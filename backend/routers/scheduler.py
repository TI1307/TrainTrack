from fastapi import APIRouter , Depends , HTTPException
from sqlalchemy.orm import Session  
from database import get_db
import models
from schemas.scheduler import schedulerRead  , schedulerCreate , schedulerUpdate
from routers.auth import get_current_admin


router = APIRouter (prefix="/scheduler"  ,tags=["scheduler"])

#GET /ALL schedular for a trip 
@router.get ( "/{trip_id}" , response_model = list[schedulerRead ])
def get_schedulers_by_trip (trip_id:int ,db:Session =Depends(get_db) ):
   trip=db.query(models.Trip).filter(models.Trip.id==trip_id).first()
   if not trip:
                raise HTTPException (status_code=404 , detail="لا توجد هذه الرحلة")
   return (
          db.query(models.Scheduler)
          .filter(models.Scheduler.trip_id== trip_id)
          .order_by(models.Scheduler.order)
          .all()
    )


 

#POST / create a time to a trip 
@router.post("/" , response_model =schedulerRead )
def create_scheduler(scheduler :schedulerCreate ,db:Session=Depends(get_db) , current_user:models.Admin=Depends(get_current_admin)):
    trip=db.query(models.Trip).filter(models.Trip.id== scheduler.trip_id).first()
    if not trip:
                raise HTTPException (status_code=404 , detail="لا توجد هذه الرحلة")
    
    station=db.query(models.Station).filter(models.Station.id== scheduler.station_id).first()
    if not station:
                raise HTTPException (status_code=404 , detail="لا توجد هذه المحطة")
    existing_order = db.query(models.Scheduler).filter(
    models.Scheduler.trip_id == scheduler.trip_id,
    models.Scheduler.order == scheduler.order
    ).first()
    if existing_order:
         raise HTTPException(status_code=409, detail="يوجد توقف بنفس الترتيب لهذه الرحلة")

    existing_station = db.query(models.Scheduler).filter(
    models.Scheduler.trip_id == scheduler.trip_id,
    models.Scheduler.station_id == scheduler.station_id
    ).first()
    if existing_station:
           raise HTTPException(status_code=409, detail="هذه المحطة موجودة مسبقًا في هذه الرحلة")
    existing_arrival_time = db.query(models.Scheduler).filter(
    models.Scheduler.trip_id == scheduler.trip_id,
    models.Scheduler.arrival_time == scheduler.arrival_time
    ).first()
    if existing_arrival_time:
            raise HTTPException(status_code=409, detail="يوجد توقف آخر بنفس وقت الوصول لهذه الرحلة")
    existing_departure_time = db.query(models.Scheduler).filter(
    models.Scheduler.trip_id == scheduler.trip_id,
    models.Scheduler.departure_time == scheduler.departure_time
    ).first()
    if existing_departure_time:
            raise HTTPException(status_code=409, detail="يوجد توقف آخر بنفس وقت  الانطلاق لهذه الرحلة")
    
    new_scheduler=models.Scheduler(
           trip_id= trip.id ,
           station_id= station.id ,
           order= scheduler.order ,
           arrival_time=scheduler.arrival_time  ,
           departure_time = scheduler.departure_time
    )
    db.add(new_scheduler)
    db.commit()
    db.refresh(new_scheduler)
    return new_scheduler
 
#Put /Scheduler
@router.put("/{scheduler_id}" , response_model =schedulerRead )
def update_scheduler( scheduler_id:int , updated_scheduler :schedulerUpdate ,db:Session=Depends(get_db) , current_user:models.Admin=Depends(get_current_admin)):
    scheduler=db.query(models.Scheduler).filter(models.Scheduler.id== scheduler_id  ).first()
    if not scheduler:
            raise HTTPException (status_code=404 , detail="لا يوجد هذا التوقيت")
    scheduler.order=updated_scheduler.order
    scheduler.arrival_time=updated_scheduler.arrival_time
    scheduler.departure_time=updated_scheduler.departure_time
    db.commit()
    db.refresh(scheduler)
    return scheduler


 
#DELETE /Scheduler {scheduler_id}
@router.delete("/{scheduler_id}" )
def delete_scheduler( scheduler_id:int  ,db:Session=Depends(get_db) , current_user:models.Admin=Depends(get_current_admin)):
    scheduler=db.query(models.Scheduler).filter(models.Scheduler.id== scheduler_id  ).first()
    if not scheduler:
               raise HTTPException (status_code=404 , detail="لا يوجد هذا التوقيت")
   
    db.delete(scheduler)
    db.commit()
    return {"message": "لقد تم حذف هذا التوقيت بنجاح"}






