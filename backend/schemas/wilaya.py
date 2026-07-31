from pydantic import BaseModel 

class wilayaCreate (BaseModel):
    name:str

    

class wilayaRead (BaseModel):
    id :int 
    name:str

    class Config:
            from_attributes = True
