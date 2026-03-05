import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Globe, Building2, Scale, Briefcase, BookOpen, ExternalLink, Loader2, Star, Sparkles } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { t } from '../i18n/translations';

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Static fallback resources when backend is unreachable
const FALLBACK_RESOURCES = {
    government_portals: [
        { name: "Udyam Registration Portal", desc: "Official MSME registration portal by Government of India", url: "https://udyamregistration.gov.in", category: "Registration" },
        { name: "GeM Portal", desc: "Government e-Marketplace for public procurement", url: "https://gem.gov.in", category: "Procurement" },
        { name: "MSME Samadhaan", desc: "Delayed payment monitoring system for MSMEs", url: "https://samadhaan.msme.gov.in", category: "Payments" },
        { name: "National Single Window System", desc: "Single platform for business approvals and clearances", url: "https://nsws.gov.in", category: "Approvals" },
        { name: "CHAMPIONS Portal", desc: "MSME grievance redressal and support platform", url: "https://champions.gov.in", category: "Grievance" },
    ],
    compliance_resources: [
        { name: "MCA Portal", desc: "Ministry of Corporate Affairs - Company registration and compliance", url: "https://www.mca.gov.in", category: "Corporate" },
        { name: "GST Portal", desc: "Goods and Services Tax filing and compliance", url: "https://www.gst.gov.in", category: "Tax" },
        { name: "Income Tax e-Filing", desc: "Income tax return filing portal", url: "https://www.incometax.gov.in", category: "Tax" },
        { name: "EPFO Portal", desc: "Employee Provident Fund Organization", url: "https://www.epfindia.gov.in", category: "Labour" },
        { name: "Shram Suvidha Portal", desc: "Unified portal for labour law compliance", url: "https://shramsuvidha.gov.in", category: "Labour" },
    ],
    business_tools: [
        { name: "MSME Toolkit by Microsoft", desc: "Free digital tools for small businesses", url: "https://www.msmetoolkit.in", category: "Digital" },
        { name: "Startup India Hub", desc: "Resources and support for startups and MSMEs", url: "https://www.startupindia.gov.in", category: "Startup" },
        { name: "TReDS Platform", desc: "Trade Receivables Discounting System for MSMEs", url: "https://www.rxil.in", category: "Finance" },
        { name: "SIDBI", desc: "Small Industries Development Bank - MSME loans and schemes", url: "https://www.sidbi.in", category: "Finance" },
    ],
    learning_resources: [
        { name: "MSME Development Institute", desc: "Training programs and skill development for MSMEs", url: "https://msmedikanpur.gov.in", category: "Training" },
        { name: "Swayam Portal", desc: "Free online courses including business and compliance", url: "https://swayam.gov.in", category: "Education" },
        { name: "NIESBUD", desc: "National Institute for Entrepreneurship and Small Business Development", url: "https://niesbud.nic.in", category: "Entrepreneurship" },
    ],
};

export default function ResourcesView() {
    const { language, profile } = useAppContext();
    const lang = language?.code || 'en';
    const [resources, setResources] = useState(null);
    const [loading, setLoading] = useState(true);
    const [usingFallback, setUsingFallback] = useState(false);

    useEffect(() => {
        const params = {};
        if (profile?.sector) params.sector = profile.sector;
        axios.get(`${API}/api/resources`, { params, timeout: 8000 })
            .then(r => {
                const data = r.data;
                if (data?.resources && Object.keys(data.resources).length > 0) {
                    setResources(data);
                } else {
                    setResources({ resources: FALLBACK_RESOURCES });
                    setUsingFallback(true);
                }
                setLoading(false);
            })
            .catch(() => {
                setResources({ resources: FALLBACK_RESOURCES });
                setUsingFallback(true);
                setLoading(false);
            });
    }, [profile?.sector]);

    if (loading) return <div className="text-center py-16"><Loader2 size={32} className="animate-spin mx-auto" style={{ color: 'var(--accent)' }} /></div>;
    if (!resources) return null;

    const groups = resources.resources || {};
    const labels = { government_portals: t('Government Portals', lang), compliance_resources: t('Compliance & Tax', lang), business_tools: t('Business Tools', lang), learning_resources: t('Learning & Support', lang) };
    const icons = { government_portals: Building2, compliance_resources: Scale, business_tools: Briefcase, learning_resources: BookOpen };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="card p-6">
                <h3 className="text-xl font-bold flex items-center gap-2 mb-1"><Globe size={22} style={{ color: 'var(--accent)' }} /> {t('Business Resources', lang)}</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('Curated, verified resources for Indian MSMEs', lang)}</p>
            </div>

            {/* Personalized recommendation banner */}
            {profile?.sector && (
                <div className="card p-5" style={{ borderLeft: '3px solid var(--accent)', background: 'var(--accent-light)' }}>
                    <h4 className="font-semibold flex items-center gap-2 mb-1" style={{ color: 'var(--accent)' }}>
                        <Sparkles size={16} /> {t('Recommended for Your Business', lang)}
                    </h4>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {t('Based on your business profile', lang)} — <strong>{profile.business_name || profile.sector}</strong> ({profile.state || 'India'})
                    </p>
                </div>
            )}

            {Object.entries(groups).map(([key, items]) => {
                const Icon = icons[key] || Globe;
                return (
                    <div key={key} className="card p-6">
                        <h4 className="font-semibold mb-4 flex items-center gap-2"><Icon size={18} style={{ color: 'var(--accent)' }} /> {labels[key] || key}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {items.map((r, i) => (
                                <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                                    className="p-4 rounded-xl flex items-start gap-3 transition-all hover:shadow-md group"
                                    style={{ background: 'var(--bg-secondary)', textDecoration: 'none', color: 'inherit' }}>
                                    <ExternalLink size={16} className="flex-shrink-0 mt-0.5 opacity-50 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--accent)' }} />
                                    <div>
                                        <p className="font-medium text-sm group-hover:underline">{r.name}</p>
                                        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{r.desc}</p>
                                        <span className="badge badge-gray text-[10px] mt-2">{r.category}</span>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
