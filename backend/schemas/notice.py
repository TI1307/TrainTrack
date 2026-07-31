from pydantic import BaseModel
from datetime import datetime

class noticeRead (BaseModel):
    id: int 
    line_id:int | None
    station_id: int | None
    trip_id: int | None
    message: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class noticeCreate  (BaseModel):
    line_id:int | None = None
    station_id: int  | None = None
    trip_id: int | None = None
    message: str
    created_at: datetime
        
    

class noticeUpdate  (BaseModel):
    message: str