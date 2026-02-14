import React from 'react';
import { Shield, Leaf, DollarSign, Scale, AlertTriangle, TrendingUp } from 'lucide-react';

function ScoreCard({ label, value, icon: Icon, color }) {
    return (
        <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${color}15`, color }}>
                    <Icon size={20} />
                </div>
                <span className="text-3xl font-bold" style={{ color }}>{value}</span>
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</p>
        </div>
    );
}

function MetricCard({ label, value, sublabel }) {
    return (
        <div className="card p-5">
            <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</p>
            <p className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{value}</p>
            {sublabel && <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{sublabel}</p>}
        </div>
    );
}

export default function Dashboard({ data }) {
    const scores = data.analysis?.scores || {};
    const summary = data.analysis?.summary || {};

    const riskScore = scores.risk_score || 0;
    const greenScore = scores.sustainability_score || 0;
    const roiScore = scores.profitability_score || 0;
    const ethicsScore = scores.ethics_score || 0;

    const riskColor = riskScore > 70 ? 'var(--red)' : riskScore > 40 ? 'var(--orange)' : 'var(--green)';

    return (
        <div className="space-y-6 fade-in">
            {/* Primary Scores */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ScoreCard label="Risk Score" value={riskScore} icon={Shield} color={riskColor} />
                <ScoreCard label="Sustainability" value={greenScore} icon={Leaf} color="var(--green)" />
                <ScoreCard label="Profitability" value={roiScore} icon={TrendingUp} color="var(--accent)" />
                <ScoreCard label="Ethics Score" value={ethicsScore} icon={Scale} color="var(--accent)" />
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard
                    label="Compliance Obligations"
                    value={data.obligations?.length || 0}
                    sublabel="Action items identified"
                />
                <MetricCard
                    label="Matched Schemes"
                    value={summary.matched_schemes?.length || 0}
                    sublabel="Government programs"
                />
                <MetricCard
                    label="Estimated Penalties"
                    value={summary.potential_penalties ? `₹${summary.potential_penalties}` : 'N/A'}
                    sublabel="For non-compliance"
                />
            </div>

            {/* Risk Factors */}
            {summary.risk_factors && summary.risk_factors.length > 0 && (
                <div className="card p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle size={20} style={{ color: 'var(--orange)' }} />
                        <h3 className="font-semibold">Risk Factors</h3>
                    </div>
                    <div className="space-y-2">
                        {summary.risk_factors.map((factor, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-lg"
                                style={{ background: 'var(--bg-hover)' }}>
                                <div className="w-2 h-2 rounded-full mt-1.5" style={{ background: 'var(--orange)' }} />
                                <p className="text-sm flex-1">{factor}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* SDG Alignment */}
            {summary.sdg_alignment && summary.sdg_alignment.length > 0 && (
                <div className="card p-6">
                    <h3 className="font-semibold mb-4">SDG Alignment</h3>
                    <div className="flex flex-wrap gap-2">
                        {summary.sdg_alignment.map(sdg => (
                            <span key={sdg} className="badge badge-green">
                                SDG {sdg}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Ethics Flags */}
            {summary.ethics_flags && summary.ethics_flags.length > 0 && (
                <div className="card p-6">
                    <h3 className="font-semibold mb-4">Ethics Considerations</h3>
                    <div className="space-y-2">
                        {summary.ethics_flags.map((flag, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-lg"
                                style={{ background: 'var(--accent-light)' }}>
                                <Scale size={16} style={{ color: 'var(--accent)' }} className="mt-0.5" />
                                <p className="text-sm flex-1">{flag}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
