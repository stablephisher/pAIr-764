"""
Firebase JWT Verification
==========================
Verifies Google Firebase ID tokens from the frontend.
No email/password — Google OAuth only.
"""

import os
import json
from typing import Optional, Dict, Any
from datetime import datetime

import firebase_admin
from firebase_admin import credentials, auth as firebase_auth, firestore
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from config import config


# ─── Firebase Initialization ─────────────────────────────────────────
_firebase_app = None

def get_firebase_app():
    """Lazy-initialize Firebase Admin SDK."""
    global _firebase_app
    if _firebase_app is not None:
        return _firebase_app

    cred_path = config.firebase.credentials_path
    if cred_path and os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        _firebase_app = firebase_admin.initialize_app(cred)
    else:
        # Use Application Default Credentials (Cloud Run / GCE)
        _firebase_app = firebase_admin.initialize_app()

    return _firebase_app


def get_firestore_client():
    """Get Firestore client instance."""
    get_firebase_app()
    return firestore.client()


# ─── Security Scheme ─────────────────────────────────────────────────
security = HTTPBearer(auto_error=False)


# ─── Token Verification ──────────────────────────────────────────────
class FirebaseUser:
    """Verified Firebase user context."""

    def __init__(self, uid: str, email: str, name: str, picture: str, 
                 email_verified: bool, provider: str):
        self.uid = uid
        self.email = email
        self.name = name
        self.picture = picture
        self.email_verified = email_verified
        self.provider = provider

    def to_dict(self) -> Dict[str, Any]:
        return {
            "uid": self.uid,
            "email": self.email,
            "name": self.name,
            "picture": self.picture,
            "email_verified": self.email_verified,
            "provider": self.provider,
        }


async def verify_firebase_token(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security),
) -> FirebaseUser:
    """
    FastAPI dependency that verifies Firebase JWT tokens.
    
    Usage:
        @app.get("/protected")
        async def protected_route(user: FirebaseUser = Depends(verify_firebase_token)):
            return {"uid": user.uid}
    """
    if config.server.demo_mode:
        # Demo mode bypass
        return FirebaseUser(
            uid="demo-user-001",
            email="demo@pair-msme.dev",
            name="Demo MSME Owner",
            picture="",
            email_verified=True,
            provider="demo",
        )

    if credentials is None:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    token = credentials.credentials
    try:
        get_firebase_app()
        decoded = firebase_auth.verify_id_token(token)

        # Enforce Google-only login
        provider = decoded.get("firebase", {}).get("sign_in_provider", "unknown")
        if provider != "google.com" and not config.server.demo_mode:
            raise HTTPException(
                status_code=403,
                detail="Only Google sign-in is allowed. Please use Google login.",
            )

        return FirebaseUser(
            uid=decoded["uid"],
            email=decoded.get("email", ""),
            name=decoded.get("name", ""),
            picture=decoded.get("picture", ""),
            email_verified=decoded.get("email_verified", False),
            provider=provider,
        )

    except firebase_auth.ExpiredIdTokenError:
        raise HTTPException(status_code=401, detail="Token expired. Please re-authenticate.")
    except firebase_auth.RevokedIdTokenError:
        raise HTTPException(status_code=401, detail="Token revoked. Please re-authenticate.")
    except firebase_auth.InvalidIdTokenError:
        raise HTTPException(status_code=401, detail="Invalid token.")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")


# ─── Raw Token Verification (non-dependency) ────────────────────────
def verify_firebase_token_raw(token: str) -> Dict[str, Any]:
    """Verify a raw Firebase ID token string. Returns decoded token dict."""
    if config.server.demo_mode:
        return {
            "uid": "demo-user-001",
            "email": "demo@pair-msme.dev",
            "name": "Demo MSME Owner",
            "email_verified": True,
            "provider": "demo",
        }
    try:
        get_firebase_app()
        decoded = firebase_auth.verify_id_token(token)
        return {
            "uid": decoded["uid"],
            "email": decoded.get("email", ""),
            "name": decoded.get("name", ""),
            "email_verified": decoded.get("email_verified", False),
            "provider": decoded.get("firebase", {}).get("sign_in_provider", "unknown"),
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token verification failed: {str(e)}")


# ─── Optional Auth (for public + authenticated endpoints) ────────────
async def optional_firebase_token(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security),
) -> Optional[FirebaseUser]:
    """Returns FirebaseUser if token present, None otherwise."""
    if credentials is None:
        return None
    try:
        return await verify_firebase_token(credentials)
    except HTTPException:
        return None
