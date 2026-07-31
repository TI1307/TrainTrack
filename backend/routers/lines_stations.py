from fastapi import APIRouter , Depends , HTTPException
from sqlalchemy.orm import Session  
from database import get_db
import models
from schemas.line_station import lineStationRead , lineStationCreate ,lineStationUpdate
from routers.auth import get_current_admin


router = APIRouter (prefix="/lines_stations"  ,tags=["lines_stations"])

#GET /{line_id}/ALL STATION FOR A LINE WITH THE ORDER 
@router.get ( "/{line_id}" , response_model = list[lineStationRead])
def get_lineStation (line_id:int ,db:Session =Depends(get_db) ):
    line=db.query(models.Line).filter(models.Line.id== line_id).first()
    if not line:
                raise HTTPException (status_code=404 , detail="لا يوجد هذا الخط")
    return (
          db.query(models.Line_Station)
          .filter(models.Line_Station.line_id== line_id)
          .order_by(models.Line_Station.order)
          .all()
    )

 

#POST /LINE_STATION #add a station to a line 
@router.post("/" , response_model =lineStationRead)
def create_lineStation(lineStation :lineStationCreate ,db:Session=Depends(get_db) , current_user:models.Admin=Depends(get_current_admin)):
    line=db.query(models.Line).filter(models.Line.name== lineStation.line_name).first()
    if not line:
                raise HTTPException (status_code=404 , detail="لا يوجد هذا الخط")
    
    station=db.query(models.Station).filter(models.Station.name== lineStation.station_name).first()
    if not station:
                raise HTTPException (status_code=404 , detail="لا توجد هذه المحطة")
    existing=db.query(models.Line_Station).filter(models.Line_Station.line_id== line.id ,models.Line_Station.station_id== station.id).first()
    if existing:
                    raise HTTPException (status_code=409 , detail="هذه المحطة موجودة بالفعل في هذا الخط")
    
    new_LineStation=models.Line_Station(
           line_id=line.id ,
           station_id=station.id ,
           order=lineStation.order ,
           distance=lineStation.distance
    )
    db.add(new_LineStation)
    db.commit()
    db.refresh(new_LineStation)
    return new_LineStation
 
#Put /LINE_Station
@router.put("/{line_id}/{station_id}" , response_model =lineStationRead)
def update_lineStation( line_id:int , station_id:int , updated_lineStation :lineStationUpdate ,db:Session=Depends(get_db) , current_user:models.Admin=Depends(get_current_admin)):
    lineStation=db.query(models.Line_Station).filter(models.Line_Station.line_id== line_id ,models.Line_Station.station_id== station_id ).first()
    if not lineStation:
            raise HTTPException (status_code=404 , detail="لا يوجد هذا الارتباط بين الخط والمحطة")
    lineStation.order=updated_lineStation.order
    lineStation.distance=updated_lineStation.distance
    db.commit()
    db.refresh(lineStation)
    return lineStation


 
#DELETE /LINE_STATIONN /{line_id}/{station_id}
@router.delete("/{line_id}/{station_id}" )
def delete_lineStation( line_id:int , station_id:int ,db:Session=Depends(get_db) , current_user:models.Admin=Depends(get_current_admin)):
    lineStation=db.query(models.Line_Station).filter(models.Line_Station.line_id== line_id ,models.Line_Station.station_id== station_id).first()
    if not lineStation:
            raise HTTPException (status_code=404 ,detail="لا يوجد هذا الارتباط بين الخط والمحطة")
   
    db.delete(lineStation)
    db.commit()
    return {"message": "لقد تم حذف المحطة من الخط بنجاح"}






