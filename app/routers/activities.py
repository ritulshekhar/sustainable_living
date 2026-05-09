"""Activities router – log and history."""
import json
import os
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, database

router = APIRouter(prefix="/api/activities", tags=["Activities"])

FACTORS_PATH = os.path.join(os.path.dirname(__file__), "../../data/emission_factors.json")

# Emission factors
CAR_PER_MILE = 0.404        # kg CO2 per mile
TRANSIT_PER_MILE = 0.089    # kg CO2 per mile
FLIGHT_PER_HOUR = 90.0      # kg CO2 per flight-hour (avg)
ELECTRICITY_PER_KWH = 0.386  # kg CO2 per kWh (US avg)
GAS_PER_THERM = 5.3         # kg CO2 per therm
FOOD_BASE = {
    "omnivore": 7.19,
    "vegetarian": 3.81,
    "vegan": 2.89,
}
MEAT_PER_SERVING = 3.3      # extra kg CO2 per meat serving
PURCHASE_PER_ITEM = 12.0    # kg CO2 per item


def _compute_emissions(data: schemas.ActivityLogRequest) -> schemas.EmissionBreakdown:
    transport = (
        data.miles_car * CAR_PER_MILE
        + data.miles_transit * TRANSIT_PER_MILE
        + data.flight_hours * FLIGHT_PER_HOUR
    )
    energy = (
        data.electricity_kwh * ELECTRICITY_PER_KWH
        + data.gas_therms * GAS_PER_THERM
    )
    food = (
        FOOD_BASE.get(data.diet_type.lower(), 7.19)
        + data.meat_servings * MEAT_PER_SERVING
    )
    shopping = data.purchases * PURCHASE_PER_ITEM
    total = transport + energy + food + shopping
    return schemas.EmissionBreakdown(
        transport=round(transport, 2),
        energy=round(energy, 2),
        food=round(food, 2),
        shopping=round(shopping, 2),
        total=round(total, 2),
    )


def _recommend(total: float) -> str:
    if total > 40:
        return "Your footprint is very high today. Consider taking public transit and reducing meat intake."
    elif total > 20:
        return "Your footprint is above average. Small changes like biking for short trips can help."
    elif total > 10:
        return "Moderate footprint. Try switching to LED bulbs and reducing car trips."
    else:
        return "Great job! Your carbon footprint is quite low today. Keep up the sustainable habits!"


@router.post("/log", response_model=schemas.ActivityLogResponse)
def log_activity(data: schemas.ActivityLogRequest, db: Session = Depends(database.get_db)):
    """Log a full daily activity and compute CO2 breakdown."""
    emissions = _compute_emissions(data)

    activity = models.Activity(
        user_id=data.user_id,
        miles_car=data.miles_car,
        miles_transit=data.miles_transit,
        flight_hours=data.flight_hours,
        electricity_kwh=data.electricity_kwh,
        gas_therms=data.gas_therms,
        diet_type=data.diet_type,
        meat_servings=data.meat_servings,
        purchases=data.purchases,
        transport_co2=emissions.transport,
        energy_co2=emissions.energy,
        food_co2=emissions.food,
        shopping_co2=emissions.shopping,
        co2_footprint=emissions.total,
        # Legacy fields
        category="daily",
        activity_type="mixed",
        value=emissions.total,
        unit="kg CO2e",
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)

    return schemas.ActivityLogResponse(
        id=activity.id,
        user_id=data.user_id,
        emissions=emissions,
        recommendation=_recommend(emissions.total),
        timestamp=activity.timestamp,
    )


@router.get("/preview")
def preview_emissions(
    miles_car: float = 0,
    miles_transit: float = 0,
    flight_hours: float = 0,
    electricity_kwh: float = 0,
    gas_therms: float = 0,
    diet_type: str = "omnivore",
    meat_servings: int = 0,
    purchases: int = 0,
):
    """Real-time preview without saving to DB."""
    data = schemas.ActivityLogRequest(
        miles_car=miles_car,
        miles_transit=miles_transit,
        flight_hours=flight_hours,
        electricity_kwh=electricity_kwh,
        gas_therms=gas_therms,
        diet_type=diet_type,
        meat_servings=meat_servings,
        purchases=purchases,
    )
    emissions = _compute_emissions(data)
    return {
        "emissions": emissions,
        "recommendation": _recommend(emissions.total),
    }


@router.get("/history")
def get_history(user_id: int = 1, limit: int = 10, db: Session = Depends(database.get_db)):
    """Return paginated activity history for a user."""
    activities = (
        db.query(models.Activity)
        .filter(models.Activity.user_id == user_id)
        .order_by(models.Activity.timestamp.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": a.id,
            "timestamp": a.timestamp,
            "total_co2": a.co2_footprint,
            "transport_co2": a.transport_co2,
            "energy_co2": a.energy_co2,
            "food_co2": a.food_co2,
            "shopping_co2": a.shopping_co2,
            "diet_type": a.diet_type or "omnivore",
            "miles_car": a.miles_car or 0,
            "miles_transit": a.miles_transit or 0,
            "electricity_kwh": a.electricity_kwh or 0,
        }
        for a in activities
    ]
