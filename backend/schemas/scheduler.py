from pydantic import BaseModel
from datetime import time

class schedulerRead (BaseModel):
     id: int
     trip_id: int  
     station_id: int
     order: int
     arrival_time:time 
     departure_time: time
     class Config:
        from_attributes = True


class schedulerCreate  (BaseModel):
    trip_id: int  
    station_id: int
    order: int
    arrival_time:time 
    departure_time: time
    

class schedulerUpdate  (BaseModel):
    order: int
    arrival_time:time 
    departure_time: time