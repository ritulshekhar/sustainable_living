"""Tips router – sustainability tips by category."""
from fastapi import APIRouter
from typing import List

router = APIRouter(prefix="/api/tips", tags=["Tips"])

TIPS = [
    # Transportation
    {
        "id": 1,
        "title": "Switch to Public Transit",
        "description": "Taking the bus or train instead of driving alone can reduce your transportation emissions by up to 45%. Even one day per week makes a meaningful difference.",
        "category": "transportation",
        "estimated_impact": "Save 2.4 kg CO₂/day",
        "difficulty": "Easy",
        "icon": "🚌",
    },
    {
        "id": 2,
        "title": "Bike or Walk Short Distances",
        "description": "For trips under 3 miles, consider biking or walking. This eliminates emissions entirely and improves your health at the same time.",
        "category": "transportation",
        "estimated_impact": "Save 1.2 kg CO₂/trip",
        "difficulty": "Easy",
        "icon": "🚲",
    },
    {
        "id": 3,
        "title": "Carpool to Work",
        "description": "Share your commute with 2–3 colleagues. This can reduce per-person emissions by 50–67% compared to solo driving.",
        "category": "transportation",
        "estimated_impact": "Save 3.1 kg CO₂/day",
        "difficulty": "Medium",
        "icon": "🚗",
    },
    {
        "id": 4,
        "title": "Switch to an Electric Vehicle",
        "description": "EVs produce 50–70% less lifetime emissions than gasoline cars, especially when charged with renewable energy.",
        "category": "transportation",
        "estimated_impact": "Save 4.6 kg CO₂/day",
        "difficulty": "Hard",
        "icon": "⚡",
    },
    # Home Energy
    {
        "id": 5,
        "title": "Switch to LED Lighting",
        "description": "LED bulbs use 75% less energy than incandescent bulbs and last 25 times longer. Replace your 5 most-used bulbs first.",
        "category": "home_energy",
        "estimated_impact": "Save 0.5 kg CO₂/day",
        "difficulty": "Easy",
        "icon": "💡",
    },
    {
        "id": 6,
        "title": "Reduce Water Heater Temperature",
        "description": "Setting your water heater to 120°F (49°C) can cut water heating costs by 4–22% and reduce associated emissions.",
        "category": "home_energy",
        "estimated_impact": "Save 0.8 kg CO₂/day",
        "difficulty": "Easy",
        "icon": "🌡️",
    },
    {
        "id": 7,
        "title": "Install a Smart Thermostat",
        "description": "Smart thermostats can reduce heating and cooling bills by 10–15% by learning your schedule and adjusting automatically.",
        "category": "home_energy",
        "estimated_impact": "Save 1.2 kg CO₂/day",
        "difficulty": "Medium",
        "icon": "🏠",
    },
    {
        "id": 8,
        "title": "Switch to Solar Energy",
        "description": "Installing solar panels can eliminate most of your home electricity emissions. Many states offer tax incentives.",
        "category": "home_energy",
        "estimated_impact": "Save 5.8 kg CO₂/day",
        "difficulty": "Hard",
        "icon": "☀️",
    },
    # Food & Diet
    {
        "id": 9,
        "title": "Try Meatless Mondays",
        "description": "Reducing beef consumption by one serving per week can save about 348 kg CO₂ per year. Plant-based proteins have a fraction of the footprint.",
        "category": "food",
        "estimated_impact": "Save 3.3 kg CO₂/serving",
        "difficulty": "Easy",
        "icon": "🥦",
    },
    {
        "id": 10,
        "title": "Buy Local and Seasonal Produce",
        "description": "Locally grown food requires far less transportation. Seasonal food doesn't need energy-intensive greenhouse growing.",
        "category": "food",
        "estimated_impact": "Save 0.4 kg CO₂/day",
        "difficulty": "Easy",
        "icon": "🌽",
    },
    {
        "id": 11,
        "title": "Reduce Food Waste",
        "description": "About 8% of global emissions come from food waste. Plan meals ahead and compost scraps to cut your food waste in half.",
        "category": "food",
        "estimated_impact": "Save 1.0 kg CO₂/day",
        "difficulty": "Medium",
        "icon": "♻️",
    },
    {
        "id": 12,
        "title": "Adopt a Plant-Based Diet",
        "description": "A fully plant-based diet can reduce your food-related emissions by up to 73%. Even reducing meat to once a week helps significantly.",
        "category": "food",
        "estimated_impact": "Save 5.2 kg CO₂/day",
        "difficulty": "Hard",
        "icon": "🌱",
    },
    # Shopping
    {
        "id": 13,
        "title": "Buy Second-Hand",
        "description": "Purchasing second-hand clothing and goods reduces manufacturing demand. Thrift stores and online marketplaces are great options.",
        "category": "shopping",
        "estimated_impact": "Save 11 kg CO₂/item",
        "difficulty": "Easy",
        "icon": "👕",
    },
    {
        "id": 14,
        "title": "Repair Instead of Replace",
        "description": "Fixing broken electronics, clothing, or appliances extends their life and prevents the high emissions from manufacturing new ones.",
        "category": "shopping",
        "estimated_impact": "Save 12 kg CO₂/item",
        "difficulty": "Medium",
        "icon": "🔧",
    },
    {
        "id": 15,
        "title": "Choose Minimal Packaging",
        "description": "Opt for products with less plastic packaging. Bring reusable bags and containers when shopping.",
        "category": "shopping",
        "estimated_impact": "Save 0.3 kg CO₂/trip",
        "difficulty": "Easy",
        "icon": "🛍️",
    },
    {
        "id": 16,
        "title": "Invest in Durable Goods",
        "description": "High-quality, long-lasting products have lower lifetime emissions than cheap items that need frequent replacement.",
        "category": "shopping",
        "estimated_impact": "Save 8 kg CO₂/item",
        "difficulty": "Medium",
        "icon": "💎",
    },
]


@router.get("")
def get_tips(category: str = "all"):
    """Return tips filtered by category."""
    if category == "all":
        return TIPS
    return [t for t in TIPS if t["category"] == category]
