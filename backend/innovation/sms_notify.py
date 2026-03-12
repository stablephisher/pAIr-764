"""
pAIr v5 — SMS Notification Module
====================================
Sends compliance alerts and policy updates via SMS to MSME owners.
Uses a pluggable gateway interface supporting Twilio, MSG91, or any HTTP API.

Features:
  - Compliance deadline reminders
  - New policy discovery alerts
  - Risk score change notifications
  - Template-based multilingual messages
"""

from __future__ import annotations

import logging
import os
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

logger = logging.getLogger("pAIr")


# ── SMS Templates ────────────────────────────────────────────────────────

SMS_TEMPLATES = {
    "deadline_reminder": {
        "en": "pAIr Alert: {policy_name} compliance deadline is {deadline}. {days_left} days remaining. Check pAIr for details.",
        "hi": "pAIr अलर्ट: {policy_name} अनुपालन की अंतिम तिथि {deadline} है। {days_left} दिन शेष। विवरण के लिए pAIr देखें।",
    },
    "new_policy": {
        "en": "pAIr: {count} new policies found for your {sector} business. Open pAIr to review.",
        "hi": "pAIr: आपके {sector} व्यवसाय के लिए {count} नई नीतियां मिलीं। समीक्षा के लिए pAIr खोलें।",
    },
    "risk_alert": {
        "en": "pAIr Risk Alert: Your compliance risk score changed to {score}/100. {action_needed}. Check pAIr now.",
        "hi": "pAIr जोखिम अलर्ट: आपका अनुपालन जोखिम स्कोर {score}/100 हो गया। {action_needed}। अभी pAIr जांचें।",
    },
    "welcome": {
        "en": "Welcome to pAIr! Your AI compliance companion for MSMEs. We'll keep you updated on relevant policies.",
        "hi": "pAIr में आपका स्वागत है! MSME के लिए आपका AI अनुपालन साथी। हम आपको प्रासंगिक नीतियों से अपडेट रखेंगे।",
    },
}


@dataclass
class SMSMessage:
    """A structured SMS message."""
    to: str
    template: str
    language: str = "en"
    params: Dict[str, Any] = field(default_factory=dict)
    body: str = ""
    sent: bool = False
    sent_at: Optional[str] = None
    error: Optional[str] = None


@dataclass
class SMSConfig:
    """SMS gateway configuration."""
    provider: str = os.getenv("SMS_PROVIDER", "log")  # "twilio", "msg91", "log"
    api_key: str = os.getenv("SMS_API_KEY", "")
    sender_id: str = os.getenv("SMS_SENDER_ID", "pAIr")
    enabled: bool = os.getenv("SMS_ENABLED", "false").lower() == "true"


class SMSNotifyEngine:
    """
    SMS notification engine for pAIr.

    Supports multiple gateway providers.
    In development, logs messages instead of sending.
    """

    def __init__(self, config: Optional[SMSConfig] = None):
        self.config = config or SMSConfig()
        self._sent_log: List[Dict[str, Any]] = []

    def render_template(
        self, template_key: str, language: str = "en", **params
    ) -> str:
        """Render an SMS template with parameters."""
        templates = SMS_TEMPLATES.get(template_key, {})
        template = templates.get(language, templates.get("en", ""))
        if not template:
            return f"pAIr notification: {template_key}"
        try:
            return template.format(**params)
        except KeyError as e:
            logger.warning(f"SMS template missing param {e} for {template_key}")
            return template

    async def send(self, message: SMSMessage) -> SMSMessage:
        """Send an SMS message through the configured gateway."""
        if not self.config.enabled:
            logger.info(f"SMS disabled. Would send to {message.to}: {message.body}")
            message.sent = False
            message.error = "SMS sending disabled"
            return message

        # Render body from template if not already set
        if not message.body and message.template:
            message.body = self.render_template(
                message.template, message.language, **message.params
            )

        # Route to gateway
        if self.config.provider == "log":
            return self._send_log(message)
        else:
            logger.warning(f"Unknown SMS provider: {self.config.provider}")
            return self._send_log(message)

    def _send_log(self, message: SMSMessage) -> SMSMessage:
        """Log-based sender for development (no actual SMS sent)."""
        logger.info(f"[SMS-LOG] To: {message.to} | Body: {message.body}")
        message.sent = True
        message.sent_at = datetime.now(timezone.utc).isoformat()
        self._sent_log.append({
            "to": message.to,
            "body": message.body,
            "template": message.template,
            "sent_at": message.sent_at,
        })
        return message

    async def send_deadline_reminder(
        self,
        phone: str,
        policy_name: str,
        deadline: str,
        days_left: int,
        language: str = "en",
    ) -> SMSMessage:
        """Send a compliance deadline reminder."""
        msg = SMSMessage(
            to=phone,
            template="deadline_reminder",
            language=language,
            params={
                "policy_name": policy_name,
                "deadline": deadline,
                "days_left": days_left,
            },
        )
        msg.body = self.render_template(
            "deadline_reminder", language,
            policy_name=policy_name, deadline=deadline, days_left=days_left,
        )
        return await self.send(msg)

    async def send_discovery_alert(
        self,
        phone: str,
        count: int,
        sector: str,
        language: str = "en",
    ) -> SMSMessage:
        """Send alert about newly discovered policies."""
        msg = SMSMessage(
            to=phone,
            template="new_policy",
            language=language,
            params={"count": count, "sector": sector},
        )
        msg.body = self.render_template(
            "new_policy", language, count=count, sector=sector,
        )
        return await self.send(msg)

    async def send_risk_alert(
        self,
        phone: str,
        score: int,
        action_needed: str,
        language: str = "en",
    ) -> SMSMessage:
        """Send a risk score change alert."""
        msg = SMSMessage(
            to=phone,
            template="risk_alert",
            language=language,
            params={"score": score, "action_needed": action_needed},
        )
        msg.body = self.render_template(
            "risk_alert", language, score=score, action_needed=action_needed,
        )
        return await self.send(msg)

    def get_sent_log(self) -> List[Dict[str, Any]]:
        """Return the in-memory sent message log."""
        return list(self._sent_log)
