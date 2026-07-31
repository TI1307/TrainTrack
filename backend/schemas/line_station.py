from pydantic import BaseModel 

class lineStationRead (BaseModel):
    line_id:int
    station_id :int
    order: int
    distance: float

    class Config:
        from_attributes=True

class lineStationCreate (BaseModel):
        line_name:str
        station_name:str
        order:int
        distance:float 

class lineStationUpdate(BaseModel):
       order: int
       distance: float      