from fastapi import FastAPI
from routers import stations , trains ,auth , wilayas

app = FastAPI(title="TrainTrack API")

app.include_router(stations.router)
app.include_router(trains.router)
app.include_router(auth.router)
app.include_router(wilayas.router)

@app.get("/health")
def health():
    return {"status": "ok"}