from pydantic import BaseModel
from models import TripStatus, TripType

class tripRead (BaseModel):
     id: int
     line_id: int
     train_id: int
     status: TripStatus
     tripType:TripType
     class Config:
        from_attributes = True


class tripCreate  (BaseModel):
    line_id: int
    train_id: int
    status: TripStatus
    tripType:TripType

class tripUpdate  (BaseModel):
    status: TripStatus
    tripType:TripType