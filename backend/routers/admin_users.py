from fastapi import APIRouter, Depends , HTTPException 
from sqlalchemy.orm import Session
from database import get_db 
import models 
from schemas.admin_user import adminCreate , adminPasswordCreate ,adminRead
from routers.auth import require_super_admin 
from security import hash_invite_token ,generate_token ,get_invite_expiry ,hash_password
from utils.email import send_invite_email
from datetime import timezone , datetime 

router=APIRouter (prefix ="/admin_users" , tags=["admin_users"])

#GET /USERS
@router.get ( "/" , response_model = list[adminRead] )
def get_users (db:Session =Depends(get_db) ,current_admin : models.Admin=Depends(require_super_admin )):
    return db.query(models.Admin).all()

#Get /users{id}
@router.get ("/{admin_id}" , response_model=adminRead)
def get_user (admin_id:int , db:Session =Depends(get_db) , current_admin : models.Admin=Depends(require_super_admin )) :
    admin = db.query (models.Admin).filter(models.Admin.id==admin_id).first()
    if not admin:
      raise HTTPException (status_code=404 , detail="لا يوجد هذا المستخدم")
    return admin 

#POST /admins 
@router.post ("/" , response_model=adminRead)
async def create_admin (admin :adminCreate , db: Session=Depends(get_db) ,current_admin : models.Admin=Depends(require_super_admin )):
    raw_token=generate_token()
    admin= models.Admin (
        username=admin.username,
        password_hash=None,
        email=admin.email,
        role="admin"  ,
        status="pending",
        invite_token_hash=hash_invite_token (raw_token) ,
        invite_token_expires_at= get_invite_expiry (),
        created_at = datetime.now(timezone.utc)
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    invite_link = f"http://localhost:5173/set-password?token={raw_token}"
    await send_invite_email (admin.email , invite_link)
    return admin

#POST / the admin put the password 

@router.post ("/set-password" )
def create_password (admin :adminPasswordCreate , db: Session=Depends(get_db) ):
    invite_token_hash=hash_invite_token (admin.token) 
    update_admin=db.query(models.Admin).filter(models.Admin.invite_token_hash==invite_token_hash).first()
    if   not update_admin or update_admin.invite_token_expires_at < datetime.now (timezone.utc) :
        raise HTTPException (status_code=409 , detail="Invalid or expired invite token")

    update_admin.status="active"
    update_admin.password_hash =hash_password (admin.new_password)
    update_admin.invite_token_hash = None
    update_admin.invite_token_expires_at=None
    db.commit()
    return {"detail" :"تم تعيين كلمة المرور بنجاح"}

#DELETE /{admin_id}

@router.delete ("/{admin_id}" )
def delete_admin (admin_id:int, db: Session=Depends(get_db) ,current_admin : models.Admin=Depends(require_super_admin)):
    admin= db.query(models.Admin).filter (models.Admin.id==admin_id).first()
    if not admin:
        raise HTTPException (status_code=404 , detail="لم يتم العثور على هذا المستخدم")
    db.delete(admin)
    db.commit()
    return {"message":"لقد تم حذف هذا المستخدم بنجاح"}

