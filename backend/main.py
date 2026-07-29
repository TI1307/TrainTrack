from fastapi import FastAPI
from routers import stations , trains

app = FastAPI(title="TrainTrack API")

app.include_router(stations.router)
app.include_router(trains.router)

@app.get("/health")
def health():
    return {"status": "ok"}