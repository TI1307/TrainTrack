from fastapi import APIRouter , Depends , HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
from schemas.station import StationCreate , StationRead

router =APIRouter(prefix="/stations",tags=["stations"])

# GET /stations
@router.get("/", response_model=list[StationRead]) # this is a decorator , so one someone call GET /station  execute this function 
def get_stations(db:Session = Depends(get_db)):
    stations = db.query(models.Station).all()
    return stations # it will be returned by default to StationRead Format 


# GET /stations/{id}
@router.get("/{station_id}", response_model=StationRead)
def get_station(station_id : int , db : Session = Depends(get_db)):
    station = db.query(models.Station).filter(models.Station.id==station_id).first() # here first will return first match if found or NONe , but without it it will return a query not an object 
    if not station :
        raise HTTPException(status_code=404,  detail="Station not found")
    else :
        return station


# POST /station
@router.post("/",response_model=StationRead)
def create_station(station :StationCreate, db : Session =Depends(get_db)):
    new_station = models.Station(  
    name=station.name,
    latitude=station.latitude,
    longitude=station.longitude,
    wilaya_id=station.wilaya_id,)

    db.add(new_station) # keep track of this object
    db.commit() # its created in the db and an id generated
    db.refresh(new_station) # the python object has the id that was assigned using the db

    return new_station


# PUT /station/{id}
@router.put("/{station_id}",response_model=StationRead)
def update_station(station_id: int ,updated : StationCreate, db : Session = Depends(get_db)):
    station=db.query(models.Station).filter(models.Station.id==station_id).first()
    if not station :
        raise HTTPException( status_code =404 , detail="Station Not found")
    else :
        station.name=updated.name
        station.latitude=updated.latitude
        station.longitude=updated.longitude
        station.wilaya_id=updated.wilaya_id

        db.commit()
        db.refresh(station)

        return station


# DELETE /station/{id}
@router.delete("/{station_id}")
def delete_station(station_id : int ,db :Session =Depends(get_db)):
    station=db.query(models.Station).filter(models.Station.id == station_id).first()
    if not station :
        raise HTTPException(status_code=404,detail="Station Not Found")
    else :
        db.delete(station)
        db.commit()

        return {
            "message":"Station Deleted Successfully"
        }