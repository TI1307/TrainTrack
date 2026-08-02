from pydantic import BaseModel
from models import classType


class TicketClassCreate(BaseModel):
    classtype: classType
    Rate_Per_Km: float


class TicketClassRead(BaseModel):
    id: int
    classtype: classType
    Rate_Per_Km: float

    class Config:
        from_attributes = True


class PriceRequest(BaseModel):
    from_station_id: int
    to_station_id: int
    ticket_class_id: int


class PriceResponse(BaseModel):
    distance_km: float
    price: float