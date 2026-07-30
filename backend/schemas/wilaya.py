from pydantic import BaseModel 

class wilayaCreate (BaseModel):
    name:str

    

class wilayaRead (BaseModel):
    id :int 
    name:str

    class config:
            from_attributes = True
