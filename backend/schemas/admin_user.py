from pydantic import BaseModel 
from models import AccountStatus
class adminCreate (BaseModel):
    username:str 
    email:str
class adminPasswordCreate (BaseModel):
    email:str
    password:str
    token:str

class adminRead(BaseModel): 
    id:int 
    username:str 
    email:str
    status :AccountStatus
    class Config:
         from_attributes = True




