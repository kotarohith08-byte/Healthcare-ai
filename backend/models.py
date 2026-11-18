"""
SQLAlchemy Database Models for Healthcare Assistance System
"""

import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), default="Healthcare User")
    role = Column(String(20), default="user") # user, clinician, admin
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    profile = relationship("HealthProfile", back_populates="user", uselist=False)
    chat_sessions = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")
    metric_logs = relationship("HealthMetricLog", back_populates="user", cascade="all, delete-orphan")
    predictions = relationship("PredictionLog", back_populates="user", cascade="all, delete-orphan")

class HealthProfile(Base):
    __tablename__ = "health_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    age = Column(Integer, nullable=True)
    gender = Column(String(20), nullable=True)
    height_cm = Column(Float, nullable=True)
    weight_kg = Column(Float, nullable=True)
    blood_group = Column(String(10), nullable=True)
    primary_physician = Column(String(100), nullable=True)
    chronic_conditions = Column(JSON, default=list) # e.g. ["Hypertension", "Asthma"]
    allergies = Column(JSON, default=list) # e.g. ["Penicillin", "Peanuts"]
    disclaimer_accepted = Column(Boolean, default=True)
    disclaimer_accepted_at = Column(DateTime, default=datetime.datetime.utcnow)
    preferred_units = Column(String(10), default="metric") # metric / imperial
    theme_preference = Column(String(10), default="dark") # dark / light
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="profile")

class HealthMetricLog(Base):
    __tablename__ = "health_metric_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    metric_type = Column(String(50), nullable=False) # systolic_bp, diastolic_bp, heart_rate, blood_glucose, bmi, weight_kg
    value = Column(Float, nullable=False)
    unit = Column(String(20), nullable=False) # mmHg, bpm, mg/dL, kg/m2, kg
    status = Column(String(30), default="Normal") # Normal, Elevated, High, Critical
    notes = Column(Text, nullable=True)
    recorded_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="metric_logs")

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    title = Column(String(200), default="New Medical Consultation")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan", order_by="ChatMessage.created_at")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(64), ForeignKey("chat_sessions.id"), index=True)
    role = Column(String(20), nullable=False) # user, assistant, system
    content = Column(Text, nullable=False)
    sources = Column(JSON, default=list)
    extracted_symptoms = Column(JSON, default=list)
    simplified_terms = Column(JSON, default=dict) # e.g. {"dyspnea": "shortness of breath"}
    is_emergency = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    session = relationship("ChatSession", back_populates="messages")

class DatasetRegistry(Base):
    __tablename__ = "dataset_registry"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), unique=True, index=True, nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    category = Column(String(80), nullable=False)
    description = Column(Text, nullable=False)
    source = Column(String(200), nullable=False)
    file_path = Column(String(300), nullable=False)
    file_type = Column(String(10), default="csv")
    record_count = Column(Integer, default=0)
    feature_count = Column(Integer, default=0)
    missing_values_count = Column(Integer, default=0)
    duplicate_count = Column(Integer, default=0)
    quality_score = Column(Float, default=95.0) # 0 to 100%
    status = Column(String(30), default="Active")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class PredictionLog(Base):
    __tablename__ = "prediction_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)
    model_name = Column(String(100), nullable=False) # heart_disease, diabetes, stroke, symptom_classifier
    inputs = Column(JSON, nullable=False)
    result = Column(JSON, nullable=False)
    risk_level = Column(String(30), nullable=False) # Low, Moderate, High, Critical
    confidence = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="predictions")
