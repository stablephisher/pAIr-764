import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Briefcase, Globe, TrendingUp, TrendingDown, Target, Shield, Users, CheckCircle, AlertCircle, RefreshCw, Loader2, Clock, Zap, BarChart3, Building2, Lightbulb } from 'lucide-react';
import MiniBarChart from './charts/MiniBarChart';
import { useAppContext, apiClient } from '../context/AppContext';
import useTranslate from '../hooks/useTranslate';

const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Demo data when API fails
const DEMO_COMPETITOR_DATA = {
    market_overview: {
        market_size: "₹15,000 Crore",
        growth_rate: "12.5%",
        key_trends: ["Digital transformation accelerating", "Sustainability focus increasing", "Government schemes driving growth", "Export opportunities expanding"]
    },
    competitive_position: {
        strengths: ["Low operational costs", "Government MSME incentives", "Local market knowledge", "Agile decision making"],
        weaknesses: ["Limited access to capital", "Technology adoption gaps", "Skilled workforce shortage"],
        opportunities: ["Digital marketplace expansion", "Government procurement (GeM)", "Export incentives under PLI", "Green manufacturing incentives"],
        threats: ["Large corporate competition", "Import competition", "Regulatory compliance burden", "Rising input costs"]
    },
    market_metrics: {
        competitor_count: "2,500+",
        market_share_potential: "0.5-2%",
        entry_barriers: "Medium",
        price_sensitivity: "High"
    },
    recommendations: [
        "Register on GeM portal for government contracts",
        "Apply for CGTMSE collateral-free loan",
        "Get ZED certification for quality advantage",
        "Explore PLI scheme benefits for your sector"
    ],
    key_competitors: [
        { name: "Regional MSMEs", strength: "Price competitiveness", market_share: "45%" },
        { name: "Large Corporates", strength: "Brand & distribution", market_share: "35%" },
        { name: "Imports", strength: "Technology/quality", market_share: "20%" }
    ]
};

function getCacheKey(profile) {
    return `pair-competitor-${profile?.sector || 'default'}-${profile?.state || 'India'}`;
}

function getCachedData(profile) {
    try {
        const raw = localStorage.getItem(getCacheKey(profile));
        if (!raw) return null;
        const cached = JSON.parse(raw);
        if (Date.now() - cached.timestamp > CACHE_DURATION_MS) {
            localStorage.removeItem(getCacheKey(profile));
            return null;
        }
        return cached;
    } catch { return null; }
}

function setCachedData(profile, data) {
    try {
        localStorage.setItem(getCacheKey(profile), JSON.stringify({ data, timestamp: Date.now() }));
    } catch { /* quota exceeded */ }
}

export default function CompetitorAnalysisView({ profile, onBack }) {
    const { language, user, history } = useAppContext();
    const lang = language?.code || 'en';
    const { gt } = useTranslate(lang);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showDemo, setShowDemo] = useState(false);
    const [error, setError] = useState(null);
    const [cachedAt, setCachedAt] = useState(null);
    const didInit = useRef(false);

    const getActiveBusiness = useCallback(() => {
        if (!profile) return null;
        if (Array.isArray(profile.businesses) && profile.businesses.length > 0) {
            const selected = profile.businesses.find((b) => b?.business_name === profile.business_name);
            return selected || profile.businesses[0];
        }
        return {
            business_name: profile.business_name,
            sector: profile.sector,
            business_type: profile.business_type,
            state: profile.state || profile.location,
            products_services: profile.products_services,
            years_in_business: profile.years_in_business,
        };
    }, [profile]);

    const runAnalysis = useCallback(async (forceRefresh = false) => {
        const activeBusiness = getActiveBusiness();

        if (!forceRefresh) {
            const cached = getCachedData(activeBusiness || profile);
            if (cached) {
                setData(cached.data);
                setCachedAt(new Date(cached.timestamp));
                setShowDemo(false);
                setError(null);
                return;
            }
        }

        setLoading(true);
        setShowDemo(false);
        setError(null);

        const recentPolicies = (Array.isArray(history) ? history : []).slice(0, 12).map((item) => {
            const analysis = item?.analysis && typeof item.analysis === 'object' ? item.analysis : item;
            return {
                policy_name: analysis?.policy_metadata?.policy_name || 'Unknown Policy',
                policy_type: analysis?.policy_metadata?.policy_type || '',
                issuing_authority: analysis?.policy_metadata?.issuing_authority || '',
                risk_score: analysis?.risk_score?.overall_score ?? null,
                risk_band: analysis?.risk_score?.overall_band || '',
                green_score: analysis?.sustainability?.green_score ?? null,
            };
        });

        try {
            const res = await apiClient.post(`/api/competitor-analysis`, {
                user_uid: user?.uid,
                sector: activeBusiness?.sector || profile?.sector || 'MSME',
                business_type: activeBusiness?.business_type || profile?.business_type || 'MSME',
                location: activeBusiness?.state || profile?.state || profile?.location || 'India',
                products_services: activeBusiness?.products_services || profile?.products_services || profile?.business_description || '',
                years_in_business: parseInt(activeBusiness?.years_in_business, 10) || parseInt(profile?.years_in_business, 10) || 1,
                policy_context: recentPolicies,
            }, { timeout: 30000 });

            setData(res.data);
            setCachedAt(new Date());
            setCachedData(activeBusiness || profile, res.data);
        } catch (e) {
            const detail = e?.response?.data?.detail;
            setError(typeof detail === 'string' ? detail : 'Failed to fetch live competitor analysis.');
        }
        setLoading(false);
    }, [getActiveBusiness, history, profile, user]);

    useEffect(() => {
        if (!didInit.current) { didInit.current = true; runAnalysis(false); }
    }, [runAnalysis]);

    if (loading) return (
        <div className="text-center py-20 animate-fade-in-up">
            <Loader2 size={40} className="animate-spin mx-auto mb-4" style={{ color: 'var(--accent)' }} />
            <p className="font-medium">{gt('Analyzing competitive landscape...')}</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{gt('This may take 15-30 seconds')}</p>
        </div>
    );

    if (error && !showDemo) {
        return (
            <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'var(--red-light)', color: 'var(--red)' }}>
                    <AlertCircle size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2">{gt('Live Competitor Analysis Failed')}</h3>
                <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{error}</p>
                <div className="flex items-center justify-center gap-3">
                    <button onClick={() => runAnalysis(true)} className="btn btn-primary gap-2">
                        <RefreshCw size={16} /> {gt('Try Again')}
                    </button>
                    <button onClick={() => { setShowDemo(true); setData(DEMO_COMPETITOR_DATA); }} className="btn btn-secondary gap-2">
                        <Zap size={16} /> {gt('Show Demo Data')}
                    </button>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const swot = data.competitive_position || {};
    const metrics = data.market_metrics || {};
    const market = data.market_overview || {};

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Demo Mode Banner */}
            {showDemo && (
                <div className="p-4 rounded-xl flex items-center justify-between" style={{ background: 'linear-gradient(135deg, var(--accent-light), var(--purple-light, #f3e8ff))' }}>
                    <div className="flex items-center gap-3">
                        <Zap size={20} style={{ color: 'var(--accent)' }} />
                        <div>
                            <p className="font-semibold" style={{ color: 'var(--text)' }}>{gt('Demo Analysis')}</p>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{gt('Showing sample competitive data for')} {profile?.sector || 'your sector'}</p>
                        </div>
                    </div>
                    <button onClick={() => runAnalysis(true)} className="btn btn-primary btn-sm gap-1.5">
                        <RefreshCw size={14} /> {gt('Retry Live')}
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="card p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Briefcase size={22} style={{ color: 'var(--accent)' }} /> {gt('Competitive Intelligence')}
                        </h3>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                            Market analysis for {profile?.sector || 'your sector'} in {profile?.state || 'India'}
                        </p>
                        {cachedAt && (
                            <p className="text-xs mt-2 flex items-center gap-1" style={{ color: 'var(--text-tertiary)' }}>
                                <Clock size={12} /> Last updated: {cachedAt.toLocaleDateString()} {cachedAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                <span className="ml-1 opacity-60">• Refreshes weekly</span>
                            </p>
                        )}
                    </div>
                    <button onClick={() => runAnalysis(true)} className="btn btn-secondary gap-2 text-sm" title="Force fresh analysis">
                        <RefreshCw size={14} /> {gt('Refresh')}
                    </button>
                </div>
            </div>

            {/* Market Overview */}
            <div className="card p-6">
                <h4 className="font-semibold mb-4 flex items-center gap-2"><Globe size={18} style={{ color: 'var(--accent)' }} /> {gt('Market Overview')}</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    <div className="p-3 rounded-xl text-center" style={{ background: 'var(--accent-light)' }}>
                        <p className="text-lg font-bold" style={{ color: 'var(--accent)' }}>{market.market_size_inr || 'N/A'}</p>
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{gt('Market Size')}</p>
                    </div>
                    <div className="p-3 rounded-xl text-center" style={{ background: 'var(--green-light)' }}>
                        <p className="text-lg font-bold" style={{ color: 'var(--green)' }}>{market.growth_rate || 'N/A'}</p>
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{gt('Growth Rate')}</p>
                    </div>
                    <div className="p-3 rounded-xl text-center" style={{ background: 'var(--bg-secondary)' }}>
                        <p className="text-lg font-bold">{metrics.your_estimated_position || 'N/A'}</p>
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{gt('Your Position')}</p>
                    </div>
                </div>
                {market.key_trends?.length > 0 && (
                    <div>
                        <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-tertiary)' }}>{gt('KEY TRENDS')}</p>
                        <div className="flex flex-wrap gap-2">
                            {market.key_trends.map((trend, i) => (
                                <span key={i} className="px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: 'var(--bg-tertiary)' }}>{trend}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* SWOT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                    { title: gt('Strengths'), items: swot.strengths || [], color: 'var(--green)', bg: 'var(--green-light)', icon: TrendingUp },
                    { title: gt('Weaknesses'), items: swot.weaknesses || [], color: 'var(--red)', bg: 'var(--red-light)', icon: TrendingDown },
                    { title: gt('Opportunities'), items: swot.opportunities || [], color: 'var(--accent)', bg: 'var(--accent-light)', icon: Target },
                    { title: gt('Threats'), items: swot.threats || [], color: 'var(--orange)', bg: 'var(--orange-light)', icon: Shield },
                ].map(({ title, items, color, bg, icon: Icon }) => (
                    <div key={title} className="card p-5">
                        <h5 className="font-semibold mb-3 flex items-center gap-2" style={{ color }}>
                            <Icon size={16} /> {title}
                        </h5>
                        <ul className="space-y-2">
                            {items.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: color }} />
                                    <span style={{ color: 'var(--text-secondary)' }}>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Market Metrics */}
            <div className="card p-6">
                <h4 className="font-semibold mb-4">{gt('Market Metrics')}</h4>
                <MiniBarChart data={[
                    { label: 'Barrier to Entry', value: { LOW: 30, MEDIUM: 60, HIGH: 90 }[(metrics.barrier_to_entry || '').toUpperCase()] || 50, color: '#f59e0b', max: 100, suffix: '' },
                    { label: 'Price Sensitivity', value: { LOW: 30, MEDIUM: 60, HIGH: 90 }[(metrics.price_sensitivity || '').toUpperCase()] || 50, color: '#ef4444', max: 100, suffix: '' },
                    { label: 'Digital Adoption', value: { LOW: 30, MEDIUM: 60, HIGH: 90 }[(metrics.digital_adoption || '').toUpperCase()] || 50, color: '#6366f1', max: 100, suffix: '' },
                ]} />
            </div>

            {/* Competitors */}
            {data.key_competitors?.length > 0 && (
                <div className="card p-6">
                    <h4 className="font-semibold mb-4 flex items-center gap-2"><Users size={18} /> {gt('Key Competitors')}</h4>
                    <div className="space-y-3">
                        {data.key_competitors.map((c, i) => (
                            <div key={i} className="p-4 rounded-xl transition-all hover:shadow-md cursor-pointer" style={{ background: 'var(--bg-secondary)' }}>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="font-medium">{c.name}</p>
                                    <div className="flex items-center gap-2">
                                        <span className={`badge ${c.type === 'direct' ? 'badge-red' : 'badge-gray'} text-[10px]`}>{c.type}</span>
                                        {c.market_share && <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>{c.market_share}</span>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mt-2">
                                    {c.strengths?.map((s, j) => (
                                        <span key={j} className="text-xs flex items-start gap-1" style={{ color: 'var(--green)' }}>
                                            <CheckCircle size={12} className="mt-0.5 flex-shrink-0" /> {s}
                                        </span>
                                    ))}
                                    {c.weaknesses?.map((w, j) => (
                                        <span key={`w${j}`} className="text-xs flex items-start gap-1" style={{ color: 'var(--red)' }}>
                                            <AlertCircle size={12} className="mt-0.5 flex-shrink-0" /> {w}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recommendations */}
            {data.recommendations?.length > 0 && (
                <div className="card p-6">
                    <h4 className="font-semibold mb-4 flex items-center gap-2"><Target size={18} style={{ color: 'var(--green)' }} /> {gt('Strategic Recommendations')}</h4>
                    <div className="space-y-3">
                        {data.recommendations.map((r, i) => (
                            <div key={i} className="p-4 rounded-xl flex items-start gap-3 transition-all hover:shadow-md" style={{ background: 'var(--bg-secondary)' }}>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${r.priority === 'HIGH' ? 'bg-red-100' : r.priority === 'LOW' ? 'bg-green-100' : 'bg-orange-100'}`}>
                                    <span className="text-xs font-bold" style={{ color: r.priority === 'HIGH' ? 'var(--red)' : r.priority === 'LOW' ? 'var(--green)' : 'var(--orange)' }}>
                                        {i + 1}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-sm">{r.action}</p>
                                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{r.expected_impact}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`badge ${r.priority === 'HIGH' ? 'badge-red' : r.priority === 'LOW' ? 'badge-green' : 'badge-orange'} text-[10px]`}>{r.priority}</span>
                                        {r.timeframe && <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{r.timeframe}</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
