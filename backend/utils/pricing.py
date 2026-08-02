from sqlalchemy.orm import Session
import models


def get_common_line_id(db: Session, from_station_id: int, to_station_id: int) -> int:
    from_line_ids = {l.line_id for l in db.query(models.Line_Station).filter(
        models.Line_Station.station_id == from_station_id).all()}
    to_line_ids = {l.line_id for l in db.query(models.Line_Station).filter(
        models.Line_Station.station_id == to_station_id).all()}
    common = from_line_ids & to_line_ids
    if not common:
        raise ValueError("لا يوجد خط مشترك بين هاتين المحطتين")
    return next(iter(common))


def get_distance_between_stations(db: Session, from_station_id: int, to_station_id: int) -> float:
    line_id = get_common_line_id(db, from_station_id, to_station_id)
    from_link = db.query(models.Line_Station).filter(
        models.Line_Station.line_id == line_id, models.Line_Station.station_id == from_station_id).first()
    to_link = db.query(models.Line_Station).filter(
        models.Line_Station.line_id == line_id, models.Line_Station.station_id == to_station_id).first()
    return abs(to_link.distance - from_link.distance)