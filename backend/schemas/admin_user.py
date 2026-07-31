from pydantic import BaseModel 

class adminCreate (BaseModel):
    username:str 
    email:str
class adminPasswordCreate (BaseModel):
    email:str
    new_password:str
    token:str

class adminRead(BaseModel): 
    id:int 
    username:str 
    email:str
    class Config:
         from_attributes = True




