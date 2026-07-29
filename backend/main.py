from fastapi import FastAPI
from routers import stations

app = FastAPI(title="TrainTrack API")

app.include_router(stations.router)

@app.get("/health")
def health():
    return {"status": "ok"}