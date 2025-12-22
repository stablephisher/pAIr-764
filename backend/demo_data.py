"""
Demo Data
=========
Deterministic demo responses for DEMO_MODE.
"""

DEMO_BUSINESS_PROFILE = {
    "business_name": "Sunrise Manufacturing Pvt Ltd",
    "enterprise_type": "Micro",
    "sector": "Manufacturing",
    "sub_sector": "Light Engineering",
    "owner_name": "Priya Sharma",
    "owner_category": "Women",
    "location": {
        "state": "Maharashtra",
        "district": "Pune",
        "area_type": "Urban"
    },
    "registration": {
        "has_udyam": True,
        "udyam_number": "UDYAM-MH-02-0012345",
        "gst_registered": True,
        "gst_number": "27AAACS1234F1ZX"
    },
    "financials": {
        "investment_in_plant_machinery": 4500000,  # Rs. 45 lakhs
        "annual_turnover": 25000000,  # Rs. 2.5 crore
        "employees": 15
    },
    "loan_requirement": {
        "purpose": "Working capital and machinery purchase",
        "amount_needed": 5000000,  # Rs. 50 lakhs
        "collateral_available": False
    },
    "is_new_unit": False
}


DEMO_POLICY_ANALYSIS = {
    "policy_metadata": {
        "policy_name": "CGTMSE Revised Guidelines 2024",
        "issuing_authority": "Ministry of MSME, Government of India",
        "effective_date": "1st July 2024",
        "geographical_scope": "Pan-India",
        "policy_type": "Credit Guarantee Scheme"
    },
    "applicability": {
        "who_is_affected": "All Micro and Small Enterprises in manufacturing or service sectors",
        "conditions": [
            "Must be registered on Udyam Portal",
            "Credit facility up to Rs. 5 crore",
            "New or existing MSE"
        ],
        "exceptions": [
            "Medium Enterprises",
            "Retail Trade",
            "Educational Institutions"
        ]
    },
    "obligations": [
        {
            "obligation": "Quarterly Report Submission",
            "description": "Submit quarterly performance reports to lending institution",
            "deadline": "Within 15 days of quarter end",
            "frequency": "Quarterly",
            "severity_if_ignored": "HIGH - May lead to withdrawal of guarantee"
        },
        {
            "obligation": "Udyam Registration Renewal",
            "description": "Maintain active Udyam registration",
            "deadline": "Annually",
            "frequency": "Annual",
            "severity_if_ignored": "HIGH - Ineligibility for scheme"
        },
        {
            "obligation": "Proper Books of Accounts",
            "description": "Maintain proper books of accounts as per applicable laws",
            "deadline": "Ongoing",
            "frequency": "Continuous",
            "severity_if_ignored": "MEDIUM - May affect future applications"
        }
    ],
    "penalties": [
        {
            "violation": "Non-compliance with reporting",
            "penalty_amount": "Up to Rs. 10,000",
            "other_consequences": "Blacklisting, Withdrawal of guarantee cover"
        },
        {
            "violation": "Misrepresentation of facts",
            "penalty_amount": "Full recovery of claim amount",
            "other_consequences": "Legal action, Permanent blacklisting"
        }
    ],
    "required_documents": [
        "Udyam Registration Certificate",
        "PAN Card (Business and Proprietor/Partners/Directors)",
        "Business Address Proof",
        "Bank Statements (6 months)",
        "Project Report / Business Plan",
        "ITR for last 2 years (if applicable)",
        "GST Registration Certificate (if applicable)",
        "Partnership Deed / MOA & AOA (if applicable)"
    ],
    "compliance_actions": [
        {
            "action": "Verify Udyam Registration is active",
            "priority": "HIGH",
            "estimated_effort": "30 minutes"
        },
        {
            "action": "Prepare Project Report for loan application",
            "priority": "HIGH",
            "estimated_effort": "2-3 days (with CA assistance)"
        },
        {
            "action": "Set up quarterly reporting system",
            "priority": "MEDIUM",
            "estimated_effort": "Half day"
        },
        {
            "action": "Organize all required documents",
            "priority": "HIGH",
            "estimated_effort": "1-2 days"
        }
    ],
    "risk_assessment": {
        "overall_risk_level": "MEDIUM",
        "reasoning": "Compliance requirements are moderate. Main risk is maintaining quarterly reporting discipline. For women entrepreneurs, the scheme offers favorable terms (85% guarantee coverage)."
    },
    "confidence_notes": {
        "ambiguous_sections": [],
        "missing_information": ["Exact deadline for annual Udyam renewal verification"]
    }
}


DEMO_COMPLIANCE_PLAN = {
    "applicability_status": "APPLICABLE",
    "summary_for_owner": "Great news! As a women-owned micro manufacturing enterprise with Udyam registration, you qualify for the CGTMSE scheme with the highest guarantee coverage of 85%. This means you can get loans up to Rs. 50 lakhs (your requirement) without pledging any collateral.",
    "action_plan": [
        {
            "step_number": 1,
            "action": "Verify your Udyam Registration is active",
            "why_it_matters": "This is a mandatory requirement. No active Udyam = No CGTMSE benefit",
            "deadline": "Before applying for loan",
            "risk_if_ignored": "Automatic rejection of guarantee application"
        },
        {
            "step_number": 2,
            "action": "Prepare a detailed Project Report",
            "why_it_matters": "Banks assess your creditworthiness based on this. A good report increases approval chances.",
            "deadline": "Within 1 week",
            "risk_if_ignored": "Delays in loan processing, possible rejection"
        },
        {
            "step_number": 3,
            "action": "Collect last 6 months bank statements",
            "why_it_matters": "Shows your business cash flow and repayment capacity",
            "deadline": "Within 3 days",
            "risk_if_ignored": "Incomplete application"
        },
        {
            "step_number": 4,
            "action": "Visit your bank's MSME/SME lending desk",
            "why_it_matters": "The bank initiates CGTMSE application on your behalf. You cannot apply directly.",
            "deadline": "Within 2 weeks",
            "risk_if_ignored": "Opportunity cost - delay in getting funds"
        },
        {
            "step_number": 5,
            "action": "Set up a simple quarterly reporting system",
            "why_it_matters": "Post-sanction compliance. Missing reports can cancel your guarantee.",
            "deadline": "Before loan disbursement",
            "risk_if_ignored": "Withdrawal of guarantee, potential blacklisting"
        }
    ],
    "compliance_timeline": {
        "immediate": [
            "Login to udyamregistration.gov.in and verify status",
            "Check if any updates needed in Udyam registration",
            "Start gathering bank statements"
        ],
        "within_30_days": [
            "Complete Project Report (hire CA if needed - Rs. 5000-10000)",
            "Gather all required documents",
            "Submit application at nearest bank branch",
            "Get CGTMSE application initiated by bank"
        ],
        "within_90_days": [
            "Complete all bank due diligence requirements",
            "Receive loan sanction letter",
            "Set up reporting calendar (15th of Apr, Jul, Oct, Jan)"
        ],
        "ongoing": [
            "Submit quarterly utilization reports",
            "Maintain proper books of accounts",
            "Keep Udyam registration updated",
            "File GST returns on time"
        ]
    },
    "resource_requirements": {
        "documents_needed": [
            "Udyam Registration Certificate",
            "PAN Card (Priya Sharma + Sunrise Manufacturing)",
            "GST Certificate",
            "Bank Statements - 6 months (Current Account)",
            "ITR last 2 years",
            "Project Report",
            "Business premises proof"
        ],
        "estimated_cost": "Rs. 8,000 - 15,000 (CA fees for project report + documentation)",
        "professional_help_needed": "Recommended: Hire a CA for project report preparation. Many CAs offer MSME packages."
    },
    "monitoring_advice": "Since you're applying for Rs. 50 lakhs, maintain detailed records of fund utilization. Banks may ask for utilization certificates. Set calendar reminders for quarterly reports - they're due by 15th of April, July, October, and January.",
    "confidence_level": "HIGH"
}


DEMO_ELIGIBLE_SCHEMES = [
    {
        "scheme_name": "CGTMSE",
        "eligibility_status": "ELIGIBLE",
        "matching_criteria": [
            "Micro Enterprise (Investment Rs. 45 lakhs < Rs. 1 crore)",
            "Manufacturing Sector",
            "Udyam Registered",
            "Women Owner (85% coverage eligibility)"
        ],
        "missing_criteria": [],
        "potential_benefit": "85% guarantee coverage on loans up to Rs. 5 crore. For your Rs. 50 lakh requirement, bank gets Rs. 42.5 lakh guaranteed by government.",
        "next_steps": [
            "Apply through any scheduled commercial bank",
            "No need to approach CGTMSE directly",
            "Mention women entrepreneur status for higher coverage"
        ]
    },
    {
        "scheme_name": "MUDRA - Tarun",
        "eligibility_status": "ELIGIBLE",
        "matching_criteria": [
            "Micro Enterprise",
            "Non-corporate entity",
            "Not a defaulter"
        ],
        "missing_criteria": [],
        "potential_benefit": "Loan up to Rs. 10 lakhs under Tarun category without collateral. Can be used for working capital.",
        "next_steps": [
            "Can apply at any bank/NBFC/MFI",
            "MUDRA Card available for working capital"
        ]
    },
    {
        "scheme_name": "PMEGP",
        "eligibility_status": "NOT_ELIGIBLE",
        "matching_criteria": ["Manufacturing sector", "Women owner"],
        "missing_criteria": [
            "PMEGP is only for NEW units",
            "Your unit is already established"
        ],
        "potential_benefit": "N/A - Not eligible",
        "next_steps": [
            "Consider if planning to set up a NEW unit in future"
        ]
    },
    {
        "scheme_name": "Stand Up India",
        "eligibility_status": "PARTIALLY_ELIGIBLE",
        "matching_criteria": [
            "Women entrepreneur",
            "Manufacturing sector"
        ],
        "missing_criteria": [
            "Stand Up India requires greenfield (new) project",
            "Existing unit may not qualify"
        ],
        "potential_benefit": "If eligible, loan Rs. 10 lakh to Rs. 1 crore with credit guarantee",
        "next_steps": [
            "Check if any expansion can be structured as new project",
            "Consult with bank for specific eligibility"
        ]
    }
]


def get_demo_response():
    """Get complete demo response for demonstration mode."""
    return {
        "business_profile": DEMO_BUSINESS_PROFILE,
        "policy_analysis": DEMO_POLICY_ANALYSIS,
        "compliance_plan": DEMO_COMPLIANCE_PLAN,
        "eligible_schemes": DEMO_ELIGIBLE_SCHEMES,
        "source": "demo",
        "demo_mode": True
    }
