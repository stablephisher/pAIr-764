import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Shield, Zap, BarChart3, Globe, ArrowRight, Sparkles, FileCheck, TrendingUp } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { t } from '../i18n/translations';

export default function Home() {
    const navigate = useNavigate();
    const { user, language } = useAppContext();
    const lang = language?.code || 'en';

    return (
        <div className="max-w-5xl mx-auto">
            {/* Hero */}
            <section className="text-center py-16 md:py-20">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8"
                    style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                    <span className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }}></span>
                    <span>{t('AI-Powered Compliance for Startup India', lang)}</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight" style={{ color: 'var(--text)' }}>
                    {t('Compliance Made', lang)} <br />
                    <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, var(--accent), var(--purple))' }}>
                        {t('Simple & Intelligent', lang)}
                    </span>
                </h1>
                <p className="text-lg mb-10 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                    {t('Upload your policy documents and let our AI agents analyze risks, ensure compliance, and unlock growth opportunities for your MSME.', lang)}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button onClick={() => navigate('/analysis/new')}
                        className="btn btn-primary btn-lg shadow-xl w-full sm:w-auto flex items-center gap-2">
                        <Upload size={20} /> {t('Start Free Analysis', lang)}
                    </button>
                    <button onClick={() => navigate('/dashboard')}
                        className="btn btn-secondary btn-lg w-full sm:w-auto flex items-center gap-2">
                        <BarChart3 size={20} /> {t('View Dashboard', lang)}
                    </button>
                </div>
            </section>

            {/* Features Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                {[
                    { icon: Shield, titleKey: "Risk Detection", descKey: "Identify compliance gaps and legal risks instantly with AI-powered analysis.", gradient: "from-red-500 to-orange-500" },
                    { icon: BarChart3, titleKey: "Smart Scoring", descKey: "Get comprehensive scores on Risk, Profitability, Sustainability, and Ethics.", gradient: "from-blue-500 to-indigo-500" },
                    { icon: Globe, titleKey: "Gov Schemes", descKey: "Discover eligible government schemes, subsidies, and grants for your MSME.", gradient: "from-emerald-500 to-teal-500" }
                ].map((f, i) => (
                    <div key={i} className="card p-6 transition-all hover:shadow-lg"
                        style={{ border: '1px solid var(--border)' }}>
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4 text-white`}>
                            <f.icon size={24} />
                        </div>
                        <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>{t(f.titleKey, lang)}</h3>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t(f.descKey, lang)}</p>
                    </div>
                ))}
            </section>

            {/* How it works */}
            <section className="mb-16">
                <h2 className="text-2xl font-bold text-center mb-10" style={{ color: 'var(--text)' }}>{t('How It Works', lang)}</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                        { step: "1", icon: Upload, titleKey: "Upload PDF", descKey: "Upload any government policy document" },
                        { step: "2", icon: Sparkles, titleKey: "AI Analysis", descKey: "Our multi-agent AI processes your document" },
                        { step: "3", icon: FileCheck, titleKey: "Get Scores", descKey: "Receive risk, sustainability, and ethics scores" },
                        { step: "4", icon: TrendingUp, titleKey: "Take Action", descKey: "Follow recommended compliance actions" },
                    ].map((item, i) => (
                        <div key={i} className="text-center p-5 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3"
                                style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                                <item.icon size={18} />
                            </div>
                            <h4 className="font-semibold text-sm mb-1" style={{ color: 'var(--text)' }}>{t(item.titleKey, lang)}</h4>
                            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{t(item.descKey, lang)}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="text-center mb-16 p-8 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text)' }}>{t('Ready to get started?', lang)}</h2>
                <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                    {t('Upload your first policy document and see pAIr in action.', lang)}
                </p>
                <button onClick={() => navigate('/analysis/new')} className="btn btn-primary gap-2">
                    {t('Get Started', lang)} <ArrowRight size={16} />
                </button>
            </section>
        </div>
    );
}
