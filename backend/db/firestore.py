"""
pAIr v3 — Firestore Database Layer
=====================================
Manages persistent storage of user profiles, analysis history,
and onboarding data in Google Cloud Firestore.

Collections
-----------
- users/{uid}                  — User profiles & settings
- users/{uid}/analyses/{id}    — Individual analysis results
- users/{uid}/onboarding       — Onboarding questionnaire state
- global_stats                 — Platform-wide statistics

Falls back gracefully to JSON file storage if Firestore is unavailable
(e.g., in local/demo mode).
"""

from __future__ import annotations

import json
import os
import time
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional


class FirestoreDB:
    """
    Firestore abstraction layer with local JSON fallback.

    Usage
    -----
        db = FirestoreDB()
        db.save_user_profile(uid, profile_dict)
        db.save_analysis(uid, analysis_dict)
        history = db.get_user_analyses(uid)
    """

    def __init__(self):
        self._firestore_client = None
        self._use_firestore = False
        self._local_dir = "data"
        self._init_storage()

    def _init_storage(self):
        """Try to connect to Firestore; fall back to local JSON."""
        try:
            from auth.firebase_auth import get_firestore_client
            client = get_firestore_client()
            if client:
                self._firestore_client = client
                self._use_firestore = True
                print("[DB] Firestore connected successfully")
                return
        except Exception as e:
            print(f"[DB] Firestore unavailable ({e}), using local JSON storage")

        # Local fallback
        os.makedirs(self._local_dir, exist_ok=True)
        print("[DB] Using local JSON file storage")

    # ════════════════════════════════════════════════════════════
    #  USER PROFILES
    # ════════════════════════════════════════════════════════════

    def save_user_profile(self, uid: str, profile: Dict[str, Any]) -> bool:
        """
        Save or update a user's business profile.

        Parameters
        ----------
        uid : str
            Firebase user UID.
        profile : dict
            Profile data from onboarding engine.
        """
        profile["updated_at"] = datetime.utcnow().isoformat()
        profile["uid"] = uid

        if self._use_firestore:
            try:
                ref = self._firestore_client.collection("users").document(uid)
                ref.set(profile, merge=True)
                return True
            except Exception as e:
                print(f"[DB] Firestore save_user_profile failed: {e}")
                return self._save_local("users", uid, profile)
        else:
            return self._save_local("users", uid, profile)

    def get_user_profile(self, uid: str) -> Optional[Dict[str, Any]]:
        """Get a user's profile by UID."""
        if self._use_firestore:
            try:
                ref = self._firestore_client.collection("users").document(uid)
                doc = ref.get()
                return doc.to_dict() if doc.exists else None
            except Exception as e:
                print(f"[DB] Firestore get_user_profile failed: {e}")
                return self._load_local("users", uid)
        else:
            return self._load_local("users", uid)

    def update_user_settings(self, uid: str, settings: Dict[str, Any]) -> bool:
        """Update specific user settings without overwriting the full profile."""
        if self._use_firestore:
            try:
                ref = self._firestore_client.collection("users").document(uid)
                ref.update(settings)
                return True
            except Exception as e:
                print(f"[DB] Firestore update_user_settings failed: {e}")
                return False
        else:
            profile = self._load_local("users", uid) or {}
            profile.update(settings)
            return self._save_local("users", uid, profile)

    # ════════════════════════════════════════════════════════════
    #  ANALYSIS HISTORY
    # ════════════════════════════════════════════════════════════

    def save_analysis(
        self,
        uid: Optional[str],
        analysis: Dict[str, Any],
        source: str = "uploaded",
    ) -> str:
        """
        Save a policy analysis result.

        Returns
        -------
        str
            The generated analysis ID.
        """
        analysis_id = str(uuid.uuid4())
        record = {
            "id": analysis_id,
            "uid": uid,
            "timestamp": time.time(),
            "created_at": datetime.utcnow().isoformat(),
            "source": source,
            "analysis": analysis,
        }

        if self._use_firestore and uid:
            try:
                ref = (
                    self._firestore_client.collection("users")
                    .document(uid)
                    .collection("analyses")
                    .document(analysis_id)
                )
                ref.set(record)
                return analysis_id
            except Exception as e:
                print(f"[DB] Firestore save_analysis failed: {e}")

        # Local fallback (always save locally too)
        self._append_local_history(record)
        return analysis_id

    def get_user_analyses(
        self, uid: str, limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Get analysis history for a specific user."""
        if self._use_firestore:
            try:
                ref = (
                    self._firestore_client.collection("users")
                    .document(uid)
                    .collection("analyses")
                    .order_by("timestamp", direction="DESCENDING")
                    .limit(limit)
                )
                docs = ref.stream()
                return [doc.to_dict() for doc in docs]
            except Exception as e:
                print(f"[DB] Firestore get_user_analyses failed: {e}")

        # Local fallback
        return self._get_local_history(uid, limit)

    def get_all_analyses(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get all analyses (for anonymous/demo mode)."""
        return self._get_local_history(None, limit)

    def delete_analysis(self, uid: Optional[str], analysis_id: str) -> bool:
        """Delete a specific analysis."""
        if self._use_firestore and uid:
            try:
                ref = (
                    self._firestore_client.collection("users")
                    .document(uid)
                    .collection("analyses")
                    .document(analysis_id)
                )
                ref.delete()
                return True
            except Exception as e:
                print(f"[DB] Firestore delete_analysis failed: {e}")

        # Local fallback
        return self._delete_from_local_history(analysis_id)

    def clear_user_history(self, uid: str) -> bool:
        """Clear all analyses for a user."""
        if self._use_firestore:
            try:
                ref = (
                    self._firestore_client.collection("users")
                    .document(uid)
                    .collection("analyses")
                )
                docs = ref.stream()
                for doc in docs:
                    doc.reference.delete()
                return True
            except Exception as e:
                print(f"[DB] Firestore clear_user_history failed: {e}")

        return self._clear_local_history(uid)

    # ════════════════════════════════════════════════════════════
    #  ONBOARDING STATE
    # ════════════════════════════════════════════════════════════

    def save_onboarding_state(
        self, uid: str, answers: Dict[str, Any], is_complete: bool
    ) -> bool:
        """Save onboarding progress."""
        state = {
            "answers": answers,
            "is_complete": is_complete,
            "updated_at": datetime.utcnow().isoformat(),
        }
        if self._use_firestore:
            try:
                ref = (
                    self._firestore_client.collection("users")
                    .document(uid)
                    .collection("onboarding")
                    .document("state")
                )
                ref.set(state)
                return True
            except Exception as e:
                print(f"[DB] Firestore save_onboarding_state failed: {e}")

        return self._save_local("onboarding", uid, state)

    def get_onboarding_state(self, uid: str) -> Optional[Dict[str, Any]]:
        """Get onboarding progress."""
        if self._use_firestore:
            try:
                ref = (
                    self._firestore_client.collection("users")
                    .document(uid)
                    .collection("onboarding")
                    .document("state")
                )
                doc = ref.get()
                return doc.to_dict() if doc.exists else None
            except Exception as e:
                print(f"[DB] Firestore get_onboarding_state failed: {e}")

        return self._load_local("onboarding", uid)

    # ════════════════════════════════════════════════════════════
    #  GLOBAL STATS
    # ════════════════════════════════════════════════════════════

    def increment_global_stat(self, stat_name: str, value: int = 1):
        """Increment a platform-wide statistic."""
        if self._use_firestore:
            try:
                from google.cloud.firestore import Increment
                ref = self._firestore_client.collection("global_stats").document("counters")
                ref.set({stat_name: Increment(value)}, merge=True)
            except Exception:
                pass  # Stats are non-critical

    def get_global_stats(self) -> Dict[str, Any]:
        """Get platform statistics."""
        if self._use_firestore:
            try:
                ref = self._firestore_client.collection("global_stats").document("counters")
                doc = ref.get()
                return doc.to_dict() if doc.exists else {}
            except Exception:
                pass
        return {}

    # ════════════════════════════════════════════════════════════
    #  LOCAL JSON FALLBACK
    # ════════════════════════════════════════════════════════════

    def _save_local(self, collection: str, doc_id: str, data: Dict) -> bool:
        """Save to local JSON file."""
        try:
            path = os.path.join(self._local_dir, collection)
            os.makedirs(path, exist_ok=True)
            filepath = os.path.join(path, f"{doc_id}.json")
            with open(filepath, "w") as f:
                json.dump(data, f, indent=2, default=str)
            return True
        except Exception as e:
            print(f"[DB] Local save failed: {e}")
            return False

    def _load_local(self, collection: str, doc_id: str) -> Optional[Dict]:
        """Load from local JSON file."""
        filepath = os.path.join(self._local_dir, collection, f"{doc_id}.json")
        if os.path.exists(filepath):
            try:
                with open(filepath, "r") as f:
                    return json.load(f)
            except Exception:
                pass
        return None

    def _append_local_history(self, record: Dict):
        """Append analysis to local history file."""
        history_file = os.path.join(self._local_dir, "history.json")
        history = []
        if os.path.exists(history_file):
            try:
                with open(history_file, "r") as f:
                    history = json.load(f)
            except Exception:
                pass

        history.insert(0, record)
        history = history[:50]  # Keep last 50

        try:
            os.makedirs(self._local_dir, exist_ok=True)
            with open(history_file, "w") as f:
                json.dump(history, f, indent=2, default=str)
        except Exception as e:
            print(f"[DB] Local history append failed: {e}")

    def _get_local_history(
        self, uid: Optional[str], limit: int
    ) -> List[Dict]:
        """Get history from local file, optionally filtered by UID."""
        history_file = os.path.join(self._local_dir, "history.json")
        if not os.path.exists(history_file):
            # Fallback to old history file location
            old_file = "history.json"
            if os.path.exists(old_file):
                history_file = old_file
            else:
                return []
        try:
            with open(history_file, "r") as f:
                history = json.load(f)
            if uid:
                history = [h for h in history if h.get("uid") == uid or h.get("uid") is None]
            return history[:limit]
        except Exception:
            return []

    def _delete_from_local_history(self, analysis_id: str) -> bool:
        """Delete a specific analysis from local history."""
        history_file = os.path.join(self._local_dir, "history.json")
        if not os.path.exists(history_file):
            return False
        try:
            with open(history_file, "r") as f:
                history = json.load(f)
            new_history = [h for h in history if h.get("id") != analysis_id]
            if len(new_history) == len(history):
                return False
            with open(history_file, "w") as f:
                json.dump(new_history, f, indent=2, default=str)
            return True
        except Exception:
            return False

    def _clear_local_history(self, uid: Optional[str]) -> bool:
        """Clear local history, optionally for a specific user."""
        history_file = os.path.join(self._local_dir, "history.json")
        try:
            if uid:
                if os.path.exists(history_file):
                    with open(history_file, "r") as f:
                        history = json.load(f)
                    history = [h for h in history if h.get("uid") != uid]
                    with open(history_file, "w") as f:
                        json.dump(history, f, indent=2, default=str)
            else:
                if os.path.exists(history_file):
                    os.remove(history_file)
            return True
        except Exception:
            return False
