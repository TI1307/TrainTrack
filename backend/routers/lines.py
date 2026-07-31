from fastapi import APIRouter , Depends , HTTPException 
from sqlalchemy.orm import Session 
from database import get_db 
from routers.auth import get_current_admin
import models 
from schemas.line import lineRead ,lineCreate 

router = APIRouter (prefix="/lines"  ,tags=["lines"])

#GET /LINES
@router.get("/" , response_model =list[lineRead])
def get_lines(db:Session=Depends(get_db) , current_user:models.Admin=Depends(get_current_admin)):
    return db.query(models.Line).all()

#GET /LINES {line_id}
@router.get("/{line_id}" , response_model =lineRead)
def get_line(line_id:int ,db:Session=Depends(get_db) , current_user:models.Admin=Depends(get_current_admin)):
    line=db.query(models.Line).filter(models.Line.id==line_id).first()
    if not line:
        raise HTTPException (status_code=404 , detail="لا يوجد هذا الخط")
    return line
 

#POST /LINE
@router.post("/" , response_model =lineRead)
def create_line(line :lineCreate ,db:Session=Depends(get_db) , current_user:models.Admin=Depends(get_current_admin)):
    line=models.Line(**line.model_dump())
    db.add(line)
    db.commit()
    db.refresh(line)
    return line
 
#Put /LINE
@router.put("/{line_id}" , response_model =lineRead)
def update_line(line_id :int ,updated_line :lineCreate ,db:Session=Depends(get_db) , current_user:models.Admin=Depends(get_current_admin)):
    line=db.query(models.Line).filter(models.Line.id== line_id).first()
    if not line:
            raise HTTPException (status_code=404 , detail="لا يوجد هذا الخط")
    line.name=updated_line.name
    line.length=updated_line.length
    db.commit()
    return line


 
#DELETE /LINES {line_id}
@router.delete("/{line_id}" )
def delete_line(line_id :int,db:Session=Depends(get_db) , current_user:models.Admin=Depends(get_current_admin)):
    line=db.query(models.Line).filter(models.Line.id==line_id).first()
    if not line:
            raise HTTPException (status_code=404 , detail="لا يوجد هذا الخط")
    #we can't delete a line that have trip but we can delete line that have notices and line geomtery encascade
    if line.trips :
            raise HTTPException (status_code=409 , detail="لا يمكن حذف هذا الخط لوجود رحلات مرتبطة به")
    
    db.delete(line)
    db.commit()
    return {"message" :"لقذ تم حذف الخط بنجاح"}






