"""Social router – leaderboard, friend management."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models, database

router = APIRouter(prefix="/api/social", tags=["Social"])

# Mock friends data seeded for demo purposes
MOCK_FRIENDS = [
    {"username": "EcoWarrior99", "total_co2": 8.2, "change": -12.3},
    {"username": "GreenMachine", "total_co2": 10.5, "change": -8.1},
    {"username": "SustainSarah", "total_co2": 12.1, "change": 2.4},
    {"username": "CarbonFighter", "total_co2": 14.7, "change": -5.6},
    {"username": "PlanetPal", "total_co2": 18.3, "change": 7.2},
]


@router.get("/stats")
def get_stats(user_id: int = 1, db: Session = Depends(database.get_db)):
    """Return social stats for the current user."""
    # Get user's average daily CO2
    user_activities = (
        db.query(models.Activity)
        .filter(models.Activity.user_id == user_id)
        .all()
    )
    user_avg = (
        sum(a.co2_footprint or 0 for a in user_activities) / len(user_activities)
        if user_activities else 15.0
    )

    # Compare against mock leaderboard
    lower_than = sum(1 for f in MOCK_FRIENDS if user_avg < f["total_co2"])
    better_pct = round(lower_than / len(MOCK_FRIENDS) * 100, 0)

    # Rank among friends + self
    all_scores = sorted(
        [(f["username"], f["total_co2"]) for f in MOCK_FRIENDS] + [("You", user_avg)],
        key=lambda x: x[1]
    )
    rank = next((i + 1 for i, (name, _) in enumerate(all_scores) if name == "You"), 1)

    return {
        "friends_count": len(MOCK_FRIENDS),
        "your_rank": rank,
        "better_than_percent": better_pct,
    }


@router.get("/leaderboard")
def get_leaderboard(user_id: int = 1, db: Session = Depends(database.get_db)):
    """Return leaderboard mixing real user data + mock friends."""
    user_activities = (
        db.query(models.Activity)
        .filter(models.Activity.user_id == user_id)
        .all()
    )
    user_avg = (
        sum(a.co2_footprint or 0 for a in user_activities) / len(user_activities)
        if user_activities else 15.0
    )

    # Build combined list
    entries = [
        {
            "username": f["username"],
            "total_co2": f["total_co2"],
            "change_percent": f["change"],
            "is_you": False,
        }
        for f in MOCK_FRIENDS
    ] + [
        {
            "username": "You",
            "total_co2": round(user_avg, 1),
            "change_percent": -5.0,
            "is_you": True,
        }
    ]

    # Sort by CO2 ascending (lower = better)
    entries.sort(key=lambda x: x["total_co2"])

    return [
        {
            "rank": i + 1,
            "username": e["username"],
            "avatar_initial": e["username"][0].upper(),
            "total_co2": e["total_co2"],
            "change_percent": e["change_percent"],
            "is_you": e["is_you"],
        }
        for i, e in enumerate(entries)
    ]


@router.get("/most-improved")
def get_most_improved(db: Session = Depends(database.get_db)):
    """Return most improved friends."""
    improved = sorted(MOCK_FRIENDS, key=lambda x: x["change"])[:3]
    return [
        {
            "rank": i + 1,
            "username": f["username"],
            "avatar_initial": f["username"][0].upper(),
            "total_co2": f["total_co2"],
            "change_percent": f["change"],
            "is_you": False,
        }
        for i, f in enumerate(improved)
    ]


@router.post("/friends/add")
def add_friend(friend_username: str, user_id: int = 1, db: Session = Depends(database.get_db)):
    """Add a friend by username."""
    friend = db.query(models.User).filter(models.User.username == friend_username).first()
    if not friend:
        return {"success": False, "message": f"User '{friend_username}' not found."}
    return {"success": True, "message": f"Friend request sent to {friend_username}."}
