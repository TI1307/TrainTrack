from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
from schemas.train import TrainCreate, TrainRead
from routers.auth import get_current_admin


router = APIRouter(prefix="/trains", tags=["trains"])

# GET /trains
@router.get("/", response_model=list[TrainRead])
def get_trains(db: Session = Depends(get_db)):
    return db.query(models.Train).all()

# GET  /trains{id}
@router.get("/{train_id}", response_model=TrainRead)
def get_train(train_id: int, db: Session = Depends(get_db)):
    train = db.query(models.Train).filter(models.Train.id == train_id).first()
    if not train:
        raise HTTPException(status_code=404, detail="Train not found")
    return train

# POST  /trains
@router.post("/", response_model=TrainRead)
def create_train(train: TrainCreate, db: Session = Depends(get_db), current_admin: models.Admin = Depends(get_current_admin)):
    new_train = models.Train(serial_number=train.serial_number)
    db.add(new_train)
    db.commit()
    db.refresh(new_train)
    return new_train


# PUT  /trains{id}
@router.put("/{train_id}", response_model=TrainRead)
def update_train(train_id: int, updated: TrainCreate, db: Session = Depends(get_db), current_admin: models.Admin = Depends(get_current_admin)):
    train = db.query(models.Train).filter(models.Train.id == train_id).first()
    if not train:
        raise HTTPException(status_code=404, detail="Train not found")
    train.serial_number = updated.serial_number
    db.commit()
    db.refresh(train)
    return train


# DELETE  /trains{id}
@router.delete("/{train_id}")
def delete_train(train_id: int, db: Session = Depends(get_db), current_admin: models.Admin = Depends(get_current_admin)):
    train = db.query(models.Train).filter(models.Train.id == train_id).first()
    if not train:
        raise HTTPException(status_code=404, detail="Train not found")

    if train.trips:  # <-- the one real difference from stations
        raise HTTPException(
            status_code=409,
            detail="Cannot delete a train with existing trips. Reassign or remove them first."
        )

    db.delete(train)
    db.commit()
    return {"message": "Train deleted successfully"}