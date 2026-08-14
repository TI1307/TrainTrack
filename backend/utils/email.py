import os
import httpx
from dotenv import load_dotenv

load_dotenv()

BREVO_API_KEY = os.getenv("BREVO_API_KEY")
BREVO_SENDER_EMAIL = os.getenv("BREVO_SENDER_EMAIL")
BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"


async def send_invite_email(to_email: str, invite_link: str):
    payload = {
        "sender": {"name": "TrainTrack", "email": BREVO_SENDER_EMAIL},
        "to": [{"email": to_email}],
        "subject": "دعوة للانضمام كمسؤول في TrainTrack",
        "textContent": (
            f"تمت دعوتك للانضمام كمسؤول. يمكنك تعيين كلمة المرور الخاصة بك "
            f"من خلال الرابط التالي : {invite_link}"
        ),
    }
    headers = {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.post(BREVO_API_URL, json=payload, headers=headers)

    if response.status_code >= 400:
        # Surface the real Brevo error instead of failing silently
        raise Exception(f"Brevo email failed ({response.status_code}): {response.text}")

    return response.json()