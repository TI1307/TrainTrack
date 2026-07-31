from database import SessionLocal  # adjust import to match your actual session factory name
import models
from security import hash_password
from datetime import datetime, timezone

db = SessionLocal()

admin = models.Admin(
    username="superadmin",
    email="admin@example.com",
    password_hash=hash_password("ChangeMe123!"),
    role=models.AdminRole.super_admin,
    status=models.AccountStatus.active,
    created_at=datetime.now(timezone.utc),
)

db.add(admin)
db.commit()
print("Super admin created:", admin.id)

db.close()