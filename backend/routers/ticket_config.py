from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
from schemas.ticket import TicketClassCreate, TicketClassRead, PriceRequest, PriceResponse
from routers.auth import get_current_admin
from utils.pricing import get_distance_between_stations

router = APIRouter(prefix="/ticket-config", tags=["ticket-config"])


@router.get("/", response_model=list[TicketClassRead])
def get_ticket_classes(db: Session = Depends(get_db)):
    return db.query(models.Ticket).all()


@router.post("/", response_model=TicketClassRead)
def create_ticket_class(
    ticket: TicketClassCreate,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(get_current_admin),
):
    new_ticket = models.Ticket(**ticket.model_dump())
    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)
    return new_ticket


@router.put("/{ticket_id}", response_model=TicketClassRead)
def update_ticket_class(
    ticket_id: int,
    updated: TicketClassCreate,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(get_current_admin),
):
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="فئة التذكرة غير موجودة")
    ticket.classtype = updated.classtype
    ticket.Rate_Per_Km = updated.Rate_Per_Km
    db.commit()
    db.refresh(ticket)
    return ticket


@router.delete("/{ticket_id}")
def delete_ticket_class(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(get_current_admin),
):
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="فئة التذكرة غير موجودة")
    db.delete(ticket)
    db.commit()
    return {"message": "تم حذف فئة التذكرة بنجاح"}


@router.post("/price", response_model=PriceResponse)
def calculate_price(request: PriceRequest, db: Session = Depends(get_db)):
    ticket = db.query(models.Ticket).filter(models.Ticket.id == request.ticket_class_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="فئة التذكرة غير موجودة")

    try:
        distance = get_distance_between_stations(db, request.from_station_id, request.to_station_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return PriceResponse(distance_km=distance, price=distance * ticket.Rate_Per_Km)