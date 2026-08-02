from pydantic import BaseModel
from typing import Optional


class TrackingRead(BaseModel):
    trip_id: int
    status: str
    from_station_id: Optional[int] = None
    to_station_id: Optional[int] = None
    progress_percent: Optional[float] = None
    latitude: float
    longitude: float