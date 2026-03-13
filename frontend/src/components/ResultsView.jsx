import React, { useEffect, useState } from 'react';
import { FileText, Zap, TrendingUp, CheckCircle, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import MiniPieChart from './charts/MiniPieChart';
import MiniBarChart from './charts/MiniBarChart';
import { Briefcase } from 'lucide-react';
import useTranslate from '../hooks/useTranslate';
import { useAppContext } from '../context/AppContext';

export default function ResultsView({ data, language, profile }) {
    const [tab, setTab] = useState('overview');
    const lang = language || 'en';
    const { gt } = useTranslate(lang);
    const { translateContent } = useAppContext();
    const [displayData, setDisplayData] = useState(data);
    const [translating, setTranslating] = useState(false);

    useEffect(() => {
        let alive = true;

        const adaptLanguage = async () => {
            if (!data) {
                if (alive) setDisplayData(data);
                return;
            }

            setTranslating(true);
            try {
                const translated = await translateContent(data, lang);
                if (alive) setDisplayData(translated || data);
            } catch (_) {
                if (alive) setDisplayData(data);
            } finally {
                if (alive) setTranslating(false);
            }
        };

        adaptLanguage();
        return () => { alive = false; };
    }, [data, lang, translateContent]);

    const sourceData = displayData || data || {};

    // Backend returns flat structure  - map to display format
    const policyMeta = sourceData.policy_metadata || {};
    const riskData = sourceData.risk_score || {};
    const susData = sourceData.sustainability || {};
    const profData = sourceData.profitability || {};
    const ethicsData = sourceData.ethics || {};

    const toFinite = (value) => {
        const num = Number(value);
        return Number.isFinite(num) ? num : null;
    };

    const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, value));

    const normalizeRoiToScore = (roiMultiplier) => {
        const roi = toFinite(roiMultiplier);
        if (roi === null) return null;
        const capped = Math.min(Math.max(roi, 0), 20);
        return Math.round((1 - Math.exp(-capped / 4)) * 100);
    };

    const rawRisk = toFinite(riskData.overall_score);
    const rawSustainability = toFinite(susData.green_score);
    const rawProfitability = toFinite(profData.profitability_score);
    const rawEthics = toFinite(ethicsData.overall_score);

    const scores = {
        risk_score: rawRisk === null ? null : clamp(rawRisk),
        sustainability_score: rawSustainability === null ? null : clamp(rawSustainability),
        profitability_score: rawProfitability === null ? normalizeRoiToScore(profData.roi_multiplier) : clamp(rawProfitability),
        ethics_score: rawEthics === null ? null : clamp(rawEthics),
    };

    const obligations = sourceData.obligations || sourceData.compliance_obligations || [];
    const compliancePlan = sourceData.compliance_plan || {};
    // Fallback chain: compliance_plan.action_plan → compliance_actions (mapped) → []
    let actionPlan = compliancePlan.action_plan || [];
    if (actionPlan.length === 0 && sourceData.compliance_actions?.length > 0) {
        actionPlan = sourceData.compliance_actions.map((act, i) => ({
            step_number: i + 1,
            action: typeof act === 'string' ? act : (act.action || ''),
            priority: act.priority || 'MEDIUM',
            deadline: act.estimated_effort || act.deadline || '',
        }));
    }
    const riskAssessment = data.risk_assessment || {};
    const policyTitle = sourceData.policy_name || policyMeta.policy_name || 'Policy Analysis';
    const riskBand = String(riskData.overall_band || riskAssessment.overall_risk_level || '').toUpperCase();
    const plainLevel = (scores.risk_score ?? 0) > 70 ? gt('High attention needed') : (scores.risk_score ?? 0) > 40 ? gt('Some care needed') : gt('Looks safe for now');
    const nextAction = actionPlan[0]?.action || obligations[0]?.obligation || obligations[0]?.description || gt('Review obligations and complete the first step.');

    const riskTone = riskBand === 'HIGH' || riskBand === 'CRITICAL'
        ? { bg: 'var(--red-light)', text: 'var(--red)' }
        : riskBand === 'MEDIUM'
            ? { bg: 'var(--orange-light)', text: 'var(--orange)' }
            : { bg: 'var(--green-light)', text: 'var(--green)' };

    // Score ring component
    const ScoreRing = ({ value, label, color }) => {
        const circumference = 2 * Math.PI * 40;
        const safeValue = value === null ? 0 : value;
        const offset = circumference - (safeValue / 100) * circumference;

        return (
            <div className="text-center">
                <div className="score-ring mx-auto mb-3">
                    <svg width="120" height="120" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="var(--bg-tertiary)" strokeWidth="8" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
                            strokeDasharray={circumference} strokeDashoffset={offset} className="progress" />
                    </svg>
                    <span className="score-value" style={{ color }}>{value === null ? 'N/A' : value}</span>
                </div>
                <p className="text-sm font-medium">{label}</p>
            </div>
        );
    };

    const pieData = [
        { label: 'Risk', value: scores.risk_score, color: (scores.risk_score ?? 0) > 70 ? '#ef4444' : (scores.risk_score ?? 0) > 40 ? '#f97316' : '#22c55e' },
        { label: 'Sustainability', value: scores.sustainability_score, color: '#22c55e' },
        { label: 'Profitability', value: scores.profitability_score, color: '#6366f1' },
        { label: 'Ethics', value: scores.ethics_score, color: '#8b5cf6' },
    ].filter((item) => item.value !== null && item.value > 0);

    return (
        <div className="space-y-6 animate-fade-in-up">
            {translating && (
                <div className="text-xs px-3 py-2 rounded-lg inline-flex items-center gap-2" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                    <Zap size={12} /> {gt('Adapting language to your selected preset...')}
                </div>
            )}

            {/* Header */}
            <div className="card p-5 md:p-6" style={{ background: 'linear-gradient(135deg, var(--surface-elevated), var(--accent-light))' }}>
                <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                        <FileText size={28} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-xl md:text-2xl font-bold mb-2 truncate">{policyTitle}</h2>
                        <div className="flex flex-wrap gap-2">
                            {policyMeta.geographical_scope && <span className="badge badge-gray">{policyMeta.geographical_scope}</span>}
                            {policyMeta.policy_type && <span className="badge badge-accent">{policyMeta.policy_type}</span>}
                            {policyMeta.issuing_authority && <span className="badge badge-green">{policyMeta.issuing_authority}</span>}
                            {riskBand && (
                                <span className="badge" style={{ background: riskTone.bg, color: riskTone.text }}>
                                    {gt('Risk')}: {riskBand}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
                    <div className="p-3 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                        <p className="text-[11px] font-semibold uppercase" style={{ color: 'var(--text-tertiary)' }}>{gt('Risk Score')}</p>
                        <p className="text-xl font-bold" style={{ color: riskTone.text }}>{scores.risk_score ?? 'N/A'}</p>
                    </div>
                    <div className="p-3 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                        <p className="text-[11px] font-semibold uppercase" style={{ color: 'var(--text-tertiary)' }}>{gt('Green Score')}</p>
                        <p className="text-xl font-bold" style={{ color: 'var(--green)' }}>{scores.sustainability_score ?? 'N/A'}</p>
                    </div>
                    <div className="p-3 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                        <p className="text-[11px] font-semibold uppercase" style={{ color: 'var(--text-tertiary)' }}>{gt('Profitability')}</p>
                        <p className="text-xl font-bold" style={{ color: 'var(--accent)' }}>{scores.profitability_score ?? 'N/A'}</p>
                    </div>
                    <div className="p-3 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                        <p className="text-[11px] font-semibold uppercase" style={{ color: 'var(--text-tertiary)' }}>{gt('Obligations')}</p>
                        <p className="text-xl font-bold" style={{ color: 'var(--text)' }}>{obligations.length}</p>
                    </div>
                </div>
            </div>

            {/* Simple Summary */}
            <div className="card p-5 md:p-6">
                <h3 className="font-semibold mb-4">{gt('Simple Summary')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                        <p className="text-xs font-semibold uppercase" style={{ color: 'var(--text-tertiary)' }}>{gt('Safety Level')}</p>
                        <p className="text-base font-bold" style={{ color: riskTone.text }}>{plainLevel}</p>
                    </div>
                    <div className="p-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                        <p className="text-xs font-semibold uppercase" style={{ color: 'var(--text-tertiary)' }}>{gt('Do This First')}</p>
                        <p className="text-base font-semibold" style={{ color: 'var(--text)' }}>{nextAction}</p>
                    </div>
                    <div className="p-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                        <p className="text-xs font-semibold uppercase" style={{ color: 'var(--text-tertiary)' }}>{gt('Expected Benefit')}</p>
                        <p className="text-base font-semibold" style={{ color: 'var(--green)' }}>
                            {susData.narrative || gt('Better compliance and lower business risk over time.')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Scores */}
            <div className="card p-6">
                <h3 className="font-semibold mb-6">{gt('Analysis Scores')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <ScoreRing value={scores.risk_score} label={gt('Risk Score')}
                        color={(scores.risk_score ?? 0) > 70 ? 'var(--red)' : (scores.risk_score ?? 0) > 40 ? 'var(--orange)' : 'var(--green)'} />
                    <ScoreRing value={scores.sustainability_score} label={gt('Sustainability')} color="var(--green)" />
                    <ScoreRing value={scores.profitability_score} label={gt('Profitability')} color="var(--accent)" />
                    <ScoreRing value={scores.ethics_score} label={gt('Ethics')} color="var(--purple)" />
                </div>
            </div>

            {/* Score Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card p-5">
                    <MiniPieChart title={gt('Score Distribution')} data={pieData} />
                </div>
                <div className="card p-5">
                    <MiniBarChart title={gt('Score Breakdown')} data={[
                        { label: 'Risk Score', value: scores.risk_score, color: (scores.risk_score ?? 0) > 70 ? '#ef4444' : (scores.risk_score ?? 0) > 40 ? '#f97316' : '#22c55e', max: 100, suffix: '/100' },
                        { label: 'Green Score', value: scores.sustainability_score, color: '#22c55e', max: 100, suffix: '/100' },
                        { label: 'Profitability', value: scores.profitability_score, color: '#6366f1', max: 100, suffix: '/100' },
                        { label: 'Ethics', value: scores.ethics_score, color: '#8b5cf6', max: 100, suffix: '/100' },
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
                    {[{key: 'overview', label: gt('Overview')}, {key: 'obligations', label: gt('Obligations')}, {key: 'actions', label: gt('Actions')}].map(item => (
                        <button key={item.key} onClick={() => setTab(item.key)} className={`tab ${tab === item.key ? 'active' : ''}`}>
                            {item.label}
                            {item.key === 'obligations' && obligations.length > 0 && ` (${obligations.length})`}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {tab === 'overview' && (
                        <div className="space-y-6">
                            {/* Who is affected */}
                            {sourceData.applicability?.who_is_affected && (
                                <div>
                                    <h4 className="font-semibold mb-3">Who Is Affected</h4>
                                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{sourceData.applicability.who_is_affected}</p>
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
                            {sourceData.matched_schemes?.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-3">Matched Government Schemes</h4>
                                    <div className="space-y-3">
                                        {sourceData.matched_schemes.map((s, i) => (
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
                                            <p className="font-medium mb-1">{obl.obligation || obl.description || obl.text || (typeof obl === 'string' ? obl : '')}</p>
                                            {obl.description && obl.obligation && <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>{obl.description}</p>}
                                            <div className="flex flex-wrap gap-2">
                                                {(obl.severity_if_ignored || obl.severity) && (
                                                    <span className={`badge badge-${(obl.severity_if_ignored || obl.severity || '').toLowerCase().includes('high') ? 'red' : (obl.severity_if_ignored || obl.severity || '').toLowerCase().includes('medium') ? 'orange' : 'green'}`}>
                                                        {obl.severity_if_ignored || obl.severity}
                                                    </span>
                                                )}
                                                {obl.deadline && (
                                                    <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                                        <Clock size={12} /> {obl.deadline}
                                                    </span>
                                                )}
                                                {obl.frequency && (
                                                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                                                        {obl.frequency}
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
                            {/* Action Plan from Planning Agent */}
                            {actionPlan.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                        <Zap size={16} style={{ color: 'var(--accent)' }} /> {gt('Compliance Action Plan')}
                                    </h4>
                                    {actionPlan.map((step, i) => (
                                        <div key={i} className="p-4 rounded-xl flex items-start gap-3 mb-3" style={{ background: 'var(--bg-secondary)' }}>
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
                                                style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                                                {step.step_number || i + 1}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold mb-1">{step.action || (typeof step === 'string' ? step : '')}</p>
                                                {step.why_it_matters && <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>{step.why_it_matters}</p>}
                                                <div className="flex flex-wrap gap-2">
                                                    {step.deadline && (
                                                        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                                            <Clock size={12} /> {step.deadline}
                                                        </span>
                                                    )}
                                                    {step.risk_if_ignored && (
                                                        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--red)' }}>
                                                            <AlertCircle size={12} /> {step.risk_if_ignored}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Legacy immediate/short/long term actions fallback */}
                            {actionPlan.length === 0 && compliancePlan.immediate_actions?.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                        <Zap size={16} style={{ color: 'var(--orange)' }} /> Immediate Actions
                                    </h4>
                                    {compliancePlan.immediate_actions.map((action, i) => (
                                        <div key={i} className="p-4 rounded-xl flex items-start gap-3 mb-2" style={{ background: 'var(--bg-secondary)' }}>
                                            <CheckCircle size={18} style={{ color: 'var(--orange)' }} className="flex-shrink-0 mt-0.5" />
                                            <p className="text-sm font-medium">{action.action || action}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Monitoring advice from planning */}
                            {compliancePlan.monitoring_advice && (
                                <div className="p-4 rounded-xl" style={{ background: 'var(--accent-light)', borderLeft: '3px solid var(--accent)' }}>
                                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                                        <TrendingUp size={14} /> Ongoing Monitoring
                                    </h4>
                                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{compliancePlan.monitoring_advice}</p>
                                </div>
                            )}

                            {/* Fallback if no actions */}
                            {actionPlan.length === 0 && !compliancePlan.immediate_actions?.length && (
                                <div className="text-center py-12">
                                    <p style={{ color: 'var(--text-secondary)' }}>{gt('No specific actions identified')}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
