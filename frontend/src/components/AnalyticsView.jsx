import React from 'react';
import { BarChart3, Shield, Leaf, Activity, CheckCircle, Building2, Loader2, TrendingUp, Target, Zap, ArrowUpRight, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useTranslate from '../hooks/useTranslate';

// Demo data for when no analytics exist
const DEMO_ANALYTICS = {
    total_analyses: 12,
    avg_risk_score: 35,
    avg_sustainability_score: 78,
    avg_profitability_multiplier: 2.4,
    total_schemes: 8,
    risk_breakdown: { CRITICAL: 1, HIGH: 2, MEDIUM: 4, LOW: 5 },
    sectors_covered: ['Manufacturing', 'Technology', 'Retail'],
    schemes_matched: ['PM MUDRA Yojana', 'Stand-Up India', 'CGTMSE', 'PLI Scheme', 'PMEGP', 'Startup India', 'NSIC', 'SIDBI'],
    sustainability_totals: { paper_saved: 450, co2_saved_kg: 12.5, cost_saved_inr: 2800 },
    score_trend: [
        { policy_name: 'GST Compliance Policy', risk_score: 28, green_score: 85 },
        { policy_name: 'Labor Law Guidelines', risk_score: 45, green_score: 72 },
        { policy_name: 'Environmental Standards', risk_score: 22, green_score: 92 },
        { policy_name: 'Trade Regulations', risk_score: 55, green_score: 65 },
    ]
};

export default function AnalyticsView({ analytics, loading, lang = 'en' }) {
    const { gt } = useTranslate(lang);
    const navigate = useNavigate();
    
    // Use demo data if no real analytics
    const isDemo = !analytics || analytics.total_analyses === 0;
    const data = isDemo ? DEMO_ANALYTICS : analytics;

    if (loading) {
        return (
            <div className="text-center py-16">
                <Loader2 size={32} className="animate-spin mx-auto mb-4" style={{ color: 'var(--accent)' }} />
                <p style={{ color: 'var(--text-secondary)' }}>{gt('Loading analytics...')}</p>
            </div>
        );
    }

    return (
        <div className="w-full animate-fade-in-up">
            <div className="space-y-6">
                {/* Demo Mode Banner */}
                {isDemo && (
                    <div className="p-4 rounded-xl flex items-center justify-between" style={{ background: 'linear-gradient(135deg, var(--accent-light), var(--purple-light, #f3e8ff))' }}>
                        <div className="flex items-center gap-3">
                            <Zap size={20} style={{ color: 'var(--accent)' }} />
                            <div>
                                <p className="font-semibold" style={{ color: 'var(--text)' }}>{gt('Demo Analytics')}</p>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{gt('Analyze your business to see real insights')}</p>
                            </div>
                        </div>
                        <button onClick={() => navigate('/analysis')} className="btn btn-primary btn-sm gap-1.5">
                            <FileText size={14} /> {gt('Start Analysis')}
                        </button>
                    </div>
                )}

                {/* Summary Cards - Full Width Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    <div className="card p-6 text-center hover:scale-105 transition-transform">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-light)' }}>
                            <BarChart3 size={24} style={{ color: 'var(--accent)' }} />
                        </div>
                        <div className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>{data.total_analyses}</div>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{gt('Total Analyses')}</p>
                    </div>
                    <div className="card p-6 text-center hover:scale-105 transition-transform">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center" style={{ background: data.avg_risk_score > 70 ? 'var(--red-light)' : data.avg_risk_score > 40 ? 'var(--orange-light)' : 'var(--green-light)' }}>
                            <Shield size={24} style={{ color: data.avg_risk_score > 70 ? 'var(--red)' : data.avg_risk_score > 40 ? 'var(--orange)' : 'var(--green)' }} />
                        </div>
                        <div className="text-3xl font-bold" style={{ color: data.avg_risk_score > 70 ? 'var(--red)' : data.avg_risk_score > 40 ? 'var(--orange)' : 'var(--green)' }}>{data.avg_risk_score}</div>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{gt('Avg Risk Score')}</p>
                    </div>
                    <div className="card p-6 text-center hover:scale-105 transition-transform">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center" style={{ background: 'var(--green-light)' }}>
                            <Leaf size={24} style={{ color: 'var(--green)' }} />
                        </div>
                        <div className="text-3xl font-bold" style={{ color: 'var(--green)' }}>{data.avg_sustainability_score}</div>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{gt('Green Score')}</p>
                    </div>
                    <div className="card p-6 text-center hover:scale-105 transition-transform">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-light)' }}>
                            <Target size={24} style={{ color: 'var(--accent)' }} />
                        </div>
                        <div className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>{data.total_schemes}</div>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{gt('Schemes Matched')}</p>
                    </div>
                    <div className="card p-6 text-center hover:scale-105 transition-transform">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-light)' }}>
                            <TrendingUp size={24} style={{ color: 'var(--accent)' }} />
                        </div>
                        <div className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>{data.avg_profitability_multiplier || '2.4'}x</div>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{gt('ROI Multiplier')}</p>
                    </div>
                </div>

                {/* Two Column Layout for Desktop */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Risk Breakdown */}
                    <div className="card p-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2"><Shield size={18} style={{ color: 'var(--orange)' }} /> {gt('Risk Distribution')}</h3>
                        <div className="grid grid-cols-4 gap-3">
                            {Object.entries(data.risk_breakdown || {}).map(([level, count]) => (
                                <div key={level} className="p-4 rounded-xl text-center" style={{
                                    background: level === 'CRITICAL' ? 'var(--red-light)' : level === 'HIGH' ? 'var(--orange-light)' : level === 'MEDIUM' ? 'var(--accent-light)' : 'var(--green-light)'
                                }}>
                                    <div className="text-2xl font-bold" style={{
                                        color: level === 'CRITICAL' ? 'var(--red)' : level === 'HIGH' ? 'var(--orange)' : level === 'MEDIUM' ? 'var(--accent)' : 'var(--green)'
                                    }}>{count}</div>
                                    <p className="text-xs font-medium mt-1">{level}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sustainability Totals */}
                    <div className="card p-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2"><Leaf size={18} style={{ color: 'var(--green)' }} /> {gt('Sustainability Impact')}</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 rounded-xl text-center" style={{ background: 'var(--green-light)' }}>
                                <div className="text-2xl font-bold" style={{ color: 'var(--green)' }}>{data.sustainability_totals?.paper_saved || 0}</div>
                                <p className="text-xs mt-1">{gt('Pages Saved')}</p>
                            </div>
                            <div className="p-4 rounded-xl text-center" style={{ background: 'var(--green-light)' }}>
                                <div className="text-2xl font-bold" style={{ color: 'var(--green)' }}>{data.sustainability_totals?.co2_saved_kg || 0} kg</div>
                                <p className="text-xs mt-1">{gt('CO₂ Saved')}</p>
                            </div>
                            <div className="p-4 rounded-xl text-center" style={{ background: 'var(--green-light)' }}>
                                <div className="text-2xl font-bold" style={{ color: 'var(--green)' }}>₹{data.sustainability_totals?.cost_saved_inr || 0}</div>
                                <p className="text-xs mt-1">{gt('Cost Saved')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Score Trend - Full Width */}
                {data.score_trend?.length > 0 && (
                    <div className="card p-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2"><Activity size={18} style={{ color: 'var(--accent)' }} /> {gt('Policy Analysis Trend')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {data.score_trend.map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-light)' }}>
                                        <FileText size={18} style={{ color: 'var(--accent)' }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{item.policy_name}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
                                                background: item.risk_score > 70 ? 'var(--red-light)' : item.risk_score > 40 ? 'var(--orange-light)' : 'var(--green-light)',
                                                color: item.risk_score > 70 ? 'var(--red)' : item.risk_score > 40 ? 'var(--orange)' : 'var(--green)',
                                            }}>Risk: {item.risk_score}</span>
                                            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
                                                background: 'var(--green-light)', color: 'var(--green)'
                                            }}>Green: {item.green_score}</span>
                                        </div>
                                    </div>
                                    <ArrowUpRight size={16} style={{ color: 'var(--text-tertiary)' }} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Two Column: Schemes and Sectors */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Matched Schemes */}
                    {data.schemes_matched?.length > 0 && (
                        <div className="card p-6">
                            <h3 className="font-semibold mb-4 flex items-center gap-2"><CheckCircle size={18} style={{ color: 'var(--accent)' }} /> {gt('Government Schemes Matched')}</h3>
                            <div className="flex flex-wrap gap-2">
                                {data.schemes_matched.map((s, i) => (
                                    <span key={i} className="px-3 py-2 rounded-xl text-sm font-medium cursor-pointer hover:scale-105 transition-transform" style={{
                                        background: 'var(--accent-light)', color: 'var(--accent)'
                                    }}>{s}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Sectors */}
                    {data.sectors_covered?.length > 0 && (
                        <div className="card p-6">
                            <h3 className="font-semibold mb-4 flex items-center gap-2"><Building2 size={18} /> {gt('Sectors Analyzed')}</h3>
                            <div className="flex flex-wrap gap-2">
                                {data.sectors_covered.map((s, i) => (
                                    <span key={i} className="px-3 py-2 rounded-xl text-sm font-medium" style={{
                                        background: 'var(--bg-tertiary)'
                                    }}>{s}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* CTA for Demo Mode */}
                {isDemo && (
                    <div className="card p-8 text-center" style={{ background: 'linear-gradient(135deg, var(--accent), var(--purple, #7c3aed))' }}>
                        <h3 className="text-xl font-bold text-white mb-2">{gt('Ready to analyze your business?')}</h3>
                        <p className="text-white/80 mb-4">{gt('Get personalized compliance insights and scheme recommendations')}</p>
                        <button onClick={() => navigate('/analysis')} className="btn bg-white hover:bg-gray-100 gap-2" style={{ color: 'var(--accent)' }}>
                            <Zap size={16} /> {gt('Start Smart Analysis')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
