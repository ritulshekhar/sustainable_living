"""
Seed script – creates a demo user and sample activities in the database.
Run: python seed_demo.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal, engine
from app import models
from app.auth import get_password_hash
import datetime, random

models.Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Check if demo user already exists
user = db.query(models.User).filter(models.User.username == "demo_user").first()
if not user:
    user = models.User(
        username="demo_user",
        email="demo@carbontrack.app",
        hashed_password=get_password_hash("demo1234"),
        member_since=datetime.datetime.utcnow() - datetime.timedelta(days=90),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    print(f"✅ Created user: demo_user (id={user.id})")
else:
    print(f"ℹ️  User already exists: demo_user (id={user.id})")

# Seed sample activities for the past 14 days
activities_created = 0
for day_offset in range(14, 0, -1):
    ts = datetime.datetime.utcnow() - datetime.timedelta(days=day_offset)
    ts = ts.replace(hour=18, minute=0, second=0, microsecond=0)

    # Check if activity already exists for this day
    existing = (
        db.query(models.Activity)
        .filter(
            models.Activity.user_id == user.id,
            models.Activity.timestamp >= ts.replace(hour=0, minute=0, second=0),
            models.Activity.timestamp < ts.replace(hour=0, minute=0, second=0) + datetime.timedelta(days=1),
        )
        .first()
    )
    if existing:
        continue

    miles_car = round(random.uniform(0, 30), 1)
    miles_transit = round(random.uniform(0, 10), 1)
    electricity_kwh = round(random.uniform(5, 25), 1)
    gas_therms = round(random.uniform(0, 3), 1)
    diet = random.choice(["omnivore", "vegetarian", "vegan"])
    meat_servings = random.randint(0, 3)
    purchases = random.randint(0, 2)

    transport_co2 = miles_car * 0.404 + miles_transit * 0.089
    energy_co2 = electricity_kwh * 0.386 + gas_therms * 5.3
    food_base = {"omnivore": 7.19, "vegetarian": 3.81, "vegan": 2.89}[diet]
    food_co2 = food_base + meat_servings * 3.3
    shopping_co2 = purchases * 12.0
    total = transport_co2 + energy_co2 + food_co2 + shopping_co2

    act = models.Activity(
        user_id=user.id,
        miles_car=miles_car,
        miles_transit=miles_transit,
        flight_hours=0,
        electricity_kwh=electricity_kwh,
        gas_therms=gas_therms,
        diet_type=diet,
        meat_servings=meat_servings,
        purchases=purchases,
        transport_co2=round(transport_co2, 2),
        energy_co2=round(energy_co2, 2),
        food_co2=round(food_co2, 2),
        shopping_co2=round(shopping_co2, 2),
        co2_footprint=round(total, 2),
        category="daily",
        activity_type="mixed",
        value=round(total, 2),
        unit="kg CO2e",
        timestamp=ts,
    )
    db.add(act)
    activities_created += 1

db.commit()
print(f"✅ Seeded {activities_created} sample activities")

# Seed sample goals
if not db.query(models.Goal).filter(models.Goal.user_id == user.id).first():
    goals = [
        models.Goal(user_id=user.id, title="Reduce Car Usage", description="Use public transit 3x per week", target_reduction=30, current_progress=12, category="transportation"),
        models.Goal(user_id=user.id, title="Cut Electricity by 20%", description="Unplug devices when not in use", target_reduction=20, current_progress=8, category="energy"),
    ]
    for g in goals:
        db.add(g)
    db.commit()
    print(f"✅ Seeded {len(goals)} sample goals")

db.close()
print("\n🎉 Demo data ready! Start the server with:")
print("   uvicorn app.main:app --reload --port 8000")
