from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime


# ── Auth Schemas ─────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None


# ── Activity Schemas ──────────────────────────────────────────────────────────

class ActivityLogRequest(BaseModel):
    """Full activity log request from the UI."""
    user_id: int = 1
    miles_car: float = 0.0
    miles_transit: float = 0.0
    flight_hours: float = 0.0
    electricity_kwh: float = 0.0
    gas_therms: float = 0.0
    diet_type: str = "omnivore"   # omnivore | vegetarian | vegan
    meat_servings: int = 0
    purchases: int = 0

class EmissionBreakdown(BaseModel):
    transport: float
    energy: float
    food: float
    shopping: float
    total: float

class ActivityLogResponse(BaseModel):
    id: int
    user_id: int
    emissions: EmissionBreakdown
    recommendation: str
    timestamp: datetime

class ActivitySummary(BaseModel):
    id: int
    timestamp: datetime
    total_co2: float
    transport_co2: float
    energy_co2: float
    food_co2: float
    shopping_co2: float
    diet_type: str
    miles_car: float
    miles_transit: float
    electricity_kwh: float

    class Config:
        from_attributes = True


# ── Legacy simplified schemas (keep backward compat) ─────────────────────────

class LogActivityRequest(BaseModel):
    user_id: int
    travel_km: float
    electricity_kwh: float
    food_type: str

class LogActivityResponse(BaseModel):
    user_id: int
    emissions: "LegacyBreakdown"
    recommendation: str

class LegacyBreakdown(BaseModel):
    travel: float
    electricity: float
    food: float
    total: float


# ── Dashboard Schemas ─────────────────────────────────────────────────────────

class GoalSchema(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    target_reduction: float
    current_progress: float
    category: str

    class Config:
        from_attributes = True

class GoalCreate(BaseModel):
    title: str
    description: Optional[str] = None
    target_reduction: float
    category: str

class ChartPoint(BaseModel):
    label: str
    transport: float
    energy: float
    food: float
    shopping: float
    total: float

class CategoryBreakdown(BaseModel):
    category: str
    co2: float
    percentage: float
    color: str

class DashboardSummary(BaseModel):
    total_co2_today: float
    total_co2_week: float
    total_co2_month: float
    total_co2_alltime: float
    activities_count: int
    goals: List[GoalSchema]
    recent_activities: List[ActivitySummary]
    category_breakdown: List[CategoryBreakdown]


# ── Social Schemas ────────────────────────────────────────────────────────────

class LeaderboardEntry(BaseModel):
    rank: int
    username: str
    avatar_initial: str
    total_co2: float
    change_percent: float
    is_you: bool = False

class SocialStats(BaseModel):
    friends_count: int
    your_rank: int
    better_than_percent: float

class AddFriendRequest(BaseModel):
    friend_username: str

class SocialData(BaseModel):
    stats: SocialStats
    leaderboard: List[LeaderboardEntry]
    most_improved: List[LeaderboardEntry]


# ── Tips Schemas ──────────────────────────────────────────────────────────────

class Tip(BaseModel):
    id: int
    title: str
    description: str
    category: str
    estimated_impact: str
    difficulty: str   # Easy | Medium | Hard
    icon: str


# ── Profile Schemas ───────────────────────────────────────────────────────────

class Badge(BaseModel):
    id: int
    name: str
    description: str
    icon: str
    earned: bool

class ProfileData(BaseModel):
    username: str
    email: str
    member_since: datetime
    total_co2_saved: float
    friends_count: int
    goals: List[GoalSchema]
    badges: List[Badge]
    emission_history: List[ChartPoint]


# ── Recommendation ────────────────────────────────────────────────────────────

class Recommendation(BaseModel):
    category: str
    tip: str
    impact_level: str
