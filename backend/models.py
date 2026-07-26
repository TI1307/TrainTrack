from sqlalchemy  import Column , Integer , String , Float ,Enum , DateTime ,Time ,ForeignKey
from sqlalchemy.orm import relationship
import enum 
from database import Base 

class TripType ( str ,enum.Enum):
   inter_Wilaya="inter_Wilaya"
   intra_Wilaya="intra_Wilaya"

class TripStatus ( str ,enum.Enum):
   working="working"
   not_working="not_working"

class classType ( str ,enum.Enum):
   first_class="first_class"
   economy="economy"


class Train(Base):
  __tablename__= "Train"
  id = Column(Integer , primary_key=True)
  serial_number= Column (String , nullable=False ) 

  trip = relationship("Trip" ,back_populates="train")


class Wilaya(Base):
  __tablename__= "Wilaya"
  id = Column(Integer , primary_key=True)
  name = Column (String , nullable=False) 

  station = relationship ("Station" , back_populates="wilaya")

class Station (Base):
   __tablename__="Station"
   id = Column ( Integer , primary_key=True)
   name = Column (String , nullable=False)
   latitude=Column (Float , nullable=False)
   Longitude =Column (Float , nullable=False)
   wilaya_id = Column (Integer ,ForeignKey("Wilaya.id") , nullable=False)

   wilaya = relationship ("Wilaya" , back_populates="station")
   scheduler=relationship("Scheduler" , back_populates="station")
   notice = relationship ("Notice" , back_populates="station")

class Line (Base):
   __tablename__="Line"
   id = Column ( Integer , primary_key=True)
   name = Column (String , nullable=False)
   length =Column (Float, nullable=False)

   trip = relationship("Trip" ,back_populates="line")
   notice = relationship ("Notice" , back_populates="line")
   line_geometry = relationship("Line_Geometry", back_populates="line")

class Line_Geometry(Base):
    __tablename__ = "line_geometry"
    id = Column(Integer, primary_key=True)
    line_id = Column(Integer, ForeignKey("Line.id"), nullable=False)
    sequence = Column(Integer, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    line = relationship("Line", back_populates="line_geometry")

class Trip (Base):
   __tablename__="Trip"
   id =Column (Integer , primary_key=True)
   line_id= Column (Integer ,ForeignKey("Line.id" ), nullable=False)
   train_id= Column (Integer ,ForeignKey("Train.id" ), nullable=False)
   status = Column (Enum (TripStatus) ,nullable =False)
   tripType=Column (Enum(TripType) , nullable=False )

   line = relationship("Line" ,back_populates="trip")
   train = relationship("Train" ,back_populates="trip")
   scheduler=relationship("Scheduler" , back_populates="trip")
   notice = relationship ("Notice" , back_populates="trip")
   vehicle_postion = relationship ("Vehicle_postion" , back_populates="trip")

   

class Scheduler(Base):
   __tablename__ ="Scheduler"
   id = Column (Integer , primary_key=True)
   trip_id=Column (Integer,ForeignKey("Trip.id" ) , nullable=False)
   station_id=Column (Integer ,ForeignKey("Station.id") , nullable=False)
   order =Column (Integer , nullable = False)
   arrival_time =Column (Time , nullable = False)
   departure_time =Column (Time , nullable = False)

   trip=relationship("Trip" , back_populates="scheduler")
   station=relationship("Station" , back_populates="scheduler")

class Notice (Base):
   __tablename__="Notice"
   id = Column (Integer , primary_key=True)
   line_id=Column (Integer ,ForeignKey("Line.id" ) )
   station_id=Column (Integer ,ForeignKey("Station.id") )
   trip_id=Column (Integer ,ForeignKey("Trip.id" ) )
   message =Column (String , nullable =False)
   created_at =Column (DateTime ,nullable = False)

   line = relationship ("Line" , back_populates="notice")
   station = relationship ("Station" , back_populates="notice")
   trip = relationship ("Trip" , back_populates="notice")



class Vehicle_postion (Base):
   __tablename__="Vehicle_postion"
   id = Column ( Integer , primary_key=True)
   latitude=Column (Float , nullable=False)
   Longitude =Column (Float , nullable=False)
   speed =Column (Float , nullable = False)
   recorded_at= Column (DateTime , nullable=False)
   trip_id = Column (Integer ,ForeignKey("Trip.id" ), nullable=False)

   trip = relationship ("Trip" , back_populates="vehicle_postion")



class Line_Station(Base):
   __tablename__="Line_Station"
   line_id=Column ( Integer , ForeignKey( "Line.id" ) , primary_key=True )
   station_id=Column ( Integer  ,ForeignKey("Station.id" ) , primary_key=True )
   order= Column (Integer ,nullable = False)
   distance=Column (Float ,nullable = False)


class Ticket(Base):
   __tablename__="Ticket"
   id=Column ( Integer , primary_key=True )
   classtype= Column (Enum(classType) )
   Rate_Per_Km=Column (Float ,nullable = False)






class Admin (Base):
   __tablename__="Admin"
   id=Column (Integer , primary_key=True)
   username =Column (String , nullable = False )
   password_hash=Column (String , nullable = False )
   created_at =Column (DateTime , nullable = False )