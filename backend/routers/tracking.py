from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
import models
from schemas.tracking import TrackingRead , StopStatus
from utils.pricing import get_common_line_id
from utils.tracking import find_active_trips, find_current_leg, get_station_distance, interpolate_position , get_line_geometry_points, split_geometry_by_progress

router = APIRouter(prefix="/tracking", tags=["tracking"])


# GET /tracking/live?from_station_id=..&to_station_id=..  — for the app's Live map tab
@router.get("/live", response_model=list[TrackingRead])
def get_live_trains(
    from_station_id: int = Query(...),
    to_station_id: int = Query(...),
    db: Session = Depends(get_db),
):
    try:
        line_id = get_common_line_id(db, from_station_id, to_station_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    active_trips = find_active_trips(db, line_id, datetime.now().time())
    results = []

    for trip, leg in active_trips:
        try:
            from_dist = get_station_distance(db, line_id, leg["from_station_id"])
            to_dist = get_station_distance(db, line_id, leg["to_station_id"])
            target = from_dist + leg["fraction"] * (to_dist - from_dist)
            lat, lon = interpolate_position(db, line_id, target)
        except ValueError:
            continue

        results.append(TrackingRead(
            trip_id=trip.id, status="in_progress",
            from_station_id=leg["from_station_id"], to_station_id=leg["to_station_id"],
            progress_percent=round(leg["fraction"] * 100, 1), latitude=lat, longitude=lon,
        ))

    return results



@router.get("/{trip_id}/path", response_model=list[StopStatus])
def get_trip_path(trip_id: int, db: Session = Depends(get_db)):
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="هذه الرحلة غير موجودة")

    schedulers = db.query(models.Scheduler).filter(models.Scheduler.trip_id == trip_id).all()
    if not schedulers:
        raise HTTPException(status_code=404, detail="لا يوجد جدول زمني لهذه الرحلة")

    stops = sorted(schedulers, key=lambda s: s.order)
    leg = find_current_leg(schedulers, datetime.now().time())

    current_order = None
    if leg["status"] == "in_progress":
        current_order = next(s.order for s in stops if s.station_id == leg["to_station_id"])
    elif leg["status"] == "completed":
        current_order = stops[-1].order + 1

    result = []
    for s in stops:
        if current_order is None:
            status = "upcoming"
        elif s.order < current_order:
            status = "passed"
        elif s.order == current_order:
            status = "current"
        else:
            status = "upcoming"

        result.append(StopStatus(
            station_id=s.station_id, station_name=s.station.name, order=s.order,
            arrival_time=s.arrival_time, departure_time=s.departure_time, stop_status=status,
        ))
    return result

@router.get("/{trip_id}/geometry")
def get_trip_geometry(trip_id: int, db: Session = Depends(get_db)):
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="هذه الرحلة غير موجودة")

    schedulers = db.query(models.Scheduler).filter(models.Scheduler.trip_id == trip_id).all()
    if not schedulers:
        raise HTTPException(status_code=404, detail="لا يوجد جدول زمني لهذه الرحلة")

    leg = find_current_leg(schedulers, datetime.now().time())
    all_points = [{"latitude": p.latitude, "longitude": p.longitude} for p in get_line_geometry_points(db, trip.line_id)]

    if leg["status"] == "not_started":
        return {"passed": [], "remaining": all_points}
    if leg["status"] == "completed":
        return {"passed": all_points, "remaining": []}

    try:
        from_dist = get_station_distance(db, trip.line_id, leg["from_station_id"])
        to_dist = get_station_distance(db, trip.line_id, leg["to_station_id"])
        target = from_dist + leg["fraction"] * (to_dist - from_dist)
        passed, remaining = split_geometry_by_progress(db, trip.line_id, target)
        return {"passed": passed, "remaining": remaining}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))