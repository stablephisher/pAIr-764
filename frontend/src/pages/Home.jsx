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
        <div className="max-w-5xl mx-auto relative">
            {/* Decorative orbs */}
            <div className="orb orb-accent" style={{ width: 280, height: 280, top: -60, right: -80 }} />
            <div className="orb orb-purple" style={{ width: 200, height: 200, top: 300, left: -100, animationDelay: '3s' }} />

            {/* Hero */}
            <section className="text-center py-16 md:py-20 relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8 badge-gradient">
                    <span className="w-2 h-2 rounded-full bg-white/60"></span>
                    <span>{t('AI-Powered Compliance for Startup India', lang)}</span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-[1.1] tracking-tight" style={{ color: 'var(--text)' }}>
                    {t('Compliance Made', lang)} <br />
                    <span className="text-gradient">
                        {t('Simple & Intelligent', lang)}
                    </span>
                </h1>
                <p className="text-lg mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {t('Upload your policy documents and let our AI agents analyze risks, ensure compliance, and unlock growth opportunities for your MSME.', lang)}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button onClick={() => navigate('/analysis/new')}
                        className="btn btn-primary w-full sm:w-auto flex items-center gap-2 px-8 py-3.5 text-base">
                        <Upload size={20} /> {t('Start Free Analysis', lang)}
                    </button>
                    <button onClick={() => navigate('/dashboard')}
                        className="btn btn-secondary w-full sm:w-auto flex items-center gap-2 px-8 py-3.5 text-base">
                        <BarChart3 size={20} /> {t('View Dashboard', lang)}
                    </button>
                </div>
            </section>

            {/* Features Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16 stagger-children">
                {[
                    { icon: Shield, titleKey: "Risk Detection", descKey: "Spot compliance gaps and legal risks instantly — before they become costly problems.", gradient: "from-red-500 to-orange-500" },
                    { icon: BarChart3, titleKey: "Smart Scoring", descKey: "Get clear scores on Risk, Profitability, Sustainability, and Ethics — all in one place.", gradient: "from-blue-500 to-indigo-500" },
                    { icon: Globe, titleKey: "Gov Schemes", descKey: "Automatically find government schemes, subsidies, and grants you're actually eligible for.", gradient: "from-emerald-500 to-teal-500" }
                ].map((f, i) => (
                    <div key={i} className="card card-hover p-6 hover-lift">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4 text-white shadow-md`}>
                            <f.icon size={22} />
                        </div>
                        <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>{t(f.titleKey, lang)}</h3>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{t(f.descKey, lang)}</p>
                    </div>
                ))}
            </section>

            {/* How it works */}
            <section className="mb-16">
                <h2 className="text-2xl font-bold text-center mb-10" style={{ color: 'var(--text)' }}>{t('How It Works', lang)}</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 stagger-children">
                    {[
                        { step: "1", icon: Upload, titleKey: "Upload PDF", descKey: "Drop any government policy document" },
                        { step: "2", icon: Sparkles, titleKey: "AI Analysis", descKey: "7 AI agents work together on your document" },
                        { step: "3", icon: FileCheck, titleKey: "Get Scores", descKey: "Risk, sustainability, ethics — all scored" },
                        { step: "4", icon: TrendingUp, titleKey: "Take Action", descKey: "Clear steps with deadlines you can follow" },
                    ].map((item, i) => (
                        <div key={i} className="card card-hover text-center p-5">
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
            <section className="text-center mb-16 card p-10">
                <Sparkles size={32} className="mx-auto mb-4" style={{ color: 'var(--accent)' }} />
                <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text)' }}>{t('Ready to get started?', lang)}</h2>
                <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                    {t('Upload your first policy document and see pAIr in action.', lang)}
                </p>
                <button onClick={() => navigate('/analysis/new')} className="btn btn-primary gap-2 px-8 py-3">
                    {t('Get Started', lang)} <ArrowRight size={16} />
                </button>
            </section>
        </div>
    );
}
