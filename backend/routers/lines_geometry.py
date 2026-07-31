from fastapi import APIRouter , Depends , HTTPException
from sqlalchemy.orm import Session  
from database import get_db
import models
from schemas.line_geometry import lineGeometryRead , lineGeometryCreate ,lineGeometryUpdate
from routers.auth import get_current_admin


router = APIRouter (prefix="/lines_Geometry"  ,tags=["lines_Geometry"])

#GET /{line_id}/get all points for a line
@router.get ( "/{line_id}" , response_model = list[lineGeometryRead])
def get_lineGeometry (line_id:int ,db:Session =Depends(get_db) ):
    line=db.query(models.Line).filter(models.Line.id== line_id).first()
    if not line:
                raise HTTPException (status_code=404 , detail="لا يوجد هذا الخط")
    return (
          db.query(models.Line_Geometry)
          .filter(models.Line_Geometry.line_id== line_id)
          .order_by(models.Line_Geometry.sequence)
          .all()
    )

 

#POST /LINE_Geometry #add a Geometry to a line 
@router.post("/" , response_model =lineGeometryRead)
def create_lineGeometry(lineGeometry :lineGeometryCreate ,db:Session=Depends(get_db) , current_user:models.Admin=Depends(get_current_admin)):
    line=db.query(models.Line).filter(models.Line.name== lineGeometry.line_name).first()
    if not line:
                raise HTTPException (status_code=404 , detail="لا يوجد هذا الخط")
    
    
    existing=db.query(models.Line_Geometry).filter(models.Line_Geometry.line_id== line.id  , models.Line_Geometry.sequence == lineGeometry.sequence).first()
    if  existing:
                    raise HTTPException (status_code=409 , detail="يوجد بالفعل نقطة بنفس الترتيب لهذا الخط")
    
    new_LineGeometry=models.Line_Geometry(
           line_id=line.id ,
           sequence=lineGeometry.sequence ,
           latitude=lineGeometry.latitude,
           longitude=lineGeometry.longitude
    )
    db.add(new_LineGeometry)
    db.commit()
    db.refresh(new_LineGeometry)
    return new_LineGeometry
 
#Put /LINE_Geometry
@router.put("/{lineGeometry_id}" , response_model =lineGeometryRead)
def update_lineGeometry( lineGeometry_id:int  , updated_lineGeometry :lineGeometryUpdate ,db:Session=Depends(get_db) , current_user:models.Admin=Depends(get_current_admin)):
    lineGeometry=db.query(models.Line_Geometry).filter(models.Line_Geometry.id== lineGeometry_id  ).first()
    if not lineGeometry:
            raise HTTPException (status_code=404 , detail="لا توجد هذه الاحداثية لهذا الخط")
    lineGeometry.sequence=updated_lineGeometry.sequence 
    lineGeometry.latitude=updated_lineGeometry.latitude
    lineGeometry.longitude=updated_lineGeometry.longitude
    db.commit()
    db.refresh(lineGeometry)
    return lineGeometry


 
#DELETE /LINE_Geometry {lineGeometry_id}
@router.delete("/{lineGeometry_id}" )
def delete_lineGeometry( lineGeometry_id:int  ,db:Session=Depends(get_db) , current_user:models.Admin=Depends(get_current_admin)):
    lineGeometry=db.query(models.Line_Geometry).filter(models.Line_Geometry.id== lineGeometry_id).first()
    if not lineGeometry:
            raise HTTPException (status_code=404 ,detail="لا توجد هذه الاحداثية لهذا الخط")
   
    db.delete(lineGeometry)
    db.commit()
    return {"message":"لقد تم حذف هذه الاحداثية بنجاح"}






