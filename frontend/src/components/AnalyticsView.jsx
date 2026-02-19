import React from 'react';
import { BarChart3, Shield, Leaf, Activity, CheckCircle, Building2, Loader2 } from 'lucide-react';

export default function AnalyticsView({ analytics, loading }) {
    if (loading) {
        return (
            <div className="text-center py-16">
                <Loader2 size={32} className="animate-spin mx-auto mb-4" style={{ color: 'var(--accent)' }} />
                <p style={{ color: 'var(--text-secondary)' }}>Loading analytics...</p>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="text-center py-16">
                <BarChart3 size={48} className="mx-auto mb-4 opacity-20" />
                <p style={{ color: 'var(--text-secondary)' }}>No analytics data. Upload and analyze policies to see insights.</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto animate-fade-in-up">
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="card p-5 text-center">
                        <div className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>{analytics.total_analyses}</div>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Total Analyses</p>
                    </div>
                    <div className="card p-5 text-center">
                        <div className="text-3xl font-bold" style={{ color: analytics.avg_risk_score > 70 ? 'var(--red)' : analytics.avg_risk_score > 40 ? 'var(--orange)' : 'var(--green)' }}>{analytics.avg_risk_score}</div>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Avg Risk Score</p>
                    </div>
                    <div className="card p-5 text-center">
                        <div className="text-3xl font-bold" style={{ color: 'var(--green)' }}>{analytics.avg_sustainability_score}</div>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Avg Green Score</p>
                    </div>
                    <div className="card p-5 text-center">
                        <div className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>{analytics.total_schemes}</div>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Schemes Matched</p>
                    </div>
                </div>

                {/* Risk Breakdown */}
                <div className="card p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2"><Shield size={18} style={{ color: 'var(--orange)' }} /> Risk Distribution</h3>
                    <div className="grid grid-cols-4 gap-3">
                        {Object.entries(analytics.risk_breakdown || {}).map(([level, count]) => (
                            <div key={level} className="p-3 rounded-xl text-center" style={{
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
                    <h3 className="font-semibold mb-4 flex items-center gap-2"><Leaf size={18} style={{ color: 'var(--green)' }} /> Sustainability Impact</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl text-center" style={{ background: 'var(--green-light)' }}>
                            <div className="text-2xl font-bold" style={{ color: 'var(--green)' }}>{analytics.sustainability_totals?.paper_saved || 0}</div>
                            <p className="text-xs mt-1">Pages Saved</p>
                        </div>
                        <div className="p-4 rounded-xl text-center" style={{ background: 'var(--green-light)' }}>
                            <div className="text-2xl font-bold" style={{ color: 'var(--green)' }}>{analytics.sustainability_totals?.co2_saved_kg || 0} kg</div>
                            <p className="text-xs mt-1">CO₂ Saved</p>
                        </div>
                        <div className="p-4 rounded-xl text-center" style={{ background: 'var(--green-light)' }}>
                            <div className="text-2xl font-bold" style={{ color: 'var(--green)' }}>₹{analytics.sustainability_totals?.cost_saved_inr || 0}</div>
                            <p className="text-xs mt-1">Cost Saved</p>
                        </div>
                    </div>
                </div>

                {/* Score Trend */}
                {analytics.score_trend?.length > 0 && (
                    <div className="card p-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2"><Activity size={18} style={{ color: 'var(--accent)' }} /> Score Trend</h3>
                        <div className="space-y-2">
                            {analytics.score_trend.map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                                    <span className="text-sm font-medium flex-1 truncate">{item.policy_name}</span>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs px-2 py-1 rounded-full font-medium" style={{
                                            background: item.risk_score > 70 ? 'var(--red-light)' : item.risk_score > 40 ? 'var(--orange-light)' : 'var(--green-light)',
                                            color: item.risk_score > 70 ? 'var(--red)' : item.risk_score > 40 ? 'var(--orange)' : 'var(--green)',
                                        }}>Risk: {item.risk_score}</span>
                                        <span className="text-xs px-2 py-1 rounded-full font-medium" style={{
                                            background: 'var(--green-light)', color: 'var(--green)'
                                        }}>Green: {item.green_score}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Matched Schemes */}
                {analytics.schemes_matched?.length > 0 && (
                    <div className="card p-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2"><CheckCircle size={18} style={{ color: 'var(--accent)' }} /> Government Schemes Matched</h3>
                        <div className="flex flex-wrap gap-2">
                            {analytics.schemes_matched.map((s, i) => (
                                <span key={i} className="px-3 py-1.5 rounded-full text-sm font-medium" style={{
                                    background: 'var(--accent-light)', color: 'var(--accent)'
                                }}>{s}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Sectors */}
                {analytics.sectors_covered?.length > 0 && (
                    <div className="card p-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2"><Building2 size={18} /> Sectors Analyzed</h3>
                        <div className="flex flex-wrap gap-2">
                            {analytics.sectors_covered.map((s, i) => (
                                <span key={i} className="px-3 py-1.5 rounded-full text-sm" style={{
                                    background: 'var(--bg-tertiary)'
                                }}>{s}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
