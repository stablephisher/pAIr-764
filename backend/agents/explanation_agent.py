"""
Explanation Agent
=================
Generates user-friendly summaries and explanations.
"""

import os
import json
from typing import Dict, Any
import re
from openai import OpenAI
from config import config


EXPLANATION_PROMPT = """
You are an Explanation Agent that converts complex compliance analysis into simple, 
jargon-free summaries that any MSME owner can understand.

Your audience:
- Small business owners in India
- Non-legal background
- May have limited English proficiency
- Want clear, actionable information

Rules:
- Use simple, everyday language
- Avoid legal/technical terms
- Be encouraging and supportive
- Format for easy scanning (bullets, bold key points)
- Keep it concise but complete
- End with clear next steps

Output a plain text summary (not JSON) that answers:
1. What is this policy about? (1-2 sentences)
2. Does it affect my business? (Yes/No and why)
3. What do I need to do? (numbered list)
4. What happens if I ignore it? (honest but not scary)
5. Who can help me? (practical resources)
"""


def _parse_json(text: str) -> dict:
    """Clean markdown fences and parse JSON from AI response."""
    text = text.strip()
    text = re.sub(r'^```(?:json)?\s*', '', text)
    text = re.sub(r'\s*```$', '', text)
    text = text.strip()
    return json.loads(text)


class ExplanationAgent:
    """
    User communication agent for generating friendly summaries.
    
    Responsibilities:
    - Convert technical analysis to plain language
    - Regional language support integration
    - Business owner perspective
    - Practical next steps
    """
    
    def __init__(self, api_key: str = None, demo_mode: bool = False):
        self.demo_mode = demo_mode
        key = api_key or config.ai.api_key
        self._client = OpenAI(
            base_url=config.ai.base_url,
            api_key=key,
            default_headers={
                "HTTP-Referer": config.ai.site_url,
                "X-Title": config.ai.site_name,
            },
        ) if key else None
        
    async def generate_summary(self, context) -> str:
        """
        Generate user-friendly explanation from context.
        
        Args:
            context: PipelineContext with all analysis results
            
        Returns:
            Plain text summary for business owner
        """
        if self.demo_mode:
            return self._get_demo_explanation()
            
        try:
            # Prepare summary input
            input_data = {
                "policy_analysis": context.policy_analysis,
                "compliance_plan": context.compliance_plan,
                "eligible_schemes": context.eligible_schemes,
                "verification_result": context.verification_result
            }
            
            prompt_text = f"{EXPLANATION_PROMPT}\n\nAnalysis Data:\n{json.dumps(input_data, indent=2)}"
            resp = self._client.chat.completions.create(
                model=config.ai.primary_model,
                messages=[
                    {"role": "system", "content": "You are an Explanation Agent that creates simple, jargon-free summaries for MSME owners."},
                    {"role": "user", "content": prompt_text},
                ],
                temperature=0.3,
            )
            response_text = resp.choices[0].message.content or ""
            
            return response_text.strip()
            
        except Exception as e:
            print(f"Explanation generation failed: {e}")
            return self._get_fallback_explanation()
    
    async def generate_quick_summary(self, policy_analysis: Dict[str, Any]) -> str:
        """Generate a quick one-paragraph summary."""
        if self.demo_mode:
            return "This is a government scheme to help small businesses get bank loans without collateral. If you're a registered MSME, you may be eligible for guaranteed loans up to Rs. 5 crore."
            
        try:
            prompt = f"""
            In 2-3 simple sentences, explain what this policy means for a small business owner:
            {json.dumps(policy_analysis.get('policy_metadata', {}), indent=2)}
            """
            
            resp = self._client.chat.completions.create(
                model=config.ai.primary_model,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that explains policies simply."},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.3,
            )
            response_text = resp.choices[0].message.content or ""
            return response_text.strip()
            
        except:
            return "This policy may affect your business. Please review the detailed analysis above."
    
    def _get_demo_explanation(self) -> str:
        """Return demo explanation."""
        return """
📋 **WHAT THIS IS ABOUT**

The government has a scheme called CGTMSE that helps small businesses like yours get bank loans more easily. Instead of asking for property or other collateral, banks can give you loans because the government guarantees to cover the risk.

---

✅ **DOES THIS AFFECT YOUR BUSINESS?**

**Yes!** If you have a Micro or Small Enterprise (investment less than Rs. 1 crore in machinery/equipment), you can benefit from this scheme.

---

📝 **WHAT YOU NEED TO DO**

1. **First** - Make sure you have Udyam Registration
   - Free and takes 30 minutes online at udyamregistration.gov.in
   
2. **Then** - Gather these documents:
   - PAN Card
   - Bank statements (last 6 months)
   - Business address proof
   
3. **Next** - Prepare a simple Project Report
   - What you want to do with the loan
   - How you'll pay it back
   - A CA can help for Rs. 5,000-10,000
   
4. **Finally** - Visit any bank's MSME section
   - They'll handle the CGTMSE application for you

---

⚠️ **WHAT IF YOU IGNORE IT?**

Nothing bad happens if you don't apply - this is a benefit scheme, not a penalty. But you might miss out on getting affordable loans without pledging your house or shop!

The only thing to be careful about: If you do get a CGTMSE loan, you must submit quarterly reports to the bank. Missing these can cancel your guarantee.

---

🤝 **WHO CAN HELP**

- **District Industries Centre (DIC)** - Free guidance on MSME schemes
- **Your bank's MSME desk** - They want your business!
- **Local CA or tax consultant** - For project report help
- **Udyam Helpline**: 1800-180-6763 (toll-free)

---

💡 **QUICK TIP**

Women entrepreneurs and businesses in North-East India get extra benefits - up to 85% guarantee coverage instead of the usual 75%.

*This analysis was generated by pAIr, your AI compliance assistant. Always verify important details with official sources.*
"""
    
    def _get_fallback_explanation(self) -> str:
        """Fallback explanation if AI fails."""
        return """
**Summary**

This policy may affect your MSME business. Please review the detailed analysis above for:
- What you need to comply with
- Important deadlines
- Required documents

For assistance, contact your local District Industries Centre or a CA professional.
"""
    
    async def translate_summary(
        self, 
        summary: str, 
        target_language: str
    ) -> str:
        """
        Translate summary to regional language.
        
        Args:
            summary: English summary text
            target_language: Target language code (hi, ta, te, etc.)
            
        Returns:
            Translated summary
        """
        lang_names = {
            'hi': 'Hindi', 'ta': 'Tamil', 'te': 'Telugu', 'kn': 'Kannada',
            'ml': 'Malayalam', 'bn': 'Bengali', 'mr': 'Marathi', 'gu': 'Gujarati',
            'pa': 'Punjabi', 'or': 'Odia', 'as': 'Assamese', 'ur': 'Urdu',
            'sa': 'Sanskrit', 'ne': 'Nepali', 'kok': 'Konkani'
        }
        
        if target_language.lower() in ['en', 'english']:
            return summary
            
        language_name = lang_names.get(target_language.lower(), target_language)
        
        try:
            prompt = f"""
            Translate the following text to {language_name}. 
            Keep the formatting (bullets, bold, etc.) intact.
            Make it sound natural, not like a translation.
            
            {summary}
            """
            
            resp = self._client.chat.completions.create(
                model=config.ai.primary_model,
                messages=[
                    {"role": "system", "content": f"You are a professional translator. Translate to {language_name}."},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.3,
            )
            response_text = resp.choices[0].message.content or ""
            return response_text.strip()
            
        except Exception as e:
            print(f"Translation failed: {e}")
            return summary  # Return original if translation fails
