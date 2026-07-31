from fastapi import APIRouter , Depends , HTTPException
from sqlalchemy.orm import Session  
from database import get_db
import models
from schemas.notice import noticeRead  , noticeCreate , noticeUpdate
from routers.auth import get_current_admin
from datetime import datetime , timezone

router = APIRouter (prefix="/notices"  ,tags=["notices"])

#GET /ALL notices for a trip  or a line or a station 
@router.get ( "/" , response_model = list[noticeRead ])
def get_notices(
    line_id: int | None = None,
    station_id: int | None = None,
    trip_id: int | None = None,
    db: Session = Depends(get_db)
):
   query=db.query(models.Notice)
   if line_id is not None:
       query=query.filter(models.Notice.line_id== line_id)
      
   if station_id is not None:
       query=query.filter(models.Notice.station_id== station_id)
      
   if trip_id is not None:
       query=query.filter(models.Notice.trip_id== trip_id)
      
   return query.all()


 

#POST / create a notice for a line / trip / station 
@router.post("/" , response_model =noticeRead )
def create_notice(notice :noticeCreate ,db:Session=Depends(get_db) , current_user:models.Admin=Depends(get_current_admin)):
    if notice.trip_id is None and notice.station_id is None and notice.line_id is None:
         raise HTTPException(status_code=422, detail="يجب تحديد خط أو محطة أو رحلة على الأقل لهذه الملاحظة")

    if notice.trip_id is not None:
      trip=db.query(models.Trip).filter(models.Trip.id== notice.trip_id).first()
      if not trip:
                raise HTTPException (status_code=404 , detail="لا توجد هذه الرحلة")
      
    if notice.station_id is not None:
      station=db.query(models.Station).filter(models.Station.id== notice.station_id).first()
      if not station:
                raise HTTPException (status_code=404 , detail="لا توجد هذه المحطة")

      
    if notice.line_id is not None:
      line=db.query(models.Line).filter(models.Line.id== notice.line_id).first()
      if not line:
                raise HTTPException (status_code=404 , detail="لا يوجد هذا الخط")
   
    
    new_notice=models.Notice(
           trip_id= notice.trip_id ,
           station_id= notice.station_id ,
           line_id= notice.line_id ,
           message=notice.message  ,
           created_at = datetime.now(timezone.utc)
    )
    db.add(new_notice)
    db.commit()
    db.refresh(new_notice)
    return new_notice
 
#Put /notice
@router.put("/{notice_id}" , response_model =noticeRead )
def update_notice( notice_id:int , updated_notice :noticeUpdate ,db:Session=Depends(get_db) , current_user:models.Admin=Depends(get_current_admin)):
    notice=db.query(models.Notice).filter(models.Notice.id== notice_id  ).first()
    if not notice:
            raise HTTPException (status_code=404 , detail="لا توجد اي ملاحظة")
    notice.message=updated_notice.message
    db.commit()
    db.refresh(notice)
    return notice


 
#DELETE /notice {notice_id}
@router.delete("/{notice_id}" )
def delete_notice( notice_id:int  ,db:Session=Depends(get_db) , current_user:models.Admin=Depends(get_current_admin)):
    notice=db.query(models.Notice).filter(models.Notice.id== notice_id  ).first()
    if not notice:
               raise HTTPException (status_code=404 , detail="لا توجد اي ملاحظة")
   
    db.delete(notice)
    db.commit()
    return {"message":"لقد تم حذف هذه الملاحظة بنجاح"}






