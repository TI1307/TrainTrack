from datetime import datetime, timedelta, timezone
import jwt
from pwdlib import PasswordHash
from config import settings
import secrets
import hashlib
from datetime import timezone , datetime 

password_hasher = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return password_hasher.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_hasher.verify(plain_password, hashed_password)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode["exp"] = expire
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


def decode_access_token(token: str) -> dict:
    return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])

def generate_token()->str :
     return secrets.token_urlsafe(32)

def hash_invite_token (raw_token:str)->str :
    return hashlib.sha256(raw_token.encode()).hexdigest()

def get_invite_expiry (hours :int =48)->datetime:
    return datetime.now (timezone.utc)+ timedelta(hours =hours)