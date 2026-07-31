from pydantic import BaseModel 

class lineGeometryRead (BaseModel):
    id:int
    line_id:int
    sequence:int 
    latitude:float
    longitude: float

    class Config:
        from_attributes=True

class lineGeometryCreate (BaseModel):
        line_name:str
        sequence:int 
        latitude:float
        longitude: float

class lineGeometryUpdate(BaseModel):
       sequence:int 
       latitude:float
       longitude: float     