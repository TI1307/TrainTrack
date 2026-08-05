from fastapi import FastAPI
from routers import stations , trains ,auth , wilayas , admin_users ,lines ,lines_stations , lines_geometry , trips , scheduler , notices , ticket_config ,tracking , passenger

app = FastAPI(title="TrainTrack API")
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://192.168.100.3:5173"],  # frontend's actual origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stations.router)
app.include_router(trains.router)
app.include_router(auth.router)
app.include_router(wilayas.router)
app.include_router(admin_users.router)
app.include_router(lines.router)
app.include_router(lines_stations.router)
app.include_router(lines_geometry.router)
app.include_router(trips.router)
app.include_router(scheduler.router)
app.include_router(notices.router)
app.include_router(ticket_config.router)
app.include_router(tracking.router)
app.include_router(passenger.router)

@app.get("/health")
def health():
    return {"status": "ok"}