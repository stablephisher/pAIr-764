import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Globe, Building2, Scale, Briefcase, BookOpen, ExternalLink, Loader2, Star, Sparkles, Zap, ArrowRight, ClipboardCheck, FileText, Rocket, Shield, CreditCard, Users, CheckCircle, Copy, Bot } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import useTranslate from '../hooks/useTranslate';

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Smart resources with direct action links (not just homepages)
const SMART_RESOURCES = {
    quick_actions: [
        { 
            name: "Register for Udyam (MSME)", 
            desc: "Get your official MSME registration certificate",
            url: "https://udyamregistration.gov.in/Government-India/Ministry-MSME-registration.htm",
            action_url: "https://udyamregistration.gov.in/Udyam_Login.aspx",
            icon: "FileText",
            category: "Registration",
            autofill_fields: ["business_name", "gstin", "state", "sector"],
            time: "10 mins",
            priority: true
        },
        { 
            name: "Apply for GST Registration", 
            desc: "Get your GSTIN for tax compliance",
            url: "https://reg.gst.gov.in/registration/",
            action_url: "https://reg.gst.gov.in/registration/",
            icon: "Scale",
            category: "Tax",
            autofill_fields: ["business_name", "state", "business_type"],
            time: "30 mins",
            priority: true
        },
        { 
            name: "Apply for MUDRA Loan", 
            desc: "Up to ₹10 Lakh collateral-free business loan",
            url: "https://www.mudra.org.in/Offerings",
            action_url: "https://www.mudra.org.in/Offerings",
            icon: "CreditCard",
            category: "Finance",
            autofill_fields: ["business_name", "sector", "state"],
            time: "Online apply",
            priority: true
        },
        { 
            name: "Register on GeM Portal", 
            desc: "Sell to government - massive B2G opportunity",
            url: "https://gem.gov.in/sellerRegistration",
            action_url: "https://gem.gov.in/sellerRegistration",
            icon: "Briefcase",
            category: "Marketplace",
            autofill_fields: ["business_name", "gstin", "state"],
            time: "15 mins",
            priority: true
        },
    ],
    finance_schemes: [
        {
            name: "CGTMSE - Collateral-Free Loans",
            desc: "Credit guarantee for loans up to ₹5 Crore without collateral",
            url: "https://www.cgtmse.in/Home/HEL",
            action_url: "https://www.cgtmse.in/Home/HEL",
            eligibility: "All MSMEs",
            benefit: "Up to ₹5 Crore"
        },
        {
            name: "Stand-Up India Loan",
            desc: "₹10 Lakh to ₹1 Crore for SC/ST/Women entrepreneurs",
            url: "https://www.standupmitra.in/Home/SUISchemes",
            action_url: "https://www.standupmitra.in/Login/Register",
            eligibility: "SC/ST/Women",
            benefit: "₹10L - ₹1Cr"
        },
        {
            name: "PMEGP Scheme",
            desc: "Up to 35% subsidy for new manufacturing/service units",
            url: "https://www.kviconline.gov.in/pmegpeportal/pmegphome/index.jsp",
            action_url: "https://www.kviconline.gov.in/pmegpeportal/jsp/pmegponline.jsp",
            eligibility: "New enterprises",
            benefit: "15-35% subsidy"
        },
        {
            name: "SIDBI Direct Loans",
            desc: "Direct lending for MSMEs at competitive rates",
            url: "https://www.sidbi.in/en/products-services/direct-credit",
            action_url: "https://www.sidbi.in/en/products-services/direct-credit",
            eligibility: "Existing MSMEs",
            benefit: "Competitive rates"
        },
    ],
    compliance_portals: [
        {
            name: "GST Return Filing",
            desc: "File your monthly/quarterly GST returns",
            url: "https://services.gst.gov.in/services/login",
            action_url: "https://services.gst.gov.in/services/login",
            frequency: "Monthly/Quarterly"
        },
        {
            name: "Income Tax e-Filing",
            desc: "File ITR and manage tax compliance",
            url: "https://eportal.incometax.gov.in/iec/foservices/#/login",
            action_url: "https://eportal.incometax.gov.in/iec/foservices/#/login",
            frequency: "Yearly"
        },
        {
            name: "MCA Company Filing",
            desc: "Annual returns and compliance for companies",
            url: "https://www.mca.gov.in/mcafoportal/login.do",
            action_url: "https://www.mca.gov.in/mcafoportal/login.do",
            frequency: "Yearly"
        },
        {
            name: "EPFO - PF Compliance",
            desc: "Employee Provident Fund filings",
            url: "https://unifiedportal-emp.epfindia.gov.in/epfo/",
            action_url: "https://unifiedportal-emp.epfindia.gov.in/epfo/",
            frequency: "Monthly"
        },
        {
            name: "ESIC Portal",
            desc: "Employee State Insurance compliance",
            url: "https://www.esic.gov.in/EsicInsurance1/EsicInsurancePortal/PortalLogin.aspx",
            action_url: "https://www.esic.gov.in/EsicInsurance1/EsicInsurancePortal/PortalLogin.aspx",
            frequency: "Monthly"
        },
    ],
    sector_specific: {
        Manufacturing: [
            { name: "PLI Scheme Application", url: "https://www.investindia.gov.in/production-linked-incentives-schemes-india", desc: "Production Linked Incentive benefits" },
            { name: "ZED Certification", url: "https://zed.msme.gov.in/", desc: "Zero Defect Zero Effect quality certification" },
            { name: "CLCSS Subsidy", url: "https://clcss.dcmsme.gov.in/", desc: "15% capital subsidy for technology upgradation" },
        ],
        Technology: [
            { name: "Software Technology Parks", url: "https://www.stpi.in/", desc: "STPI registration for IT/Software units" },
            { name: "Startup India Recognition", url: "https://www.startupindia.gov.in/content/sih/en/startupgov/startup-recognition-page.html", desc: "Get recognized as a startup - tax benefits" },
            { name: "Digital India Programme", url: "https://digitalindia.gov.in/", desc: "Digital transformation support" },
        ],
        Retail: [
            { name: "FSSAI License", url: "https://foscos.fssai.gov.in/", desc: "Food safety license for food businesses" },
            { name: "Shops & Establishment", url: "#", desc: "State-specific license (varies by state)" },
            { name: "Trade License", url: "#", desc: "Municipal trade license" },
        ],
        Agriculture: [
            { name: "PM-KISAN", url: "https://pmkisan.gov.in/", desc: "₹6000/year for farmer entrepreneurs" },
            { name: "NABARD Schemes", url: "https://www.nabard.org/content1.aspx?id=591&catid=8&mid=488", desc: "Rural and agricultural financing" },
            { name: "Kisan Credit Card", url: "https://pmkisan.gov.in/kcc.aspx", desc: "Easy credit for agri-businesses" },
        ],
    }
};

const iconMap = {
    FileText, Scale, CreditCard, Briefcase, Shield, Building2, Globe, Users, Rocket, ClipboardCheck, Bot
};

export default function ResourcesView() {
    const { language, profile } = useAppContext();
    const lang = language?.code || 'en';
    const { gt } = useTranslate(lang);
    const [copied, setCopied] = useState(null);
    const [activeTab, setActiveTab] = useState('actions');

    const copyToClipboard = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopied(field);
        setTimeout(() => setCopied(null), 2000);
    };

    // Get sector-specific resources
    const sectorResources = profile?.sector ? SMART_RESOURCES.sector_specific[profile.sector] || [] : [];

    const tabs = [
        { id: 'actions', label: gt('Quick Actions'), icon: Zap },
        { id: 'finance', label: gt('Funding & Loans'), icon: CreditCard },
        { id: 'compliance', label: gt('Compliance'), icon: Scale },
        { id: 'sector', label: gt('For Your Sector'), icon: Building2, badge: sectorResources.length },
    ];

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header with Profile Context */}
            <div className="card p-6" style={{ background: 'linear-gradient(135deg, var(--accent), var(--purple, #7c3aed))', color: 'white' }}>
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-xl font-bold flex items-center gap-2 mb-1">
                            <Rocket size={22} /> {gt('Smart Business Resources')}
                        </h3>
                        <p className="text-sm opacity-90">
                            {gt('Direct links to forms & portals - not just homepages. Personalized for your business.')}
                        </p>
                    </div>
                    {profile?.business_name && (
                        <div className="text-right">
                            <p className="text-xs opacity-70">{gt('Personalized for')}</p>
                            <p className="font-semibold">{profile.business_name}</p>
                            <p className="text-xs opacity-70">{profile.sector} • {profile.state}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Autofill Helper Card */}
            {profile?.business_name && (
                <div className="card p-5" style={{ border: '2px dashed var(--accent)', background: 'var(--accent-light)' }}>
                    <div className="flex items-center gap-3 mb-3">
                        <Bot size={20} style={{ color: 'var(--accent)' }} />
                        <div>
                            <h4 className="font-semibold" style={{ color: 'var(--accent)' }}>{gt('Quick Copy for Forms')}</h4>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{gt('Click to copy your details for quick form filling')}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {[
                            { label: 'Business Name', value: profile.business_name, field: 'name' },
                            { label: 'State', value: profile.state, field: 'state' },
                            { label: 'GSTIN', value: profile.gstin || 'Not set', field: 'gstin' },
                            { label: 'Sector', value: profile.sector, field: 'sector' },
                        ].filter(f => f.value && f.value !== 'Not set').map((item) => (
                            <button key={item.field}
                                onClick={() => copyToClipboard(item.value, item.field)}
                                className="p-2 rounded-lg text-left transition-all hover:scale-105"
                                style={{ background: 'white', border: '1px solid var(--border)' }}>
                                <p className="text-[10px] uppercase font-medium" style={{ color: 'var(--text-tertiary)' }}>{item.label}</p>
                                <p className="text-sm font-medium truncate flex items-center gap-1">
                                    {item.value}
                                    {copied === item.field ? <CheckCircle size={12} style={{ color: 'var(--green)' }} /> : <Copy size={12} className="opacity-50" />}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {tabs.map(tab => (
                    <button key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`btn btn-sm gap-1.5 whitespace-nowrap ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}>
                        <tab.icon size={14} />
                        {tab.label}
                        {tab.badge ? <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-white/20">{tab.badge}</span> : null}
                    </button>
                ))}
            </div>

            {/* Quick Actions Tab */}
            {activeTab === 'actions' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {SMART_RESOURCES.quick_actions.map((r, i) => {
                        const Icon = iconMap[r.icon] || Globe;
                        return (
                            <div key={i} className="card p-5 hover:shadow-lg transition-all group" style={{ border: r.priority ? '2px solid var(--accent)' : '1px solid var(--border)' }}>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{ background: 'var(--accent-light)' }}>
                                        <Icon size={24} style={{ color: 'var(--accent)' }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-semibold">{r.name}</h4>
                                            {r.priority && <span className="badge badge-accent text-[10px]">Recommended</span>}
                                        </div>
                                        <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>{r.desc}</p>
                                        <div className="flex items-center gap-2">
                                            <a href={r.action_url} target="_blank" rel="noopener noreferrer"
                                                className="btn btn-primary btn-sm gap-1.5">
                                                {gt('Start Now')} <ArrowRight size={14} />
                                            </a>
                                            <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'var(--bg-secondary)', color: 'var(--text-tertiary)' }}>
                                                ~{r.time}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Finance Tab */}
            {activeTab === 'finance' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {SMART_RESOURCES.finance_schemes.map((scheme, i) => (
                        <div key={i} className="card p-5 hover:shadow-lg transition-all">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold">{scheme.name}</h4>
                                <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: 'var(--green-light)', color: 'var(--green)' }}>
                                    {scheme.benefit}
                                </span>
                            </div>
                            <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>{scheme.desc}</p>
                            <p className="text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>
                                <strong>Eligibility:</strong> {scheme.eligibility}
                            </p>
                            <a href={scheme.action_url} target="_blank" rel="noopener noreferrer"
                                className="btn btn-primary btn-sm gap-1.5 w-full">
                                {gt('Apply Now')} <ArrowRight size={14} />
                            </a>
                        </div>
                    ))}
                </div>
            )}

            {/* Compliance Tab */}
            {activeTab === 'compliance' && (
                <div className="space-y-3">
                    {SMART_RESOURCES.compliance_portals.map((portal, i) => (
                        <div key={i} className="card p-4 flex items-center justify-between hover:shadow-md transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                                    style={{ background: 'var(--bg-secondary)' }}>
                                    <Scale size={18} style={{ color: 'var(--accent)' }} />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm">{portal.name}</h4>
                                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{portal.desc}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'var(--bg-tertiary)' }}>
                                    {portal.frequency}
                                </span>
                                <a href={portal.action_url} target="_blank" rel="noopener noreferrer"
                                    className="btn btn-secondary btn-sm gap-1">
                                    {gt('Login')} <ExternalLink size={12} />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Sector-Specific Tab */}
            {activeTab === 'sector' && (
                <div>
                    {sectorResources.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {sectorResources.map((r, i) => (
                                <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                                    className="card p-5 hover:shadow-lg transition-all group text-left">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Star size={16} style={{ color: 'var(--accent)' }} />
                                        <h4 className="font-semibold text-sm group-hover:underline">{r.name}</h4>
                                    </div>
                                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{r.desc}</p>
                                    <div className="mt-3 flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--accent)' }}>
                                        {gt('Visit Portal')} <ArrowRight size={12} />
                                    </div>
                                </a>
                            ))}
                        </div>
                    ) : (
                        <div className="card p-8 text-center">
                            <Building2 size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="font-medium mb-2">{gt('No sector-specific resources')}</p>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                {gt('Update your business profile to see tailored resources for your sector')}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Footer tip */}
            <div className="p-4 rounded-xl text-center" style={{ background: 'var(--bg-secondary)' }}>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    💡 {gt('Tip: All links go directly to registration/application forms, not just homepages. Keep your profile updated for personalized recommendations.')}
                </p>
            </div>
        </div>
    );
}
