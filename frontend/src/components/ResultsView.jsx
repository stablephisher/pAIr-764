import React, { useState } from 'react';
import { FileText, AlertCircle, CheckCircle2, Clock, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

function Section({ title, children, defaultOpen = true }) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="card mb-4">
            <button onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between p-5 text-left">
                <h3 className="font-semibold">{title}</h3>
                {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {open && <div className="px-5 pb-5">{children}</div>}
        </div>
    );
}

function Badge({ children, variant = 'gray' }) {
    const classNames = {
        gray: 'badge-gray',
        red: 'badge-red',
        orange: 'badge-orange',
        green: 'badge-green',
        accent: 'badge-accent',
    };

    return <span className={`badge ${classNames[variant]}`}>{children}</span>;
}

export default function ResultsView({ data }) {
    const [activeTab, setActiveTab] = useState('overview');
    const analysis = data.analysis || {};
    const summary = analysis.summary || {};
    const obligations = data.obligations || [];

    const getSeverityVariant = (severity) => {
        if (severity === 'high' || severity === 'critical') return 'red';
        if (severity === 'medium' || severity === 'moderate') return 'orange';
        return 'green';
    };

    return (
        <div className="space-y-6 fade-in">
            {/* Policy Header */}
            <div className="card p-6">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                        <FileText size={24} />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-2">{data.policy_name || 'Policy Analysis'}</h2>
                        <div className="flex flex-wrap gap-2">
                            {summary.sector && <Badge>{summary.sector}</Badge>}
                            {summary.policy_type && <Badge variant="accent">{summary.policy_type}</Badge>}
                            {summary.applicable && <Badge variant="green">APPLICABLE</Badge>}
                            {obligations.length > 0 && <Badge variant="orange">{obligations.length} obligations</Badge>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="card">
                <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
                    <button onClick={() => setActiveTab('overview')}
                        className={`px-6 py-4 font-medium text-sm transition-all ${activeTab === 'overview'
                            ? 'border-b-2 text-blue-600'
                            : 'text-gray-500 hover:text-gray-700'}`}
                        style={{ borderColor: activeTab === 'overview' ? 'var(--accent)' : 'transparent' }}>
                        Overview
                    </button>
                    <button onClick={() => setActiveTab('obligations')}
                        className={`px-6 py-4 font-medium text-sm transition-all ${activeTab === 'obligations'
                            ? 'border-b-2 text-blue-600'
                            : 'text-gray-500 hover:text-gray-700'}`}
                        style={{ borderColor: activeTab === 'obligations' ? 'var(--accent)' : 'transparent' }}>
                        Obligations {obligations.length > 0 && `(${obligations.length})`}
                    </button>
                    <button onClick={() => setActiveTab('actions')}
                        className={`px-6 py-4 font-medium text-sm transition-all ${activeTab === 'actions'
                            ? 'border-b-2 text-blue-600'
                            : 'text-gray-500 hover:text-gray-700'}`}
                        style={{ borderColor: activeTab === 'actions' ? 'var(--accent)' : 'transparent' }}>
                        Action Plan
                    </button>
                </div>

                <div className="p-6">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {summary.summary && (
                                <Section title="Summary">
                                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                        {summary.summary}
                                    </p>
                                </Section>
                            )}

                            {summary.risk_assessment && (
                                <Section title="Risk Assessment">
                                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                        {summary.risk_assessment}
                                    </p>
                                </Section>
                            )}

                            {summary.matched_schemes && summary.matched_schemes.length > 0 && (
                                <Section title="Matched Government Schemes">
                                    <div className="space-y-3">
                                        {summary.matched_schemes.map((scheme, i) => (
                                            <div key={i} className="p-4 rounded-lg" style={{ background: 'var(--bg-hover)' }}>
                                                <p className="font-medium mb-1">{scheme.name || scheme}</p>
                                                {scheme.description && (
                                                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                                        {scheme.description}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </Section>
                            )}

                            {summary.penalties && (
                                <Section title="Penalties for Non-Compliance">
                                    <div className="p-4 rounded-lg" style={{ background: 'var(--red-light)' }}>
                                        <p className="text-sm" style={{ color: 'var(--red)' }}>{summary.penalties}</p>
                                    </div>
                                </Section>
                            )}
                        </div>
                    )}

                    {/* Obligations Tab */}
                    {activeTab === 'obligations' && (
                        <div className="space-y-3">
                            {obligations.length === 0 ? (
                                <div className="text-center py-12">
                                    <CheckCircle2 size={48} className="mx-auto mb-3" style={{ color: 'var(--text-tertiary)' }} />
                                    <p style={{ color: 'var(--text-secondary)' }}>No compliance obligations found</p>
                                </div>
                            ) : (
                                obligations.map((obl, i) => (
                                    <div key={i} className="card p-5">
                                        <div className="flex items-start gap-4">
                                            <CheckCircle2 size={20} style={{ color: 'var(--accent)', flexShrink: 0 }} className="mt-0.5" />
                                            <div className="flex-1">
                                                <p className="font-medium mb-2">{obl.description || obl.text}</p>
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {obl.severity && (
                                                        <Badge variant={getSeverityVariant(obl.severity)}>
                                                            {obl.severity}
                                                        </Badge>
                                                    )}
                                                    {obl.deadline && (
                                                        <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                                                            <Clock size={12} />
                                                            {obl.deadline}
                                                        </div>
                                                    )}
                                                </div>
                                                {obl.details && (
                                                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                                        {obl.details}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Actions Tab */}
                    {activeTab === 'actions' && (
                        <div className="space-y-6">
                            {summary.compliance_actions && summary.compliance_actions.length > 0 && (
                                <Section title="Recommended Actions">
                                    <div className="space-y-2">
                                        {summary.compliance_actions.map((action, i) => (
                                            <div key={i} className="flex items-start gap-3 p-3 rounded-lg"
                                                style={{ background: 'var(--bg-hover)' }}>
                                                <ArrowRight size={16} style={{ color: 'var(--accent)' }} className="mt-0.5" />
                                                <p className="text-sm flex-1">{action}</p>
                                            </div>
                                        ))}
                                    </div>
                                </Section>
                            )}

                            {summary.implementation_timeline && summary.implementation_timeline.length > 0 && (
                                <Section title="Implementation Timeline">
                                    <div className="space-y-4 relative pl-6">
                                        <div className="absolute left-2 top-3 bottom-3 w-0.5" style={{ background: 'var(--border)' }} />
                                        {summary.implementation_timeline.map((item, i) => (
                                            <div key={i} className="relative">
                                                <div className="w-3 h-3 rounded-full absolute -left-6 top-1.5"
                                                    style={{ background: 'var(--accent)', border: '2px solid var(--bg-surface)' }} />
                                                <div className="p-4 rounded-lg" style={{ background: 'var(--bg-hover)' }}>
                                                    <p className="font-medium mb-1">{item.phase || item.title}</p>
                                                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                                        {item.description || item.details}
                                                    </p>
                                                    {item.duration && (
                                                        <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
                                                            {item.duration}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Section>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
