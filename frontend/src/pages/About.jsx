import React from 'react';
import { Link } from 'react-router-dom';
import {
    Zap, Shield, Brain, Layers, GitBranch, Globe, BarChart3, FileText,
    Users, TrendingUp, CheckCircle, ArrowRight, Eye, Sparkles,
    Target, Award, Lightbulb, Heart, Rocket
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { t } from '../i18n/translations';

const agents = [
    { name: 'Orchestrator', role: 'The Coordinator', desc: 'Runs the whole show — assigns tasks, manages state, and makes sure every agent does its job right.', color: 'from-blue-500 to-indigo-500', icon: Layers },
    { name: 'Ingestion Agent', role: 'Document Reader', desc: 'Reads through those dense 200-page PDFs and messy scanned documents so you never have to.', color: 'from-emerald-500 to-teal-500', icon: FileText },
    { name: 'Reasoning Agent', role: 'The Legal Brain', desc: 'Figures out what the policy actually means for your business — obligations, deadlines, penalties, the works.', color: 'from-violet-500 to-purple-500', icon: Brain },
    { name: 'Planning Agent', role: 'Action Planner', desc: 'Turns all that legal analysis into a clear, step-by-step plan you can actually follow.', color: 'from-amber-500 to-orange-500', icon: Target },
    { name: 'Execution Agent', role: 'Draft Generator', desc: 'Creates application drafts, compliance checklists, and form guides so you can start acting right away.', color: 'from-pink-500 to-rose-500', icon: Rocket },
    { name: 'Verification Agent', role: 'Quality Checker', desc: 'Double-checks everything for accuracy before it reaches you. No hallucinations, no guesswork.', color: 'from-cyan-500 to-blue-500', icon: CheckCircle },
    { name: 'Explanation Agent', role: 'Translator', desc: 'Takes technical jargon and turns it into simple language — in any of 10 Indian languages.', color: 'from-green-500 to-emerald-500', icon: Eye },
];

export default function About() {
    const { language } = useAppContext();
    const lang = language?.code || 'en';

    return (
        <div className="max-w-5xl mx-auto space-y-16 pb-16 relative">
            {/* Decorative orbs */}
            <div className="orb orb-accent" style={{ width: 300, height: 300, top: -80, right: -100 }} />
            <div className="orb orb-purple" style={{ width: 250, height: 250, top: 400, left: -120, animationDelay: '2s' }} />

            {/* ═══ HERO ═══ */}
            <section className="text-center pt-8 relative z-10">
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold mb-8 tracking-wide badge-gradient">
                    <Award size={14} />
                    Code Unnati Innovation Marathon 4.0
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6 tracking-tight">
                    <span style={{ color: 'var(--text)' }}>Policy compliance</span>
                    <br />
                    <span className="text-gradient">shouldn't need a lawyer.</span>
                </h1>
                <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    pAIr reads government policies, understands what they mean for <em>your</em> business, and tells you exactly what to do — in plain language, in your language.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link to="/analysis/new" className="btn btn-primary gap-2 px-8 py-3.5 text-base">
                        <Zap size={20} /> Try It Free
                    </Link>
                    <Link to="/team" className="btn btn-secondary gap-2 px-8 py-3.5 text-base">
                        <Users size={20} /> Meet Our Team
                    </Link>
                </div>
            </section>

            {/* ═══ QUICK STATS ═══ */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { value: '7', label: 'AI Agents', icon: Brain },
                    { value: '10', label: 'Languages', icon: Globe },
                    { value: '5', label: 'Scoring Engines', icon: BarChart3 },
                    { value: '30+', label: 'Gov Schemes', icon: FileText },
                ].map((s, i) => (
                    <div key={i} className="card card-hover p-6 text-center hover-lift">
                        <s.icon size={24} className="mx-auto mb-3" style={{ color: 'var(--accent)' }} />
                        <div className="text-3xl font-extrabold mb-1 text-gradient">{s.value}</div>
                        <p className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>{s.label}</p>
                    </div>
                ))}
            </section>

            {/* ═══ THE PROBLEM ═══ */}
            <section className="card p-8 md:p-10 relative overflow-hidden">
                <div className="orb orb-accent" style={{ width: 200, height: 200, bottom: -60, right: -60, opacity: 0.06 }} />
                <div className="flex items-start gap-4 mb-5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white flex-shrink-0 shadow-lg">
                        <Lightbulb size={24} />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--text)' }}>Here's the reality</h2>
                </div>
                <div className="space-y-4 pl-16" style={{ color: 'var(--text-secondary)' }}>
                    <p className="text-base leading-relaxed">
                        India has over <strong>63 million small businesses</strong>. Most are run by incredible people who are experts at what they do — manufacturing, food, textiles, services. But they're not legal experts. And nobody expects them to be.
                    </p>
                    <p className="text-base leading-relaxed">
                        Yet every year, thousands of MSMEs miss government scheme deadlines, pay avoidable penalties, or simply have no idea a new regulation affects them. Not because they don't care — because <strong>policy documents are 200 pages of legal jargon</strong> that nobody has time to read.
                    </p>
                    <p className="text-lg font-bold mt-4" style={{ color: 'var(--accent)' }}>
                        We built pAIr to change that.
                    </p>
                </div>
            </section>

            {/* ═══ HOW IT WORKS ═══ */}
            <section>
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>How it works</h2>
                    <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>Upload a document. Get a compliance plan. It's that simple.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {[
                        { step: '1', title: 'Upload', desc: 'Drop any government PDF', icon: FileText, color: 'from-blue-500 to-indigo-500' },
                        { step: '2', title: 'AI Reads', desc: '7 agents work together', icon: Brain, color: 'from-purple-500 to-violet-500' },
                        { step: '3', title: 'Score', desc: 'Risk, ethics, sustainability', icon: BarChart3, color: 'from-emerald-500 to-green-500' },
                        { step: '4', title: 'Plan', desc: 'Your action steps + deadlines', icon: Target, color: 'from-orange-500 to-amber-500' },
                        { step: '5', title: 'Act', desc: 'Schemes matched, drafts ready', icon: Rocket, color: 'from-pink-500 to-rose-500' },
                    ].map((s, i) => (
                        <div key={i} className="card card-hover text-center p-5 relative">
                            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mx-auto mb-3 text-white shadow-md`}>
                                <s.icon size={18} />
                            </div>
                            <div className="text-[10px] font-bold mb-1 tracking-widest" style={{ color: 'var(--accent)' }}>STEP {s.step}</div>
                            <h4 className="font-bold text-sm mb-1" style={{ color: 'var(--text)' }}>{s.title}</h4>
                            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{s.desc}</p>
                            {i < 4 && <ArrowRight size={14} className="hidden md:block absolute top-1/2 -right-2.5 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />}
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══ WHAT IT ACTUALLY DOES ═══ */}
            <section>
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>What you actually get</h2>
                    <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>Real help, not just summaries</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[
                        { icon: Shield, title: 'Full compliance breakdown', desc: 'Every obligation, deadline, and penalty extracted and explained in simple terms you can act on.' },
                        { icon: TrendingUp, title: 'Government scheme matching', desc: 'Automatically checks your eligibility for 30+ schemes like CGTMSE, PMEGP, and Stand-Up India.' },
                        { icon: Globe, title: 'Analysis in your language', desc: 'Not just the UI — the entire compliance report, in Hindi, Tamil, Telugu, Kannada, and 6 more languages.' },
                        { icon: Users, title: 'Built for real business owners', desc: 'No legal background needed. Whether you run a chai stall or a manufacturing unit, pAIr speaks your language.' },
                    ].map((p, i) => (
                        <div key={i} className="card card-hover p-6 flex gap-4 hover-lift">
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                                <p.icon size={22} />
                            </div>
                            <div>
                                <h3 className="font-bold mb-1" style={{ color: 'var(--text)' }}>{p.title}</h3>
                                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{p.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══ 7 AGENT SYSTEM ═══ */}
            <section>
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
                        style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                        <GitBranch size={14} /> Under the Hood
                    </div>
                    <h2 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>7 AI agents, one mission</h2>
                    <p className="mt-2 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                        Each agent specializes in one thing and does it really well. Together, they form a pipeline that goes from raw PDF to personalized compliance plan.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {agents.map((agent, i) => (
                        <div key={i} className="card card-hover overflow-hidden group hover-lift">
                            <div className={`h-1.5 bg-gradient-to-r ${agent.color}`} />
                            <div className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${agent.color} flex items-center justify-center text-white shadow-md`}>
                                        <agent.icon size={18} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm" style={{ color: 'var(--text)' }}>{agent.name}</h3>
                                        <p className="text-xs font-medium" style={{ color: 'var(--accent)' }}>{agent.role}</p>
                                    </div>
                                </div>
                                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{agent.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══ SCORING ENGINES ═══ */}
            <section className="card p-8 md:p-10">
                <h2 className="text-2xl font-bold mb-2 text-center" style={{ color: 'var(--text)' }}>5 ways we score every policy</h2>
                <p className="text-center mb-8 text-sm" style={{ color: 'var(--text-secondary)' }}>Not just "is this risky?" — we go deep.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {[
                        { name: 'Risk', icon: Shield, color: 'var(--red)', desc: 'Deadlines, penalties, severity' },
                        { name: 'Sustainability', icon: Globe, color: 'var(--green)', desc: 'Green impact, CO₂ saved' },
                        { name: 'Profitability', icon: TrendingUp, color: 'var(--accent)', desc: 'ROI, cost-benefit analysis' },
                        { name: 'Ethics', icon: Eye, color: 'var(--purple)', desc: 'Bias check, fairness score' },
                        { name: 'Impact', icon: Sparkles, color: 'var(--orange)', desc: 'Sector benchmark, value' },
                    ].map((e, i) => (
                        <div key={i} className="text-center p-4 rounded-xl hover-lift" style={{ background: 'var(--bg-secondary)' }}>
                            <e.icon size={26} className="mx-auto mb-2" style={{ color: e.color }} />
                            <h4 className="font-bold text-sm mb-1" style={{ color: 'var(--text)' }}>{e.name}</h4>
                            <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{e.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══ WHY WE'RE DIFFERENT ═══ */}
            <section className="card p-8 md:p-10 relative overflow-hidden" style={{ borderColor: 'var(--accent)' }}>
                <div className="orb orb-purple" style={{ width: 180, height: 180, top: -40, left: -40, opacity: 0.05 }} />
                <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text)' }}>Why pAIr isn't just another AI tool</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[
                        { title: 'Not a chatbot', desc: 'This isn\'t a conversation — it\'s a pipeline. Seven specialized agents analyze, plan, verify, and deliver.' },
                        { title: 'Actually personalized', desc: 'Every analysis knows your sector, your state, your business size. The output is yours, not generic.' },
                        { title: 'Made for Bharat', desc: '10 Indian languages, designed for non-tech-savvy owners. Your uncle who runs a welding shop can use this.' },
                        { title: 'Plans, not summaries', desc: 'We don\'t just explain what a policy says. We tell you what to do, by when, and what happens if you don\'t.' },
                        { title: 'Auto policy monitor', desc: 'New policies get auto-analyzed and affected businesses get instant notifications. Stay ahead, not behind.' },
                        { title: '100% free AI models', desc: 'Built on Gemma 3 27B + LLaMA 3.3 70B — no expensive API. Affordable compliance for every MSME.' },
                    ].map((p, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <CheckCircle size={18} className="flex-shrink-0 mt-1" style={{ color: 'var(--accent)' }} />
                            <div>
                                <h4 className="font-bold text-sm mb-0.5" style={{ color: 'var(--text)' }}>{p.title}</h4>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{p.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══ CTA ═══ */}
            <section className="text-center card p-10 relative overflow-hidden">
                <div className="orb orb-accent" style={{ width: 250, height: 250, top: -80, right: -80, opacity: 0.06 }} />
                <Sparkles size={36} className="mx-auto mb-4" style={{ color: 'var(--accent)' }} />
                <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--text)' }}>Ready to try it?</h2>
                <p className="text-base mb-8 max-w-lg mx-auto" style={{ color: 'var(--text-secondary)' }}>
                    Upload any government policy PDF. Watch 7 AI agents turn it into a personalized compliance plan in under 60 seconds.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link to="/analysis/new" className="btn btn-primary gap-2 px-8 py-3.5 text-base">
                        <Zap size={20} /> Start Your First Analysis
                    </Link>
                    <Link to="/dashboard" className="btn btn-secondary gap-2 px-8 py-3.5 text-base">
                        <BarChart3 size={20} /> View Dashboard
                    </Link>
                </div>
                <p className="text-xs mt-8 flex items-center justify-center gap-1" style={{ color: 'var(--text-tertiary)' }}>
                    Made with <Heart size={12} fill="var(--red)" stroke="none" /> by Team pAIr
                </p>
            </section>
        </div>
    );
}
