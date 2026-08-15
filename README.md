# TrainTrack

A Passenger Information System (PIS) for a railway network — built as a course project. It reproduces the core experience of a real rail passenger-information system (schedule lookup, route browsing, live train tracking, service announcements) on top of predefined reference data, with a native Arabic, right-to-left interface throughout.

The current dataset is seeded from one real commuter line — **Agha–Zeralda** in Algiers, operated by SNTF — though the data model supports any number of wilayas, lines, and trains.

**Prepared by:** Salhi Belkeis & Tifour Imene
**Supervisor:** AOUACHE Mustapha

Full requirements and design documentation: see `TrainTrack_SRS.pdf` .

---

## Live Deployment

| Component | Link |
|---|---|
| Mobile app (web preview) | https://train-track-web.vercel.app/ |
| Admin web dashboard | https://traintrack-frontend-two.vercel.app/ |
| Backend API docs (Swagger) | https://traintrack-backend-tkuz.onrender.com/docs |

### Test accounts

| Role | Username | Email | Password |
|---|---|---|---|
| Super Admin | `superadmin` | superadmin@traintrack.dz | `Super123!` |
| Admin | `admin1` | admin1@traintrack.dz | `Admin123!` |

---

## What the system does

- **Passenger mobile app** — search trips between two stations, see an estimated live position of the current train on a map, view each stop's status (passed/current/upcoming), read service notices for the route, and get an indicative fare.
- **Admin web dashboard** — manage wilayas, stations, lines (including route geometry via an interactive map), trains, trips, timetables, notices, ticket pricing, and admin accounts (invite-based, Super Admin only).
- **Backend API** — the single source of truth both clients talk to; handles authentication, CRUD for all reference data, fare calculation, and the live-position simulation.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (Python), SQLAlchemy 2.0, Alembic |
| Database | PostgreSQL (Neon) in production, SQLite for local development |
| Auth | JWT bearer tokens, Argon2 password hashing |
| Admin panel | React + TypeScript + Vite, Leaflet |
| Mobile app | React Native + Expo, react-native-maps |
| Hosting | Render (backend), Vercel (admin panel + mobile web), Neon (database) |

---

## Project structure

```
TrainTrack/
├── backend/        # FastAPI app — routers, models, schemas, migrations
├── frontend/        # Admin dashboard (React + Vite)
├── mobile/          # Passenger app (React Native + Expo)
└── TrainTrack_SRS.pdf   # Full requirements & design documentation
```

---

## Running locally

### Backend
```bash
cd backend
uv sync
uv run alembic upgrade head
uv run python seed_data.py      # optional: populate demo data
uv run uvicorn main:app --reload
```
Requires a `.env` with `SECRET_KEY` set, and `DATABASE_URL` if not using the default local SQLite file.

### Admin panel
```bash
cd frontend
npm install
npm run dev
```
Requires a `.env` with `VITE_API_BASE_URL` pointing at the backend.

### Mobile app
```bash
cd mobile
npm install
npx expo start
```
Requires a `.env` with `EXPO_PUBLIC_API_URL` pointing at the backend. Scan the QR code with Expo Go, or press `w` to run the web preview.

---
