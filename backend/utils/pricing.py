from sqlalchemy.orm import Session
import models


def get_distance_between_stations(db: Session, from_station_id: int, to_station_id: int) -> float:
    from_links = db.query(models.Line_Station).filter(
        models.Line_Station.station_id == from_station_id
    ).all()
    to_links = db.query(models.Line_Station).filter(
        models.Line_Station.station_id == to_station_id
    ).all()

    from_by_line = {link.line_id: link for link in from_links}
    to_by_line = {link.line_id: link for link in to_links}
    common_line_ids = set(from_by_line) & set(to_by_line)

    if not common_line_ids:
        raise ValueError("هذه المحطات لا تشترك في نفس الخط")

    line_id = next(iter(common_line_ids))
    return abs(to_by_line[line_id].distance - from_by_line[line_id].distance)