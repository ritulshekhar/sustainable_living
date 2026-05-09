"""Dashboard router – summary stats, chart data, goals."""
from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models, schemas, database

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

COLORS = {
    "transportation": "#22c55e",
    "energy": "#3b82f6",
    "food": "#f59e0b",
    "shopping": "#ec4899",
}


def _get_user_or_default(user_id: int, db: Session) -> models.User:
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        # Create demo user if none exists
        user = models.User(
            id=user_id,
            username="demo_user",
            email="demo@example.com",
            hashed_password="$2b$12$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


@router.get("/summary")
def get_summary(user_id: int = 1, db: Session = Depends(database.get_db)):
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=7)
    month_start = today_start - timedelta(days=30)

    base_q = db.query(models.Activity).filter(models.Activity.user_id == user_id)

    def sum_co2(q):
        result = q.with_entities(func.sum(models.Activity.co2_footprint)).scalar()
        return round(result or 0.0, 2)

    total_today = sum_co2(base_q.filter(models.Activity.timestamp >= today_start))
    total_week = sum_co2(base_q.filter(models.Activity.timestamp >= week_start))
    total_month = sum_co2(base_q.filter(models.Activity.timestamp >= month_start))
    total_all = sum_co2(base_q)
    count = base_q.count()

    # Category breakdown
    all_acts = base_q.all()
    transport_total = sum(a.transport_co2 or 0 for a in all_acts)
    energy_total = sum(a.energy_co2 or 0 for a in all_acts)
    food_total = sum(a.food_co2 or 0 for a in all_acts)
    shopping_total = sum(a.shopping_co2 or 0 for a in all_acts)
    grand = transport_total + energy_total + food_total + shopping_total or 1

    breakdown = [
        {"category": "Transportation", "co2": round(transport_total, 2),
         "percentage": round(transport_total / grand * 100, 1), "color": COLORS["transportation"]},
        {"category": "Energy", "co2": round(energy_total, 2),
         "percentage": round(energy_total / grand * 100, 1), "color": COLORS["energy"]},
        {"category": "Food", "co2": round(food_total, 2),
         "percentage": round(food_total / grand * 100, 1), "color": COLORS["food"]},
        {"category": "Shopping", "co2": round(shopping_total, 2),
         "percentage": round(shopping_total / grand * 100, 1), "color": COLORS["shopping"]},
    ]

    # Recent activities
    recent = (
        base_q.order_by(models.Activity.timestamp.desc()).limit(5).all()
    )
    recent_list = [
        {
            "id": a.id,
            "timestamp": a.timestamp,
            "total_co2": a.co2_footprint,
            "transport_co2": a.transport_co2 or 0,
            "energy_co2": a.energy_co2 or 0,
            "food_co2": a.food_co2 or 0,
            "shopping_co2": a.shopping_co2 or 0,
            "diet_type": a.diet_type or "omnivore",
            "miles_car": a.miles_car or 0,
            "miles_transit": a.miles_transit or 0,
            "electricity_kwh": a.electricity_kwh or 0,
        }
        for a in recent
    ]

    # Goals
    goals = db.query(models.Goal).filter(models.Goal.user_id == user_id).all()

    return {
        "total_co2_today": total_today,
        "total_co2_week": total_week,
        "total_co2_month": total_month,
        "total_co2_alltime": total_all,
        "activities_count": count,
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
        "recent_activities": recent_list,
        "category_breakdown": breakdown,
    }


@router.get("/chart")
def get_chart(user_id: int = 1, period: str = "weekly", db: Session = Depends(database.get_db)):
    """Return time-series chart data."""
    now = datetime.utcnow()

    if period == "daily":
        # Last 24 hours by hour
        points = []
        for h in range(23, -1, -1):
            start = now - timedelta(hours=h + 1)
            end = now - timedelta(hours=h)
            acts = (
                db.query(models.Activity)
                .filter(
                    models.Activity.user_id == user_id,
                    models.Activity.timestamp >= start,
                    models.Activity.timestamp < end,
                )
                .all()
            )
            points.append(_aggregate(f"{end.strftime('%H')}:00", acts))
        return points

    elif period == "weekly":
        points = []
        for d in range(6, -1, -1):
            day_start = (now - timedelta(days=d)).replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)
            acts = (
                db.query(models.Activity)
                .filter(
                    models.Activity.user_id == user_id,
                    models.Activity.timestamp >= day_start,
                    models.Activity.timestamp < day_end,
                )
                .all()
            )
            points.append(_aggregate(day_start.strftime("%a"), acts))
        return points

    elif period == "monthly":
        points = []
        for w in range(3, -1, -1):
            start = now - timedelta(weeks=w + 1)
            end = now - timedelta(weeks=w)
            acts = (
                db.query(models.Activity)
                .filter(
                    models.Activity.user_id == user_id,
                    models.Activity.timestamp >= start,
                    models.Activity.timestamp < end,
                )
                .all()
            )
            points.append(_aggregate(f"Week {4 - w}", acts))
        return points

    else:  # yearly
        points = []
        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        for m in range(12):
            start = now.replace(month=m + 1, day=1, hour=0, minute=0, second=0, microsecond=0)
            if m == 11:
                end = start.replace(year=start.year + 1, month=1)
            else:
                end = start.replace(month=m + 2)
            acts = (
                db.query(models.Activity)
                .filter(
                    models.Activity.user_id == user_id,
                    models.Activity.timestamp >= start,
                    models.Activity.timestamp < end,
                )
                .all()
            )
            points.append(_aggregate(months[m], acts))
        return points


def _aggregate(label: str, acts) -> dict:
    return {
        "label": label,
        "transport": round(sum(a.transport_co2 or 0 for a in acts), 2),
        "energy": round(sum(a.energy_co2 or 0 for a in acts), 2),
        "food": round(sum(a.food_co2 or 0 for a in acts), 2),
        "shopping": round(sum(a.shopping_co2 or 0 for a in acts), 2),
        "total": round(sum(a.co2_footprint or 0 for a in acts), 2),
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


@router.delete("/goals/{goal_id}")
def delete_goal(goal_id: int, db: Session = Depends(database.get_db)):
    goal = db.query(models.Goal).filter(models.Goal.id == goal_id).first()
    if goal:
        db.delete(goal)
        db.commit()
    return {"success": True}
