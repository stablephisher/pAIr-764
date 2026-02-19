import React, { useState } from 'react';
import { FileText, Zap, TrendingUp, CheckCircle, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import MiniPieChart from './charts/MiniPieChart';
import MiniBarChart from './charts/MiniBarChart';
import { Briefcase } from 'lucide-react';

export default function ResultsView({ data, language, profile }) {
    const [tab, setTab] = useState('overview');

    // Backend returns flat structure — map to display format
    const policyMeta = data.policy_metadata || {};
    const riskData = data.risk_score || {};
    const susData = data.sustainability || {};
    const profData = data.profitability || {};
    const ethicsData = data.ethics || {};

    const scores = {
        risk_score: riskData.overall_score || 0,
        sustainability_score: susData.green_score || 0,
        profitability_score: Math.min(100, Math.round((profData.roi_multiplier || 0) * 10)),
        ethics_score: ethicsData.overall_score || 0,
    };

    const obligations = data.compliance_obligations || [];
    const compliancePlan = data.compliance_plan || {};
    const riskAssessment = data.risk_assessment || {};

    // Score ring component
    const ScoreRing = ({ value, label, color }) => {
        const circumference = 2 * Math.PI * 40;
        const offset = circumference - (value / 100) * circumference;

        return (
            <div className="text-center">
                <div className="score-ring mx-auto mb-3">
                    <svg width="120" height="120" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="var(--bg-tertiary)" strokeWidth="8" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
                            strokeDasharray={circumference} strokeDashoffset={offset} className="progress" />
                    </svg>
                    <span className="score-value" style={{ color }}>{value}</span>
                </div>
                <p className="text-sm font-medium">{label}</p>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header */}
            <div className="card p-6 flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                    <FileText size={28} />
                </div>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">{data.policy_name || policyMeta.policy_name || 'Policy Analysis'}</h2>
                    <div className="flex flex-wrap gap-2">
                        {policyMeta.geographical_scope && <span className="badge badge-gray">{policyMeta.geographical_scope}</span>}
                        {policyMeta.policy_type && <span className="badge badge-accent">{policyMeta.policy_type}</span>}
                        {policyMeta.issuing_authority && <span className="badge badge-green">{policyMeta.issuing_authority}</span>}
                    </div>
                </div>
            </div>

            {/* Scores */}
            <div className="card p-6">
                <h3 className="font-semibold mb-6">Analysis Scores</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <ScoreRing value={scores.risk_score || 0} label="Risk Score"
                        color={scores.risk_score > 70 ? 'var(--red)' : scores.risk_score > 40 ? 'var(--orange)' : 'var(--green)'} />
                    <ScoreRing value={scores.sustainability_score || 0} label="Sustainability" color="var(--green)" />
                    <ScoreRing value={scores.profitability_score || 0} label="Profitability" color="var(--accent)" />
                    <ScoreRing value={scores.ethics_score || 0} label="Ethics" color="var(--purple)" />
                </div>
            </div>

            {/* Score Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card p-5">
                    <MiniPieChart title="Score Distribution" data={[
                        { label: 'Risk', value: scores.risk_score || 1, color: (scores.risk_score || 0) > 70 ? '#ef4444' : (scores.risk_score || 0) > 40 ? '#f97316' : '#22c55e' },
                        { label: 'Sustainability', value: scores.sustainability_score || 1, color: '#22c55e' },
                        { label: 'Profitability', value: scores.profitability_score || 1, color: '#6366f1' },
                        { label: 'Ethics', value: scores.ethics_score || 1, color: '#8b5cf6' },
                    ]} />
                </div>
                <div className="card p-5">
                    <MiniBarChart title="Score Breakdown" data={[
                        { label: 'Risk Score', value: scores.risk_score || 0, color: (scores.risk_score || 0) > 70 ? '#ef4444' : (scores.risk_score || 0) > 40 ? '#f97316' : '#22c55e', max: 100, suffix: '/100' },
                        { label: 'Green Score', value: scores.sustainability_score || 0, color: '#22c55e', max: 100, suffix: '/100' },
                        { label: 'Profitability', value: scores.profitability_score || 0, color: '#6366f1', max: 100, suffix: '/100' },
                        { label: 'Ethics', value: scores.ethics_score || 0, color: '#8b5cf6', max: 100, suffix: '/100' },
                    ]} />
                </div>
            </div>

            {/* Business Profile Summary */}
            {profile && profile.business_name && (
                <div className="card p-5" style={{ borderLeft: '3px solid var(--accent)' }}>
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                        <Briefcase size={16} style={{ color: 'var(--accent)' }} /> Business Profile Applied
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div><p className="text-[10px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>BUSINESS</p><p className="text-sm font-medium">{profile.business_name}</p></div>
                        <div><p className="text-[10px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>SECTOR</p><p className="text-sm font-medium">{profile.sector || 'N/A'}</p></div>
                        <div><p className="text-[10px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>TYPE</p><p className="text-sm font-medium">{profile.business_type || 'N/A'}</p></div>
                        <div><p className="text-[10px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>STATE</p><p className="text-sm font-medium">{profile.state || 'N/A'}</p></div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="card overflow-hidden">
                <div className="tabs">
                    {['overview', 'obligations', 'actions'].map(t => (
                        <button key={t} onClick={() => setTab(t)} className={`tab ${tab === t ? 'active' : ''}`}>
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                            {t === 'obligations' && obligations.length > 0 && ` (${obligations.length})`}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {tab === 'overview' && (
                        <div className="space-y-6">
                            {/* Who is affected */}
                            {data.applicability?.who_is_affected && (
                                <div>
                                    <h4 className="font-semibold mb-3">Who Is Affected</h4>
                                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{data.applicability.who_is_affected}</p>
                                </div>
                            )}

                            {/* Risk Assessment */}
                            {riskAssessment.overall_risk_level && (
                                <div>
                                    <h4 className="font-semibold mb-3">Risk Assessment</h4>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`badge badge-${riskAssessment.overall_risk_level === 'HIGH' ? 'red' : riskAssessment.overall_risk_level === 'MEDIUM' ? 'orange' : 'green'}`}>
                                            {riskAssessment.overall_risk_level}
                                        </span>
                                    </div>
                                    {riskAssessment.risk_factors?.length > 0 && (
                                        <ul className="list-disc list-inside space-y-1">
                                            {riskAssessment.risk_factors.map((f, i) => (
                                                <li key={i} className="text-sm" style={{ color: 'var(--text-secondary)' }}>{f}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}

                            {/* Top Risks from scoring */}
                            {riskData.top_risks?.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-3">Top Compliance Risks</h4>
                                    <div className="space-y-3">
                                        {riskData.top_risks.map((r, i) => (
                                            <div key={i} className="p-4 rounded-xl flex items-start gap-3" style={{ background: 'var(--bg-secondary)' }}>
                                                <AlertCircle size={18} style={{ color: 'var(--orange)' }} className="flex-shrink-0 mt-0.5" />
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">{r.name}</p>
                                                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{r.hint}</p>
                                                    <div className="flex gap-2 mt-2">
                                                        <span className={`badge badge-${r.band === 'CRITICAL' ? 'red' : r.band === 'HIGH' ? 'orange' : 'green'}`}>{r.band}</span>
                                                        {r.days_remaining != null && <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{r.days_remaining} days remaining</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Sustainability */}
                            {susData.green_score > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-3">Sustainability Impact</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {[
                                            { label: 'Green Score', value: susData.green_score, suffix: '/100' },
                                            { label: 'Grade', value: susData.grade },
                                            { label: 'Paper Saved', value: `${susData.paper_saved || 0} pages` },
                                            { label: 'CO₂ Saved', value: `${(susData.co2_saved_kg || 0).toFixed(1)} kg` },
                                        ].map((item, i) => (
                                            <div key={i} className="p-3 rounded-lg text-center" style={{ background: 'var(--bg-secondary)' }}>
                                                <p className="text-lg font-bold" style={{ color: 'var(--green)' }}>{item.value}{item.suffix || ''}</p>
                                                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{item.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                    {susData.narrative && <p className="text-sm mt-3" style={{ color: 'var(--text-secondary)' }}>{susData.narrative}</p>}
                                </div>
                            )}

                            {/* Matched Schemes */}
                            {data.matched_schemes?.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-3">Matched Government Schemes</h4>
                                    <div className="space-y-3">
                                        {data.matched_schemes.map((s, i) => (
                                            <div key={i} className="p-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                                                <p className="font-medium">{s.name || s}</p>
                                                {s.description && <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{s.description}</p>}
                                                {s.eligibility && <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Eligibility: {s.eligibility}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {tab === 'obligations' && (
                        <div className="space-y-4">
                            {obligations.length === 0 ? (
                                <div className="text-center py-12">
                                    <CheckCircle size={48} style={{ color: 'var(--text-tertiary)' }} className="mx-auto mb-3" />
                                    <p style={{ color: 'var(--text-secondary)' }}>No compliance obligations found</p>
                                </div>
                            ) : (
                                obligations.map((obl, i) => (
                                    <div key={i} className="card p-5 flex items-start gap-4">
                                        <CheckCircle size={20} style={{ color: 'var(--accent)' }} className="flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="font-medium mb-2">{obl.description || obl.text}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {obl.severity && (
                                                    <span className={`badge badge-${obl.severity === 'high' ? 'red' : obl.severity === 'medium' ? 'orange' : 'green'}`}>
                                                        {obl.severity}
                                                    </span>
                                                )}
                                                {obl.deadline && (
                                                    <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                                        <Clock size={12} /> {obl.deadline}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {tab === 'actions' && (
                        <div className="space-y-6">
                            {/* Immediate Actions */}
                            {compliancePlan.immediate_actions?.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                        <Zap size={16} style={{ color: 'var(--orange)' }} /> Immediate Actions
                                    </h4>
                                    {compliancePlan.immediate_actions.map((action, i) => (
                                        <div key={i} className="p-4 rounded-xl flex items-start gap-3 mb-2" style={{ background: 'var(--orange-light)' }}>
                                            <CheckCircle size={18} style={{ color: 'var(--orange)' }} className="flex-shrink-0 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">{action.action || action}</p>
                                                {action.deadline && <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Deadline: {action.deadline}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Short Term */}
                            {compliancePlan.short_term?.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                        <Clock size={16} style={{ color: 'var(--accent)' }} /> Short Term
                                    </h4>
                                    {compliancePlan.short_term.map((action, i) => (
                                        <div key={i} className="p-4 rounded-xl flex items-start gap-3 mb-2" style={{ background: 'var(--bg-secondary)' }}>
                                            <ArrowRight size={18} style={{ color: 'var(--accent)' }} className="flex-shrink-0 mt-0.5" />
                                            <p className="text-sm">{action.action || action}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Long Term */}
                            {compliancePlan.long_term?.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                        <TrendingUp size={16} style={{ color: 'var(--green)' }} /> Long Term
                                    </h4>
                                    {compliancePlan.long_term.map((action, i) => (
                                        <div key={i} className="p-4 rounded-xl flex items-start gap-3 mb-2" style={{ background: 'var(--green-light)' }}>
                                            <ArrowRight size={18} style={{ color: 'var(--green)' }} className="flex-shrink-0 mt-0.5" />
                                            <p className="text-sm">{action.action || action}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Fallback if no actions */}
                            {!compliancePlan.immediate_actions?.length && !compliancePlan.short_term?.length && !compliancePlan.long_term?.length && (
                                <div className="text-center py-12">
                                    <p style={{ color: 'var(--text-secondary)' }}>No specific actions identified</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
