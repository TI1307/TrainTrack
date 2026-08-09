- whenever a change happen to db :
alembic upgrade head
- whenever i do a change in db 
1.alembic revision --autogenerate -m "description" ( review it first )
2. alembic upgrade head ( to apply it )

- to check for bugs and styling errors : uv run ruff check .

- run the server : 
uv run uvicorn main:app --reload
uv run uvicorn main:app --reload --host 0.0.0.0  so all device in the same network can reach it 
