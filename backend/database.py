from sqlalchemy import create_engine , event
from sqlalchemy.orm import sessionmaker, DeclarativeBase

DATABASE_URL = "sqlite:///./traintrack.db"

#The engine is the object that actually knows how to open a connection to that file and speak SQL to it
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
                            # don't silently save changes to the DB until you explicitly tell it to (db.commit())
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db # when the router call it it will freeze in this line until a responce sent , and the close connection 
    finally:
        db.close()

# run this whenever  connection is set , and apply foreign Key Rules ( assign non existing foreign key , or delete a record in main table )
@event.listens_for(engine, "connect")
def enable_foreign_keys(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()