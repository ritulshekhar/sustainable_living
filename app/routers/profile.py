"""Profile router – user stats, badges, goals."""
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, database

router = APIRouter(prefix="/api/profile", tags=["Profile"])

BADGES_TEMPLATE = [
    {"id": 1, "name": "First Log", "description": "Logged your first activity", "icon": "🌱"},
    {"id": 2, "name": "Week Streak", "description": "Logged activities 7 days in a row", "icon": "🔥"},
    {"id": 3, "name": "Carbon Cutter", "description": "Reduced emissions by 20% in a month", "icon": "✂️"},
    {"id": 4, "name": "Transit Champion", "description": "Used public transit 10 times", "icon": "🚌"},
    {"id": 5, "name": "Plant Powered", "description": "Ate 14 consecutive plant-based meals", "icon": "🥦"},
    {"id": 6, "name": "Solar Star", "description": "Tracked renewable energy usage", "icon": "☀️"},
    {"id": 7, "name": "Goal Achiever", "description": "Completed your first goal", "icon": "🎯"},
    {"id": 8, "name": "Eco Influencer", "description": "Referred 5 friends to CarbonTrack", "icon": "🌍"},
]


@router.get("")
def get_profile(user_id: int = 1, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    activities = (
        db.query(models.Activity)
        .filter(models.Activity.user_id == user_id)
        .order_by(models.Activity.timestamp)
        .all()
    )

    total_co2 = sum(a.co2_footprint or 0 for a in activities)

    # Badge logic (simple rules)
    earned_ids = set()
    if activities:
        earned_ids.add(1)  # First Log
    if len(activities) >= 7:
        earned_ids.add(2)  # Week Streak
    if total_co2 == 0 and len(activities) > 5:
        earned_ids.add(3)
    transit_acts = [a for a in activities if (a.miles_transit or 0) > 0]
    if len(transit_acts) >= 10:
        earned_ids.add(4)
    vegan_acts = [a for a in activities if a.diet_type in ("vegan", "vegetarian")]
    if len(vegan_acts) >= 14:
        earned_ids.add(5)
    solar_acts = [a for a in activities if (a.electricity_kwh or 0) > 0]
    if solar_acts:
        earned_ids.add(6)
    goals = db.query(models.Goal).filter(models.Goal.user_id == user_id).all()
    completed = [g for g in goals if g.current_progress >= g.target_reduction]
    if completed:
        earned_ids.add(7)

    badges = [
        {**b, "earned": b["id"] in earned_ids}
        for b in BADGES_TEMPLATE
    ]

    # Historical chart (last 7 days)
    now = datetime.utcnow()
    history = []
    for d in range(6, -1, -1):
        day_start = (now - timedelta(days=d)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        day_acts = [a for a in activities if day_start <= a.timestamp < day_end]
        history.append({
            "label": day_start.strftime("%a"),
            "transport": round(sum(a.transport_co2 or 0 for a in day_acts), 2),
            "energy": round(sum(a.energy_co2 or 0 for a in day_acts), 2),
            "food": round(sum(a.food_co2 or 0 for a in day_acts), 2),
            "shopping": round(sum(a.shopping_co2 or 0 for a in day_acts), 2),
            "total": round(sum(a.co2_footprint or 0 for a in day_acts), 2),
        })

    return {
        "username": user.username,
        "email": user.email,
        "member_since": user.member_since,
        "total_co2_saved": round(total_co2, 2),
        "friends_count": 5,
        "goals": [
            {
                "id": g.id,
                "title": g.title,
                "description": g.description,
                "target_reduction": g.target_reduction,
                "current_progress": g.current_progress,
                "category": g.category,
            }
            for g in goals
        ],
        "badges": badges,
        "emission_history": history,
    }


@router.post("/goals")
def add_goal(goal: schemas.GoalCreate, user_id: int = 1, db: Session = Depends(database.get_db)):
    new_goal = models.Goal(
        title=goal.title,
        description=goal.description,
        target_reduction=goal.target_reduction,
        current_progress=0.0,
        category=goal.category,
        user_id=user_id,
    )
    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)
    return {
        "id": new_goal.id,
        "title": new_goal.title,
        "description": new_goal.description,
        "target_reduction": new_goal.target_reduction,
        "current_progress": new_goal.current_progress,
        "category": new_goal.category,
    }
