import React from 'react';
import { Shield, AlertTriangle, FileText, CheckCircle, Info } from 'lucide-react';

const Section = ({ title, icon: Icon, children, className = "" }) => (
    <div className={`card mb-6 ${className}`}>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary-400">
            <Icon size={20} className="text-blue-400" />
            {title}
        </h2>
        {children}
    </div>
);

const Badge = ({ text, type = "default" }) => {
    const colors = {
        HIGH: "bg-red-900/30 text-red-400 border-red-800",
        MEDIUM: "bg-yellow-900/30 text-yellow-400 border-yellow-800",
        LOW: "bg-green-900/30 text-green-400 border-green-800",
        default: "bg-gray-800 text-gray-300 border-gray-700"
    };
    return (
        <span className={`px-2 py-1 rounded text-xs font-semibold border ${colors[type] || colors.default}`}>
            {text}
        </span>
    );
};

// Helper to check if content is valid (not empty/null/UNKNOWN)
const isValid = (val) => {
    if (!val) return false;
    if (Array.isArray(val) && val.length === 0) return false;
    if (typeof val === 'string') {
        const lower = val.toLowerCase().trim();
        return lower !== 'unknown' && lower !== 'n/a' && lower !== '';
    }
    return true;
};

export default function ResultsView({ data }) {
    if (!data) return null;

    const { policy_metadata, obligations, penalties, compliance_actions, risk_assessment, compliance_plan } = data;

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            {/* Header */}
            <div className="card border-l-4 border-blue-500">
                <h1 className="text-2xl font-bold text-white mb-2">{policy_metadata.policy_name}</h1>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400">
                    {isValid(policy_metadata.issuing_authority) && (
                        <div>
                            <span className="block text-gray-500">Authority</span>
                            {policy_metadata.issuing_authority}
                        </div>
                    )}
                    {isValid(policy_metadata.effective_date) && (
                        <div>
                            <span className="block text-gray-500">Date</span>
                            {policy_metadata.effective_date}
                        </div>
                    )}
                    {isValid(policy_metadata.geographical_scope) && (
                        <div>
                            <span className="block text-gray-500">Scope</span>
                            {policy_metadata.geographical_scope}
                        </div>
                    )}
                    {isValid(policy_metadata.policy_type) && (
                        <div>
                            <span className="block text-gray-500">Type</span>
                            {policy_metadata.policy_type}
                        </div>
                    )}
                </div>
            </div>

            {/* --- NEW: COMPLIANCE ACTION PLAN --- */}
            {compliance_plan && (
                <Section title="Owner's Action Plan" icon={FileText} className="border-l-4 border-emerald-500 bg-emerald-900/10">
                    <div className="flex items-center gap-4 mb-4">
                        <Badge
                            text={compliance_plan.applicability_status.replace('_', ' ')}
                            type={compliance_plan.applicability_status === 'APPLICABLE' ? 'HIGH' : 'LOW'}
                        />
                        {isValid(compliance_plan.summary_for_owner) && (
                            <span className="text-gray-300 italic">{compliance_plan.summary_for_owner}</span>
                        )}
                    </div>

                    {compliance_plan.applicability_status !== "NOT_APPLICABLE" && (
                        <div className="space-y-3 mt-4">
                            {compliance_plan.action_plan.map((step, idx) => (
                                <div key={idx} className="flex gap-4 p-4 bg-surface rounded-lg border border-gray-700">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-900/50 border border-emerald-700 text-emerald-400 flex items-center justify-center font-bold">
                                        {step.step_number}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-white text-lg">{step.action}</h3>
                                        <p className="text-gray-400 text-sm mt-1 mb-2">{step.why_it_matters}</p>
                                        <div className="flex gap-4 text-xs font-mono">
                                            {isValid(step.deadline) && <span className="text-orange-400">⏰ Due: {step.deadline}</span>}
                                            {isValid(step.risk_if_ignored) && <span className="text-red-400">⚠️ Risk: {step.risk_if_ignored}</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {isValid(compliance_plan.monitoring_advice) && (
                        <div className="mt-4 p-3 bg-blue-900/20 text-blue-300 rounded text-sm border border-blue-800/50 flex gap-2">
                            <Info size={16} className="mt-0.5" />
                            {compliance_plan.monitoring_advice}
                        </div>
                    )}
                </Section>
            )}

            {/* Risk Assessment */}
            <Section title="Risk Assessment" icon={Shield} className="border-l-4 border-purple-500">
                <div className="flex items-start gap-4">
                    <div className="flex-1">
                        <p className="text-gray-300 mb-2">{risk_assessment.reasoning}</p>
                    </div>
                    <div className="text-center min-w-[100px]">
                        <Badge text={risk_assessment.overall_risk_level} type={risk_assessment.overall_risk_level} />
                        <div className="text-xs text-gray-500 mt-1">Overall Risk</div>
                    </div>
                </div>
            </Section>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Obligations */}
                {obligations.length > 0 && (
                    <Section title="Key Obligations" icon={CheckCircle}>
                        <div className="space-y-4">
                            {obligations.map((obs, idx) => (
                                <div key={idx} className="p-3 bg-black/20 rounded border border-gray-800">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-semibold text-white">{obs.obligation}</h3>
                                        {isValid(obs.severity_if_ignored) && <Badge text={obs.severity_if_ignored} type={obs.severity_if_ignored === 'Critical' ? 'HIGH' : 'MEDIUM'} />}
                                    </div>
                                    {isValid(obs.description) && <p className="text-sm text-gray-400 mb-2">{obs.description}</p>}
                                    <div className="flex gap-4 text-xs text-gray-500">
                                        {isValid(obs.deadline) && <span>📅 Due: {obs.deadline}</span>}
                                        {isValid(obs.frequency) && <span>🔄 Freq: {obs.frequency}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Section>
                )}

                {/* Compliance Actions */}
                {compliance_actions.length > 0 && (
                    <Section title="Action Plan (Details)" icon={FileText}>
                        <div className="space-y-3">
                            {compliance_actions.map((action, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-black/20 rounded border border-gray-800">
                                    <div className="flex-1">
                                        <p className="text-gray-200">{action.action}</p>
                                        {isValid(action.estimated_effort) && <p className="text-xs text-gray-500 mt-1">Effort: {action.estimated_effort}</p>}
                                    </div>
                                    <Badge text={action.priority} type={action.priority} />
                                </div>
                            ))}
                        </div>
                    </Section>
                )}
            </div>

            {/* Penalties */}
            {penalties.length > 0 && (
                <Section title="Penalties & Violations" icon={AlertTriangle}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-black/20 text-gray-200">
                                <tr>
                                    <th className="p-3 rounded-tl">Violation</th>
                                    <th className="p-3">Penalty</th>
                                    <th className="p-3 rounded-tr">Consequences</th>
                                </tr>
                            </thead>
                            <tbody>
                                {penalties.map((p, idx) => (
                                    <tr key={idx} className="border-b border-gray-800 last:border-0">
                                        <td className="p-3 font-medium text-white">{p.violation}</td>
                                        <td className="p-3 text-red-400">{isValid(p.penalty_amount) ? p.penalty_amount : "N/A"}</td>
                                        <td className="p-3">{isValid(p.other_consequences) ? p.other_consequences : "N/A"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Section>
            )}
        </div>
    );
}
