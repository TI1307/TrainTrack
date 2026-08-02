from pydantic import BaseModel
from datetime import time
from typing import Optional


class TripSearchResult(BaseModel):
    trip_id: int
    train_serial_number: str
    status: str
    departure_time: time
    arrival_time: time
    is_current: bool