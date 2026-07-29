from sqlalchemy import ForeignKey, Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, time
import enum
from database import Base


class TripType(str, enum.Enum):
    inter_Wilaya = "inter_Wilaya"
    intra_Wilaya = "intra_Wilaya"


class TripStatus(str, enum.Enum):
    working = "working"
    not_working = "not_working"


class classType(str, enum.Enum):
    first_class = "first_class"
    economy = "economy"


class Train(Base):
    __tablename__ = "Train"
    id: Mapped[int] = mapped_column(primary_key=True)
    serial_number: Mapped[str] = mapped_column()

    trips: Mapped[list["Trip"]] = relationship(back_populates="train")


class Wilaya(Base):
    __tablename__ = "Wilaya"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column()

    stations: Mapped[list["Station"]] = relationship(back_populates="wilaya")


class Station(Base):
    __tablename__ = "Station"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column()
    latitude: Mapped[float] = mapped_column()
    longitude: Mapped[float] = mapped_column()
    wilaya_id: Mapped[int] = mapped_column(ForeignKey("Wilaya.id"))

    wilaya: Mapped["Wilaya"] = relationship(back_populates="stations")
    schedulers: Mapped[list["Scheduler"]] = relationship(back_populates="station")
    notices: Mapped[list["Notice"]] = relationship(back_populates="station")


class Line(Base):
    __tablename__ = "Line"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column()
    length: Mapped[float] = mapped_column()

    trips: Mapped[list["Trip"]] = relationship(back_populates="line")
    notices: Mapped[list["Notice"]] = relationship(back_populates="line")
    line_geometries: Mapped[list["Line_Geometry"]] = relationship(back_populates="line")


class Line_Geometry(Base):
    __tablename__ = "line_geometry"
    id: Mapped[int] = mapped_column(primary_key=True)
    line_id: Mapped[int] = mapped_column(ForeignKey("Line.id"))
    sequence: Mapped[int] = mapped_column()
    latitude: Mapped[float] = mapped_column()
    longitude: Mapped[float] = mapped_column()

    line: Mapped["Line"] = relationship(back_populates="line_geometries")


class Trip(Base):
    __tablename__ = "Trip"
    id: Mapped[int] = mapped_column(primary_key=True)
    line_id: Mapped[int] = mapped_column(ForeignKey("Line.id"))
    train_id: Mapped[int] = mapped_column(ForeignKey("Train.id"))
    status: Mapped[TripStatus] = mapped_column(SqlEnum(TripStatus))
    tripType: Mapped[TripType] = mapped_column(SqlEnum(TripType))

    line: Mapped["Line"] = relationship(back_populates="trips")
    train: Mapped["Train"] = relationship(back_populates="trips")
    schedulers: Mapped[list["Scheduler"]] = relationship(back_populates="trip")
    notices: Mapped[list["Notice"]] = relationship(back_populates="trip")
    vehicle_postions: Mapped[list["Vehicle_postion"]] = relationship(back_populates="trip")


class Scheduler(Base):
    __tablename__ = "Scheduler"
    id: Mapped[int] = mapped_column(primary_key=True)
    trip_id: Mapped[int] = mapped_column(ForeignKey("Trip.id"))
    station_id: Mapped[int] = mapped_column(ForeignKey("Station.id"))
    order: Mapped[int] = mapped_column()
    arrival_time: Mapped[time] = mapped_column()
    departure_time: Mapped[time] = mapped_column()

    trip: Mapped["Trip"] = relationship(back_populates="schedulers")
    station: Mapped["Station"] = relationship(back_populates="schedulers")


class Notice(Base):
    __tablename__ = "Notice"
    id: Mapped[int] = mapped_column(primary_key=True)
    line_id: Mapped[int | None] = mapped_column(ForeignKey("Line.id"))
    station_id: Mapped[int | None] = mapped_column(ForeignKey("Station.id"))
    trip_id: Mapped[int | None] = mapped_column(ForeignKey("Trip.id"))
    message: Mapped[str] = mapped_column()
    created_at: Mapped[datetime] = mapped_column()

    line: Mapped["Line"] = relationship(back_populates="notices")
    station: Mapped["Station"] = relationship(back_populates="notices")
    trip: Mapped["Trip"] = relationship(back_populates="notices")


class Vehicle_postion(Base):
    __tablename__ = "Vehicle_postion"
    id: Mapped[int] = mapped_column(primary_key=True)
    latitude: Mapped[float] = mapped_column()
    Longitude: Mapped[float] = mapped_column()
    speed: Mapped[float] = mapped_column()
    recorded_at: Mapped[datetime] = mapped_column()
    trip_id: Mapped[int] = mapped_column(ForeignKey("Trip.id"))

    trip: Mapped["Trip"] = relationship(back_populates="vehicle_postions")


class Line_Station(Base):
    __tablename__ = "Line_Station"
    line_id: Mapped[int] = mapped_column(ForeignKey("Line.id"), primary_key=True)
    station_id: Mapped[int] = mapped_column(ForeignKey("Station.id"), primary_key=True)
    order: Mapped[int] = mapped_column()
    distance: Mapped[float] = mapped_column()


class Ticket(Base):
    __tablename__ = "Ticket"
    id: Mapped[int] = mapped_column(primary_key=True)
    classtype: Mapped[classType | None] = mapped_column(SqlEnum(classType))
    Rate_Per_Km: Mapped[float] = mapped_column()


class Admin(Base):
    __tablename__ = "Admin"
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column()
    password_hash: Mapped[str] = mapped_column()
    created_at: Mapped[datetime] = mapped_column()