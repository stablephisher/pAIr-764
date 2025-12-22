import React from 'react';
import { Shield, AlertTriangle, FileText, CheckCircle, Info, TrendingUp, Link, Upload, Globe } from 'lucide-react';

// ===== UI TRANSLATIONS =====
const TRANSLATIONS = {
    en: {
        riskLevel: "Risk Level",
        obligations: "Obligations",
        penalties: "Penalties",
        actions: "Actions",
        riskAssessment: "Risk Assessment",
        actionPriority: "Action Priority",
        whatYouNeed: "What You Need To Do",
        yourObligations: "Your Obligations",
        penaltiesWarning: "Penalties If You Don't Comply",
        documentSource: "Document Source",
        autoFetched: "Auto-Fetched",
        autoFetchedDesc: "This policy was automatically downloaded from a government portal.",
        uploadedByUser: "Uploaded by User",
        uploadedDesc: "This policy was manually uploaded for analysis.",
        high: "High",
        medium: "Medium",
        low: "Low",
        due: "Due",
        frequency: "Frequency",
        penalty: "Penalty",
        noActions: "No actions defined.",
        authority: "Authority",
        effectiveDate: "Effective Date",
        scope: "Scope",
        type: "Type"
    },
    hi: {
        riskLevel: "जोखिम स्तर",
        obligations: "दायित्व",
        penalties: "दंड",
        actions: "कार्रवाई",
        riskAssessment: "जोखिम मूल्यांकन",
        actionPriority: "कार्रवाई प्राथमिकता",
        whatYouNeed: "आपको क्या करना है",
        yourObligations: "आपके दायित्व",
        penaltiesWarning: "अनुपालन न करने पर दंड",
        documentSource: "दस्तावेज़ स्रोत",
        autoFetched: "स्वचालित रूप से प्राप्त",
        autoFetchedDesc: "यह नीति स्वचालित रूप से सरकारी पोर्टल से डाउनलोड की गई।",
        uploadedByUser: "उपयोगकर्ता द्वारा अपलोड",
        uploadedDesc: "यह नीति मैन्युअल रूप से विश्लेषण के लिए अपलोड की गई।",
        high: "उच्च",
        medium: "मध्यम",
        low: "निम्न",
        due: "देय तिथि",
        frequency: "आवृत्ति",
        penalty: "दंड",
        noActions: "कोई कार्रवाई नहीं।",
        authority: "प्राधिकरण",
        effectiveDate: "प्रभावी तिथि",
        scope: "दायरा",
        type: "प्रकार"
    },
    ta: {
        riskLevel: "ஆபத்து நிலை",
        obligations: "கடமைகள்",
        penalties: "அபராதங்கள்",
        actions: "நடவடிக்கைகள்",
        riskAssessment: "ஆபத்து மதிப்பீடு",
        actionPriority: "நடவடிக்கை முன்னுரிமை",
        whatYouNeed: "நீங்கள் செய்ய வேண்டியது",
        yourObligations: "உங்கள் கடமைகள்",
        penaltiesWarning: "இணங்காவிட்டால் அபராதங்கள்",
        documentSource: "ஆவண மூலம்",
        autoFetched: "தானாக பெறப்பட்டது",
        autoFetchedDesc: "இந்த கொள்கை அரசு போர்டலில் இருந்து தானாக பதிவிறக்கப்பட்டது.",
        uploadedByUser: "பயனர் பதிவேற்றியது",
        uploadedDesc: "இந்த கொள்கை பகுப்பாய்வுக்காக கைமுறையாக பதிவேற்றப்பட்டது.",
        high: "உயர்",
        medium: "நடுத்தர",
        low: "குறை",
        due: "நிலுவை",
        frequency: "அதிர்வெண்",
        penalty: "அபராதம்",
        noActions: "நடவடிக்கைகள் இல்லை.",
        authority: "அதிகாரம்",
        effectiveDate: "நடைமுறை தேதி",
        scope: "எல்லை",
        type: "வகை"
    },
    te: {
        riskLevel: "ప్రమాద స్థాయి",
        obligations: "బాధ్యతలు",
        penalties: "జరిమానాలు",
        actions: "చర్యలు",
        riskAssessment: "ప్రమాద అంచనా",
        actionPriority: "చర్య ప్రాధాన్యత",
        whatYouNeed: "మీరు చేయవలసింది",
        yourObligations: "మీ బాధ్యతలు",
        penaltiesWarning: "అనుసరించకపోతే జరిమానాలు",
        documentSource: "పత్రం మూలం",
        autoFetched: "స్వయంచాలకంగా పొందబడింది",
        autoFetchedDesc: "ఈ విధానం ప్రభుత్వ పోర్టల్ నుండి స్వయంచాలకంగా డౌన్‌లోడ్ చేయబడింది.",
        uploadedByUser: "వినియోగదారు అప్‌లోడ్ చేసారు",
        uploadedDesc: "ఈ విధానం విశ్లేషణ కోసం మాన్యువల్‌గా అప్‌లోడ్ చేయబడింది.",
        high: "అధిక",
        medium: "మధ్యస్థ",
        low: "తక్కువ",
        due: "గడువు",
        frequency: "ఫ్రీక్వెన్సీ",
        penalty: "జరిమానా",
        noActions: "చర్యలు నిర్వచించబడలేదు.",
        authority: "అధికారం",
        effectiveDate: "అమలు తేదీ",
        scope: "పరిధి",
        type: "రకం"
    }
};

// Get translation helper
const getT = (lang) => (key) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key;

// ===== VISUAL COMPONENTS =====

// Risk Level Gauge (Visual Circle)
const RiskGauge = ({ level, t }) => {
    const colors = {
        HIGH: { bg: '#fef2f2', stroke: '#ef4444', text: '#dc2626' },
        MEDIUM: { bg: '#fefce8', stroke: '#eab308', text: '#ca8a04' },
        LOW: { bg: '#f0fdf4', stroke: '#22c55e', text: '#16a34a' }
    };
    const config = colors[level] || colors.MEDIUM;

    return (
        <div className="text-center p-6">
            <div
                className="w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg"
                style={{
                    backgroundColor: config.bg,
                    border: `5px solid ${config.stroke}`,
                    boxShadow: `0 0 20px ${config.stroke}40`
                }}
            >
                <span className="text-xl font-bold" style={{ color: config.text }}>{level}</span>
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{t('riskLevel')}</p>
        </div>
    );
};

// Priority Bar Chart
const PriorityChart = ({ actions, t }) => {
    const high = actions.filter(a => a.priority === 'HIGH').length;
    const medium = actions.filter(a => a.priority === 'MEDIUM').length;
    const low = actions.filter(a => a.priority === 'LOW').length;
    const total = Math.max(actions.length, 1);

    const bars = [
        { label: t('high'), count: high, color: '#ef4444', bg: '#fef2f2' },
        { label: t('medium'), count: medium, color: '#eab308', bg: '#fefce8' },
        { label: t('low'), count: low, color: '#22c55e', bg: '#f0fdf4' }
    ];

    return (
        <div className="space-y-3 p-4">
            {bars.map((bar, idx) => (
                <div key={idx} className="flex items-center gap-3">
                    <span className="text-sm w-20 font-medium" style={{ color: 'var(--text-secondary)' }}>{bar.label}</span>
                    <div
                        className="flex-1 h-8 rounded-lg overflow-hidden relative"
                        style={{ backgroundColor: bar.bg }}
                    >
                        <div
                            className="h-full rounded-lg transition-all duration-500"
                            style={{
                                width: `${Math.max((bar.count / total) * 100, bar.count > 0 ? 15 : 0)}%`,
                                backgroundColor: bar.color
                            }}
                        />
                    </div>
                    <span
                        className="text-lg font-bold w-8 text-center"
                        style={{ color: bar.color }}
                    >
                        {bar.count}
                    </span>
                </div>
            ))}
        </div>
    );
};

// Quick Stats Cards
const StatCard = ({ icon: Icon, label, value, colorClass, bgColor }) => (
    <div
        className="p-5 rounded-2xl text-center shadow-sm transition-all hover:scale-105"
        style={{ backgroundColor: bgColor || 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
    >
        <Icon size={28} className={`mx-auto mb-3 ${colorClass}`} />
        <p className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{value}</p>
        <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</p>
    </div>
);

// Section Wrapper
const Section = ({ title, icon: Icon, children, accentColor = '#3b82f6' }) => (
    <div
        className="card mb-6 overflow-hidden"
        style={{ borderLeft: `4px solid ${accentColor}` }}
    >
        <h2 className="text-lg font-bold mb-4 flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
            <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${accentColor}20` }}
            >
                <Icon size={20} style={{ color: accentColor }} />
            </div>
            {title}
        </h2>
        {children}
    </div>
);

// Badge
const Badge = ({ text, type = "default" }) => {
    const styles = {
        HIGH: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
        MEDIUM: { bg: '#fefce8', color: '#ca8a04', border: '#fde047' },
        LOW: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
        default: { bg: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: 'var(--border-color)' }
    };
    const s = styles[type] || styles.default;
    return (
        <span
            className="px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}
        >
            {text}
        </span>
    );
};

// Helper
const isValid = (val) => {
    if (!val) return false;
    if (Array.isArray(val) && val.length === 0) return false;
    if (typeof val === 'string') {
        const lower = val.toLowerCase().trim();
        return lower !== 'unknown' && lower !== 'n/a' && lower !== '';
    }
    return true;
};

// ===== MAIN COMPONENT =====
export default function ResultsView({ data, language = 'en' }) {
    if (!data) return null;

    const t = getT(language);
    const { policy_metadata, obligations, penalties, compliance_actions, risk_assessment, compliance_plan, source } = data;

    return (
        <div className="space-y-6 pb-20">
            {/* Quick Stats Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard
                    icon={Shield}
                    label={t('riskLevel')}
                    value={risk_assessment?.overall_risk_level || "—"}
                    colorClass={risk_assessment?.overall_risk_level === 'HIGH' ? 'text-red-500' : risk_assessment?.overall_risk_level === 'MEDIUM' ? 'text-yellow-500' : 'text-green-500'}
                />
                <StatCard
                    icon={CheckCircle}
                    label={t('obligations')}
                    value={obligations?.length || 0}
                    colorClass="text-blue-500"
                />
                <StatCard
                    icon={AlertTriangle}
                    label={t('penalties')}
                    value={penalties?.length || 0}
                    colorClass="text-orange-500"
                />
                <StatCard
                    icon={TrendingUp}
                    label={t('actions')}
                    value={compliance_actions?.length || 0}
                    colorClass="text-purple-500"
                />
            </div>

            {/* Policy Header */}
            <div className="card" style={{ borderLeft: '4px solid #3b82f6' }}>
                <h1 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                    📋 {policy_metadata?.policy_name || "Policy Analysis"}
                </h1>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {isValid(policy_metadata?.issuing_authority) && (
                        <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                            <span className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{t('authority')}</span>
                            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{policy_metadata.issuing_authority}</span>
                        </div>
                    )}
                    {isValid(policy_metadata?.effective_date) && (
                        <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                            <span className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{t('effectiveDate')}</span>
                            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{policy_metadata.effective_date}</span>
                        </div>
                    )}
                    {isValid(policy_metadata?.geographical_scope) && (
                        <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                            <span className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{t('scope')}</span>
                            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{policy_metadata.geographical_scope}</span>
                        </div>
                    )}
                    {isValid(policy_metadata?.policy_type) && (
                        <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                            <span className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{t('type')}</span>
                            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{policy_metadata.policy_type}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Risk & Priority Dashboard */}
            <div className="grid md:grid-cols-2 gap-6">
                <Section title={t('riskAssessment')} icon={Shield} accentColor="#8b5cf6">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <RiskGauge level={risk_assessment?.overall_risk_level || 'LOW'} t={t} />
                        <div className="flex-1 p-4">
                            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                {risk_assessment?.reasoning || "No risk assessment available."}
                            </p>
                        </div>
                    </div>
                </Section>

                <Section title={t('actionPriority')} icon={TrendingUp} accentColor="#f59e0b">
                    {compliance_actions?.length > 0 ? (
                        <PriorityChart actions={compliance_actions} t={t} />
                    ) : (
                        <p className="text-sm p-4" style={{ color: 'var(--text-muted)' }}>{t('noActions')}</p>
                    )}
                </Section>
            </div>

            {/* Owner's Action Plan */}
            {compliance_plan && (
                <Section title={`📝 ${t('whatYouNeed')}`} icon={FileText} accentColor="#22c55e">
                    <div className="flex items-center gap-3 mb-4 p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                        <Badge
                            text={compliance_plan.applicability_status?.replace('_', ' ')}
                            type={compliance_plan.applicability_status === 'APPLICABLE' ? 'HIGH' : 'LOW'}
                        />
                        {isValid(compliance_plan.summary_for_owner) && (
                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                {compliance_plan.summary_for_owner}
                            </span>
                        )}
                    </div>

                    {compliance_plan.action_plan?.map((step, idx) => (
                        <div
                            key={idx}
                            className="flex gap-4 p-4 rounded-xl mb-3 transition-all hover:shadow-md"
                            style={{ backgroundColor: 'var(--bg-tertiary)' }}
                        >
                            <div
                                className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 shadow-lg"
                                style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
                            >
                                {step.step_number}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--text-primary)' }}>
                                    {step.action}
                                </h3>
                                <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                                    💡 {step.why_it_matters}
                                </p>
                                <div className="flex flex-wrap gap-3 text-xs">
                                    {isValid(step.deadline) && (
                                        <span className="px-2 py-1 rounded-lg bg-orange-500/10 text-orange-600">
                                            ⏰ {t('due')}: {step.deadline}
                                        </span>
                                    )}
                                    {isValid(step.risk_if_ignored) && (
                                        <span className="px-2 py-1 rounded-lg bg-red-500/10 text-red-600">
                                            ⚠️ {step.risk_if_ignored}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {isValid(compliance_plan.monitoring_advice) && (
                        <div className="mt-4 p-4 rounded-xl flex gap-3" style={{
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            border: '1px solid rgba(59, 130, 246, 0.2)'
                        }}>
                            <Info size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{compliance_plan.monitoring_advice}</span>
                        </div>
                    )}
                </Section>
            )}

            {/* Obligations */}
            {obligations?.length > 0 && (
                <Section title={`📋 ${t('yourObligations')}`} icon={CheckCircle} accentColor="#3b82f6">
                    <div className="space-y-3">
                        {obligations.map((obs, idx) => (
                            <div
                                key={idx}
                                className="p-4 rounded-xl transition-all hover:shadow-md"
                                style={{ backgroundColor: 'var(--bg-tertiary)' }}
                            >
                                <div className="flex justify-between items-start mb-2 gap-3">
                                    <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{obs.obligation}</h3>
                                    {isValid(obs.severity_if_ignored) && (
                                        <Badge text={obs.severity_if_ignored} type="MEDIUM" />
                                    )}
                                </div>
                                {isValid(obs.description) && (
                                    <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{obs.description}</p>
                                )}
                                <div className="flex flex-wrap gap-2 text-xs">
                                    {isValid(obs.deadline) && (
                                        <span className="px-2 py-1 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-muted)' }}>
                                            📅 {t('due')}: {obs.deadline}
                                        </span>
                                    )}
                                    {isValid(obs.frequency) && (
                                        <span className="px-2 py-1 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-muted)' }}>
                                            🔄 {obs.frequency}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {/* Penalties */}
            {penalties?.length > 0 && (
                <Section title={`⚠️ ${t('penaltiesWarning')}`} icon={AlertTriangle} accentColor="#ef4444">
                    <div className="space-y-3">
                        {penalties.map((p, idx) => (
                            <div
                                key={idx}
                                className="p-4 rounded-xl"
                                style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)' }}
                            >
                                <h3 className="font-semibold text-red-600 mb-2">{p.violation}</h3>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    💰 {t('penalty')}: <span className="text-red-600 font-bold">{isValid(p.penalty_amount) ? p.penalty_amount : "Varies"}</span>
                                </p>
                                {isValid(p.other_consequences) && (
                                    <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                                        {p.other_consequences}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {/* Source Information */}
            <Section title={t('documentSource')} icon={Link} accentColor="#64748b">
                <div
                    className="flex items-center gap-4 p-4 rounded-xl"
                    style={{ backgroundColor: 'var(--bg-tertiary)' }}
                >
                    {source === 'auto-fetched' ? (
                        <>
                            <div className="p-3 rounded-full bg-green-500/10">
                                <Globe className="text-green-500" size={24} />
                            </div>
                            <div>
                                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{t('autoFetched')}</p>
                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('autoFetchedDesc')}</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="p-3 rounded-full bg-blue-500/10">
                                <Upload className="text-blue-500" size={24} />
                            </div>
                            <div>
                                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{t('uploadedByUser')}</p>
                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('uploadedDesc')}</p>
                            </div>
                        </>
                    )}
                </div>
            </Section>
        </div>
    );
}
