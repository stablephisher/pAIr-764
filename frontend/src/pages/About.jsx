import React from 'react';
import { Link } from 'react-router-dom';
import {
    Zap, Shield, Brain, Layers, GitBranch, Globe, BarChart3, FileText,
    Users, TrendingUp, CheckCircle, ArrowRight, Cpu, Lock, Eye, Sparkles,
    Target, Award, Lightbulb, Heart, Rocket
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { t } from '../i18n/translations';

const stats = [
    { label: 'AI Agents Working Together', value: '7', icon: Brain },
    { label: 'Languages Supported', value: '10', icon: Globe },
    { label: 'Scoring Engines', value: '5', icon: BarChart3 },
    { label: 'Gov Schemes Indexed', value: '30+', icon: FileText },
];

const agents = [
    { name: 'Orchestrator', role: 'Coordinates all agents', desc: 'Central brain that delegates tasks, manages state, and ensures all agents work in harmony.', color: 'from-blue-500 to-indigo-500', icon: Layers },
    { name: 'Ingestion Agent', role: 'PDF & Data Intake', desc: 'Extracts and structures text from government PDFs, scanned documents, and policy URLs.', color: 'from-emerald-500 to-teal-500', icon: FileText },
    { name: 'Reasoning Agent', role: 'Legal Intelligence', desc: 'Deep semantic analysis using AI to interpret complex legal text into structured, actionable intelligence.', color: 'from-violet-500 to-purple-500', icon: Brain },
    { name: 'Planning Agent', role: 'Compliance Roadmap', desc: 'Transforms policy intelligence into clear, prioritized, step-by-step action plans for MSME owners.', color: 'from-amber-500 to-orange-500', icon: Target },
    { name: 'Execution Agent', role: 'Output Preparation', desc: 'Generates application drafts, compliance checklists, document guides, and form-filling assistance.', color: 'from-pink-500 to-rose-500', icon: Rocket },
    { name: 'Verification Agent', role: 'Quality Assurance', desc: 'Validates all outputs for accuracy, completeness, and consistency before delivery.', color: 'from-cyan-500 to-blue-500', icon: CheckCircle },
    { name: 'Explanation Agent', role: 'Simple Summaries', desc: 'Converts technical analysis into plain language any business owner can understand, in 10 languages.', color: 'from-green-500 to-emerald-500', icon: Eye },
];

const techStack = [
    { category: 'AI / LLM', items: ['Google Gemma 3 27B', 'LLaMA 3.3 70B (fallback)', 'OpenRouter API', 'Multi-Agent Architecture'] },
    { category: 'Backend', items: ['Python 3.11 / FastAPI', 'Async Pipeline Engine', '5 Scoring Engines', 'Real-time Policy Monitor'] },
    { category: 'Frontend', items: ['React 18 + Vite 5', 'TailwindCSS', '10-Language i18n', 'Firebase Auth (Google)'] },
    { category: 'Infrastructure', items: ['Firestore / Local JSON', 'Docker + Cloud Run', 'Vercel Deployment', 'Auto-scaling Ready'] },
];

const impactPoints = [
    { icon: Users, title: '63M+ MSMEs in India', desc: 'Most lack resources for legal compliance. pAIr makes it free, instant, and accessible in their own language.' },
    { icon: Shield, title: 'Zero-to-Compliant in Minutes', desc: 'Upload a policy PDF → get a personalized compliance plan with step-by-step actions, deadlines, and risk alerts.' },
    { icon: TrendingUp, title: 'Unlock Government Benefits', desc: 'Automatic eligibility matching across 30+ government schemes including CGTMSE, PMEGP, Stand-Up India, and more.' },
    { icon: Globe, title: 'Truly Inclusive', desc: 'Full support for Hindi, Telugu, Tamil, Kannada, Malayalam, Bengali, Marathi, Gujarati, and Punjabi — not just the UI, the entire analysis.' },
];

export default function About() {
    const { language } = useAppContext();
    const lang = language?.code || 'en';

    return (
        <div className="max-w-6xl mx-auto space-y-20 pb-16">

            {/* ═══ HERO ═══ */}
            <section className="text-center pt-8">
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold mb-8 tracking-wide"
                    style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                    <Award size={14} />
                    Code Unnati Innovation Marathon 4.0 — Team 13494
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
                    <span style={{ color: 'var(--text)' }}>The AI That </span>
                    <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, var(--accent), var(--purple))' }}>
                        Understands Policy
                    </span>
                    <br />
                    <span style={{ color: 'var(--text)' }}>So You Don't Have To</span>
                </h1>
                <p className="text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    <strong>pAIr</strong> is a multi-agent AI system that reads government policy documents, understands complex legal text, and generates personalized compliance roadmaps — 
                    so that 63 million Indian MSMEs can focus on growing their business instead of decoding regulations.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link to="/analysis/new" className="btn btn-primary btn-lg shadow-xl gap-2">
                        <Zap size={20} /> Try It Now — Free
                    </Link>
                    <Link to="/team" className="btn btn-secondary btn-lg gap-2">
                        <Users size={20} /> Meet the Team
                    </Link>
                </div>
            </section>

            {/* ═══ STATS BAR ═══ */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                    <div key={i} className="card p-6 text-center transition-all hover:shadow-lg" style={{ border: '1px solid var(--border)' }}>
                        <s.icon size={28} className="mx-auto mb-3" style={{ color: 'var(--accent)' }} />
                        <div className="text-3xl font-extrabold mb-1" style={{ color: 'var(--text)' }}>{s.value}</div>
                        <p className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>{s.label}</p>
                    </div>
                ))}
            </section>

            {/* ═══ THE PROBLEM ═══ */}
            <section className="card p-8 md:p-12" style={{ background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))', border: '1px solid var(--border)' }}>
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white flex-shrink-0">
                        <Lightbulb size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: 'var(--text)' }}>The Problem We're Solving</h2>
                        <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            India has <strong>63+ million MSMEs</strong> that form the backbone of the economy. But most are run by owners who are experts at their craft — not at reading 200-page government gazettes. They miss deadlines, lose schemes, and pay penalties — 
                            not because they don't care, but because <strong>compliance is complex, scattered, and written in legal jargon</strong>.
                        </p>
                        <p className="text-base leading-relaxed mt-4" style={{ color: 'var(--text-secondary)' }}>
                            Existing solutions are expensive consulting firms or generic portals. There's nothing that reads a policy document, understands your specific business context, and tells you exactly what to do — in your language, for your sector, with your deadlines.
                        </p>
                        <p className="text-lg font-bold mt-6" style={{ color: 'var(--accent)' }}>
                            Until pAIr.
                        </p>
                    </div>
                </div>
            </section>

            {/* ═══ IMPACT ═══ */}
            <section>
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>Real-World Impact</h2>
                    <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>What pAIr actually does for MSME owners across India</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {impactPoints.map((p, i) => (
                        <div key={i} className="card p-6 flex gap-4 transition-all hover:shadow-lg" style={{ border: '1px solid var(--border)' }}>
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                                <p.icon size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--text)' }}>{p.title}</h3>
                                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{p.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══ HOW IT WORKS — FLOW ═══ */}
            <section>
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>How It Works</h2>
                    <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>From PDF to personalized compliance plan in under 60 seconds</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {[
                        { step: '1', title: 'Upload', desc: 'Drop a government PDF or policy URL', icon: FileText, color: 'from-blue-500 to-indigo-500' },
                        { step: '2', title: 'AI Reads', desc: '7 agents analyze simultaneously', icon: Brain, color: 'from-purple-500 to-violet-500' },
                        { step: '3', title: 'Score', desc: 'Risk, Sustainability, Ethics, Profitability', icon: BarChart3, color: 'from-emerald-500 to-green-500' },
                        { step: '4', title: 'Plan', desc: 'Personalized action steps with deadlines', icon: Target, color: 'from-orange-500 to-amber-500' },
                        { step: '5', title: 'Act', desc: 'Scheme eligibility + application drafts', icon: Rocket, color: 'from-pink-500 to-rose-500' },
                    ].map((s, i) => (
                        <div key={i} className="text-center p-5 rounded-2xl relative" style={{ background: 'var(--bg-secondary)' }}>
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mx-auto mb-3 text-white`}>
                                <s.icon size={20} />
                            </div>
                            <div className="text-xs font-bold mb-1" style={{ color: 'var(--accent)' }}>STEP {s.step}</div>
                            <h4 className="font-bold mb-1" style={{ color: 'var(--text)' }}>{s.title}</h4>
                            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{s.desc}</p>
                            {i < 4 && <ArrowRight size={16} className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />}
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══ MULTI-AGENT ARCHITECTURE ═══ */}
            <section>
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
                        style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                        <GitBranch size={14} /> Architecture Deep Dive
                    </div>
                    <h2 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>7-Agent AI System</h2>
                    <p className="mt-2 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                        pAIr uses a state-of-the-art multi-agent orchestration pattern. Each agent specializes in one task and communicates through a shared pipeline context.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {agents.map((agent, i) => (
                        <div key={i} className="card overflow-hidden transition-all hover:shadow-xl group" style={{ border: '1px solid var(--border)' }}>
                            <div className={`h-2 bg-gradient-to-r ${agent.color}`} />
                            <div className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${agent.color} flex items-center justify-center text-white`}>
                                        <agent.icon size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold" style={{ color: 'var(--text)' }}>{agent.name}</h3>
                                        <p className="text-xs font-medium" style={{ color: 'var(--accent)' }}>{agent.role}</p>
                                    </div>
                                </div>
                                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{agent.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══ 5 SCORING ENGINES ═══ */}
            <section className="card p-8 md:p-12" style={{ border: '1px solid var(--border)' }}>
                <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: 'var(--text)' }}>5 Intelligent Scoring Engines</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                        { name: 'Compliance Risk', icon: Shield, color: 'var(--red)', desc: 'Deadline tracking, penalty detection, severity scoring' },
                        { name: 'Sustainability', icon: Globe, color: 'var(--green)', desc: 'Environmental impact, paper saved, CO₂ reduction' },
                        { name: 'Profitability', icon: TrendingUp, color: 'var(--accent)', desc: 'ROI calculation, cost-benefit, scheme value' },
                        { name: 'Ethics', icon: Eye, color: 'var(--purple)', desc: 'Inclusivity scoring, bias detection, fairness' },
                        { name: 'Impact', icon: Sparkles, color: 'var(--orange)', desc: 'Overall MSME impact with sector benchmarking' },
                    ].map((e, i) => (
                        <div key={i} className="text-center p-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                            <e.icon size={28} className="mx-auto mb-2" style={{ color: e.color }} />
                            <h4 className="font-bold text-sm mb-1" style={{ color: 'var(--text)' }}>{e.name}</h4>
                            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{e.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══ TECH STACK ═══ */}
            <section>
                <h2 className="text-3xl font-bold text-center mb-8" style={{ color: 'var(--text)' }}>Technology Stack</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                    {techStack.map((cat, i) => (
                        <div key={i} className="card p-5" style={{ border: '1px solid var(--border)' }}>
                            <h3 className="font-bold text-sm mb-3 pb-2 border-b" style={{ color: 'var(--accent)', borderColor: 'var(--border)' }}>{cat.category}</h3>
                            <ul className="space-y-2">
                                {cat.items.map((item, j) => (
                                    <li key={j} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                        <CheckCircle size={12} style={{ color: 'var(--green)' }} /> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══ WHAT MAKES US DIFFERENT ═══ */}
            <section className="card p-8 md:p-12" style={{ background: 'linear-gradient(135deg, var(--accent-light), var(--bg-secondary))', border: '1px solid var(--accent)' }}>
                <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text)' }}>What Makes pAIr Different</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                        { title: 'Not a Chatbot', desc: 'pAIr is a structured multi-agent pipeline — not a conversation. It systematically reads, reasons, plans, executes, and verifies.' },
                        { title: 'Truly Personalized', desc: 'Every analysis is contextual to YOUR business — your sector, your state, your size, your compliance history.' },
                        { title: 'Built for Bharat', desc: 'Full support for 10 Indian languages, designed for non-technical MSME owners, accessible to all age groups.' },
                        { title: 'Real Compliance, Not Summaries', desc: 'We don\'t summarize policies — we generate executable compliance plans with application drafts, checklists, and deadline alerts.' },
                        { title: 'Automatic Policy Monitor', desc: 'Drop new policy PDFs in the monitor folder and pAIr auto-analyzes and notifies affected businesses.' },
                        { title: '100% Free Models', desc: 'Built on Gemma 3 27B + LLaMA 3.3 70B via OpenRouter — no expensive API keys needed. Designed to be affordable for every MSME.' },
                    ].map((p, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <CheckCircle size={20} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                            <div>
                                <h4 className="font-bold mb-1" style={{ color: 'var(--text)' }}>{p.title}</h4>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{p.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══ CTA ═══ */}
            <section className="text-center p-10 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <Sparkles size={40} className="mx-auto mb-4" style={{ color: 'var(--accent)' }} />
                <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--text)' }}>See It In Action</h2>
                <p className="text-base mb-8 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                    Upload any government policy PDF and watch pAIr's 7 AI agents break it down into a personalized compliance roadmap in under 60 seconds.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link to="/analysis/new" className="btn btn-primary btn-lg shadow-xl gap-2">
                        <Zap size={20} /> Start Your First Analysis
                    </Link>
                    <Link to="/dashboard" className="btn btn-secondary btn-lg gap-2">
                        <BarChart3 size={20} /> View Dashboard
                    </Link>
                </div>
                <p className="text-xs mt-6 flex items-center justify-center gap-1" style={{ color: 'var(--text-tertiary)' }}>
                    Made with <Heart size={12} fill="var(--red)" stroke="none" /> by Team pAIr
                </p>
            </section>
        </div>
    );
}
