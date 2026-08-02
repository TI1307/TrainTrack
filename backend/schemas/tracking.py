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


class StopStatus(BaseModel):
    station_id: int
    station_name: str
    order: int
    arrival_time: time
    departure_time: time
    stop_status: str  # "passed" | "current" | "upcoming"