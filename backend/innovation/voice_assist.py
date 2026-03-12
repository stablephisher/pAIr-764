"""
pAIr v5 — Voice Assist Module
===============================
Processes voice queries and generates spoken responses for MSME owners.
Supports Indian regional languages via Gemini for transcription/translation.

Flow:
  1. Accept audio bytes or transcribed text
  2. Translate to English if needed (via AI)
  3. Route to appropriate backend action (discovery, analysis, query)
  4. Generate response in user's preferred language
  5. Return structured text response (TTS handled by frontend)
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

logger = logging.getLogger("pAIr")

# Supported Indian languages for voice interaction
VOICE_LANGUAGES = {
    "en": "English",
    "hi": "Hindi",
    "ta": "Tamil",
    "te": "Telugu",
    "kn": "Kannada",
    "ml": "Malayalam",
    "bn": "Bengali",
    "mr": "Marathi",
    "gu": "Gujarati",
    "pa": "Punjabi",
    "or": "Odia",
    "as": "Assamese",
    "ur": "Urdu",
}

# Intent detection keywords (multilingual)
INTENT_KEYWORDS = {
    "discover": ["find policies", "search policies", "new schemes", "government schemes", "naya yojana", "sarkari yojana"],
    "analyze": ["analyze", "check compliance", "audit", "risk check", "jaanch", "vishleshan"],
    "status": ["status", "my policies", "dashboard", "sthiti"],
    "help": ["help", "how to", "what is", "kaise", "kya hai", "madad"],
}


@dataclass
class VoiceQuery:
    """Structured voice query after processing."""
    text: str
    language: str = "en"
    detected_intent: str = "general"
    confidence: float = 0.0
    entities: Dict[str, Any] = field(default_factory=dict)


@dataclass
class VoiceResponse:
    """Response formatted for voice output."""
    text: str
    language: str = "en"
    intent: str = "general"
    action_taken: Optional[str] = None
    data: Optional[Dict[str, Any]] = None


class VoiceAssistEngine:
    """
    Voice interaction engine for pAIr.

    Handles text-based voice queries (actual speech-to-text
    is handled by the frontend via Web Speech API or Google STT).
    Backend focuses on intent detection, routing, and response generation.
    """

    def __init__(self, ai_client=None):
        self.ai_client = ai_client
        self.model = "google/gemini-2.0-flash-exp:free"

    def detect_intent(self, text: str) -> tuple[str, float]:
        """Detect user intent from query text using keyword matching."""
        text_lower = text.lower()

        for intent, keywords in INTENT_KEYWORDS.items():
            for keyword in keywords:
                if keyword in text_lower:
                    return intent, 0.85

        return "general", 0.5

    async def process_query(
        self,
        text: str,
        language: str = "en",
        user_uid: Optional[str] = None,
        business_profile: Optional[Dict[str, Any]] = None,
    ) -> VoiceResponse:
        """
        Process a voice query and return a structured response.

        Args:
            text: Transcribed text from voice input
            language: ISO 639-1 language code
            user_uid: Optional user ID for personalized responses
            business_profile: Optional business profile for context
        """
        intent, confidence = self.detect_intent(text)

        query = VoiceQuery(
            text=text,
            language=language,
            detected_intent=intent,
            confidence=confidence,
        )

        # Route by intent
        if intent == "discover":
            return await self._handle_discover(query, business_profile)
        elif intent == "analyze":
            return await self._handle_analyze(query, business_profile)
        elif intent == "status":
            return await self._handle_status(query, user_uid)
        elif intent == "help":
            return self._handle_help(query)
        else:
            return await self._handle_general(query, business_profile)

    async def _handle_discover(
        self, query: VoiceQuery, profile: Optional[Dict] = None
    ) -> VoiceResponse:
        """Handle policy discovery queries."""
        return VoiceResponse(
            text="I'll search for relevant government policies and schemes for your business. "
                 "This may take a moment.",
            language=query.language,
            intent="discover",
            action_taken="trigger_discovery",
            data={"business_profile": profile},
        )

    async def _handle_analyze(
        self, query: VoiceQuery, profile: Optional[Dict] = None
    ) -> VoiceResponse:
        """Handle analysis/compliance check queries."""
        return VoiceResponse(
            text="I'll run a compliance analysis for your business. "
                 "Let me check your regulatory obligations.",
            language=query.language,
            intent="analyze",
            action_taken="trigger_analysis",
            data={"query_text": query.text},
        )

    async def _handle_status(
        self, query: VoiceQuery, user_uid: Optional[str] = None
    ) -> VoiceResponse:
        """Handle status/dashboard queries."""
        return VoiceResponse(
            text="Here's your current compliance status. "
                 "You can view details on your dashboard.",
            language=query.language,
            intent="status",
            action_taken="show_dashboard",
            data={"user_uid": user_uid},
        )

    def _handle_help(self, query: VoiceQuery) -> VoiceResponse:
        """Handle help/information queries."""
        help_text = (
            "I'm pAIr, your AI compliance companion. I can help you: "
            "1) Find relevant government policies and schemes, "
            "2) Check your business compliance status, "
            "3) Analyze policy documents for risks and opportunities, "
            "4) Get sustainability and profitability insights. "
            "Just ask me in your preferred language!"
        )
        return VoiceResponse(
            text=help_text,
            language=query.language,
            intent="help",
        )

    async def _handle_general(
        self, query: VoiceQuery, profile: Optional[Dict] = None
    ) -> VoiceResponse:
        """Handle general queries using AI."""
        if not self.ai_client:
            return VoiceResponse(
                text="I understand your question. Please use the dashboard for detailed analysis.",
                language=query.language,
                intent="general",
            )

        try:
            system_prompt = (
                "You are pAIr, an AI regulatory intelligence companion for Indian MSMEs. "
                "Answer the user's question concisely in 2-3 sentences. "
                "Focus on practical, actionable advice about compliance, policies, and schemes."
            )
            if profile:
                system_prompt += f"\nUser's business: {profile.get('sector', 'unknown')} sector, "
                system_prompt += f"in {profile.get('state', 'India')}."

            response = await self.ai_client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": query.text},
                ],
                max_tokens=200,
            )
            answer = response.choices[0].message.content or "I couldn't process that. Please try again."

            return VoiceResponse(
                text=answer,
                language=query.language,
                intent="general",
                action_taken="ai_response",
            )
        except Exception as e:
            logger.error(f"Voice AI query failed: {e}")
            return VoiceResponse(
                text="I'm having trouble processing your question. Please try the dashboard instead.",
                language=query.language,
                intent="general",
            )

    async def translate_response(
        self, response: VoiceResponse, target_language: str
    ) -> VoiceResponse:
        """Translate response text to target language using AI."""
        if target_language == "en" or not self.ai_client:
            return response

        lang_name = VOICE_LANGUAGES.get(target_language, target_language)

        try:
            result = await self.ai_client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": f"Translate the following text to {lang_name}. "
                                   "Keep it natural and conversational. Return only the translation.",
                    },
                    {"role": "user", "content": response.text},
                ],
                max_tokens=300,
            )
            translated = result.choices[0].message.content or response.text
            response.text = translated
            response.language = target_language
        except Exception as e:
            logger.warning(f"Translation to {lang_name} failed: {e}")

        return response
