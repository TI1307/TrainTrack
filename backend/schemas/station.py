from pydantic import BaseModel


class StationRead(BaseModel):
    id:int
    name:str
    latitude:float
    longitude:float
    wilaya_id:int
    # when the router recives this from db pydantic will treat it as a dict , and this will cause a problem 
    class Config:
        from_attributes = True

#For modify we will use this , and the id will be in the path : POST /stations/{id}
class StationCreate(BaseModel):
    name:str
    latitude:float
    longitude:float
    wilaya_id:int

# delete needs no schema because the id is a path parameter 