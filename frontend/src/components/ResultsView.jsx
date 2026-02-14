import React, { useState } from 'react';
import {
    FileText, BookOpen, AlertTriangle, CheckCircle2, Clock,
    ChevronDown, ChevronUp, Scale, ClipboardList, Target,
    Gavel, Shield, Lightbulb, ArrowRight, Globe
} from 'lucide-react';

function Section({ icon: Icon, title, color, children, defaultOpen = true }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <button onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between p-4 transition-all"
                style={{ background: open ? 'var(--bg-elevated)' : 'transparent' }}>
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: `${color}15`, color }}>
                        <Icon size={14} />
                    </div>
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</span>
                </div>
                {open ? <ChevronUp size={15} style={{ color: 'var(--text-muted)' }} />
                    : <ChevronDown size={15} style={{ color: 'var(--text-muted)' }} />}
            </button>
            {open && <div className="p-4 pt-2">{children}</div>}
        </div>
    );
}

function ListItem({ icon: Icon, text, color = 'var(--text-secondary)' }) {
    return (
        <div className="flex items-start gap-2.5 py-2 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            <Icon size={13} className="mt-0.5 flex-shrink-0" style={{ color }} />
            <span>{typeof text === 'string' ? text : text.description || text.title || text.name || JSON.stringify(text)}</span>
        </div>
    );
}

function Badge({ label, variant = 'default' }) {
    const styles = {
        high: { background: 'rgba(239,68,68,0.12)', color: 'var(--red)' },
        medium: { background: 'rgba(245,158,11,0.12)', color: 'var(--orange)' },
        low: { background: 'rgba(34,197,94,0.12)', color: 'var(--green)' },
        default: { background: 'var(--bg-elevated)', color: 'var(--text-secondary)' },
    };
    const s = styles[variant] || styles.default;
    return <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={s}>{label}</span>;
}

export default function ResultsView({ data, onTranslate }) {
    const [translating, setTranslating] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    if (!data) return null;

    const meta = data.policy_metadata || {};
    const obligations = data.obligations || [];
    const penalties = data.penalties || [];
    const actions = data.compliance_actions || [];
    const riskAssess = data.risk_assessment || {};
    const plan = data.compliance_plan || {};
    const planSteps = plan.action_plan || plan.steps || [];
    const applicability = data.applicability || {};
    const schemes = data.applicable_schemes || data.matched_schemes || [];

    const tabs = [
        { id: 'overview', label: 'Overview', icon: FileText },
        { id: 'obligations', label: 'Obligations', icon: ClipboardList },
        { id: 'actions', label: 'Action Plan', icon: Target },
    ];

    const severityVariant = (s) => {
        if (!s) return 'default';
        const sl = s.toLowerCase();
        if (sl.includes('high') || sl.includes('critical') || sl.includes('severe')) return 'high';
        if (sl.includes('med') || sl.includes('moderate')) return 'medium';
        return 'low';
    };

    return (
        <div className="fade-up space-y-4">
            {/* Policy Header */}
            <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <h2 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                            {meta.policy_name || meta.title || 'Policy Analysis'}
                        </h2>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {meta.issuing_authority || meta.authority || 'Unknown Authority'}
                            {meta.effective_date && ` · Effective: ${meta.effective_date}`}
                        </p>
                    </div>
                    {onTranslate && (
                        <button onClick={() => { setTranslating(true); onTranslate().finally(() => setTranslating(false)); }}
                            disabled={translating}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
                            style={{ background: 'var(--bg-elevated)', color: 'var(--accent)', border: '1px solid var(--border)' }}>
                            <Globe size={12} />
                            {translating ? 'Translating...' : 'Translate'}
                        </button>
                    )}
                </div>

                {/* Quick Stats */}
                <div className="flex flex-wrap gap-2 mt-3">
                    {meta.sector && <Badge label={meta.sector} />}
                    {meta.policy_type && <Badge label={meta.policy_type} />}
                    {applicability.is_applicable !== undefined && (
                        <Badge label={applicability.is_applicable ? 'Applicable' : 'N/A'}
                            variant={applicability.is_applicable ? 'low' : 'default'} />
                    )}
                    {obligations.length > 0 && <Badge label={`${obligations.length} Obligations`} />}
                    {penalties.length > 0 && <Badge label={`${penalties.length} Penalties`} variant="high" />}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all"
                        style={{
                            background: activeTab === t.id ? 'var(--accent)' : 'transparent',
                            color: activeTab === t.id ? 'white' : 'var(--text-muted)',
                        }}>
                        <t.icon size={13} />
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="space-y-4 fade-up">
                    {/* Summary */}
                    {(meta.summary || data.summary || applicability.explanation) && (
                        <Section icon={BookOpen} title="Summary" color="var(--accent)">
                            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                {meta.summary || data.summary || applicability.explanation}
                            </p>
                        </Section>
                    )}

                    {/* Risk Assessment */}
                    {(riskAssess.level || riskAssess.risk_level) && (
                        <Section icon={Shield} title="Risk Assessment" color="var(--red)">
                            <div className="flex items-center gap-2 mb-3">
                                <Badge label={riskAssess.level || riskAssess.risk_level}
                                    variant={severityVariant(riskAssess.level || riskAssess.risk_level)} />
                                {riskAssess.score && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Score: {riskAssess.score}/100</span>}
                            </div>
                            {riskAssess.explanation && (
                                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{riskAssess.explanation}</p>
                            )}
                        </Section>
                    )}

                    {/* Matched Schemes */}
                    {schemes.length > 0 && (
                        <Section icon={Lightbulb} title="Matched Schemes" color="var(--green)">
                            <div className="space-y-2">
                                {schemes.map((s, i) => (
                                    <div key={i} className="p-3 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
                                        <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                                            {typeof s === 'string' ? s : s.name || s.scheme_name}
                                        </div>
                                        {s.match_reason && (
                                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.match_reason}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Section>
                    )}

                    {/* Penalties */}
                    {penalties.length > 0 && (
                        <Section icon={Gavel} title="Penalties & Consequences" color="var(--red)" defaultOpen={false}>
                            {penalties.map((p, i) => (
                                <div key={i} className="py-2 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <AlertTriangle size={12} style={{ color: 'var(--red)' }} />
                                        <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                                            {typeof p === 'string' ? p : p.penalty || p.description || p.title}
                                        </span>
                                    </div>
                                    {p.severity && <Badge label={p.severity} variant={severityVariant(p.severity)} />}
                                </div>
                            ))}
                        </Section>
                    )}
                </div>
            )}

            {activeTab === 'obligations' && (
                <div className="space-y-4 fade-up">
                    {obligations.length === 0 ? (
                        <div className="text-center py-8 text-xs" style={{ color: 'var(--text-muted)' }}>
                            No obligations identified.
                        </div>
                    ) : (
                        <Section icon={ClipboardList} title={`Obligations (${obligations.length})`} color="var(--accent)">
                            {obligations.map((o, i) => (
                                <div key={i} className="p-3 mb-2 rounded-lg last:mb-0" style={{ background: 'var(--bg-elevated)' }}>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle2 size={13} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--green)' }} />
                                        <div>
                                            <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                                                {typeof o === 'string' ? o : o.obligation || o.description || o.title}
                                            </div>
                                            {o.deadline && (
                                                <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                                                    <Clock size={10} /> {o.deadline}
                                                </div>
                                            )}
                                            {o.severity && <Badge label={o.severity} variant={severityVariant(o.severity)} />}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </Section>
                    )}
                </div>
            )}

            {activeTab === 'actions' && (
                <div className="space-y-4 fade-up">
                    {/* Compliance Actions */}
                    {actions.length > 0 && (
                        <Section icon={Target} title="Compliance Actions" color="var(--accent)">
                            {actions.map((a, i) => (
                                <ListItem key={i} icon={ArrowRight} text={a} color="var(--accent)" />
                            ))}
                        </Section>
                    )}

                    {/* Action Plan Timeline */}
                    {planSteps.length > 0 && (
                        <Section icon={Clock} title="Implementation Plan" color="var(--green)">
                            <div className="relative pl-4">
                                <div className="absolute left-1.5 top-2 bottom-2 w-px" style={{ background: 'var(--border-light)' }} />
                                {planSteps.map((step, i) => (
                                    <div key={i} className="relative mb-4 last:mb-0">
                                        <div className="absolute -left-2.5 top-1 w-3 h-3 rounded-full border-2"
                                            style={{ background: 'var(--bg-card)', borderColor: 'var(--accent)' }} />
                                        <div className="ml-3 p-3 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
                                            <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                                                {typeof step === 'string' ? step : step.action || step.step || step.title}
                                            </div>
                                            {step.timeline && (
                                                <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                                                    <Clock size={10} /> {step.timeline}
                                                </div>
                                            )}
                                            {step.priority && (
                                                <Badge label={step.priority} variant={severityVariant(step.priority)} />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    )}

                    {actions.length === 0 && planSteps.length === 0 && (
                        <div className="text-center py-8 text-xs" style={{ color: 'var(--text-muted)' }}>
                            No action items identified.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
