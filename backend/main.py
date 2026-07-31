from fastapi import FastAPI
from routers import stations , trains ,auth , wilayas , admin_users ,lines ,lines_stations , lines_geometry , trips , scheduler , notices

app = FastAPI(title="TrainTrack API")

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

@app.get("/health")
def health():
    return {"status": "ok"}