import React, { useState } from 'react';
import {
    FileText, BookOpen, AlertTriangle, CheckCircle2, Clock,
    ChevronDown, ChevronUp, ClipboardList, Target,
    Gavel, Shield, Lightbulb, ArrowRight, Globe
} from 'lucide-react';

function Badge({ label, variant = 'default' }) {
    const styles = {
        high: { background: 'var(--red-muted)', color: 'var(--red)' },
        medium: { background: 'var(--orange-muted)', color: 'var(--orange)' },
        low: { background: 'var(--green-muted)', color: 'var(--green)' },
        default: { background: 'var(--bg-elevated)', color: 'var(--text-secondary)' },
    };
    const s = styles[variant] || styles.default;
    return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider" style={s}>{label}</span>;
}

function Section({ icon: Icon, title, color, children, defaultOpen = true }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="card overflow-hidden">
            <button onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between p-4 transition-all"
                style={{ background: open ? 'rgba(30,41,59,0.3)' : 'transparent' }}>
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: `${color}12`, color }}>
                        <Icon size={14} />
                    </div>
                    <span className="text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>{title}</span>
                </div>
                {open ? <ChevronUp size={14} style={{ color: 'var(--text-dim)' }} />
                    : <ChevronDown size={14} style={{ color: 'var(--text-dim)' }} />}
            </button>
            {open && <div className="px-4 pb-4 pt-1">{children}</div>}
        </div>
    );
}

const severityVariant = (s) => {
    if (!s) return 'default';
    const sl = s.toLowerCase();
    if (sl.includes('high') || sl.includes('critical') || sl.includes('severe')) return 'high';
    if (sl.includes('med') || sl.includes('moderate')) return 'medium';
    return 'low';
};

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
        { id: 'obligations', label: 'Obligations', icon: ClipboardList, count: obligations.length },
        { id: 'actions', label: 'Action Plan', icon: Target },
    ];

    return (
        <div className="space-y-4 fade-in">
            {/* Policy Header Card */}
            <div className="card card-glow p-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-base font-bold mb-1.5 leading-tight" style={{ color: 'var(--text-primary)' }}>
                            {meta.policy_name || meta.title || 'Policy Analysis'}
                        </h2>
                        <p className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
                            {meta.issuing_authority || meta.authority || 'Unknown Authority'}
                            {meta.effective_date && ` · ${meta.effective_date}`}
                        </p>
                    </div>
                    {onTranslate && (
                        <button onClick={() => { setTranslating(true); onTranslate().finally(() => setTranslating(false)); }}
                            disabled={translating}
                            className="btn-ghost flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium flex-shrink-0">
                            <Globe size={12} />
                            {translating ? 'Translating...' : 'Translate'}
                        </button>
                    )}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
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

            {/* Tab Bar */}
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-card-solid)', border: '1px solid var(--border)' }}>
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-semibold transition-all"
                        style={{
                            background: activeTab === t.id ? 'linear-gradient(135deg, var(--accent), #818cf8)' : 'transparent',
                            color: activeTab === t.id ? 'white' : 'var(--text-dim)',
                        }}>
                        <t.icon size={12} />
                        {t.label}
                        {t.count > 0 && activeTab !== t.id && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full"
                                style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                                {t.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="space-y-3 stagger">
                    {(meta.summary || data.summary || applicability.explanation) && (
                        <div className="card p-5 fade-in" style={{ animationDelay: '0.05s' }}>
                            <div className="flex items-center gap-2 mb-3">
                                <BookOpen size={14} style={{ color: 'var(--accent)' }} />
                                <h4 className="text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>Summary</h4>
                            </div>
                            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                {meta.summary || data.summary || applicability.explanation}
                            </p>
                        </div>
                    )}

                    {(riskAssess.level || riskAssess.risk_level) && (
                        <Section icon={Shield} title="Risk Assessment" color="var(--red)">
                            <div className="flex items-center gap-2 mb-3">
                                <Badge label={riskAssess.level || riskAssess.risk_level}
                                    variant={severityVariant(riskAssess.level || riskAssess.risk_level)} />
                                {riskAssess.score && <span className="text-[11px]" style={{ color: 'var(--text-dim)' }}>Score: {riskAssess.score}/100</span>}
                            </div>
                            {riskAssess.explanation && (
                                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{riskAssess.explanation}</p>
                            )}
                        </Section>
                    )}

                    {schemes.length > 0 && (
                        <Section icon={Lightbulb} title={`Matched Schemes (${schemes.length})`} color="var(--green)">
                            <div className="space-y-2">
                                {schemes.map((s, i) => (
                                    <div key={i} className="p-3 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
                                        <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>
                                            {typeof s === 'string' ? s : s.name || s.scheme_name}
                                        </p>
                                        {s.match_reason && (
                                            <p className="text-[11px]" style={{ color: 'var(--text-dim)' }}>{s.match_reason}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Section>
                    )}

                    {penalties.length > 0 && (
                        <Section icon={Gavel} title={`Penalties (${penalties.length})`} color="var(--red)" defaultOpen={false}>
                            <div className="space-y-2">
                                {penalties.map((p, i) => (
                                    <div key={i} className="flex items-start gap-2 p-3 rounded-xl"
                                        style={{ background: 'var(--bg-elevated)' }}>
                                        <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--red)' }} />
                                        <div>
                                            <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                                                {typeof p === 'string' ? p : p.penalty || p.description || p.title}
                                            </p>
                                            {p.severity && <Badge label={p.severity} variant={severityVariant(p.severity)} />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    )}
                </div>
            )}

            {/* Obligations Tab */}
            {activeTab === 'obligations' && (
                <div className="fade-in">
                    {obligations.length === 0 ? (
                        <div className="text-center py-12">
                            <ClipboardList size={24} className="mx-auto mb-3" style={{ color: 'var(--text-dim)' }} />
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No obligations identified</p>
                        </div>
                    ) : (
                        <div className="space-y-2 stagger">
                            {obligations.map((o, i) => (
                                <div key={i} className="card p-4 fade-in">
                                    <div className="flex items-start gap-2.5">
                                        <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--green)' }} />
                                        <div className="flex-1">
                                            <p className="text-xs font-medium leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                                                {typeof o === 'string' ? o : o.obligation || o.description || o.title}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                {o.deadline && (
                                                    <span className="inline-flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-dim)' }}>
                                                        <Clock size={10} /> {o.deadline}
                                                    </span>
                                                )}
                                                {o.severity && <Badge label={o.severity} variant={severityVariant(o.severity)} />}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Actions Tab */}
            {activeTab === 'actions' && (
                <div className="space-y-3 fade-in">
                    {actions.length > 0 && (
                        <div className="card p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <Target size={14} style={{ color: 'var(--accent)' }} />
                                <h4 className="text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>
                                    Compliance Actions ({actions.length})
                                </h4>
                            </div>
                            <div className="space-y-2">
                                {actions.map((a, i) => (
                                    <div key={i} className="flex items-start gap-2.5 py-2">
                                        <ArrowRight size={12} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                                        <span className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                            {typeof a === 'string' ? a : a.action || a.description || a.title}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {planSteps.length > 0 && (
                        <div className="card p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <Clock size={14} style={{ color: 'var(--green)' }} />
                                <h4 className="text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>
                                    Implementation Timeline
                                </h4>
                            </div>
                            <div className="relative pl-5">
                                <div className="absolute left-[7px] top-2 bottom-2 w-px"
                                    style={{ background: 'var(--border)' }} />
                                {planSteps.map((step, i) => (
                                    <div key={i} className="relative mb-5 last:mb-0">
                                        <div className="absolute -left-[13px] top-1.5 w-3 h-3 rounded-full border-2"
                                            style={{ background: 'var(--bg-card-solid)', borderColor: 'var(--accent)' }} />
                                        <div className="p-3 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
                                            <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                                                {typeof step === 'string' ? step : step.action || step.step || step.title}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                {step.timeline && (
                                                    <span className="inline-flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-dim)' }}>
                                                        <Clock size={9} /> {step.timeline}
                                                    </span>
                                                )}
                                                {step.priority && <Badge label={step.priority} variant={severityVariant(step.priority)} />}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {actions.length === 0 && planSteps.length === 0 && (
                        <div className="text-center py-12">
                            <Target size={24} className="mx-auto mb-3" style={{ color: 'var(--text-dim)' }} />
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No action items identified</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
