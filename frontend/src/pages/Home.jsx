import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Shield, Zap, BarChart3, Globe, ArrowRight, Sparkles, FileCheck, TrendingUp } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Home() {
    const navigate = useNavigate();
    const { user } = useAppContext();

    return (
        <div className="max-w-5xl mx-auto">
            {/* Hero */}
            <section className="text-center py-16 md:py-20">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8"
                    style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                    <span className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }}></span>
                    <span>AI-Powered Compliance for Startup India</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight" style={{ color: 'var(--text)' }}>
                    Compliance Made <br />
                    <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, var(--accent), var(--purple))' }}>
                        Simple & Intelligent
                    </span>
                </h1>
                <p className="text-lg mb-10 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                    Upload your policy documents and let our AI agents analyze risks, ensure compliance, and unlock growth opportunities for your MSME.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button onClick={() => navigate('/analysis/new')}
                        className="btn btn-primary btn-lg shadow-xl w-full sm:w-auto flex items-center gap-2">
                        <Upload size={20} /> Start Free Analysis
                    </button>
                    <button onClick={() => navigate('/dashboard')}
                        className="btn btn-secondary btn-lg w-full sm:w-auto flex items-center gap-2">
                        <BarChart3 size={20} /> View Dashboard
                    </button>
                </div>
            </section>

            {/* Features Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                {[
                    { icon: Shield, title: "Risk Detection", desc: "Identify compliance gaps and legal risks instantly with AI-powered analysis.", gradient: "from-red-500 to-orange-500" },
                    { icon: BarChart3, title: "Smart Scoring", desc: "Get comprehensive scores on Risk, Profitability, Sustainability, and Ethics.", gradient: "from-blue-500 to-indigo-500" },
                    { icon: Globe, title: "Gov Schemes", desc: "Discover eligible government schemes, subsidies, and grants for your MSME.", gradient: "from-emerald-500 to-teal-500" }
                ].map((f, i) => (
                    <div key={i} className="card p-6 transition-all hover:shadow-lg"
                        style={{ border: '1px solid var(--border)' }}>
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4 text-white`}>
                            <f.icon size={24} />
                        </div>
                        <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>{f.title}</h3>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
                    </div>
                ))}
            </section>

            {/* How it works */}
            <section className="mb-16">
                <h2 className="text-2xl font-bold text-center mb-10" style={{ color: 'var(--text)' }}>How It Works</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                        { step: "1", icon: Upload, title: "Upload PDF", desc: "Upload any government policy document" },
                        { step: "2", icon: Sparkles, title: "AI Analysis", desc: "Our multi-agent AI processes your document" },
                        { step: "3", icon: FileCheck, title: "Get Scores", desc: "Receive risk, sustainability, and ethics scores" },
                        { step: "4", icon: TrendingUp, title: "Take Action", desc: "Follow recommended compliance actions" },
                    ].map((item, i) => (
                        <div key={i} className="text-center p-5 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3"
                                style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                                <item.icon size={18} />
                            </div>
                            <h4 className="font-semibold text-sm mb-1" style={{ color: 'var(--text)' }}>{item.title}</h4>
                            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="text-center mb-16 p-8 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text)' }}>Ready to get started?</h2>
                <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                    Upload your first policy document and see pAIr in action.
                </p>
                <button onClick={() => navigate('/analysis/new')} className="btn btn-primary gap-2">
                    Get Started <ArrowRight size={16} />
                </button>
            </section>
        </div>
    );
}
