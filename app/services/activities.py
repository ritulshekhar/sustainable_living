import json
import os
from fastapi import APIRouter, HTTPException
from .. import schemas

router = APIRouter(prefix="/activities", tags=["Activities"])

FACTORS_PATH = "data/emission_factors.json"

def load_factors():
    if not os.path.exists(FACTORS_PATH):
        raise HTTPException(status_code=500, detail="Emission factors file not found")
    with open(FACTORS_PATH, "r") as f:
        return json.load(f)

@router.post("/log", response_model=schemas.LogActivityResponse)
def log_activity(data: schemas.LogActivityRequest):
    """
    Log daily activities and calculate carbon footprint.
    """
    factors = load_factors()
    
    # 1. Travel Calculation (using 'car' as default for simplification)
    travel_factor = factors.get("travel", {}).get("car", 0.2)
    travel_emissions = data.travel_km * travel_factor
    
    # 2. Electricity Calculation (using 'grid' as default)
    grid_factor = factors.get("electricity", {}).get("grid", 0.45)
    electricity_emissions = data.electricity_kwh * grid_factor
    
    # 3. Food Calculation
    food_factor = factors.get("food", {}).get(data.food_type.lower(), 2.0)
    # Assume 1 unit of food as 1 standard daily portion (kg) for this demo
    food_emissions = food_factor 
    
    total_emissions = travel_emissions + electricity_emissions + food_emissions
    
    # 4. Generate Simple Recommendation
    if total_emissions > 15:
        recommendation = "Your daily footprint is high. Try using public transport and reducing meat consumption."
    elif total_emissions > 5:
        recommendation = "Your footprint is moderate. Switching to energy-efficient appliances could help further."
    else:
        recommendation = "Great job! Your carbon footprint is quite low. Keep up the sustainable habits!"
        
    return schemas.LogActivityResponse(
        user_id=data.user_id,
        emissions=schemas.EmissionBreakdown(
            travel=round(travel_emissions, 2),
            electricity=round(electricity_emissions, 2),
            food=round(food_emissions, 2),
            total=round(total_emissions, 2)
        ),
        recommendation=recommendation
    )
