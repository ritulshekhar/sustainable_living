from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models, database
from .routers import auth, activities, dashboard, social, tips, profile

# Create all DB tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="CarbonTrack – Sustainable Living Tracker",
    description="Full REST API for tracking daily carbon footprint, goals, social features, and sustainability tips.",
    version="2.0.0",
)

# ── CORS (allow Vite dev server) ──────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(activities.router)
app.include_router(dashboard.router)
app.include_router(social.router)
app.include_router(tips.router)
app.include_router(profile.router)


# ── Root endpoints ────────────────────────────────────────────────────────────
@app.get("/")
def read_root():
    return {
        "message": "Welcome to the CarbonTrack API",
        "docs": "/docs",
        "health": "/health",
        "version": "2.0.0",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "CarbonTrack"}
