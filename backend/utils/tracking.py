import math
from datetime import time, datetime
from sqlalchemy.orm import Session
import models


def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


def find_current_leg(schedulers: list[models.Scheduler], now: time):
    stops = sorted(schedulers, key=lambda s: s.order)

    if now <= stops[0].departure_time:
        return {"status": "not_started", "at_station_id": stops[0].station_id}
    if now >= stops[-1].arrival_time:
        return {"status": "completed", "at_station_id": stops[-1].station_id}

    for i in range(len(stops) - 1):
        leg_start, leg_end = stops[i].departure_time, stops[i + 1].arrival_time
        if leg_start <= now <= leg_end:
            total = (datetime.combine(datetime.min, leg_end) - datetime.combine(datetime.min, leg_start)).total_seconds()
            elapsed = (datetime.combine(datetime.min, now) - datetime.combine(datetime.min, leg_start)).total_seconds()
            return {
                "status": "in_progress",
                "from_station_id": stops[i].station_id,
                "to_station_id": stops[i + 1].station_id,
                "fraction": elapsed / total if total > 0 else 0,
            }

    # NEW: covers dwell time — train has arrived at a station but hasn't departed yet
    for i in range(1, len(stops)):
        if stops[i].arrival_time <= now <= stops[i].departure_time:
            return {
                "status": "in_progress",
                "from_station_id": stops[i].station_id,
                "to_station_id": stops[i].station_id,  # same station on both sides
                "fraction": 0.0,
            }

    # unreachable in practice, but never leave a function able to silently return None
    return {"status": "not_started", "at_station_id": stops[0].station_id}


def find_active_trips(db: Session, line_id: int, now: time):
    """NEW — the missing step: which trip(s) on this line are actually mid-journey right now."""
    trips = db.query(models.Trip).filter(
        models.Trip.line_id == line_id,
        models.Trip.status == models.TripStatus.working,
    ).all()

    active = []
    for trip in trips:
        schedulers = db.query(models.Scheduler).filter(models.Scheduler.trip_id == trip.id).all()
        if not schedulers:
            continue
        leg = find_current_leg(schedulers, now)
        if leg["status"] == "in_progress":
            active.append((trip, leg))
    return active


def get_station_distance(db: Session, line_id: int, station_id: int) -> float:
    link = db.query(models.Line_Station).filter(
        models.Line_Station.line_id == line_id,
        models.Line_Station.station_id == station_id,
    ).first()
    if not link:
        raise ValueError("المحطة غير موجودة على هذا الخط")
    return link.distance


def interpolate_position(db: Session, line_id: int, target_distance: float):
    points = (
        db.query(models.Line_Geometry)
        .filter(models.Line_Geometry.line_id == line_id)
        .order_by(models.Line_Geometry.sequence)
        .all()
    )
    if not points:
        raise ValueError("لا توجد بيانات جغرافية لهذا الخط")

    cumulative = [0.0]
    for i in range(1, len(points)):
        cumulative.append(cumulative[-1] + haversine_distance(
            points[i - 1].latitude, points[i - 1].longitude, points[i].latitude, points[i].longitude))

    if target_distance <= cumulative[0]:
        return points[0].latitude, points[0].longitude
    if target_distance >= cumulative[-1]:
        return points[-1].latitude, points[-1].longitude

    for i in range(1, len(cumulative)):
        if cumulative[i] >= target_distance:
            seg_frac = (target_distance - cumulative[i - 1]) / (cumulative[i] - cumulative[i - 1])
            lat = points[i - 1].latitude + seg_frac * (points[i].latitude - points[i - 1].latitude)
            lon = points[i - 1].longitude + seg_frac * (points[i].longitude - points[i - 1].longitude)
            return lat, lon


def get_line_geometry_points(db: Session, line_id: int):
    return (
        db.query(models.Line_Geometry)
        .filter(models.Line_Geometry.line_id == line_id)
        .order_by(models.Line_Geometry.sequence)
        .all()
    )


def split_geometry_by_progress(db: Session, line_id: int, target_distance: float):
    points = get_line_geometry_points(db, line_id)
    if not points:
        raise ValueError("لا توجد بيانات جغرافية لهذا الخط")

    cumulative = [0.0]
    for i in range(1, len(points)):
        cumulative.append(cumulative[-1] + haversine_distance(
            points[i - 1].latitude, points[i - 1].longitude, points[i].latitude, points[i].longitude
        ))

    target_distance = max(0.0, min(target_distance, cumulative[-1]))

    if target_distance <= cumulative[0]:
        idx, split_lat, split_lon = 0, points[0].latitude, points[0].longitude
    elif target_distance >= cumulative[-1]:
        idx, split_lat, split_lon = len(points), points[-1].latitude, points[-1].longitude
    else:
        idx = next(i for i in range(1, len(cumulative)) if cumulative[i] >= target_distance)
        seg_frac = (target_distance - cumulative[idx - 1]) / (cumulative[idx] - cumulative[idx - 1])
        split_lat = points[idx - 1].latitude + seg_frac * (points[idx].latitude - points[idx - 1].latitude)
        split_lon = points[idx - 1].longitude + seg_frac * (points[idx].longitude - points[idx - 1].longitude)

    split_point = {"latitude": split_lat, "longitude": split_lon}
    passed = [{"latitude": p.latitude, "longitude": p.longitude} for p in points[:idx]] + [split_point]
    remaining = [split_point] + [{"latitude": p.latitude, "longitude": p.longitude} for p in points[idx:]]
    return passed, remaining