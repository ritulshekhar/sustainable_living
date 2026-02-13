# Sustainable Living & Carbon Footprint Tracker

A backend-only REST API system for tracking daily activities and calculating carbon footprints.

## Features
- **User Authentication**: Secure registration and login using JWT.
- **Activity Logging**: Log travel, electricity, and food habits.
- **Carbon Calculation**: Automatic footprint calculation based on configurable emission factors.
- **History Tracking**: View your historical footprint and total impact.
- **Actionable Tips**: Get sustainability recommendations based on your habits.

## Tech Stack
- **Framework**: FastAPI
- **Database**: SQLite (SQLAlchemy ORM)
- **Validation**: Pydantic
- **Auth**: JWT (OAuth2 with Password Flow)

## Setup & Run

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run the Server
```bash
uvicorn app.main:app --reload
```
The API will be available at `http://127.0.0.1:8000`.
API documentation (Swagger UI) is available at `http://127.0.0.1:8000/docs`.

### 3. Verify Functionality
You can run the provided verification script to test all endpoints:
```bash
python3 tests/verify_api.py
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register a new user |
| POST | `/token` | Login and get JWT access token |
| POST | `/activities` | Log a daily activity (Auth required) |
| GET | `/history` | Fetch footprint history (Auth required) |
| GET | `/recommendations` | Get sustainability tips (Auth required) |
| GET | `/health` | Server health check |

## Configurable Emission Factors
Emission factors are stored in `data/emission_factors.json` and can be updated without code changes.
Values are in **kg CO2 per unit** (km for travel, kWh for electricity, kg for food).
