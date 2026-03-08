import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Zap, Shield, Search, FileCheck, BarChart3, Brain,
    ArrowRight, Sparkles, Bot, Globe, Mic, ChevronRight,
    CheckCircle, Clock, TrendingUp, Users, Rocket, Star
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import useTranslate from '../hooks/useTranslate';

export default function Home() {
    const navigate = useNavigate();
    const { user, language } = useAppContext();
    const lang = language?.code || 'en';
    const { gt } = useTranslate(lang);

    const agents = [
        { icon: Search, name: gt('Ingestion Agent'), desc: gt('Monitors government portals and fetches latest policies automatically'), color: '#6366f1' },
        { icon: Brain, name: gt('Reasoning Agent'), desc: gt('Analyzes policies using AI to extract obligations and deadlines'), color: '#7c3aed' },
        { icon: FileCheck, name: gt('Planning Agent'), desc: gt('Creates personalized compliance action plans for your business'), color: '#059669' },
        { icon: BarChart3, name: gt('Scoring Agent'), desc: gt('Calculates risk, sustainability, and profitability scores'), color: '#d97706' },
        { icon: Shield, name: gt('Execution Agent'), desc: gt('Generates templates, checklists, and filing guides'), color: '#dc2626' },
        { icon: CheckCircle, name: gt('Verification Agent'), desc: gt('Cross-checks results for accuracy and completeness'), color: '#0891b2' },
        { icon: Globe, name: gt('Explanation Agent'), desc: gt('Translates everything into your preferred Indian language'), color: '#ec4899' },
    ];

    const features = [
        { icon: Bot, title: gt('Autonomous AI'), desc: gt('No uploading PDFs. Just tell us about your business and pAIr does everything automatically.') },
        { icon: Shield, title: gt('Real-time Compliance'), desc: gt('Stay ahead with automatic policy monitoring and instant alerts on regulatory changes.') },
        { icon: Globe, title: gt('16 Indian Languages'), desc: gt('Get everything in your language: Hindi, Tamil, Telugu, Bengali, Marathi, and more.') },
        { icon: TrendingUp, title: gt('Smart Scoring'), desc: gt('Risk, sustainability, profitability, and ethics scores powered by AI scoring engines.') },
    ];

    return (
        <div className="animate-fade-in">
            {/* Hero Section */}
            <section className="py-20 md:py-28 px-4" style={{ position: 'relative', zIndex: 1 }}>
                <div className="max-w-5xl mx-auto text-center" style={{ position: 'relative', zIndex: 2 }}>
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8 animate-fade-in-up"
                        style={{ background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid var(--accent-muted)' }}>
                        <Sparkles size={14} />
                        <span>{gt('Powered by 7 Autonomous AI Agents')}</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s', lineHeight: 1.1 }}>
                        {gt('Compliance Made')}{' '}
                        <span className="text-gradient">{gt('Effortless')}</span>
                        <br />
                        {gt('for Indian MSMEs')}
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg mb-8 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s', color: 'var(--text-secondary)' }}>
                        {gt('Tell us about your business. pAIr automatically finds relevant policies, analyzes compliance requirements, and creates personalized action plans in your language.')}
                    </p>

                    {/* CTA */}
                    <div className="flex flex-wrap items-center justify-center gap-4 mb-10 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <button onClick={() => navigate(user ? '/dashboard' : '/login')}
                            className="btn btn-primary px-8 py-4 text-base gap-2 group shadow-lg">
                            {user ? gt('Go to Dashboard') : gt('Get Started Free')}
                            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                        </button>
                        <Link to="/about" className="btn btn-secondary px-6 py-4 text-base gap-2 group">
                            {gt('Learn More')} <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                        </Link>
                    </div>

                    {/* Trust badges */}
                    <div className="flex flex-wrap items-center justify-center gap-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                            <Shield size={16} style={{ color: 'var(--green)' }} /> {gt('100% Secure')}
                        </div>
                        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                            <Globe size={16} style={{ color: 'var(--accent)' }} /> {gt('16 Languages')}
                        </div>
                        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                            <Zap size={16} style={{ color: 'var(--orange)' }} /> {gt('Real-time Updates')}
                        </div>
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section className="py-16 px-4" style={{ position: 'relative', zIndex: 1 }}>
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">{gt('How pAIr Works')}</h2>
                        <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                            {gt('No uploading. No manual work. Fully autonomous compliance.')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
                        {[
                            { step: '01', icon: Users, title: gt('Set Up Your Profile'), desc: gt('Answer a few questions about your business: type, sector, location, and size.') },
                            { step: '02', icon: Bot, title: gt('AI Agents Analyze'), desc: gt('7 AI agents automatically find, analyze, and score relevant policies and schemes.') },
                            { step: '03', icon: CheckCircle, title: gt('Get Your Action Plan'), desc: gt('Receive a personalized compliance roadmap with deadlines, templates, and alerts.') },
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
            <section className="py-16 px-4" style={{ position: 'relative', zIndex: 1 }}>
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">{gt('Why pAIr?')}</h2>
                        <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                            {gt('Built specifically for Indian MSMEs who need compliance help, not more paperwork.')}
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
                        <h2 className="text-3xl font-bold mb-4">{gt('Meet Your 7 AI Agents')}</h2>
                        <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                            {gt('Each agent specializes in a critical part of compliance analysis.')}
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
            <section className="py-16 px-4" style={{ position: 'relative', zIndex: 1 }}>
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Voice Assistant Teaser */}
                        <div className="card p-8 text-center" style={{ border: '1px solid var(--accent-muted)' }}>
                            <div className="badge badge-accent mx-auto mb-4">{gt('Coming Soon')}</div>
                            <div className="flex items-center justify-center gap-1.5 mb-6 h-10">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="voice-wave-bar" style={{ animationDelay: `${i * 0.15}s` }} />
                                ))}
                            </div>
                            <h3 className="text-xl font-bold mb-3 flex items-center justify-center gap-2">
                                <Mic size={22} style={{ color: 'var(--accent)' }} />
                                {gt('Voice Assistant')}
                            </h3>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                {gt('Ask compliance questions in your language using voice. Get instant answers from our AI agents, hands-free.')}
                            </p>
                        </div>

                        {/* Future Roadmap */}
                        <div className="card p-8">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Rocket size={22} style={{ color: 'var(--accent)' }} />
                                {gt('Future Plans')}
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { icon: Mic, label: gt('Voice-powered compliance queries'), badge: 'Q3 2026' },
                                    { icon: Star, label: gt('Mobile app (Android & iOS)'), badge: 'Q4 2026' },
                                    { icon: Clock, label: gt('WhatsApp & SMS compliance alerts'), badge: 'Q1 2027' },
                                    { icon: TrendingUp, label: gt('Predictive compliance forecasting'), badge: 'Q2 2027' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl transition-colors"
                                        style={{ background: 'var(--surface)' }}>
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
            <section className="py-20 px-4 text-center" style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">{gt('Ready to simplify compliance?')}</h2>
                    <p className="text-base mb-8 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                        {gt('Join Indian MSMEs who trust pAIr to handle their compliance so they can focus on growing their business.')}
                    </p>
                    <button onClick={() => navigate(user ? '/dashboard' : '/login')}
                        className="btn btn-primary px-8 py-4 text-lg gap-2 group">
                        {user ? gt('Go to Dashboard') : gt('Start for Free')}
                        <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                    </button>
                </div>
            </section>
        </div>
    );
}
