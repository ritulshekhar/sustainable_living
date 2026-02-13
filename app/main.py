from fastapi import FastAPI
from .services import activities

app = FastAPI(
    title="Sustainable Living Tracker - Review Version",
    description="A simplified backend for tracking daily carbon footprint.",
    version="1.0.0"
)

# Root endpoint
@app.get("/")
def read_root():
    return {
        "message": "Welcome to the Sustainable Living Tracker API (Review Version)",
        "docs": "/docs",
        "health": "/health"
    }

# Health-check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "Sustainability Tracker"}

# Include the simplified activities router
app.include_router(activities.router)
