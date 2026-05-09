from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Table
from sqlalchemy.orm import relationship
from .database import Base
import datetime


# Friendship association table
friendship = Table(
    "friendships",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("friend_id", Integer, ForeignKey("users.id"), primary_key=True),
)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    member_since = Column(DateTime, default=datetime.datetime.utcnow)

    activities = relationship("Activity", back_populates="owner")
    goals = relationship("Goal", back_populates="owner")
    friends = relationship(
        "User",
        secondary=friendship,
        primaryjoin=id == friendship.c.user_id,
        secondaryjoin=id == friendship.c.friend_id,
        back_populates="friends"
    )


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    # Legacy fields
    category = Column(String, nullable=True)
    activity_type = Column(String, nullable=True)
    value = Column(Float, nullable=True)
    unit = Column(String, nullable=True)
    co2_footprint = Column(Float, default=0.0)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))

    # Expanded fields matching UI
    miles_car = Column(Float, default=0.0)
    miles_transit = Column(Float, default=0.0)
    flight_hours = Column(Float, default=0.0)
    electricity_kwh = Column(Float, default=0.0)
    gas_therms = Column(Float, default=0.0)
    diet_type = Column(String, default="omnivore")  # omnivore, vegetarian, vegan
    meat_servings = Column(Integer, default=0)
    purchases = Column(Integer, default=0)

    # Per-category breakdown
    transport_co2 = Column(Float, default=0.0)
    energy_co2 = Column(Float, default=0.0)
    food_co2 = Column(Float, default=0.0)
    shopping_co2 = Column(Float, default=0.0)

    owner = relationship("User", back_populates="activities")


class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String, nullable=True)
    target_reduction = Column(Float)  # % reduction target
    current_progress = Column(Float, default=0.0)
    category = Column(String)  # transportation, energy, food, shopping
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="goals")
