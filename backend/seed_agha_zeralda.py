"""TrainTrack seed data for the Agha -> Zeralda line.

Run from backend/:
    uv run python seed_agha_zeralda.py

The timetable values below follow the supplied SNTF Agha-Zeralda timetable.
The geometry below is a clean station-to-station seed geometry. The supplied
Overpass export does not contain one continuous Agha-Zeralda path, so the
final OSM track geometry should replace this list later.
"""

from datetime import datetime, timezone
from database import SessionLocal
import models
from security import hash_password


db = SessionLocal()

if db.query(models.Wilaya).first():
    print("البيانات موجودة بالفعل، لن يتم إدخالها مرة أخرى")
    db.close()
    raise SystemExit

# ------------------------------------------------------------
# Wilaya
# ------------------------------------------------------------
wilaya = models.Wilaya(name="الجزائر")
db.add(wilaya)
db.commit()
db.refresh(wilaya)

# ------------------------------------------------------------
# Stations: Agha -> Zeralda
# Coordinates are railway-station coordinates.
# ------------------------------------------------------------
stations_data = [
    ("أغا", 36.7711111111, 3.0613888889),
    ("الورشات", 36.7563991806, 3.0658281194),
    ("حسين داي", 36.7457572500, 3.0939764194),
    ("خروبة", 36.7353400000, 3.1194700000),
    ("الحراش", 36.7220950000, 3.1324051944),
    ("جسر قسنطينة", 36.6967500000, 3.0952804000),
    ("عين النعجة", 36.6891404111, 3.0783371694),
    ("بابا علي", 36.6671538111, 3.0522143806),
    ("بئر توتة", 36.6310945000, 3.0099595000),
    ("تسالة المرجة", 36.6395150000, 2.9355438889),
    ("سيدي عبد الله", 36.6806240111, 2.8919875306),
    ("سيدي عبد الله - ج", 36.6920153889, 2.8714816944),
    ("زرالدة", 36.7021722222, 2.8497666667),
]

stations = []
for name, lat, lon in stations_data:
    station = models.Station(
        name=name,
        latitude=lat,
        longitude=lon,
        wilaya_id=wilaya.id,
    )
    db.add(station)
    stations.append(station)

db.commit()
for station in stations:
    db.refresh(station)

# ------------------------------------------------------------
# Line
# ------------------------------------------------------------
line = models.Line(name="أغا - زرالدة", length=35.0)
db.add(line)
db.commit()
db.refresh(line)

# Approximate cumulative distances for seed/testing.
station_distances = [0.00, 1.44, 3.80, 5.98, 7.58, 11.29, 12.76,
                     15.65, 20.34, 26.07, 31.19, 33.09, 35.00]

for order, (station, distance) in enumerate(zip(stations, station_distances), 1):
    db.add(models.Line_Station(
        line_id=line.id,
        station_id=station.id,
        order=order,
        distance=distance,
    ))

db.commit()

# ------------------------------------------------------------
# Line geometry
# ------------------------------------------------------------
# Temporary clean geometry for testing the map. Replace with the
# complete OSM LineString once the full Agha-Zeralda geometry is available.
line_geometry = [(lat, lon) for _, lat, lon in stations_data]

for sequence, (lat, lon) in enumerate(line_geometry, 1):
    db.add(models.Line_Geometry(
        line_id=line.id,
        sequence=sequence,
        latitude=lat,
        longitude=lon,
    ))

db.commit()

# ------------------------------------------------------------
# Trains / service numbers
# ------------------------------------------------------------
outbound_numbers = [1501, 1505, 1509, 1513, 1515, 1519, 1521, 1525, 1529]
inbound_numbers = [1500, 1502, 1504, 1508, 1512, 1514, 1518, 1522, 1526]
all_numbers = outbound_numbers + inbound_numbers

trains = {}
for number in all_numbers:
    train = models.Train(serial_number=f"SNTF-{number}")
    db.add(train)
    trains[number] = train

db.commit()
for train in trains.values():
    db.refresh(train)

# ------------------------------------------------------------
# Exact timetable from the supplied image.
# One time is supplied per station, so arrival = departure.
# ------------------------------------------------------------
outbound_times = {
    1501: ["05:10","05:12","05:16","05:19","05:22","05:26","05:29","05:33","05:38","05:46","05:51","05:54","05:58"],
    1505: ["07:30","07:32","07:36","07:39","07:42","07:46","07:49","07:53","07:58","08:06","08:11","08:14","08:18"],
    1509: ["08:40","08:42","08:46","08:49","08:52","08:56","08:59","09:03","09:08","09:16","09:21","09:24","09:28"],
    1513: ["10:15","10:17","10:21","10:24","10:27","10:31","10:34","10:38","10:43","10:51","10:56","10:59","11:03"],
    1515: ["11:35","11:37","11:41","11:44","11:47","11:51","11:54","11:58","12:03","12:11","12:16","12:19","12:23"],
    1519: ["13:10","13:12","13:16","13:19","13:22","13:26","13:29","13:33","13:38","13:46","13:51","13:54","13:58"],
    1521: ["14:40","14:42","14:46","14:49","14:52","14:56","14:59","15:03","15:08","15:16","15:21","15:24","15:28"],
    1525: ["16:25","16:27","16:31","16:34","16:37","16:41","16:44","16:48","16:53","17:01","17:06","17:09","17:13"],
    1529: ["18:35","18:37","18:41","18:44","18:47","18:51","18:54","18:58","19:03","19:11","19:16","19:19","19:23"],
}

inbound_times = {
    1500: ["06:15","06:18","06:21","06:26","06:32","06:37","06:41","06:44","06:48","06:51","06:54","06:57","07:01"],
    1502: ["06:55","06:58","07:01","07:07","07:14","07:19","07:23","07:26","07:30","07:33","07:36","07:39","07:44"],
    1504: ["08:30","08:33","08:36","08:42","08:49","08:54","08:58","09:01","09:05","09:08","09:11","09:15","09:18"],
    1508: ["10:00","10:03","10:06","10:12","10:19","10:24","10:28","10:31","10:35","10:38","10:41","10:45","10:48"],
    1512: ["11:30","11:33","11:36","11:42","11:49","11:54","11:58","12:01","12:05","12:08","12:11","12:15","12:18"],
    1514: ["13:15","13:18","13:21","13:27","13:34","13:39","13:43","13:46","13:50","13:53","13:56","14:01","14:04"],
    1518: ["14:45","14:48","14:51","14:57","15:04","15:09","15:13","15:16","15:20","15:23","15:26","15:30","15:33"],
    1522: ["16:30","16:33","16:36","16:42","16:49","16:54","16:58","17:01","17:05","17:08","17:11","17:15","17:18"],
    1526: ["18:35","18:38","18:41","18:47","18:54","19:00","19:04","19:07","19:12","19:17","19:20","19:24","19:27"],
}


def parse_time(value: str):
    hour, minute = map(int, value.split(":"))
    return datetime(2000, 1, 1, hour, minute).time()


def create_trip(service_number, times, trip_stations):
    trip = models.Trip(
        line_id=line.id,
        train_id=trains[service_number].id,
        status=models.TripStatus.working,
        tripType=models.TripType.intra_Wilaya,
    )
    db.add(trip)
    db.commit()
    db.refresh(trip)

    for order, (station, value) in enumerate(zip(trip_stations, times), 1):
        t = parse_time(value)
        db.add(models.Scheduler(
            trip_id=trip.id,
            station_id=station.id,
            order=order,
            arrival_time=t,
            departure_time=t,
        ))
    db.commit()


# Agha -> Zeralda
for service_number, times in outbound_times.items():
    create_trip(service_number, times, stations)

# Zeralda -> Agha
for service_number, times in inbound_times.items():
    create_trip(service_number, times, list(reversed(stations)))

# ------------------------------------------------------------
# Tickets
# Current models.py only defines economy and first_class.
# ------------------------------------------------------------
db.add_all([
    models.Ticket(classtype=models.classType.economy, Rate_Per_Km=8.0),
    models.Ticket(classtype=models.classType.first_class, Rate_Per_Km=15.0),
])
db.commit()

# ------------------------------------------------------------
# Admins
# ------------------------------------------------------------
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

# ------------------------------------------------------------
# Notices
# ------------------------------------------------------------
db.add_all([
    models.Notice(
        line_id=line.id,
        message="أعمال صيانة على خط أغا - زرالدة",
        created_at=datetime.now(timezone.utc),
    ),
    models.Notice(
        station_id=stations[4].id,
        message="تنبيه في محطة الحراش",
        created_at=datetime.now(timezone.utc),
    ),
])
db.commit()

db.close()
print("تم إدخال بيانات أغا - زرالدة بنجاح ✅")
print("13 محطة | 18 رحلة | 9 ذهاب + 9 إياب")
