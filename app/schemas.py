from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class ActivityBase(BaseModel):
    category: str
    activity_type: str
    value: float
    unit: str

class ActivityCreate(ActivityBase):
    pass

class Activity(ActivityBase):
    id: int
    co2_footprint: float
    timestamp: datetime
    user_id: int

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    activities: List[Activity] = []

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class FootprintSummary(BaseModel):
    total_co2: float
    activities_count: int
    history: List[Activity]

class Recommendation(BaseModel):
    category: str
    tip: str
    impact_level: str

# Simplified models for academic review
class LogActivityRequest(BaseModel):
    user_id: int
    travel_km: float
    electricity_kwh: float
    food_type: str  # meat, vegetarian, vegan

class EmissionBreakdown(BaseModel):
    travel: float
    electricity: float
    food: float
    total: float

class LogActivityResponse(BaseModel):
    user_id: int
    emissions: EmissionBreakdown
    recommendation: str
