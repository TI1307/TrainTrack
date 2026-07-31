from fastapi import APIRouter , Depends , HTTPException
from sqlalchemy.orm import Session  
from database import get_db
import models
from schemas.wilaya import wilayaRead ,wilayaCreate
from routers.auth import get_current_admin

router = APIRouter ( prefix ="/wilayas"  , tags =["wilayas"])

#Get /wilaya 
@router.get ( "/" , response_model = list[wilayaRead])
def get_wilayas (db:Session =Depends(get_db)):
    return db.query(models.Wilaya).all()

#Get /wilaya{id}
@router.get ("/{wilaya_id}" , response_model=wilayaRead)
def get_wilaya (wilaya_id:int , db:Session =Depends(get_db)) :
    wilaya = db.query (models.Wilaya).filter(models.Wilaya.id==wilaya_id).first()
    if not wilaya:
      raise HTTPException (status_code=404 , detail="لا توجد هذه الولاية")
    return wilaya 

#post / wilayas
@router.post ( "/" , response_model = wilayaRead)
def post_wilaya (wilaya:wilayaCreate , db:Session =Depends(get_db) , current_admin :models.Admin=Depends(get_current_admin)):
    existing=db.query(models.Wilaya).filter(models.Wilaya.name==wilaya.name)
    if existing:
        raise HTTPException (status_code=409 , detail ="توجد هذه الولاية مسبقا ")
    new_wilaya= models.Wilaya (**wilaya.model_dump())
    db.add(new_wilaya)
    db.commit()
    db.refresh(new_wilaya)
    return new_wilaya

#put / wilaya{id}
@router.put ( "/{wilaya_id}" , response_model = wilayaRead)
def update_wilaya (wilaya_id :int , updated:wilayaCreate , db:Session =Depends(get_db) , current_admin :models.Admin=Depends(get_current_admin)):
    wilaya= db.query(models.Wilaya).filter(models.Wilaya.id==wilaya_id).first()
    if not wilaya:
        raise HTTPException (status_code=404 , detail="لا توجد هذه الولاية ")
    wilaya.name= updated.name
    db.commit()
    db.refresh(wilaya)
    return wilaya

#delete  / wilaya{id}
@router.delete ( "/{wilaya_id}" )
def delete_wilaya (wilaya_id :int  , db:Session =Depends(get_db) , current_admin :models.Admin=Depends(get_current_admin)):
    wilaya= db.query(models.Wilaya).filter(models.Wilaya.id==wilaya_id).first()
    if not wilaya:
        raise HTTPException (status_code=404 , detail="لا توجد هذه الولاية ")
    if wilaya.stations:
        raise HTTPException (status_code=409, detail="لا يمكن حذف هذه الولاية لوجود محطات مرتبطة بها  ")

    db.delete(wilaya)
    db.commit()
    return { "message": "لقد تم حذف الولاية بنجاح"}