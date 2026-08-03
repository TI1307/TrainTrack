from datetime import datetime, timedelta, time, timezone
from database import SessionLocal
import models
from security import hash_password

db = SessionLocal()

if db.query(models.Wilaya).first():
    print("البيانات موجودة بالفعل، لن يتم إدخالها مرة أخرى")
    db.close()
    exit()

# ---------- Wilaya ----------
wilaya = models.Wilaya(name="الجزائر")
db.add(wilaya)
db.commit()
db.refresh(wilaya)

# ---------- Stations (one line, 5 stops) ----------
station_data = [
    ("أغا", 36.7738, 3.0588),
    ("حسين داي", 36.7365, 3.0972),
    ("الحراش", 36.7180, 3.1310),
    ("بئر توتة", 36.6520, 3.0450),
    ("زرالدة", 36.7115, 2.8520),
]
stations = []
for name, lat, lon in station_data:
    s = models.Station(name=name, latitude=lat, longitude=lon, wilaya_id=wilaya.id)
    db.add(s)
    stations.append(s)
db.commit()
for s in stations:
    db.refresh(s)

# ---------- Line ----------
line = models.Line(name="أغا - زرالدة", length=32.0)
db.add(line)
db.commit()
db.refresh(line)

# ---------- Line_Station (cumulative distance from Agha) ----------
distances = [0.0, 8.5, 15.0, 24.0, 32.0]
for i, (station, dist) in enumerate(zip(stations, distances)):
    db.add(models.Line_Station(line_id=line.id, station_id=station.id, order=i + 1, distance=dist))
db.commit()

# ---------- Line_Geometry (simple interpolated points along the same path) ----------
geo_points = [
    (36.7738, 3.0588), (36.7500, 3.0800), (36.7365, 3.0972),
    (36.7180, 3.1310), (36.6900, 3.0900), (36.6520, 3.0450),
    (36.6800, 2.9500), (36.7115, 2.8520),
]
for i, (lat, lon) in enumerate(geo_points):
    db.add(models.Line_Geometry(line_id=line.id, sequence=i + 1, latitude=lat, longitude=lon))
db.commit()

# ---------- Trains ----------
train1 = models.Train(serial_number="TR-853")
train2 = models.Train(serial_number="TR-855")
db.add_all([train1, train2])
db.commit()
db.refresh(train1)
db.refresh(train2)

# ---------- Trip 1: CURRENTLY IN PROGRESS (times built around "now") ----------
now = datetime.now()
trip1 = models.Trip(line_id=line.id, train_id=train1.id, status=models.TripStatus.working, tripType=models.TripType.intra_Wilaya)
db.add(trip1)
db.commit()
db.refresh(trip1)

# stop 3 (El Harrach) departed 5 min ago, stop 4 (Bir Touta) arrives in 10 min -> train is "in_progress" between them right now
offsets = [-40, -25, -5, 10, 25]  # minutes relative to now, per stop's arrival-ish time
for i, (station, offset) in enumerate(zip(stations, offsets)):
    t = (now + timedelta(minutes=offset)).time()
    t_dep = (now + timedelta(minutes=offset + 2)).time()
    db.add(models.Scheduler(trip_id=trip1.id, station_id=station.id, order=i + 1, arrival_time=t, departure_time=t_dep))
db.commit()

# ---------- Trip 2: NOT STARTED YET (later today) ----------
trip2 = models.Trip(line_id=line.id, train_id=train2.id, status=models.TripStatus.working, tripType=models.TripType.intra_Wilaya)
db.add(trip2)
db.commit()
db.refresh(trip2)

offsets2 = [180, 195, 215, 230, 245]  # 3+ hours from now
for i, (station, offset) in enumerate(zip(stations, offsets2)):
    t = (now + timedelta(minutes=offset)).time()
    t_dep = (now + timedelta(minutes=offset + 2)).time()
    db.add(models.Scheduler(trip_id=trip2.id, station_id=station.id, order=i + 1, arrival_time=t, departure_time=t_dep))
db.commit()

# ---------- Ticket classes ----------
db.add_all([
    models.Ticket(classtype=models.classType.economy, Rate_Per_Km=8.0),
    models.Ticket(classtype=models.classType.first_class, Rate_Per_Km=15.0),
])
db.commit()

# ---------- Admins ----------
db.add_all([
    models.Admin(
        email="superadmin@traintrack.dz",
        username="superadmin",
        password_hash=hash_password("Super123!"),
        role=models.AdminRole.super_admin,
        status=models.AccountStatus.active,
        created_at=datetime.now(timezone.utc),
    ),
    models.Admin(
        email="admin1@traintrack.dz",
        username="admin1",
        password_hash=hash_password("Admin123!"),
        role=models.AdminRole.admin,
        status=models.AccountStatus.active,
        created_at=datetime.now(timezone.utc),
    ),
])
db.commit()

# ---------- Notices (one per type, so passenger.py's OR-filter has something to find) ----------
db.add_all([
    models.Notice(line_id=line.id, message="أعمال صيانة على الخط بالقرب من زرالدة", created_at=datetime.now(timezone.utc)),
    models.Notice(station_id=stations[2].id, message="إغلاق مؤقت لأحد الأرصفة في محطة الحراش", created_at=datetime.now(timezone.utc)),
    models.Notice(trip_id=trip1.id, message="تأخر متوقع بـ 8 دقائق", created_at=datetime.now(timezone.utc)),
])
db.commit()

db.close()
print("تم إدخال البيانات التجريبية بنجاح ✅")