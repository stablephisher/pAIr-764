import React from 'react';
import {
    ShieldCheck, Leaf, TrendingUp, Scale, AlertTriangle,
    CheckCircle2, XCircle, Info, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

function ScoreGauge({ value, label, color, icon: Icon }) {
    const clamp = Math.max(0, Math.min(100, value || 0));
    const circumference = 2 * Math.PI * 40;
    const offset = circumference - (clamp / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative w-24 h-24">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="var(--bg-elevated)" strokeWidth="6" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="6"
                        strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
                        transform="rotate(-90 50 50)" className="transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{clamp}</span>
                </div>
            </div>
            <div className="flex items-center gap-1.5">
                <Icon size={13} style={{ color }} />
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
            </div>
        </div>
    );
}

function MetricCard({ icon: Icon, title, value, subtitle, color, trend }) {
    return (
        <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="flex items-start justify-between mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${color}15`, color }}>
                    <Icon size={16} />
                </div>
                {trend !== undefined && (
                    <div className="flex items-center gap-0.5 text-xs"
                        style={{ color: trend >= 0 ? 'var(--green)' : 'var(--red)' }}>
                        {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <div className="text-lg font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>{value}</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{title}</div>
            {subtitle && <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{subtitle}</div>}
        </div>
    );
}

export default function Dashboard({ data }) {
    if (!data) {
        return (
            <div className="flex items-center justify-center p-12" style={{ color: 'var(--text-muted)' }}>
                <Info size={18} className="mr-2" /> No scoring data available.
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
        <div className="fade-up space-y-5">
            {/* Scores Overview */}
            <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <h3 className="text-sm font-semibold mb-5 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <ShieldCheck size={16} style={{ color: 'var(--accent)' }} />
                    Compliance Scores
                </h3>
                <div className="flex justify-around flex-wrap gap-6">
                    <ScoreGauge value={riskValue} label="Risk Score" color={riskColor} icon={AlertTriangle} />
                    <ScoreGauge value={greenScore} label="Green Score" color="var(--green)" icon={Leaf} />
                    <ScoreGauge value={Math.min(100, roi)} label="ROI %" color="var(--accent)" icon={TrendingUp} />
                    <ScoreGauge value={ethicsScore} label="Ethics" color="var(--orange)" icon={Scale} />
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 gap-3">
                <MetricCard icon={AlertTriangle} title="Risk Level" value={riskLabel} color={riskColor}
                    subtitle={risk.risk_category || risk.category || ''} />
                <MetricCard icon={Leaf} title="Sustainability Grade"
                    value={sustainability.grade || sustainability.rating || 'N/A'}
                    color="var(--green)" subtitle={sustainability.recommendation || ''} />
                <MetricCard icon={TrendingUp} title="Est. ROI"
                    value={`${roi}%`} color="var(--accent)"
                    subtitle={profitability.recommendation || profitability.summary || ''} />
                <MetricCard icon={Scale} title="Ethics Status"
                    value={ethics.status || (ethicsScore > 60 ? 'Compliant' : 'Needs Review')}
                    color="var(--orange)" subtitle={ethics.recommendation || ''} />
            </div>

            {/* Risk Factors */}
            {risk.factors && risk.factors.length > 0 && (
                <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <AlertTriangle size={15} style={{ color: 'var(--red)' }} />
                        Risk Factors
                    </h3>
                    <div className="space-y-2">
                        {risk.factors.map((f, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs p-2.5 rounded-lg"
                                style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                                <XCircle size={13} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--red)' }} />
                                {typeof f === 'string' ? f : f.description || f.name}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* SDG Alignment */}
            {sustainability.sdg_alignment && sustainability.sdg_alignment.length > 0 && (
                <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <Leaf size={15} style={{ color: 'var(--green)' }} />
                        SDG Alignment
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {sustainability.sdg_alignment.map((sdg, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-full text-xs font-medium"
                                style={{ background: 'rgba(34,197,94,0.12)', color: 'var(--green)' }}>
                                {typeof sdg === 'string' ? sdg : sdg.goal || sdg.name}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Ethics Details */}
            {ethics.escalation_flags && ethics.escalation_flags.length > 0 && (
                <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <Scale size={15} style={{ color: 'var(--orange)' }} />
                        Ethical Escalation Flags
                    </h3>
                    <div className="space-y-2">
                        {ethics.escalation_flags.map((flag, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs p-2.5 rounded-lg"
                                style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                                <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--orange)' }} />
                                {typeof flag === 'string' ? flag : flag.description || flag.reason}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
