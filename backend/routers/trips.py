from fastapi import APIRouter , Depends , HTTPException
from sqlalchemy.orm import Session  
from database import get_db
import models
from schemas.trip import tripRead , tripCreate ,tripUpdate
from routers.auth import get_current_admin


router = APIRouter (prefix="/trips"  ,tags=["trips"])

#GET /ALL trips FOR A LINE 
@router.get ( "/{line_id}" , response_model = list[tripRead])
def get_trips (line_id:int ,db:Session =Depends(get_db) ):
    line=db.query(models.Line).filter(models.Line.id== line_id).first()
    if not line:
                raise HTTPException (status_code=404 , detail="لا يوجد هذا الخط")
    return (
          db.query(models.Trip)
          .filter(models.Trip.line_id== line_id)
          .all()
    )

#GET /{trip_id}/get one trip  
@router.get ( "/{trip_id}" , response_model = tripRead)
def get_trip (trip_id:int ,db:Session =Depends(get_db) ):
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="لا توجد هذه الرحلة")
    return trip
    

 

#POST /Trip
@router.post("/" , response_model =tripRead)
def create_trip(trip :tripCreate ,db:Session=Depends(get_db) , current_user:models.Admin=Depends(get_current_admin)):
    line=db.query(models.Line).filter(models.Line.id== trip.line_id).first()
    if not line:
                raise HTTPException (status_code=404 , detail="لا يوجد هذا الخط")
    train=db.query(models.Train).filter(models.Train.id== trip.train_id).first()
    if not train:
                raise HTTPException (status_code=404 , detail="لا يوجد هذا القطار ")

    existing=db.query(models.Trip).filter(models.Trip.line_id== trip.line_id ,models.Trip.train_id== trip.train_id).first()
    if existing:
                raise HTTPException (status_code=409 , detail="الرحلة موجودة مسبقًا")
    
    new_trip=models.Trip(
           line_id = trip.line_id ,
           train_id =trip.train_id ,
           status =trip.status ,
           tripType =trip.tripType
    )
    db.add(new_trip)
    db.commit()
    db.refresh(new_trip)
    return new_trip
 
#Put /trip
@router.put("/{trip_id}" , response_model =tripRead)
def update_trip( trip_id:int  , updated_trip :tripUpdate ,db:Session=Depends(get_db) , current_user:models.Admin=Depends(get_current_admin)):
    trip=db.query(models.Trip).filter(models.Trip.id== trip_id  ).first()
    if not trip:
            raise HTTPException (status_code=404 , detail="لا توجد هذه الرحلة ")
    trip.status=updated_trip.status
    trip.tripType=updated_trip.tripType
    db.commit()
    db.refresh(trip)
    return trip


 
#DELETE /{trip_id}
@router.delete("/{trip_id}" )
def delete_trip( trip_id:int  ,db:Session=Depends(get_db) , current_user:models.Admin=Depends(get_current_admin)):
    trip=db.query(models.Trip).filter(models.Trip.id== trip_id ).first()
    if not trip:
            raise HTTPException (status_code=404 ,detail="لا توجد هذه الرحلة ")
    for notice in list(trip.notices):
        # this notice ONLY exists because of this trip — safe to delete
        db.delete(notice)
    db.delete(trip)
    db.commit()
    return {"message": "لقد تم حذف هذه الرحلة "}






