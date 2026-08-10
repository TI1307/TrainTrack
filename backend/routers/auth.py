from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import jwt

from database import get_db
import models
from schemas.auth import Token
from security import verify_password, create_access_token, decode_access_token

router = APIRouter(prefix="/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    admin = db.query(models.Admin).filter(
        (models.Admin.username == form_data.username) | (models.Admin.email == form_data.username)
    ).first()
    if not admin or not verify_password(form_data.password, admin.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="اسم المستخدم أو كلمة المرور غير صحيحة")
    token = create_access_token({"sub": admin.username})
    return {"access_token": token, "token_type": "bearer"}


def get_current_admin(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="لا يمكن التحقق من بيانات الاعتماد",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(token)
        username = payload.get("sub")
        if username is None:
            raise unauthorized
    except jwt.PyJWTError:
        raise unauthorized

    admin = db.query(models.Admin).filter(models.Admin.username == username).first()
    if admin is None:
        raise unauthorized
    return admin

def require_super_admin(current_admin: models.Admin = Depends(get_current_admin)):
    if current_admin.role != models.AdminRole.super_admin:
        raise HTTPException(status_code=403, detail="تتطلب صلاحية المشرف الأعلى")
    return current_admin


@router.get("/me")
def read_me(current_admin: models.Admin = Depends(get_current_admin)):
    return {"id": current_admin.id, "username": current_admin.username}


@router.post("/logout")
def logout():
    return {"message": "Logged out. Discard the token on the client side."}