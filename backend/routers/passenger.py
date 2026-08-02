from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
import models
from database import get_db
from schemas.passenger import TripSearchResult
from schemas.notice import noticeRead
from utils.pricing import get_common_line_id, get_distance_between_stations
from utils.tracking import find_current_leg
from datetime import  datetime


router = APIRouter(prefix="/passenger", tags=["passenger"])


# GET /passenger/search — Trains tab
@router.get("/search", response_model=list[TripSearchResult])
def search_trips(from_station_id: int = Query(...), to_station_id: int = Query(...), db: Session = Depends(get_db)):
    try:
        line_id = get_common_line_id(db, from_station_id, to_station_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    trips = db.query(models.Trip).filter(
        models.Trip.line_id == line_id, models.Trip.status == models.TripStatus.working
    ).all()

    results = []
    for trip in trips:
        from_stop = next((s for s in trip.schedulers if s.station_id == from_station_id), None)
        to_stop = next((s for s in trip.schedulers if s.station_id == to_station_id), None)
        if not from_stop or not to_stop or from_stop.order >= to_stop.order:
            continue

        leg = find_current_leg(trip.schedulers, datetime.now().time())
        is_current = leg["status"] == "in_progress"

        results.append(TripSearchResult(
                  trip_id=trip.id, train_serial_number=trip.train.serial_number,
                  status=trip.status.value, departure_time=from_stop.departure_time,
                  arrival_time=to_stop.arrival_time, is_current=is_current,
        ))
    return results


# GET /passenger/notices — Notices tab
@router.get("/notices", response_model=list[noticeRead])
def get_route_notices(from_station_id: int = Query(...), to_station_id: int = Query(...), db: Session = Depends(get_db)):
    try:
        line_id = get_common_line_id(db, from_station_id, to_station_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    trip_ids = [t.id for t in db.query(models.Trip.id).filter(models.Trip.line_id == line_id).all()]
    station_ids = [ls.station_id for ls in db.query(models.Line_Station.station_id).filter(models.Line_Station.line_id == line_id).all()]

    return db.query(models.Notice).filter(
        or_(
            models.Notice.line_id == line_id,
            models.Notice.trip_id.in_(trip_ids),
            models.Notice.station_id.in_(station_ids),
        )
    ).all()