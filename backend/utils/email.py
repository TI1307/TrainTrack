import os
from dotenv import load_dotenv
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType

load_dotenv()

conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_SERVER=os.getenv("MAIL_SERVER"),
    MAIL_PORT=int(os.getenv("MAIL_PORT")),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
)

async def send_invite_email(to_email: str, invite_link: str):
    message = MessageSchema(
        subject="دعوة للانضمام كمسؤول في TrainTtrack",
        recipients=[to_email],
        body=f"تمت دعوتك للانضمام كمسؤول. يمكنك تعيين كلمة المرور الخاصة بك من خلال الرابط التالي : {invite_link}",
        subtype=MessageType.plain,
    )
    fm = FastMail(conf)
    await fm.send_message(message)