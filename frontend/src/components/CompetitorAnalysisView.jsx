import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { Briefcase, Globe, TrendingUp, TrendingDown, Target, Shield, Users, CheckCircle, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import MiniBarChart from './charts/MiniBarChart';

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function CompetitorAnalysisView({ profile, onBack }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const runAnalysis = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post(`${API}/api/competitor-analysis`, {
                sector: profile?.sector || 'Manufacturing',
                business_type: profile?.business_type || 'MSME',
                location: profile?.state || 'India',
                products_services: profile?.products_services || '',
                years_in_business: parseInt(profile?.years_in_business) || 1,
            });
            setData(res.data);
        } catch (e) {
            setError(e.response?.data?.detail || 'Failed to generate analysis');
        }
        setLoading(false);
    }, [profile]);

    useEffect(() => { runAnalysis(); }, [runAnalysis]);

    if (loading) return (
        <div className="text-center py-20 animate-fade-in-up">
            <Loader2 size={40} className="animate-spin mx-auto mb-4" style={{ color: 'var(--accent)' }} />
            <p className="font-medium">Analyzing competitive landscape...</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>This may take 15-30 seconds</p>
        </div>
    );

    if (error) return (
        <div className="text-center py-16 animate-fade-in-up">
            <AlertCircle size={48} className="mx-auto mb-4" style={{ color: 'var(--red)' }} />
            <h3 className="font-bold text-lg mb-2">Analysis Failed</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{error}</p>
            <button onClick={runAnalysis} className="btn btn-primary gap-2"><RefreshCw size={16} /> Retry</button>
        </div>
    );

    if (!data) return null;

    const swot = data.competitive_position || {};
    const metrics = data.market_metrics || {};
    const market = data.market_overview || {};

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header */}
            <div className="card p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Briefcase size={22} style={{ color: 'var(--accent)' }} /> Competitive Intelligence
                        </h3>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                            Market analysis for {profile?.sector || 'your sector'} in {profile?.state || 'India'}
                        </p>
                    </div>
                    <button onClick={runAnalysis} className="btn btn-ghost btn-icon" title="Refresh"><RefreshCw size={16} /></button>
                </div>
            </div>

            {/* Market Overview */}
            <div className="card p-6">
                <h4 className="font-semibold mb-4 flex items-center gap-2"><Globe size={18} style={{ color: 'var(--accent)' }} /> Market Overview</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    <div className="p-3 rounded-xl text-center" style={{ background: 'var(--accent-light)' }}>
                        <p className="text-lg font-bold" style={{ color: 'var(--accent)' }}>{market.market_size_inr || 'N/A'}</p>
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Market Size</p>
                    </div>
                    <div className="p-3 rounded-xl text-center" style={{ background: 'var(--green-light)' }}>
                        <p className="text-lg font-bold" style={{ color: 'var(--green)' }}>{market.growth_rate || 'N/A'}</p>
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Growth Rate</p>
                    </div>
                    <div className="p-3 rounded-xl text-center" style={{ background: 'var(--bg-secondary)' }}>
                        <p className="text-lg font-bold">{metrics.your_estimated_position || 'N/A'}</p>
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Your Position</p>
                    </div>
                </div>
                {market.key_trends?.length > 0 && (
                    <div>
                        <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-tertiary)' }}>KEY TRENDS</p>
                        <div className="flex flex-wrap gap-2">
                            {market.key_trends.map((t, i) => (
                                <span key={i} className="px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: 'var(--bg-tertiary)' }}>{t}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* SWOT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                    { title: 'Strengths', items: swot.strengths || [], color: 'var(--green)', bg: 'var(--green-light)', icon: TrendingUp },
                    { title: 'Weaknesses', items: swot.weaknesses || [], color: 'var(--red)', bg: 'var(--red-light)', icon: TrendingDown },
                    { title: 'Opportunities', items: swot.opportunities || [], color: 'var(--accent)', bg: 'var(--accent-light)', icon: Target },
                    { title: 'Threats', items: swot.threats || [], color: 'var(--orange)', bg: 'var(--orange-light)', icon: Shield },
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
                <h4 className="font-semibold mb-4">Market Metrics</h4>
                <MiniBarChart data={[
                    { label: 'Barrier to Entry', value: { LOW: 30, MEDIUM: 60, HIGH: 90 }[metrics.barrier_to_entry] || 50, color: 'var(--orange)', max: 100, suffix: '' },
                    { label: 'Price Sensitivity', value: { LOW: 30, MEDIUM: 60, HIGH: 90 }[metrics.price_sensitivity] || 50, color: 'var(--red)', max: 100, suffix: '' },
                    { label: 'Digital Adoption', value: { LOW: 30, MEDIUM: 60, HIGH: 90 }[metrics.digital_adoption] || 50, color: 'var(--accent)', max: 100, suffix: '' },
                ]} />
            </div>

            {/* Competitors */}
            {data.key_competitors?.length > 0 && (
                <div className="card p-6">
                    <h4 className="font-semibold mb-4 flex items-center gap-2"><Users size={18} /> Key Competitors</h4>
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
                    <h4 className="font-semibold mb-4 flex items-center gap-2"><Target size={18} style={{ color: 'var(--green)' }} /> Strategic Recommendations</h4>
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
