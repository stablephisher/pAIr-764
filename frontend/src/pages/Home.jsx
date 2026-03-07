import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Zap, Shield, Search, FileCheck, BarChart3, Brain,
    ArrowRight, Sparkles, Bot, Globe, Mic, ChevronRight,
    CheckCircle, Clock, TrendingUp, Users, Rocket, Star
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { t } from '../i18n/translations';

export default function Home() {
    const navigate = useNavigate();
    const { user, language } = useAppContext();
    const lang = language?.code || 'en';

    const agents = [
        { icon: Search, name: t('Ingestion Agent', lang), desc: t('Monitors government portals and fetches latest policies automatically', lang), color: '#6366f1' },
        { icon: Brain, name: t('Reasoning Agent', lang), desc: t('Analyzes policies using AI to extract obligations and deadlines', lang), color: '#7c3aed' },
        { icon: FileCheck, name: t('Planning Agent', lang), desc: t('Creates personalized compliance action plans for your business', lang), color: '#059669' },
        { icon: BarChart3, name: t('Scoring Agent', lang), desc: t('Calculates risk, sustainability, and profitability scores', lang), color: '#d97706' },
        { icon: Shield, name: t('Execution Agent', lang), desc: t('Generates templates, checklists, and filing guides', lang), color: '#dc2626' },
        { icon: CheckCircle, name: t('Verification Agent', lang), desc: t('Cross-checks results for accuracy and completeness', lang), color: '#0891b2' },
        { icon: Globe, name: t('Explanation Agent', lang), desc: t('Translates everything into your preferred Indian language', lang), color: '#ec4899' },
    ];

    const features = [
        { icon: Bot, title: t('Autonomous AI', lang), desc: t('No uploading PDFs. Just tell us about your business — pAIr does everything automatically.', lang) },
        { icon: Shield, title: t('Real-time Compliance', lang), desc: t('Stay ahead with automatic policy monitoring and instant alerts on regulatory changes.', lang) },
        { icon: Globe, title: t('16 Indian Languages', lang), desc: t('Get everything in your language — Hindi, Tamil, Telugu, Bengali, Marathi, and more.', lang) },
        { icon: TrendingUp, title: t('Smart Scoring', lang), desc: t('Risk, sustainability, profitability, and ethics scores powered by AI scoring engines.', lang) },
    ];

    return (
        <div className="animate-fade-in">
            {/* Hero Section */}
            <section className="hero-blur-section py-20 md:py-28 px-4" style={{ position: 'relative', zIndex: 1 }}>
                <div className="max-w-5xl mx-auto text-center" style={{ position: 'relative', zIndex: 2 }}>
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8 animate-fade-in-up"
                        style={{ background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid var(--accent-muted)' }}>
                        <Sparkles size={14} />
                        <span>{t('Powered by 7 Autonomous AI Agents', lang)}</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s', lineHeight: 1.1 }}>
                        {t('Compliance Made', lang)}{' '}
                        <span className="text-gradient">{t('Effortless', lang)}</span>
                        <br />
                        {t('for Indian MSMEs', lang)}
                    </h1>

                    {/* Subheadline */}
                    <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s', color: 'var(--text-secondary)' }}>
                        {t('Tell us about your business — pAIr automatically finds relevant policies, analyzes compliance requirements, and creates personalized action plans in your language.', lang)}
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <button onClick={() => navigate(user ? '/dashboard' : '/login')}
                            className="btn btn-primary px-8 py-4 text-lg gap-2 group">
                            {user ? t('Go to Dashboard', lang) : t('Get Started Free', lang)}
                            <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                        </button>
                        <Link to="/about" className="btn btn-secondary px-6 py-4 gap-2">
                            {t('Learn More', lang)} <ChevronRight size={16} />
                        </Link>
                    </div>

                    {/* Trust indicators */}
                    <div className="flex flex-wrap items-center justify-center gap-6 mt-10 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                            <Shield size={16} style={{ color: 'var(--green)' }} /> {t('100% Secure', lang)}
                        </div>
                        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                            <Globe size={16} style={{ color: 'var(--accent)' }} /> {t('16 Languages', lang)}
                        </div>
                        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                            <Zap size={16} style={{ color: 'var(--orange)' }} /> {t('Real-time Updates', lang)}
                        </div>
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section className="py-16 px-4" style={{ position: 'relative', zIndex: 1 }}>
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">{t('How pAIr Works', lang)}</h2>
                        <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                            {t('No uploading. No manual work. Fully autonomous compliance.', lang)}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
                        {[
                            { step: '01', icon: Users, title: t('Set Up Your Profile', lang), desc: t('Answer a few questions about your business — type, sector, location, and size.', lang) },
                            { step: '02', icon: Bot, title: t('AI Agents Analyze', lang), desc: t('7 AI agents automatically find, analyze, and score relevant policies and schemes.', lang) },
                            { step: '03', icon: CheckCircle, title: t('Get Your Action Plan', lang), desc: t('Receive a personalized compliance roadmap with deadlines, templates, and alerts.', lang) },
                        ].map((item, i) => (
                            <div key={i} className="card card-hover p-8 text-center group">
                                <div className="text-5xl font-extrabold mb-4" style={{ color: 'var(--accent-muted)' }}>{item.step}</div>
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all group-hover:scale-110"
                                    style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                                    <item.icon size={24} />
                                </div>
                                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-16 px-4" style={{ background: 'var(--bg-secondary)', position: 'relative', zIndex: 1 }}>
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">{t('Why pAIr?', lang)}</h2>
                        <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                            {t('Built specifically for Indian MSMEs who need compliance help, not more paperwork.', lang)}
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger-children">
                        {features.map((f, i) => (
                            <div key={i} className="card card-hover p-6 flex gap-4 group">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110"
                                    style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                                    <f.icon size={22} />
                                </div>
                                <div>
                                    <h3 className="font-bold mb-1">{f.title}</h3>
                                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 7 AI Agents */}
            <section className="py-16 px-4" style={{ position: 'relative', zIndex: 1 }}>
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">{t('Meet Your 7 AI Agents', lang)}</h2>
                        <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                            {t('Each agent specializes in a critical part of compliance analysis.', lang)}
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
                        {agents.map((agent, i) => (
                            <div key={i} className="card card-hover p-5 group">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                                        style={{ background: `${agent.color}15`, color: agent.color }}>
                                        <agent.icon size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm mb-1">{agent.name}</h4>
                                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{agent.desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Voice Assistant Coming Soon + Future Plans */}
            <section className="py-16 px-4" style={{ background: 'var(--bg-secondary)', position: 'relative', zIndex: 1 }}>
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Voice Assistant Teaser */}
                        <div className="card p-8 text-center" style={{ border: '1px solid var(--accent-muted)' }}>
                            <div className="badge badge-accent mx-auto mb-4">{t('Coming Soon', lang)}</div>
                            <div className="flex items-center justify-center gap-1.5 mb-6 h-10">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="voice-wave-bar" style={{ animationDelay: `${i * 0.15}s` }} />
                                ))}
                            </div>
                            <h3 className="text-xl font-bold mb-3 flex items-center justify-center gap-2">
                                <Mic size={22} style={{ color: 'var(--accent)' }} />
                                {t('Voice Assistant', lang)}
                            </h3>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                {t('Ask compliance questions in your language using voice. Get instant answers from our AI agents — hands-free.', lang)}
                            </p>
                        </div>

                        {/* Future Roadmap */}
                        <div className="card p-8">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Rocket size={22} style={{ color: 'var(--accent)' }} />
                                {t('Future Plans', lang)}
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { icon: Mic, label: t('Voice-powered compliance queries', lang), badge: 'Q3 2026' },
                                    { icon: Star, label: t('Mobile app (Android & iOS)', lang), badge: 'Q4 2026' },
                                    { icon: Clock, label: t('WhatsApp & SMS compliance alerts', lang), badge: 'Q1 2027' },
                                    { icon: TrendingUp, label: t('Predictive compliance forecasting', lang), badge: 'Q2 2027' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl transition-colors"
                                        style={{ background: 'var(--bg-secondary)' }}>
                                        <item.icon size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                                        <span className="text-sm font-medium flex-1">{item.label}</span>
                                        <span className="badge badge-gray text-[10px]">{item.badge}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="hero-blur-section py-20 px-4 text-center" style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('Ready to simplify compliance?', lang)}</h2>
                    <p className="text-base mb-8 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                        {t('Join Indian MSMEs who trust pAIr to handle their compliance — so they can focus on growing their business.', lang)}
                    </p>
                    <button onClick={() => navigate(user ? '/dashboard' : '/login')}
                        className="btn btn-primary px-8 py-4 text-lg gap-2 group">
                        {user ? t('Go to Dashboard', lang) : t('Start for Free', lang)}
                        <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                    </button>
                </div>
            </section>
        </div>
    );
}
