"""
Extended seed data for TrainTrack — covers edge cases:
- 2 wilayas, 2 lines, one station SHARED between both lines
- 5 trips across both lines: in_progress, not_started, completed, and one not_working
  (not_working proves the live-tracking status filter actually excludes it)
- notices of all 3 target types (line / station / trip)
- 3 ticket classes including intra_wilaya
- one extra 'pending' admin (no password yet) to test the invite-flow edge case

Run with: uv run python seed_data_extended.py
"""

from datetime import datetime, timedelta, timezone
from database import SessionLocal
import models
from security import hash_password

db = SessionLocal()

if db.query(models.Wilaya).first():
    print("البيانات موجودة بالفعل، لن يتم إدخالها مرة أخرى")
    db.close()
    exit()

now = datetime.now()

# ---------- Wilayas ----------
wilaya_algiers = models.Wilaya(name="الجزائر")
wilaya_blida = models.Wilaya(name="البليدة")
db.add_all([wilaya_algiers, wilaya_blida])
db.commit()
db.refresh(wilaya_algiers)
db.refresh(wilaya_blida)

# ---------- Stations ----------
# Line 1 stations (all within Algiers)
line1_station_data = [
    ("أغا", 36.7738, 3.0588, wilaya_algiers),
    ("حسين داي", 36.7365, 3.0972, wilaya_algiers),
    ("الحراش", 36.7180, 3.1310, wilaya_algiers),
    ("بئر توتة", 36.6520, 3.0450, wilaya_algiers),
    ("زرالدة", 36.7115, 2.8520, wilaya_algiers),  # shared with Line 2
]
line1_stations = []
for name, lat, lon, wilaya in line1_station_data:
    s = models.Station(name=name, latitude=lat, longitude=lon, wilaya_id=wilaya.id)
    db.add(s)
    line1_stations.append(s)
db.commit()
for s in line1_stations:
    db.refresh(s)

zeralda = line1_stations[-1]  # shared station

# Line 2 stations: Zeralda (shared) -> Boufarik -> Blida (crosses into a new wilaya)
boufarik = models.Station(name="بوفاريك", latitude=36.5736, longitude=2.9108, wilaya_id=wilaya_blida.id)
blida_station = models.Station(name="البليدة", latitude=36.4700, longitude=2.8280, wilaya_id=wilaya_blida.id)
db.add_all([boufarik, blida_station])
db.commit()
db.refresh(boufarik)
db.refresh(blida_station)

line2_stations = [zeralda, boufarik, blida_station]

# ---------- Lines ----------
line1 = models.Line(name="أغا - زرالدة", length=32.0)
line2 = models.Line(name="زرالدة - البليدة", length=35.0)
db.add_all([line1, line2])
db.commit()
db.refresh(line1)
db.refresh(line2)

# ---------- Line_Station ----------
line1_distances = [0.0, 8.5, 15.0, 24.0, 32.0]
for i, (station, dist) in enumerate(zip(line1_stations, line1_distances)):
    db.add(models.Line_Station(line_id=line1.id, station_id=station.id, order=i + 1, distance=dist))

line2_distances = [0.0, 20.0, 35.0]  # distances measured along Line 2, independent of Line 1
for i, (station, dist) in enumerate(zip(line2_stations, line2_distances)):
    db.add(models.Line_Station(line_id=line2.id, station_id=station.id, order=i + 1, distance=dist))
db.commit()

# ---------- Line_Geometry ----------
line1_geo = [
    (36.7738, 3.0588), (36.7500, 3.0800), (36.7365, 3.0972),
    (36.7180, 3.1310), (36.6900, 3.0900), (36.6520, 3.0450),
    (36.6800, 2.9500), (36.7115, 2.8520),
]
for i, (lat, lon) in enumerate(line1_geo):
    db.add(models.Line_Geometry(line_id=line1.id, sequence=i + 1, latitude=lat, longitude=lon))

line2_geo = [
    (36.7115, 2.8520), (36.6400, 2.8700), (36.5736, 2.9108),
    (36.5200, 2.8800), (36.4700, 2.8280),
]
for i, (lat, lon) in enumerate(line2_geo):
    db.add(models.Line_Geometry(line_id=line2.id, sequence=i + 1, latitude=lat, longitude=lon))
db.commit()

# ---------- Trains ----------
train1 = models.Train(serial_number="TR-853")
train2 = models.Train(serial_number="TR-855")
train3 = models.Train(serial_number="TR-861")
train4 = models.Train(serial_number="TR-870")
db.add_all([train1, train2, train3, train4])
db.commit()
for t in (train1, train2, train3, train4):
    db.refresh(t)


def make_schedule(trip, stations, offsets_minutes):
    """offsets_minutes: list of (arrival_offset, departure_offset) relative to `now`, one per station."""
    for i, (station, (arr_off, dep_off)) in enumerate(zip(stations, offsets_minutes)):
        arr = (now + timedelta(minutes=arr_off)).time()
        dep = (now + timedelta(minutes=dep_off)).time()
        db.add(models.Scheduler(trip_id=trip.id, station_id=station.id, order=i + 1,
                                 arrival_time=arr, departure_time=dep))


# ---------- Trip 1: Line 1, IN PROGRESS right now ----------
trip1 = models.Trip(line_id=line1.id, train_id=train1.id, status=models.TripStatus.working,
                     tripType=models.TripType.intra_Wilaya)
db.add(trip1)
db.commit()
db.refresh(trip1)
make_schedule(trip1, line1_stations, [(-40, -38), (-25, -23), (-5, -3), (10, 12), (25, 27)])

# ---------- Trip 2: Line 1, NOT STARTED (far future) ----------
trip2 = models.Trip(line_id=line1.id, train_id=train2.id, status=models.TripStatus.working,
                     tripType=models.TripType.intra_Wilaya)
db.add(trip2)
db.commit()
db.refresh(trip2)
make_schedule(trip2, line1_stations, [(180, 182), (195, 197), (215, 217), (230, 232), (245, 247)])

# ---------- Trip 3: Line 1, status NOT_WORKING but times overlap "now" ----------
# proves find_active_trips correctly excludes it from /tracking/live despite matching times
trip3 = models.Trip(line_id=line1.id, train_id=train3.id, status=models.TripStatus.not_working,
                     tripType=models.TripType.intra_Wilaya)
db.add(trip3)
db.commit()
db.refresh(trip3)
make_schedule(trip3, line1_stations, [(-40, -38), (-25, -23), (-5, -3), (10, 12), (25, 27)])

# ---------- Trip 4: Line 2, IN PROGRESS right now (inter-wilaya) ----------
trip4 = models.Trip(line_id=line2.id, train_id=train4.id, status=models.TripStatus.working,
                     tripType=models.TripType.inter_Wilaya)
db.add(trip4)
db.commit()
db.refresh(trip4)
make_schedule(trip4, line2_stations, [(-15, -13), (10, 15), (35, 40)])

# ---------- Trip 5: Line 2, COMPLETED (times fully in the past) ----------
trip5 = models.Trip(line_id=line2.id, train_id=train1.id, status=models.TripStatus.working,
                     tripType=models.TripType.inter_Wilaya)
db.add(trip5)
db.commit()
db.refresh(trip5)
make_schedule(trip5, line2_stations, [(-120, -118), (-95, -90), (-70, -65)])

# ---------- Ticket classes ----------
db.add_all([
    models.Ticket(classtype=models.classType.economy, Rate_Per_Km=8.0),
    models.Ticket(classtype=models.classType.first_class, Rate_Per_Km=15.0),
    models.Ticket(classtype=models.classType.intra_wilaya, Rate_Per_Km=6.0),
])
db.commit()

# ---------- Admins ----------
db.add_all([
    models.Admin(email="superadmin@traintrack.dz", username="superadmin",
                 password_hash=hash_password("Super123!"), role=models.AdminRole.super_admin,
                 status=models.AccountStatus.active, created_at=datetime.now(timezone.utc)),
    models.Admin(email="admin1@traintrack.dz", username="admin1",
                 password_hash=hash_password("Admin123!"), role=models.AdminRole.admin,
                 status=models.AccountStatus.active, created_at=datetime.now(timezone.utc)),
    # edge case: an invited-but-not-yet-activated admin, no password set
    models.Admin(email="pending@traintrack.dz", username="pending_admin",
                 password_hash=None, role=models.AdminRole.admin,
                 status=models.AccountStatus.pending, created_at=datetime.now(timezone.utc)),
])
db.commit()

# ---------- Notices: one of each target type, across both lines ----------
db.add_all([
    models.Notice(line_id=line1.id, message="أعمال صيانة على خط أغا - زرالدة", created_at=datetime.now(timezone.utc)),
    models.Notice(station_id=line1_stations[2].id, message="إغلاق مؤقت لأحد الأرصفة في محطة الحراش",
                  created_at=datetime.now(timezone.utc)),
    models.Notice(trip_id=trip1.id, message="تأخر متوقع بـ 8 دقائق", created_at=datetime.now(timezone.utc)),
    models.Notice(line_id=line2.id, message="ازدحام متوقع على خط زرالدة - البليدة نهاية الأسبوع",
                  created_at=datetime.now(timezone.utc)),
])
db.commit()

db.close()
print("تم إدخال بيانات الاختبار الموسعة بنجاح ✅")
