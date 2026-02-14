import React from 'react';
import {
    ShieldCheck, Leaf, TrendingUp, Scale, AlertTriangle,
    XCircle, Info, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

function ScoreGauge({ value, label, color, icon: Icon, size = 96 }) {
    const clamp = Math.max(0, Math.min(100, value || 0));
    const r = 38;
    const circumference = 2 * Math.PI * r;
    const offset = circumference - (clamp / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="relative" style={{ width: size, height: size }}>
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r={r} fill="none"
                        stroke="var(--bg-elevated)" strokeWidth="7" />
                    <circle cx="50" cy="50" r={r} fill="none"
                        stroke={color} strokeWidth="7" strokeLinecap="round"
                        strokeDasharray={circumference} strokeDashoffset={offset}
                        className="transition-all duration-1000 ease-out" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                        {clamp}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-1.5">
                <Icon size={12} style={{ color }} />
                <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>{label}</span>
            </div>
        </div>
    );
}

function MetricCard({ icon: Icon, title, value, subtitle, color }) {
    return (
        <div className="card p-4">
            <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${color}12`, color }}>
                    <Icon size={15} />
                </div>
                <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>{title}</span>
            </div>
            <div className="text-lg font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>{value}</div>
            {subtitle && (
                <p className="text-[11px] line-clamp-2" style={{ color: 'var(--text-dim)' }}>{subtitle}</p>
            )}
        </div>
    );
}

export default function Dashboard({ data }) {
    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <Info size={24} className="mb-3" style={{ color: 'var(--text-dim)' }} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No scoring data available</p>
            </div>
        );
    }

    const risk = data.risk_score || {};
    const sustainability = data.sustainability || {};
    const profitability = data.profitability || {};
    const ethics = data.ethics || {};

    const riskValue = typeof risk === 'number' ? risk : (risk.overall_score || risk.score || 0);
    const greenScore = sustainability.green_score || sustainability.score || 0;
    const roi = profitability.roi_percentage || profitability.roi || 0;
    const ethicsScore = ethics.transparency_score || ethics.score || 0;

    const riskColor = riskValue > 70 ? 'var(--red)' : riskValue > 40 ? 'var(--orange)' : 'var(--green)';
    const riskLabel = riskValue > 70 ? 'High Risk' : riskValue > 40 ? 'Moderate' : 'Low Risk';

    return (
        <div className="space-y-5 fade-in">
            {/* Score Gauges */}
            <div className="card card-glow p-6">
                <div className="flex items-center gap-2 mb-6">
                    <ShieldCheck size={16} style={{ color: 'var(--accent)' }} />
                    <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Compliance Scores</h3>
                </div>
                <div className="grid grid-cols-4 gap-4">
                    <ScoreGauge value={riskValue} label="Risk" color={riskColor} icon={AlertTriangle} />
                    <ScoreGauge value={greenScore} label="Green" color="var(--green)" icon={Leaf} />
                    <ScoreGauge value={Math.min(100, roi)} label="ROI" color="var(--accent)" icon={TrendingUp} />
                    <ScoreGauge value={ethicsScore} label="Ethics" color="var(--orange)" icon={Scale} />
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 gap-3">
                <MetricCard icon={AlertTriangle} title="Risk Level" value={riskLabel} color={riskColor}
                    subtitle={risk.risk_category || risk.category || ''} />
                <MetricCard icon={Leaf} title="Sustainability"
                    value={sustainability.grade || sustainability.rating || 'N/A'}
                    color="var(--green)" subtitle={sustainability.recommendation || ''} />
                <MetricCard icon={TrendingUp} title="Estimated ROI"
                    value={`${roi}%`} color="var(--accent)"
                    subtitle={profitability.recommendation || profitability.summary || ''} />
                <MetricCard icon={Scale} title="Ethics Status"
                    value={ethics.status || (ethicsScore > 60 ? 'Compliant' : 'Review')}
                    color="var(--orange)" subtitle={ethics.recommendation || ''} />
            </div>

            {/* Risk Factors */}
            {risk.factors && risk.factors.length > 0 && (
                <div className="card p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle size={14} style={{ color: 'var(--red)' }} />
                        <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Risk Factors</h3>
                    </div>
                    <div className="space-y-2">
                        {risk.factors.map((f, i) => (
                            <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg"
                                style={{ background: 'var(--bg-elevated)' }}>
                                <XCircle size={13} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--red)' }} />
                                <span className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                    {typeof f === 'string' ? f : f.description || f.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* SDG */}
            {sustainability.sdg_alignment && sustainability.sdg_alignment.length > 0 && (
                <div className="card p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Leaf size={14} style={{ color: 'var(--green)' }} />
                        <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>SDG Alignment</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {sustainability.sdg_alignment.map((sdg, i) => (
                            <span key={i} className="px-3 py-1 rounded-full text-xs font-medium"
                                style={{ background: 'var(--green-muted)', color: 'var(--green)' }}>
                                {typeof sdg === 'string' ? sdg : sdg.goal || sdg.name}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Ethics Flags */}
            {ethics.escalation_flags && ethics.escalation_flags.length > 0 && (
                <div className="card p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Scale size={14} style={{ color: 'var(--orange)' }} />
                        <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Ethical Flags</h3>
                    </div>
                    <div className="space-y-2">
                        {ethics.escalation_flags.map((flag, i) => (
                            <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg"
                                style={{ background: 'var(--bg-elevated)' }}>
                                <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--orange)' }} />
                                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                    {typeof flag === 'string' ? flag : flag.description || flag.reason}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
