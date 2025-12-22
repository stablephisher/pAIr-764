"""
Government Schemes Database
===========================
Definitions and eligibility rules for Indian MSME schemes.
"""

GOVERNMENT_SCHEMES = [
    {
        "scheme_id": "CGTMSE",
        "name": "Credit Guarantee Fund Trust for Micro and Small Enterprises",
        "ministry": "Ministry of MSME",
        "description": "Provides collateral-free credit to MSEs by guaranteeing loans from banks",
        "max_coverage": "Rs. 5 crore",
        "guarantee_percentage": {
            "general": "75%",
            "micro_women_ner": "85%",
            "priority_sector": "80%"
        },
        "eligibility_criteria": {
            "enterprise_type": ["Micro", "Small"],
            "activities": ["Manufacturing", "Service"],
            "registration_required": "Udyam",
            "max_investment_manufacturing": "Rs. 10 crore",
            "max_investment_service": "Rs. 5 crore",
            "max_turnover": "Rs. 50 crore",
            "excluded": ["Retail Trade", "Educational Institutions", "Training Institutions", "Self Help Groups"]
        },
        "guarantee_fee": {
            "annual_min": "0.37%",
            "annual_max": "1.80%"
        },
        "benefits": [
            "Collateral-free loans up to Rs. 5 crore",
            "No third-party guarantee required",
            "Available through all scheduled commercial banks",
            "Higher coverage for women and NER entrepreneurs"
        ],
        "application_process": "Through lending bank - bank applies to CGTMSE on behalf of borrower",
        "website": "https://www.cgtmse.in",
        "helpline": "1800-180-6763"
    },
    {
        "scheme_id": "PMEGP",
        "name": "Prime Minister's Employment Generation Programme",
        "ministry": "Ministry of MSME (KVIC)",
        "description": "Credit-linked subsidy scheme for setting up new micro enterprises",
        "subsidy_rate": {
            "urban_general": "15%",
            "urban_special": "25%",
            "rural_general": "25%",
            "rural_special": "35%"
        },
        "eligibility_criteria": {
            "age": "18+ years",
            "education": {
                "projects_above_10L_manufacturing": "8th pass",
                "projects_above_5L_service": "8th pass"
            },
            "project_cost": {
                "manufacturing_max": "Rs. 50 lakhs",
                "service_max": "Rs. 20 lakhs"
            },
            "unit_type": "New units only (existing units not eligible)",
            "income_limit": "No income ceiling",
            "special_categories": ["SC/ST", "Women", "Minorities", "Ex-servicemen", "PH", "NER", "Hill areas", "Border areas"]
        },
        "beneficiary_contribution": {
            "general": "10%",
            "special_category": "5%"
        },
        "benefits": [
            "Non-refundable subsidy up to 35%",
            "90-95% bank loan coverage",
            "Training support",
            "Handholding during setup"
        ],
        "application_process": "Online through PMEGP e-Portal (kviconline.gov.in)",
        "implementing_agencies": ["KVIC", "State KVIB", "DIC"],
        "website": "https://www.kviconline.gov.in/pmegpeportal",
        "helpline": "1800-180-6763"
    },
    {
        "scheme_id": "MUDRA",
        "name": "Pradhan Mantri MUDRA Yojana",
        "ministry": "Ministry of Finance",
        "description": "Micro credit scheme for non-corporate, non-farm small/micro enterprises",
        "loan_categories": {
            "Shishu": {
                "amount": "Up to Rs. 50,000",
                "interest_rate": "As per bank/NBFC norms"
            },
            "Kishore": {
                "amount": "Rs. 50,001 to Rs. 5 lakhs",
                "interest_rate": "As per bank/NBFC norms"
            },
            "Tarun": {
                "amount": "Rs. 5,00,001 to Rs. 10 lakhs",
                "interest_rate": "As per bank/NBFC norms"
            }
        },
        "eligibility_criteria": {
            "enterprise_type": ["Micro", "Small"],
            "activities": ["Manufacturing", "Trading", "Service", "Allied Agriculture"],
            "existing_loan": "Should not be defaulter to any bank/FI",
            "excluded": ["Agriculture (direct)", "Corporate entities"]
        },
        "benefits": [
            "No collateral required",
            "No processing fee",
            "Flexible repayment (5-7 years)",
            "MUDRA Card for working capital"
        ],
        "application_process": "Through any bank, NBFC, or MFI",
        "website": "https://www.mudra.org.in",
        "helpline": "1800-180-1111"
    },
    {
        "scheme_id": "STANDUPINDIA",
        "name": "Stand Up India",
        "ministry": "Ministry of Finance (SIDBI)",
        "description": "Bank loans between Rs. 10 lakh and Rs. 1 crore for SC/ST and Women entrepreneurs",
        "loan_amount": {
            "minimum": "Rs. 10 lakhs",
            "maximum": "Rs. 1 crore"
        },
        "eligibility_criteria": {
            "category": ["SC", "ST", "Women"],
            "age": "18+ years",
            "unit_type": "Greenfield (new) manufacturing, services, or trading",
            "shareholding": "51% for SC/ST/Women",
            "existing_default": "Should not be defaulter"
        },
        "interest_rate": "Base rate + 3% + tenor premium (lowest applicable rate)",
        "repayment": "7 years with 18 months moratorium",
        "benefits": [
            "Composite loan for term loan + working capital",
            "Margin money of 25%",
            "Credit guarantee through CGTMSE"
        ],
        "application_process": "Online through standupmitra.in or through banks",
        "website": "https://www.standupmitra.in",
        "helpline": "1800-180-1111"
    },
    {
        "scheme_id": "UDYAM",
        "name": "Udyam Registration",
        "ministry": "Ministry of MSME",
        "description": "Free online registration for MSMEs - mandatory for availing benefits",
        "categories": {
            "Micro": {
                "investment": "Up to Rs. 1 crore",
                "turnover": "Up to Rs. 5 crore"
            },
            "Small": {
                "investment": "Rs. 1-10 crore",
                "turnover": "Rs. 5-50 crore"
            },
            "Medium": {
                "investment": "Rs. 10-50 crore",
                "turnover": "Rs. 50-250 crore"
            }
        },
        "eligibility_criteria": {
            "enterprise_type": ["Manufacturing", "Service"],
            "documents_needed": ["Aadhaar of proprietor/MD/partners"]
        },
        "benefits": [
            "Free registration",
            "Aadhaar-based self-declaration",
            "No documents required for registration",
            "Lifetime validity (until enterprise details change)",
            "Gateway to all MSME schemes"
        ],
        "application_process": "Online at udyamregistration.gov.in",
        "website": "https://udyamregistration.gov.in",
        "helpline": "1800-180-6763"
    },
    {
        "scheme_id": "SFURTI",
        "name": "Scheme of Fund for Regeneration of Traditional Industries",
        "ministry": "Ministry of MSME (KVIC)",
        "description": "Cluster development scheme for traditional industries",
        "cluster_types": {
            "Regular": {
                "artisans": "500",
                "funding": "Up to Rs. 2.5 crore"
            },
            "Major": {
                "artisans": "More than 500",
                "funding": "Up to Rs. 5 crore"
            }
        },
        "eligibility_criteria": {
            "industries": ["Khadi", "Coir", "Village Industries", "Traditional crafts"],
            "cluster_location": "Preferably in rural areas"
        },
        "benefits": [
            "Common facility centers",
            "Design and technology upgrade",
            "Market linkage support",
            "Training and capacity building"
        ],
        "implementing_agencies": ["KVIC", "State KVIB", "Coir Board"],
        "website": "https://www.sfurti.in"
    }
]


def get_scheme_by_id(scheme_id: str) -> dict:
    """Get scheme details by ID."""
    for scheme in GOVERNMENT_SCHEMES:
        if scheme['scheme_id'] == scheme_id:
            return scheme
    return None


def get_applicable_schemes(business_profile: dict) -> list:
    """
    Get list of potentially applicable schemes for a business.
    
    Args:
        business_profile: Dict with keys like enterprise_type, turnover, 
                         investment, sector, owner_category, location
                         
    Returns:
        List of scheme IDs that may apply
    """
    applicable = []
    
    enterprise_type = business_profile.get('enterprise_type', '').lower()
    sector = business_profile.get('sector', '').lower()
    owner_category = business_profile.get('owner_category', '').lower()
    
    # CGTMSE - for Micro and Small
    if enterprise_type in ['micro', 'small']:
        if sector in ['manufacturing', 'service']:
            applicable.append('CGTMSE')
    
    # PMEGP - for new units
    if business_profile.get('is_new_unit', False):
        applicable.append('PMEGP')
    
    # MUDRA - for micro/small
    if enterprise_type in ['micro', 'small']:
        applicable.append('MUDRA')
    
    # Stand Up India - for SC/ST/Women
    if any(cat in owner_category for cat in ['sc', 'st', 'women', 'woman']):
        if business_profile.get('is_new_unit', False):
            applicable.append('STANDUPINDIA')
    
    # Udyam - recommended for all
    if not business_profile.get('has_udyam', False):
        applicable.append('UDYAM')
    
    return applicable
