from pydantic import BaseModel

class TrainCreate(BaseModel):
    serial_number: str

class TrainRead(BaseModel):
    id: int
    serial_number: str

    class Config:
        from_attributes = True