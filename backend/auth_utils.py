"""
Authentication & Security Utilities
- SHA-256 salted password hashing
- Session token generation & validation
"""

import hashlib
import os
import secrets
from datetime import datetime, timedelta

SALT = "ANTIGRAVITY_HEALTHCARE_SECURE_SALT_2026"

def hash_password(password: str) -> str:
    """Hashes a password with SHA-256 and salt."""
    salted = f"{SALT}:{password}"
    return hashlib.sha256(salted.encode("utf-8")).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against the stored hash."""
    return hash_password(plain_password) == hashed_password

def generate_session_token() -> str:
    """Generates a cryptographically secure hex token."""
    return secrets.token_hex(32)
