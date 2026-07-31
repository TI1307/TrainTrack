from pydantic import BaseModel

class lineRead (BaseModel):
    id:int 
    name:str 
    length : float 
    class Config:
        from_attributes = True


class lineCreate  (BaseModel):
    name :str
    length : float 



