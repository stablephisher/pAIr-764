import React, { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGoogle, logOut } from './firebase';
import axios from 'axios';
import {
    Upload, FileText, LogOut, ChevronDown, Languages, X,
    BarChart3, ClipboardList, Menu, Shield, Zap, Moon, Sun,
    User, Settings, HelpCircle, Home, Info, Mail, FileCheck,
    Lock, ExternalLink, ChevronRight, Loader2, Building2,
    CheckCircle, AlertCircle, TrendingUp, Leaf, Scale, Clock,
    ArrowRight, Plus, Trash2, Bell, PieChart, Activity,
    Play, BookOpen, Sparkles, Star, Target, Award, Eye
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ═══════════════════════════════════════
// THEME CONTEXT
// ═══════════════════════════════════════
const ThemeContext = createContext();

export function useTheme() {
    return useContext(ThemeContext);
}

function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('pair-theme');
        return saved || 'light';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('pair-theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

// ═══════════════════════════════════════
// LANGUAGES
// ═══════════════════════════════════════
const LANGUAGES = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    { code: 'mr', name: 'Marathi', native: 'मराठी' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
];

// ═══════════════════════════════════════
// FOOTER COMPONENT
// ═══════════════════════════════════════
function Footer({ onNavigate }) {
    const year = new Date().getFullYear();

    const links = {
        product: [
            { label: 'Features', page: 'features' },
            { label: 'Pricing', page: 'pricing' },
            { label: 'API', page: 'api' },
        ],
        company: [
            { label: 'About', page: 'about' },
            { label: 'Contact', page: 'contact' },
            { label: 'Careers', page: 'careers' },
        ],
        resources: [
            { label: 'FAQ', page: 'faq' },
            { label: 'Documentation', page: 'docs' },
            { label: 'Blog', page: 'blog' },
        ],
        legal: [
            { label: 'Privacy Policy', page: 'privacy' },
            { label: 'Terms of Service', page: 'terms' },
            { label: 'Cookie Policy', page: 'cookies' },
        ],
    };

    return (
        <footer className="footer">
            <div className="container">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
                                <Zap size={16} color="white" />
                            </div>
                            <span className="font-bold text-lg">pAIr</span>
                        </div>
                        <p className="text-sm mb-4" style={{ color: 'var(--text-tertiary)' }}>
                            AI-powered policy compliance for Indian MSMEs.
                        </p>
                    </div>

                    {/* Links */}
                    {Object.entries(links).map(([title, items]) => (
                        <div key={title}>
                            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4" style={{ color: 'var(--text-tertiary)' }}>
                                {title}
                            </h4>
                            <ul className="space-y-2">
                                {items.map(item => (
                                    <li key={item.page}>
                                        <button onClick={() => onNavigate(item.page)}
                                            className="text-sm hover:underline" style={{ color: 'var(--text-secondary)' }}>
                                            {item.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="border-t pt-6 flex flex-col md:flex-row justify-between items-center gap-4" style={{ borderColor: 'var(--border)' }}>
                    <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                        © {year} pAIr. All rights reserved. Built for Code Unnati Innovation Marathon 4.0
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                        Made with ❤️ in India
                    </p>
                </div>
            </div>
        </footer>
    );
}

// ═══════════════════════════════════════
// FAQ ACCORDION COMPONENT
// ═══════════════════════════════════════
function FaqAccordion({ items }) {
    const [openIndex, setOpenIndex] = useState(null);

    return (
        <div className="space-y-3">
            {items.map((item, i) => (
                <div key={i} className="card faq-item animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
                    <div
                        className="faq-header"
                        onClick={() => setOpenIndex(openIndex === i ? null : i)}
                    >
                        <span>{item.q}</span>
                        <ChevronDown size={18} className={`faq-chevron ${openIndex === i ? 'open' : ''}`} />
                    </div>
                    <div className={`faq-body ${openIndex === i ? 'open' : ''}`}>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.a}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ═══════════════════════════════════════
// TUTORIAL OVERLAY (Onboarding for new users)
// ═══════════════════════════════════════
function TutorialOverlay({ onClose }) {
    const [step, setStep] = useState(0);

    const steps = [
        {
            icon: Upload,
            title: 'Upload Policy Documents',
            desc: 'Start by uploading any government policy PDF. Our AI will analyze it instantly — from MSME schemes to environmental regulations.',
            color: 'var(--accent)',
        },
        {
            icon: Target,
            title: 'Get Risk Scores',
            desc: 'Receive comprehensive risk scoring across compliance, sustainability, profitability, and ethical governance dimensions (0–100).',
            color: 'var(--orange)',
        },
        {
            icon: Award,
            title: 'Discover Government Schemes',
            desc: 'Automatically match with eligible schemes like CGTMSE, PMEGP, MUDRA, Stand Up India, and Udyam based on your business profile.',
            color: 'var(--green)',
        },
        {
            icon: BarChart3,
            title: 'Track Analytics',
            desc: 'Monitor your compliance journey with the analytics dashboard — see trends, sector coverage, and sustainability impact over time.',
            color: 'var(--purple)',
        },
    ];

    const currentStep = steps[step];
    const StepIcon = currentStep.icon;

    return (
        <div className="tutorial-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="tutorial-card">
                <div className="p-8 text-center">
                    {/* Step indicator */}
                    <div className="flex items-center justify-center gap-2 mb-6">
                        {steps.map((_, i) => (
                            <div key={i} className="h-1.5 rounded-full transition-all duration-300"
                                style={{
                                    width: i === step ? '24px' : '8px',
                                    background: i === step ? currentStep.color : 'var(--bg-hover)',
                                }} />
                        ))}
                    </div>

                    {/* Icon */}
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-float"
                        style={{ background: `${currentStep.color}20`, color: currentStep.color }}>
                        <StepIcon size={36} />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold mb-3" key={`title-${step}`} style={{ animation: 'fadeInUp 0.4s ease-out' }}>
                        {currentStep.title}
                    </h3>
                    <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)', animation: 'fadeInUp 0.4s ease-out 0.1s both' }}
                        key={`desc-${step}`}>
                        {currentStep.desc}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                        <button onClick={onClose} className="btn btn-ghost text-sm">
                            Skip Tour
                        </button>
                        {step < steps.length - 1 ? (
                            <button onClick={() => setStep(step + 1)} className="btn btn-primary gap-2">
                                Next <ArrowRight size={16} />
                            </button>
                        ) : (
                            <button onClick={onClose} className="btn btn-primary gap-2">
                                <Sparkles size={16} /> Get Started
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════
// STATIC PAGES (About, FAQ, etc.)
// ═══════════════════════════════════════
function StaticPage({ page, onBack, onNavigate }) {
    const { theme, toggleTheme } = useTheme();

    const pages = {
        about: {
            title: 'About pAIr',
            content: (
                <div className="space-y-6">
                    <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                        pAIr (Policy AI Reader) is an AI-powered platform designed to help Indian MSMEs navigate complex government policies and regulations.
                    </p>
                    <div className="grid md:grid-cols-3 gap-6 stagger">
                        {[
                            { icon: Shield, title: 'Compliance Analysis', desc: 'AI-powered extraction of compliance obligations from policy documents' },
                            { icon: TrendingUp, title: 'Risk Scoring', desc: 'Real-time assessment of compliance risks, sustainability, and profitability' },
                            { icon: Zap, title: 'Scheme Matching', desc: 'Automatic matching with relevant government schemes and benefits' },
                        ].map((item, i) => (
                            <div key={i} className="card card-hover p-6 animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                                    <item.icon size={24} />
                                </div>
                                <h4 className="font-semibold mb-2">{item.title}</h4>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                    <div className="card p-6">
                        <h3 className="text-xl font-bold mb-4">Our Mission</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            To democratize access to policy information and make compliance effortless for every MSME in India. We believe that understanding regulations shouldn't require expensive consultants or legal teams.
                        </p>
                    </div>

                    {/* Our Team */}
                    <div className="mt-8">
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <Star size={24} style={{ color: 'var(--accent)' }} /> Our Team
                        </h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 stagger">
                            {[
                                { name: 'Shivanshu Semwal', role: 'Founder & Lead Developer', bio: 'Full-stack developer passionate about using AI to simplify compliance for Indian MSMEs.', initials: 'SS' },
                                { name: 'AI Research Team', role: 'ML & NLP Engineers', bio: 'Building multi-agent AI systems for policy analysis, risk scoring, and scheme matching.', initials: 'AI' },
                                { name: 'Policy Experts', role: 'Domain Specialists', bio: 'Government policy analysts ensuring accuracy of compliance recommendations.', initials: 'PE' },
                                { name: 'Design Team', role: 'UX/UI Design', bio: 'Creating intuitive interfaces that make policy compliance accessible to everyone.', initials: 'DT' },
                            ].map((member, i) => (
                                <div key={i} className="card card-hover p-6 text-center animate-fade-in-up" style={{ animationDelay: `${0.1 + i * 0.1}s` }}>
                                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold text-white"
                                        style={{ background: `linear-gradient(135deg, var(--accent), var(--purple))` }}>
                                        {member.initials}
                                    </div>
                                    <h4 className="font-semibold mb-1">{member.name}</h4>
                                    <p className="text-xs font-medium mb-3" style={{ color: 'var(--accent)' }}>{member.role}</p>
                                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{member.bio}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ),
        },
        features: {
            title: 'Features',
            content: (
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
                        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                            pAIr leverages a multi-agent AI architecture to deliver comprehensive policy intelligence.
                        </p>
                        <button onClick={onBack} className="btn btn-primary gap-2 flex-shrink-0">
                            <Play size={16} /> Try It Free
                        </button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6 stagger">
                        {[
                            { icon: Shield, title: 'Compliance Analysis', desc: 'Upload any government policy PDF and our AI pipeline extracts obligations, deadlines, and penalties — structured for instant action.' },
                            { icon: TrendingUp, title: 'Multi-Dimensional Risk Scoring', desc: 'Get 0–100 risk scores across compliance, sustainability, profitability, and ethical AI governance dimensions.' },
                            { icon: Zap, title: 'Government Scheme Matching', desc: 'Automatically match your MSME profile with eligible schemes like CGTMSE, PMEGP, MUDRA, Stand Up India, and Udyam.' },
                            { icon: Leaf, title: 'Sustainability Engine', desc: 'Track environmental impact: paper saved, CO₂ reduction, SDG alignment, and green scores for your compliance journey.' },
                            { icon: Scale, title: 'Ethical AI Governance', desc: 'Built-in transparency cards, escalation alerts, bias detection, and confidence scoring for every analysis.' },
                            { icon: Languages, title: '15+ Language Support', desc: 'Translate analysis results to Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, and 9 more Indian languages.' },
                        ].map((item, i) => (
                            <div key={i} className="card card-hover p-6 animate-fade-in-up" style={{ animationDelay: `${i * 0.08}s` }}>
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                                    <item.icon size={24} />
                                </div>
                                <h4 className="font-semibold mb-2">{item.title}</h4>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Tutorial Section */}
                    <div className="card p-8 text-center" style={{ background: 'linear-gradient(135deg, var(--accent-light), var(--purple-light))' }}>
                        <Sparkles size={32} className="mx-auto mb-4" style={{ color: 'var(--accent)' }} />
                        <h3 className="text-xl font-bold mb-2">See It In Action</h3>
                        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                            Upload any government policy PDF and get instant compliance insights, risk scores, and scheme recommendations.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={onBack} className="btn btn-primary gap-2">
                                <Play size={16} /> Try It Free →
                            </button>
                        </div>
                    </div>
                </div>
            ),
        },
        pricing: {
            title: 'Pricing',
            content: (
                <div className="space-y-6">
                    <p className="text-lg text-center" style={{ color: 'var(--text-secondary)' }}>
                        Simple, transparent pricing for MSMEs of all sizes.
                    </p>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { plan: 'Free', price: '₹0', period: '/month', features: ['5 policy analyses/month', 'Basic risk scoring', '3 language translations', 'Community support'], cta: 'Get Started' },
                            { plan: 'Pro', price: '₹999', period: '/month', features: ['Unlimited analyses', 'Full scoring suite', 'All 15+ languages', 'Priority support', 'API access'], cta: 'Start Free Trial', highlight: true },
                            { plan: 'Enterprise', price: 'Custom', period: '', features: ['Everything in Pro', 'Custom integrations', 'Dedicated support', 'On-premise option', 'SLA guarantee'], cta: 'Contact Sales' },
                        ].map((item, i) => (
                            <div key={i} className={`card p-6 text-center ${item.highlight ? 'border-2' : ''}`}
                                style={item.highlight ? { borderColor: 'var(--accent)' } : {}}>
                                <h3 className="text-lg font-bold mb-2">{item.plan}</h3>
                                <div className="text-3xl font-bold mb-1">{item.price}<span className="text-base font-normal" style={{ color: 'var(--text-tertiary)' }}>{item.period}</span></div>
                                <ul className="space-y-2 my-6 text-left">
                                    {item.features.map((f, j) => (
                                        <li key={j} className="flex items-center gap-2 text-sm">
                                            <CheckCircle size={14} style={{ color: 'var(--green)' }} />{f}
                                        </li>
                                    ))}
                                </ul>
                                <button className={`btn w-full ${item.highlight ? 'btn-primary' : 'btn-secondary'}`}>{item.cta}</button>
                            </div>
                        ))}
                    </div>
                </div>
            ),
        },
        api: {
            title: 'API Documentation',
            content: (
                <div className="space-y-6">
                    <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                        Integrate pAIr's policy intelligence into your applications with our REST API.
                    </p>
                    <div className="space-y-4">
                        {[
                            { method: 'GET', path: '/api/health', desc: 'Health check and version info' },
                            { method: 'POST', path: '/api/analyze', desc: 'Upload a PDF for full policy analysis with v3 scoring' },
                            { method: 'POST', path: '/api/scoring/risk', desc: 'Standalone compliance risk scoring (0-100)' },
                            { method: 'POST', path: '/api/scoring/sustainability', desc: 'Sustainability and environmental impact scoring' },
                            { method: 'POST', path: '/api/scoring/profitability', desc: 'ROI and profitability optimization' },
                            { method: 'POST', path: '/api/translate', desc: 'Translate analysis results to 15+ Indian languages' },
                            { method: 'GET', path: '/api/history', desc: 'Get analysis history for a user' },
                        ].map((endpoint, i) => (
                            <div key={i} className="card p-5 flex items-start gap-4">
                                <span className={`badge ${endpoint.method === 'GET' ? 'badge-green' : 'badge-accent'}`}>{endpoint.method}</span>
                                <div>
                                    <code className="font-mono text-sm font-semibold">{endpoint.path}</code>
                                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{endpoint.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ),
        },
        careers: {
            title: 'Careers',
            content: (
                <div className="space-y-6">
                    <div className="card p-8 text-center">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                            <Building2 size={28} />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Join Team pAIr</h3>
                        <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                            We're building the future of MSME compliance in India. If you're passionate about AI, policy tech, and empowering small businesses, we'd love to hear from you.
                        </p>
                        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                            Currently, we're a team of 3 participating in Code Unnati Innovation Marathon 4.0. Stay tuned for openings!
                        </p>
                    </div>
                </div>
            ),
        },
        docs: {
            title: 'Documentation',
            content: (
                <div className="space-y-6">
                    <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                        Everything you need to get started with pAIr.
                    </p>
                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            { title: 'Quick Start', desc: 'Clone the repo, set up backend & frontend, and run your first analysis in under 5 minutes.', icon: Zap },
                            { title: 'Architecture', desc: 'Learn about our 7-stage multi-agent pipeline: Ingestion → Reasoning → Planning → Execution → Verification → Explanation → Scoring.', icon: BarChart3 },
                            { title: 'API Reference', desc: 'Complete REST API documentation with request/response examples for all endpoints.', icon: FileCheck },
                            { title: 'Deployment', desc: 'Deploy with Docker, Docker Compose, Google Cloud Run, or Vercel in minutes.', icon: ExternalLink },
                        ].map((item, i) => (
                            <div key={i} className="card p-6 card-hover cursor-pointer" onClick={() => onBack()}>
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                                    <item.icon size={20} />
                                </div>
                                <h4 className="font-semibold mb-1">{item.title}</h4>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ),
        },
        blog: {
            title: 'Blog',
            content: (
                <div className="space-y-6">
                    <div className="card p-8 text-center">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                            <FileText size={28} />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Coming Soon</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            We're working on insightful articles about MSME compliance, government schemes, AI in policy tech, and more. Stay tuned!
                        </p>
                    </div>
                </div>
            ),
        },
        cookies: {
            title: 'Cookie Policy',
            content: (
                <div className="prose max-w-none space-y-6">
                    <p style={{ color: 'var(--text-secondary)' }}>Last updated: February 2026</p>
                    {[
                        { title: '1. What Are Cookies', text: 'Cookies are small text files stored on your device when you visit a website. They help us provide a better user experience by remembering your preferences and login sessions.' },
                        { title: '2. How We Use Cookies', text: 'We use essential cookies for authentication (Firebase Auth), theme preferences (light/dark mode), and language settings. We do not use advertising or tracking cookies.' },
                        { title: '3. Managing Cookies', text: 'You can control cookies through your browser settings. Disabling essential cookies may affect the functionality of pAIr, particularly authentication features.' },
                        { title: '4. Third-Party Cookies', text: 'Firebase Authentication may set cookies for session management. These are governed by Google\'s privacy policy.' },
                    ].map((section, i) => (
                        <div key={i} className="card p-6">
                            <h4 className="font-semibold mb-2">{section.title}</h4>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{section.text}</p>
                        </div>
                    ))}
                </div>
            ),
        },
        faq: {
            title: 'Frequently Asked Questions',
            content: (
                <FaqAccordion items={[
                    { q: 'What is pAIr?', a: 'pAIr is an AI-powered platform that analyzes government policy documents and provides compliance guidance, risk scores, and scheme matching for Indian MSMEs.' },
                    { q: 'How does the analysis work?', a: 'Upload a PDF of a government policy. Our AI extracts key compliance obligations, calculates risk scores across multiple dimensions (compliance, sustainability, profitability, ethics), and matches you with relevant government schemes.' },
                    { q: 'What languages are supported?', a: 'We support 10 Indian languages including Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, and Punjabi. Translation is processed instantly.' },
                    { q: 'Is my data secure?', a: 'Yes. We use industry-standard encryption and your documents are processed securely. We do not store or share your business information with third parties.' },
                    { q: 'How accurate is the AI analysis?', a: 'Our AI is trained on thousands of Indian policy documents and achieves high accuracy. However, we recommend verifying critical compliance decisions with qualified professionals.' },
                    { q: 'What types of policies can I analyze?', a: 'Any government policy document in PDF format - MSME schemes, environmental regulations, labor laws, tax policies, industry-specific guidelines, and more.' },
                    { q: 'Is there a limit on document uploads?', a: 'Free users can analyze up to 5 documents per month. Premium plans offer unlimited analysis.' },
                    { q: 'Can I export the analysis results?', a: 'Yes, you can export analysis results as PDF reports or share them directly with your team.' },
                ]} />
            ),
        },
        contact: {
            title: 'Contact Us',
            content: (
                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4">Get in Touch</h3>
                        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                            Have questions or feedback? We'd love to hear from you.
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                                    <Mail size={18} />
                                </div>
                                <div>
                                    <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Email</p>
                                    <a href="mailto:contact@pair.ai" className="font-medium">contact@pair.ai</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="card p-6">
                        <h4 className="font-semibold mb-4">Send a Message</h4>
                        <form className="space-y-4" onSubmit={e => { e.preventDefault(); alert('Message sent! (Demo)'); }}>
                            <input type="text" placeholder="Your Name" className="input" required />
                            <input type="email" placeholder="Your Email" className="input" required />
                            <textarea placeholder="Your Message" rows={4} className="input" style={{ resize: 'none' }} required />
                            <button type="submit" className="btn btn-primary w-full">Send Message</button>
                        </form>
                    </div>
                </div>
            ),
        },
        privacy: {
            title: 'Privacy Policy',
            content: (
                <div className="prose max-w-none space-y-6">
                    <p style={{ color: 'var(--text-secondary)' }}>Last updated: February 2026</p>
                    {[
                        { title: '1. Information We Collect', text: 'We collect information you provide directly, including your Google account information when you sign in, business profile data you enter during onboarding, and documents you upload for analysis.' },
                        { title: '2. How We Use Your Information', text: 'We use your information to provide and improve our services, analyze policy documents, generate compliance reports, and communicate with you about your account.' },
                        { title: '3. Data Security', text: 'We implement industry-standard security measures to protect your data, including encryption in transit and at rest, secure cloud infrastructure, and regular security audits.' },
                        { title: '4. Data Retention', text: 'We retain your data only as long as necessary to provide our services. You can request deletion of your data at any time.' },
                        { title: '5. Third-Party Services', text: 'We use Google Cloud services for authentication and AI processing. Your data is processed in accordance with their privacy policies.' },
                    ].map((section, i) => (
                        <div key={i} className="card p-6">
                            <h4 className="font-semibold mb-2">{section.title}</h4>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{section.text}</p>
                        </div>
                    ))}
                </div>
            ),
        },
        terms: {
            title: 'Terms of Service',
            content: (
                <div className="prose max-w-none space-y-6">
                    <p style={{ color: 'var(--text-secondary)' }}>Last updated: February 2026</p>
                    {[
                        { title: '1. Acceptance of Terms', text: 'By accessing or using pAIr, you agree to be bound by these Terms of Service and all applicable laws and regulations.' },
                        { title: '2. Use of Service', text: 'You may use pAIr for lawful purposes only. You are responsible for maintaining the confidentiality of your account credentials.' },
                        { title: '3. AI-Generated Content', text: 'Analysis results are generated by AI and should be used as guidance only. We recommend verifying critical compliance decisions with qualified professionals.' },
                        { title: '4. Limitation of Liability', text: 'pAIr is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the service.' },
                        { title: '5. Changes to Terms', text: 'We may modify these terms at any time. Continued use of the service constitutes acceptance of modified terms.' },
                    ].map((section, i) => (
                        <div key={i} className="card p-6">
                            <h4 className="font-semibold mb-2">{section.title}</h4>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{section.text}</p>
                        </div>
                    ))}
                </div>
            ),
        },
    };

    const pageData = pages[page] || { title: 'Page Not Found', content: <p>The requested page could not be found.</p> };

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
            {/* Header */}
            <header className="topbar justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="btn btn-ghost btn-icon" title="Go back">
                        <ArrowRight size={18} style={{ transform: 'rotate(180deg)' }} />
                    </button>
                    <button onClick={onBack} className="flex items-center gap-2 font-semibold">
                        <Zap size={20} style={{ color: 'var(--accent)' }} />
                        <span>pAIr</span>
                    </button>
                </div>
                <button onClick={toggleTheme} className="btn btn-ghost btn-icon">
                    {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </button>
            </header>

            {/* Content */}
            <main className="container py-12 animate-fade-in-up">
                <h1 className="text-3xl font-bold mb-8">{pageData.title}</h1>
                {pageData.content}
            </main>

            <Footer onNavigate={onNavigate} />
        </div>
    );
}

// ═══════════════════════════════════════
// LOGIN PAGE
// ═══════════════════════════════════════
function LoginPage({ onNavigate }) {
    const { theme, toggleTheme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const login = async () => {
        setLoading(true);
        setError('');
        try {
            await signInWithGoogle();
        } catch (e) {
            setError(e.message || 'Sign-in failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
            {/* Header */}
            <header className="topbar justify-between">
                <div className="flex items-center gap-2">
                    <Zap size={20} style={{ color: 'var(--accent)' }} />
                    <span className="font-bold">pAIr</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={toggleTheme} className="btn btn-ghost btn-icon" aria-label="Toggle theme">
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    </button>
                    <button onClick={() => onNavigate('faq')} className="btn btn-ghost">
                        <HelpCircle size={16} /> FAQ
                    </button>
                </div>
            </header>

            {/* Hero */}
            <main className="flex-1 flex items-center justify-center px-4">
                <div className="max-w-lg w-full animate-fade-in-up">
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-float"
                            style={{ background: 'linear-gradient(135deg, var(--accent), var(--purple))', boxShadow: 'var(--glow)' }}>
                            <Shield size={36} color="white" />
                        </div>
                        <h1 className="text-4xl font-bold mb-3">Welcome to pAIr</h1>
                        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                            AI-powered policy compliance for Indian MSMEs
                        </p>
                    </div>

                    <div className="card card-elevated p-8 animate-fade-in-scale" style={{ animationDelay: '0.1s' }}>
                        <button onClick={login} disabled={loading}
                            className="btn w-full py-4 justify-center gap-3 text-base font-medium"
                            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                            {loading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                            )}
                            {loading ? 'Signing in...' : 'Continue with Google'}
                        </button>

                        {error && (
                            <div className="mt-4 p-3 rounded-lg flex items-center gap-2" style={{ background: 'var(--red-light)' }}>
                                <AlertCircle size={16} style={{ color: 'var(--red)' }} />
                                <p className="text-sm" style={{ color: 'var(--red)' }}>{error}</p>
                            </div>
                        )}

                        <p className="text-xs text-center mt-6" style={{ color: 'var(--text-tertiary)' }}>
                            By continuing, you agree to our{' '}
                            <button onClick={() => onNavigate('terms')} className="underline">Terms</button>
                            {' '}and{' '}
                            <button onClick={() => onNavigate('privacy')} className="underline">Privacy Policy</button>
                        </p>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-3 gap-4 mt-8 stagger">
                        {[
                            { icon: Shield, label: 'Compliance' },
                            { icon: TrendingUp, label: 'Risk Scores' },
                            { icon: Zap, label: 'Scheme Match' },
                        ].map((f, i) => (
                            <div key={i} className="text-center p-4 animate-fade-in-up" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2"
                                    style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                                    <f.icon size={20} />
                                </div>
                                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{f.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <Footer onNavigate={onNavigate} />
        </div>
    );
}

// ═══════════════════════════════════════
// PROFILE SETUP (After first login)
// ═══════════════════════════════════════
function ProfileSetup({ user, onComplete, existingProfile, onCancel }) {
    const { theme, toggleTheme } = useTheme();
    const isEditing = !!existingProfile;
    const [step, setStep] = useState(0);
    const [profile, setProfile] = useState({
        business_name: existingProfile?.business_name || '',
        business_type: existingProfile?.business_type || '',
        sector: existingProfile?.sector || '',
        employees: existingProfile?.employees || '',
        revenue: existingProfile?.revenue || '',
        location: existingProfile?.location || '',
        business_description: existingProfile?.business_description || '',
        products_services: existingProfile?.products_services || '',
        compliance_concerns: existingProfile?.compliance_concerns || '',
        years_in_business: existingProfile?.years_in_business || '',
    });
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.post(`${API}/api/profile/${user.uid}`, profile);
            localStorage.setItem(`pair-profile-${user.uid}`, JSON.stringify(profile));
            onComplete(profile);
        } catch (e) {
            console.error('Profile save error:', e);
            localStorage.setItem(`pair-profile-${user.uid}`, JSON.stringify(profile));
            onComplete(profile);
        }
    };

    const steps = [
        { field: 'business_name', title: "What's your business name?", type: 'text', placeholder: 'e.g., Sharma Textiles Pvt. Ltd.' },
        { field: 'business_type', title: 'What type of business do you operate?', options: ['Manufacturing', 'Service', 'Trading', 'Technology', 'Handicraft', 'Food Processing'] },
        { field: 'sector', title: 'Which sector best describes your business?', options: ['Textiles', 'IT/Software', 'Food & Beverage', 'Healthcare', 'Retail', 'Education', 'Construction', 'Other'] },
        { field: 'employees', title: 'How many employees do you have?', options: ['1-10', '11-50', '51-200', '201-500', '500+'] },
        { field: 'revenue', title: "What's your annual revenue?", options: ['Less than ₹1 Cr', '₹1-5 Crore', '₹5-10 Crore', '₹10-50 Crore', 'More than ₹50 Cr'] },
        { field: 'location', title: 'Where is your business located?', type: 'text', placeholder: 'e.g., Mumbai, Maharashtra' },
        { field: 'years_in_business', title: 'How long have you been in business?', options: ['Less than 1 year', '1-3 years', '3-5 years', '5-10 years', '10+ years'] },
        { field: 'business_description', title: 'Describe your business in a few lines', type: 'textarea', placeholder: 'What does your business do? Tell us about your operations...' },
        { field: 'products_services', title: 'What products/services do you offer?', type: 'text', placeholder: 'e.g., Cotton textiles, IT consulting, Food delivery' },
        { field: 'compliance_concerns', title: 'What compliance areas concern you most?', type: 'textarea', placeholder: 'e.g., GST compliance, environmental regulations, labor laws...' },
    ];

    // EDITING MODE: Single-form view
    if (isEditing) {
        const canSave = profile.business_name?.trim() && profile.business_type?.trim();
        return (
            <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
                <header className="topbar justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={onCancel} className="btn btn-ghost btn-icon" title="Go back">
                            <ArrowRight size={18} style={{ transform: 'rotate(180deg)' }} />
                        </button>
                        <div className="flex items-center gap-2">
                            <Zap size={20} style={{ color: 'var(--accent)' }} />
                            <span className="font-bold">pAIr</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={toggleTheme} className="btn btn-ghost btn-icon">
                            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                        </button>
                        <div className="flex items-center gap-2">
                            <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />
                            <span className="text-sm font-medium hidden sm:block">{user.displayName?.split(' ')[0]}</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto px-4 py-8">
                    <div className="max-w-2xl mx-auto animate-fade-in-up">
                        <div className="text-center mb-8">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                                style={{ background: 'var(--accent)', color: 'white' }}>
                                <Settings size={24} />
                            </div>
                            <h1 className="text-2xl font-bold mb-2">Edit Business Profile</h1>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                Update your details to improve AI recommendations
                            </p>
                        </div>

                        <div className="space-y-6">
                            {steps.map((field, i) => (
                                <div key={field.field} className="card p-6 animate-fade-in-up" style={{ animationDelay: `${i * 0.04}s` }}>
                                    <label className="block font-semibold mb-3 text-sm">{field.title}</label>
                                    {field.type === 'text' ? (
                                        <input type="text" value={profile[field.field]}
                                            onChange={e => setProfile({ ...profile, [field.field]: e.target.value })}
                                            placeholder={field.placeholder} className="input" />
                                    ) : field.type === 'textarea' ? (
                                        <textarea value={profile[field.field]}
                                            onChange={e => setProfile({ ...profile, [field.field]: e.target.value })}
                                            placeholder={field.placeholder} rows={3} className="input" style={{ resize: 'none' }} />
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {field.options.map(opt => (
                                                <button key={opt}
                                                    onClick={() => setProfile({ ...profile, [field.field]: opt })}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${profile[field.field] === opt
                                                        ? 'text-white shadow-md' : ''}`}
                                                    style={profile[field.field] === opt
                                                        ? { background: 'var(--accent)' }
                                                        : { background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between mt-8 mb-12">
                            <button onClick={onCancel} className="btn btn-ghost">Cancel</button>
                            <button onClick={handleSave} disabled={!canSave || saving} className="btn btn-primary gap-2">
                                {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><CheckCircle size={16} /> Save Changes</>}
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // NEW USER MODE: Step-by-step wizard
    const currentStep = steps[step];
    const progress = ((step + 1) / steps.length) * 100;
    const isLastStep = step === steps.length - 1;
    const canProceed = profile[currentStep.field]?.trim();

    const handleNext = async () => {
        if (isLastStep) {
            await handleSave();
        } else {
            setStep(step + 1);
        }
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
            {/* Header */}
            <header className="topbar justify-between">
                <div className="flex items-center gap-2">
                    <Zap size={20} style={{ color: 'var(--accent)' }} />
                    <span className="font-bold">pAIr</span>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={toggleTheme} className="btn btn-ghost btn-icon">
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    </button>
                    <div className="flex items-center gap-2">
                        <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />
                        <span className="text-sm font-medium hidden sm:block">{user.displayName?.split(' ')[0]}</span>
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="max-w-lg w-full animate-fade-in-up">
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                            style={{ background: 'var(--accent)', color: 'white' }}>
                            <Building2 size={24} />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Set up your profile</h1>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            Step {step + 1} of {steps.length} • Personalized recommendations
                        </p>
                    </div>

                    {/* Progress */}
                    <div className="h-1.5 rounded-full mb-8 overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                        <div className="h-full rounded-full progress-animated transition-all duration-500"
                            style={{ width: `${progress}%` }} />
                    </div>

                    {/* Question */}
                    <div className="card p-8">
                        <h2 className="text-lg font-semibold mb-6">{currentStep.title}</h2>

                        {currentStep.type === 'text' ? (
                            <input type="text" value={profile[currentStep.field]}
                                onChange={e => setProfile({ ...profile, [currentStep.field]: e.target.value })}
                                placeholder={currentStep.placeholder} className="input" autoFocus
                                onKeyDown={e => e.key === 'Enter' && canProceed && handleNext()} />
                        ) : currentStep.type === 'textarea' ? (
                            <textarea value={profile[currentStep.field]}
                                onChange={e => setProfile({ ...profile, [currentStep.field]: e.target.value })}
                                placeholder={currentStep.placeholder} rows={4} className="input" style={{ resize: 'none' }} autoFocus />
                        ) : (
                            <div className="radio-group">
                                {currentStep.options.map(opt => (
                                    <div key={opt}
                                        onClick={() => setProfile({ ...profile, [currentStep.field]: opt })}
                                        className={`radio-option ${profile[currentStep.field] === opt ? 'selected' : ''}`}>
                                        <div className="radio-circle">
                                            {profile[currentStep.field] === opt && <div className="radio-dot" />}
                                        </div>
                                        <span className="font-medium">{opt}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-6">
                        {step > 0 ? (
                            <button onClick={() => setStep(step - 1)} className="btn btn-ghost">Back</button>
                        ) : (
                            <div />
                        )}
                        <button onClick={handleNext} disabled={!canProceed || saving} className="btn btn-primary">
                            {saving ? (
                                <><Loader2 size={16} className="animate-spin" /> Saving...</>
                            ) : isLastStep ? (
                                <>Complete Setup</>
                            ) : (
                                <>Continue <ArrowRight size={16} /></>
                            )}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

// ═══════════════════════════════════════
// SIDEBAR
// ═══════════════════════════════════════
function Sidebar({ history, activeId, onSelect, onDelete, collapsed }) {
    return (
        <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
            <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    Analysis History
                </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
                {history.length === 0 ? (
                    <div className="text-center py-16 px-4">
                        <FileText size={32} style={{ color: 'var(--text-tertiary)' }} className="mx-auto mb-3" />
                        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No analyses yet</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {history.map(item => (
                            <div key={item.id}
                                onClick={() => onSelect(item.id)}
                                className={`p-3 rounded-lg cursor-pointer group transition-all flex items-start gap-3 relative ${activeId === item.id ? 'active' : ''}`}
                                style={{
                                    background: activeId === item.id ? 'var(--accent-light)' : 'transparent',
                                    color: activeId === item.id ? 'var(--accent)' : 'inherit'
                                }}>
                                <FileText size={16} className="flex-shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{item.policy_name || item.policy_metadata?.policy_name || 'Policy'}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="badge badge-gray text-[10px]">
                                            {item.source === 'auto' ? 'AUTO' : 'UPLOAD'}
                                        </span>
                                    </div>
                                </div>
                                <button onClick={(e) => onDelete(item.id, e)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded"
                                    style={{ color: 'var(--red)' }}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </aside>
    );
}

// ═══════════════════════════════════════
// PROCESSING VIEW
// ═══════════════════════════════════════
function ProcessingView({ onCancel }) {
    const [step, setStep] = useState(0);
    const [elapsed, setElapsed] = useState(0);

    const steps = [
        { icon: FileText, label: 'Reading document...', duration: 2 },
        { icon: Zap, label: 'Extracting obligations...', duration: 3 },
        { icon: TrendingUp, label: 'Calculating risk scores...', duration: 2 },
        { icon: Shield, label: 'Matching schemes...', duration: 2 },
        { icon: CheckCircle, label: 'Generating report...', duration: 1 },
    ];

    useEffect(() => {
        const stepTimer = setInterval(() => {
            setStep(s => s < steps.length - 1 ? s + 1 : s);
        }, 2000);

        const elapsedTimer = setInterval(() => {
            setElapsed(e => e + 1);
        }, 1000);

        return () => {
            clearInterval(stepTimer);
            clearInterval(elapsedTimer);
        };
    }, []);

    return (
        <div className="max-w-xl mx-auto text-center py-16 animate-fade-in-up">
            <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse-glow"
                style={{ background: 'linear-gradient(135deg, var(--accent), var(--purple))' }}>
                <Loader2 size={40} color="white" className="animate-spin" />
            </div>

            <h2 className="text-2xl font-bold mb-2">Analyzing your document</h2>
            <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
                {elapsed}s • This usually takes 10-20 seconds
            </p>

            {/* Progress bar */}
            <div className="h-2 rounded-full mb-8 overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                <div className="h-full rounded-full progress-animated transition-all duration-700"
                    style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
            </div>

            {/* Steps */}
            <div className="space-y-3 text-left max-w-sm mx-auto">
                {steps.map((s, i) => {
                    const isDone = i < step;
                    const isCurrent = i === step;
                    const Icon = s.icon;

                    return (
                        <div key={i} className={`p-4 rounded-xl flex items-center gap-4 transition-all ${isCurrent ? 'animate-fade-in-scale' : ''}`}
                            style={{
                                background: isCurrent ? 'var(--accent-light)' : isDone ? 'var(--green-light)' : 'var(--bg-secondary)',
                                opacity: !isDone && !isCurrent ? 0.5 : 1
                            }}>
                            <Icon size={20} style={{ color: isDone ? 'var(--green)' : isCurrent ? 'var(--accent)' : 'var(--text-tertiary)' }} />
                            <span className="flex-1 text-sm font-medium">{s.label}</span>
                            {isDone && <CheckCircle size={16} style={{ color: 'var(--green)' }} />}
                        </div>
                    );
                })}
            </div>

            <button onClick={onCancel} className="btn btn-ghost mt-8">
                Cancel
            </button>
        </div>
    );
}

// ═══════════════════════════════════════
// UPLOAD VIEW
// ═══════════════════════════════════════
function UploadView({ onAnalyze, onShowOnboarding }) {
    const [file, setFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [error, setError] = useState(null);

    const handleFile = (f) => {
        if (f?.type === 'application/pdf') {
            setFile(f);
            setError(null);
        } else {
            setError('Please select a valid PDF file');
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        handleFile(e.dataTransfer.files[0]);
    };

    return (
        <div className="max-w-2xl mx-auto py-12 animate-fade-in-up">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-3">Upload a Policy Document</h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Get instant compliance analysis, risk scores, and scheme recommendations
                </p>
            </div>

            <div className={`upload-zone ${dragging ? 'dragging' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}>
                <input type="file" id="file" accept=".pdf" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
                <label htmlFor="file" className="cursor-pointer">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce"
                        style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                        <Upload size={28} />
                    </div>
                    <p className="font-medium mb-1">Click to upload or drag and drop</p>
                    <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>PDF files only (max 10MB)</p>
                </label>
            </div>

            {file && (
                <div className="card p-4 mt-4 flex items-center justify-between animate-fade-in-scale">
                    <div className="flex items-center gap-3">
                        <FileText size={20} style={{ color: 'var(--accent)' }} />
                        <span className="font-medium truncate">{file.name}</span>
                        <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                    </div>
                    <button onClick={() => setFile(null)} className="btn btn-ghost btn-icon">
                        <X size={16} />
                    </button>
                </div>
            )}

            {error && (
                <div className="mt-4 p-4 rounded-xl flex items-center gap-3" style={{ background: 'var(--red-light)' }}>
                    <AlertCircle size={18} style={{ color: 'var(--red)' }} />
                    <p className="text-sm" style={{ color: 'var(--red)' }}>{error}</p>
                </div>
            )}

            {file && !error && (
                <button onClick={() => onAnalyze(file)} className="btn btn-primary w-full mt-6 py-4 text-base">
                    <Zap size={18} /> Analyze Document
                </button>
            )}

            <div className="text-center mt-8">
                <button onClick={onShowOnboarding} className="text-sm hover:underline" style={{ color: 'var(--text-secondary)' }}>
                    Update business profile →
                </button>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════
// RESULTS VIEW
// ═══════════════════════════════════════
function ResultsView({ data, language }) {
    const [tab, setTab] = useState('overview');

    // Backend returns flat structure — map to display format
    const policyMeta = data.policy_metadata || {};
    const riskData = data.risk_score || {};
    const susData = data.sustainability || {};
    const profData = data.profitability || {};
    const ethicsData = data.ethics || {};

    const scores = {
        risk_score: riskData.overall_score || 0,
        sustainability_score: susData.green_score || 0,
        profitability_score: Math.min(100, Math.round((profData.roi_multiplier || 0) * 10)),
        ethics_score: ethicsData.overall_score || 0,
    };

    const obligations = data.compliance_obligations || [];
    const compliancePlan = data.compliance_plan || {};
    const riskAssessment = data.risk_assessment || {};

    // Score ring component
    const ScoreRing = ({ value, label, color }) => {
        const circumference = 2 * Math.PI * 40;
        const offset = circumference - (value / 100) * circumference;

        return (
            <div className="text-center">
                <div className="score-ring mx-auto mb-3">
                    <svg width="120" height="120" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="var(--bg-tertiary)" strokeWidth="8" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
                            strokeDasharray={circumference} strokeDashoffset={offset} className="progress" />
                    </svg>
                    <span className="score-value" style={{ color }}>{value}</span>
                </div>
                <p className="text-sm font-medium">{label}</p>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header */}
            <div className="card p-6 flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                    <FileText size={28} />
                </div>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">{data.policy_name || policyMeta.policy_name || 'Policy Analysis'}</h2>
                    <div className="flex flex-wrap gap-2">
                        {policyMeta.geographical_scope && <span className="badge badge-gray">{policyMeta.geographical_scope}</span>}
                        {policyMeta.policy_type && <span className="badge badge-accent">{policyMeta.policy_type}</span>}
                        {policyMeta.issuing_authority && <span className="badge badge-green">{policyMeta.issuing_authority}</span>}
                    </div>
                </div>
            </div>

            {/* Scores */}
            <div className="card p-6">
                <h3 className="font-semibold mb-6">Analysis Scores</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <ScoreRing value={scores.risk_score || 0} label="Risk Score"
                        color={scores.risk_score > 70 ? 'var(--red)' : scores.risk_score > 40 ? 'var(--orange)' : 'var(--green)'} />
                    <ScoreRing value={scores.sustainability_score || 0} label="Sustainability" color="var(--green)" />
                    <ScoreRing value={scores.profitability_score || 0} label="Profitability" color="var(--accent)" />
                    <ScoreRing value={scores.ethics_score || 0} label="Ethics" color="var(--purple)" />
                </div>
            </div>

            {/* Tabs */}
            <div className="card overflow-hidden">
                <div className="tabs">
                    {['overview', 'obligations', 'actions'].map(t => (
                        <button key={t} onClick={() => setTab(t)} className={`tab ${tab === t ? 'active' : ''}`}>
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                            {t === 'obligations' && obligations.length > 0 && ` (${obligations.length})`}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {tab === 'overview' && (
                        <div className="space-y-6">
                            {/* Who is affected */}
                            {data.applicability?.who_is_affected && (
                                <div>
                                    <h4 className="font-semibold mb-3">Who Is Affected</h4>
                                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{data.applicability.who_is_affected}</p>
                                </div>
                            )}

                            {/* Risk Assessment */}
                            {riskAssessment.overall_risk_level && (
                                <div>
                                    <h4 className="font-semibold mb-3">Risk Assessment</h4>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`badge badge-${riskAssessment.overall_risk_level === 'HIGH' ? 'red' : riskAssessment.overall_risk_level === 'MEDIUM' ? 'orange' : 'green'}`}>
                                            {riskAssessment.overall_risk_level}
                                        </span>
                                    </div>
                                    {riskAssessment.risk_factors?.length > 0 && (
                                        <ul className="list-disc list-inside space-y-1">
                                            {riskAssessment.risk_factors.map((f, i) => (
                                                <li key={i} className="text-sm" style={{ color: 'var(--text-secondary)' }}>{f}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}

                            {/* Top Risks from scoring */}
                            {riskData.top_risks?.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-3">Top Compliance Risks</h4>
                                    <div className="space-y-3">
                                        {riskData.top_risks.map((r, i) => (
                                            <div key={i} className="p-4 rounded-xl flex items-start gap-3" style={{ background: 'var(--bg-secondary)' }}>
                                                <AlertCircle size={18} style={{ color: 'var(--orange)' }} className="flex-shrink-0 mt-0.5" />
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">{r.name}</p>
                                                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{r.hint}</p>
                                                    <div className="flex gap-2 mt-2">
                                                        <span className={`badge badge-${r.band === 'CRITICAL' ? 'red' : r.band === 'HIGH' ? 'orange' : 'green'}`}>{r.band}</span>
                                                        {r.days_remaining != null && <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{r.days_remaining} days remaining</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Sustainability */}
                            {susData.green_score > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-3">Sustainability Impact</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {[
                                            { label: 'Green Score', value: susData.green_score, suffix: '/100' },
                                            { label: 'Grade', value: susData.grade },
                                            { label: 'Paper Saved', value: `${susData.paper_saved || 0} pages` },
                                            { label: 'CO₂ Saved', value: `${(susData.co2_saved_kg || 0).toFixed(1)} kg` },
                                        ].map((item, i) => (
                                            <div key={i} className="p-3 rounded-lg text-center" style={{ background: 'var(--bg-secondary)' }}>
                                                <p className="text-lg font-bold" style={{ color: 'var(--green)' }}>{item.value}{item.suffix || ''}</p>
                                                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{item.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                    {susData.narrative && <p className="text-sm mt-3" style={{ color: 'var(--text-secondary)' }}>{susData.narrative}</p>}
                                </div>
                            )}

                            {/* Matched Schemes */}
                            {data.matched_schemes?.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-3">Matched Government Schemes</h4>
                                    <div className="space-y-3">
                                        {data.matched_schemes.map((s, i) => (
                                            <div key={i} className="p-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                                                <p className="font-medium">{s.name || s}</p>
                                                {s.description && <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{s.description}</p>}
                                                {s.eligibility && <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Eligibility: {s.eligibility}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {tab === 'obligations' && (
                        <div className="space-y-4">
                            {obligations.length === 0 ? (
                                <div className="text-center py-12">
                                    <CheckCircle size={48} style={{ color: 'var(--text-tertiary)' }} className="mx-auto mb-3" />
                                    <p style={{ color: 'var(--text-secondary)' }}>No compliance obligations found</p>
                                </div>
                            ) : (
                                obligations.map((obl, i) => (
                                    <div key={i} className="card p-5 flex items-start gap-4">
                                        <CheckCircle size={20} style={{ color: 'var(--accent)' }} className="flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="font-medium mb-2">{obl.description || obl.text}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {obl.severity && (
                                                    <span className={`badge badge-${obl.severity === 'high' ? 'red' : obl.severity === 'medium' ? 'orange' : 'green'}`}>
                                                        {obl.severity}
                                                    </span>
                                                )}
                                                {obl.deadline && (
                                                    <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                                        <Clock size={12} /> {obl.deadline}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {tab === 'actions' && (
                        <div className="space-y-6">
                            {/* Immediate Actions */}
                            {compliancePlan.immediate_actions?.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                        <Zap size={16} style={{ color: 'var(--orange)' }} /> Immediate Actions
                                    </h4>
                                    {compliancePlan.immediate_actions.map((action, i) => (
                                        <div key={i} className="p-4 rounded-xl flex items-start gap-3 mb-2" style={{ background: 'var(--orange-light)' }}>
                                            <CheckCircle size={18} style={{ color: 'var(--orange)' }} className="flex-shrink-0 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">{action.action || action}</p>
                                                {action.deadline && <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Deadline: {action.deadline}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Short Term */}
                            {compliancePlan.short_term?.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                        <Clock size={16} style={{ color: 'var(--accent)' }} /> Short Term
                                    </h4>
                                    {compliancePlan.short_term.map((action, i) => (
                                        <div key={i} className="p-4 rounded-xl flex items-start gap-3 mb-2" style={{ background: 'var(--bg-secondary)' }}>
                                            <ArrowRight size={18} style={{ color: 'var(--accent)' }} className="flex-shrink-0 mt-0.5" />
                                            <p className="text-sm">{action.action || action}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Long Term */}
                            {compliancePlan.long_term?.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                        <TrendingUp size={16} style={{ color: 'var(--green)' }} /> Long Term
                                    </h4>
                                    {compliancePlan.long_term.map((action, i) => (
                                        <div key={i} className="p-4 rounded-xl flex items-start gap-3 mb-2" style={{ background: 'var(--green-light)' }}>
                                            <ArrowRight size={18} style={{ color: 'var(--green)' }} className="flex-shrink-0 mt-0.5" />
                                            <p className="text-sm">{action.action || action}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Fallback if no actions */}
                            {!compliancePlan.immediate_actions?.length && !compliancePlan.short_term?.length && !compliancePlan.long_term?.length && (
                                <div className="text-center py-12">
                                    <p style={{ color: 'var(--text-secondary)' }}>No specific actions identified</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════
function MainApp({ user, profile, onLogout, onNavigate, onUpdateProfile, onShowTutorial }) {
    const { theme, toggleTheme } = useTheme();
    const [state, setState] = useState('IDLE'); // IDLE | PROCESSING | SUCCESS | ERROR | ANALYTICS
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [language, setLanguage] = useState(LANGUAGES[0]);
    const [langDropdown, setLangDropdown] = useState(false);
    const [userDropdown, setUserDropdown] = useState(false);

    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState([]);
    const [activeId, setActiveId] = useState(null);

    // Notification state
    const [notifications, setNotifications] = useState([]);
    const [notifDropdown, setNotifDropdown] = useState(false);
    const unreadCount = notifications.filter(n => !n.read).length;

    // Analytics state
    const [analytics, setAnalytics] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);

    useEffect(() => {
        loadHistory();
        loadNotifications();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, [user]);

    const loadNotifications = async () => {
        try {
            const res = await axios.get(`${API}/api/notifications?user_uid=${user.uid}`);
            setNotifications(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            console.error('Load notifications error:', e);
        }
    };

    const markNotifRead = async (notifId) => {
        try {
            await axios.post(`${API}/api/notifications/${notifId}/read?user_uid=${user.uid}`);
            setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
        } catch (e) { console.error('Mark read error:', e); }
    };

    const markAllRead = async () => {
        try {
            await axios.post(`${API}/api/notifications/read-all?user_uid=${user.uid}`);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (e) { console.error('Mark all read error:', e); }
    };

    const loadAnalytics = async () => {
        setAnalyticsLoading(true);
        try {
            const res = await axios.get(`${API}/api/analytics/${user.uid}`);
            setAnalytics(res.data);
        } catch (e) {
            console.error('Load analytics error:', e);
        }
        setAnalyticsLoading(false);
    };

    const showAnalytics = () => {
        setState('ANALYTICS');
        setResult(null);
        setActiveId(null);
        loadAnalytics();
    };

    const loadHistory = async () => {
        try {
            const res = await axios.get(`${API}/api/history?user_uid=${user.uid}`);
            // Backend returns an array directly
            const data = Array.isArray(res.data) ? res.data : (res.data.analyses || []);
            setHistory(data);
        } catch (e) {
            console.error('Load history error:', e);
        }
    };

    const analyze = async (file) => {
        setState('PROCESSING');
        setError(null);

        const fd = new FormData();
        fd.append('file', file);
        fd.append('user_uid', user.uid);
        fd.append('language', language.code);

        try {
            const res = await axios.post(`${API}/api/analyze`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResult(res.data);
            setState('SUCCESS');
            loadHistory();
        } catch (e) {
            console.error('Analysis error:', e);
            setError(e.response?.data?.detail || 'Analysis failed. Please try again.');
            setState('ERROR');
        }
    };

    const loadAnalysis = (id) => {
        setActiveId(id);
        // Find analysis from cached history instead of calling a non-existent endpoint
        const found = history.find(item => item.id === id);
        if (found) {
            setResult(found);
            setState('SUCCESS');
        } else {
            setError('Analysis not found in history');
            setState('ERROR');
        }
    };

    const deleteAnalysis = async (id, e) => {
        e.stopPropagation();
        if (!confirm('Delete this analysis?')) return;
        try {
            await axios.delete(`${API}/api/history/${id}?user_uid=${user.uid}`);
            setHistory(h => h.filter(item => item.id !== id));
            if (activeId === id) {
                setState('IDLE');
                setResult(null);
            }
        } catch (e) {
            console.error('Delete error:', e);
        }
    };

    const newAnalysis = () => {
        setState('IDLE');
        setResult(null);
        setError(null);
        setActiveId(null);
    };

    return (
        <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
            {/* Sidebar */}
            <Sidebar
                history={history}
                activeId={activeId}
                onSelect={loadAnalysis}
                onDelete={deleteAnalysis}
                collapsed={!sidebarOpen}
            />

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar */}
                <header className="topbar justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="btn btn-ghost btn-icon">
                            <Menu size={20} />
                        </button>
                        <div className="flex items-center gap-2">
                            <Zap size={20} style={{ color: 'var(--accent)' }} />
                            <span className="font-bold text-lg hidden sm:block">pAIr</span>
                            <span className="badge badge-accent text-[9px]">BETA</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Language */}
                        <div className="relative">
                            <button onClick={() => setLangDropdown(!langDropdown)} className="btn btn-ghost gap-2">
                                <Languages size={16} />
                                <span className="hidden sm:inline text-sm">{language.native}</span>
                                <ChevronDown size={14} />
                            </button>
                            {langDropdown && (
                                <>
                                    <div className="fixed inset-0" style={{ zIndex: 100 }} onClick={() => setLangDropdown(false)} />
                                    <div className="dropdown max-h-72 overflow-y-auto">
                                        {LANGUAGES.map(l => (
                                            <div key={l.code}
                                                onClick={() => { setLanguage(l); setLangDropdown(false); }}
                                                className={`dropdown-item ${language.code === l.code ? 'bg-accent-light' : ''}`}>
                                                <span className="flex-1">{l.name}</span>
                                                <span style={{ color: 'var(--text-tertiary)' }}>{l.native}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Analytics */}
                        <button onClick={showAnalytics} className="btn btn-ghost btn-icon" title="Analytics Dashboard">
                            <BarChart3 size={18} />
                        </button>

                        {/* Notifications */}
                        <div className="relative">
                            <button onClick={() => setNotifDropdown(!notifDropdown)} className="btn btn-ghost btn-icon relative" title="Notifications">
                                <Bell size={18} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                                        style={{ background: 'var(--red)' }}>
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>
                            {notifDropdown && (
                                <>
                                    <div className="fixed inset-0" style={{ zIndex: 100 }} onClick={() => setNotifDropdown(false)} />
                                    <div className="dropdown w-96 max-h-[480px] overflow-hidden flex flex-col" style={{ right: 0 }}>
                                        <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                                            <span className="font-semibold text-sm">Notifications</span>
                                            {unreadCount > 0 && (
                                                <button onClick={markAllRead} className="text-xs font-medium" style={{ color: 'var(--accent)' }}>Mark all read</button>
                                            )}
                                        </div>
                                        <div className="overflow-y-auto flex-1">
                                            {notifications.length === 0 ? (
                                                <div className="p-8 text-center" style={{ color: 'var(--text-tertiary)' }}>
                                                    <Bell size={24} className="mx-auto mb-2 opacity-40" />
                                                    <p className="text-sm">No notifications yet</p>
                                                </div>
                                            ) : (
                                                notifications.slice(0, 20).map(n => (
                                                    <div key={n.id}
                                                        onClick={() => { markNotifRead(n.id); setNotifDropdown(false); }}
                                                        className="p-3 cursor-pointer transition-colors hover:bg-opacity-50"
                                                        style={{
                                                            background: n.read ? 'transparent' : 'var(--accent-light)',
                                                            borderBottom: '1px solid var(--border)',
                                                        }}>
                                                        <div className="flex items-start gap-2">
                                                            <span className="text-base mt-0.5">
                                                                {n.type === 'risk_alert' ? '⚠️' : n.type === 'analysis_complete' ? '✅' : n.type === 'scheme_match' ? '🎯' : n.type === 'new_policy' ? '📋' : '🔔'}
                                                            </span>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`text-sm ${n.read ? '' : 'font-semibold'}`}>{n.title}</p>
                                                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{n.body}</p>
                                                                <p className="text-[10px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
                                                                    {n.created_at ? new Date(n.created_at).toLocaleString() : ''}
                                                                </p>
                                                            </div>
                                                            {!n.read && <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: 'var(--accent)' }} />}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Theme */}
                        <button onClick={toggleTheme} className="btn btn-ghost btn-icon">
                            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                        </button>

                        {/* User */}
                        <div className="relative">
                            <button onClick={() => setUserDropdown(!userDropdown)} className="flex items-center gap-2">
                                <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />
                            </button>
                            {userDropdown && (
                                <>
                                    <div className="fixed inset-0" style={{ zIndex: 100 }} onClick={() => setUserDropdown(false)} />
                                    <div className="dropdown w-64">
                                        <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
                                            <p className="font-medium truncate">{user.displayName}</p>
                                            <p className="text-sm truncate" style={{ color: 'var(--text-tertiary)' }}>{user.email}</p>
                                        </div>
                                        <div className="p-2">
                                            <div onClick={() => { onUpdateProfile(); setUserDropdown(false); }} className="dropdown-item">
                                                <User size={16} /> Edit Profile
                                            </div>
                                            <div onClick={() => { onNavigate('faq'); setUserDropdown(false); }} className="dropdown-item">
                                                <HelpCircle size={16} /> FAQ
                                            </div>
                                            <div onClick={() => { onShowTutorial?.(); setUserDropdown(false); }} className="dropdown-item">
                                                <BookOpen size={16} /> Show Tutorial
                                            </div>
                                            <div onClick={() => { onLogout(); setUserDropdown(false); }} className="dropdown-item" style={{ color: 'var(--red)' }}>
                                                <LogOut size={16} /> Sign Out
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-auto p-6">
                    {state === 'IDLE' && (
                        <UploadView onAnalyze={analyze} onShowOnboarding={onUpdateProfile} />
                    )}

                    {state === 'PROCESSING' && (
                        <ProcessingView onCancel={newAnalysis} />
                    )}

                    {state === 'SUCCESS' && result && (
                        <div className="max-w-5xl mx-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">Analysis Results</h2>
                                <button onClick={newAnalysis} className="btn btn-secondary">
                                    <Plus size={16} /> New Analysis
                                </button>
                            </div>
                            <ResultsView data={result} language={language} />
                        </div>
                    )}

                    {state === 'ERROR' && (
                        <div className="max-w-md mx-auto text-center py-16 animate-fade-in-up">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                                style={{ background: 'var(--red-light)', color: 'var(--red)' }}>
                                <AlertCircle size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Analysis Failed</h3>
                            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>{error}</p>
                            <button onClick={newAnalysis} className="btn btn-primary">
                                Try Again
                            </button>
                        </div>
                    )}

                    {state === 'ANALYTICS' && (
                        <div className="max-w-5xl mx-auto animate-fade-in-up">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold flex items-center gap-3">
                                    <BarChart3 size={24} style={{ color: 'var(--accent)' }} /> Analytics Dashboard
                                </h2>
                                <button onClick={newAnalysis} className="btn btn-secondary">
                                    <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} /> Back
                                </button>
                            </div>

                            {analyticsLoading ? (
                                <div className="text-center py-16">
                                    <Loader2 size={32} className="animate-spin mx-auto mb-4" style={{ color: 'var(--accent)' }} />
                                    <p style={{ color: 'var(--text-secondary)' }}>Loading analytics...</p>
                                </div>
                            ) : analytics ? (
                                <div className="space-y-6">
                                    {/* Summary Cards */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="card p-5 text-center">
                                            <div className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>{analytics.total_analyses}</div>
                                            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Total Analyses</p>
                                        </div>
                                        <div className="card p-5 text-center">
                                            <div className="text-3xl font-bold" style={{ color: analytics.avg_risk_score > 70 ? 'var(--red)' : analytics.avg_risk_score > 40 ? 'var(--orange)' : 'var(--green)' }}>{analytics.avg_risk_score}</div>
                                            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Avg Risk Score</p>
                                        </div>
                                        <div className="card p-5 text-center">
                                            <div className="text-3xl font-bold" style={{ color: 'var(--green)' }}>{analytics.avg_sustainability_score}</div>
                                            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Avg Green Score</p>
                                        </div>
                                        <div className="card p-5 text-center">
                                            <div className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>{analytics.total_schemes}</div>
                                            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Schemes Matched</p>
                                        </div>
                                    </div>

                                    {/* Risk Breakdown */}
                                    <div className="card p-6">
                                        <h3 className="font-semibold mb-4 flex items-center gap-2"><Shield size={18} style={{ color: 'var(--orange)' }} /> Risk Distribution</h3>
                                        <div className="grid grid-cols-4 gap-3">
                                            {Object.entries(analytics.risk_breakdown || {}).map(([level, count]) => (
                                                <div key={level} className="p-3 rounded-xl text-center" style={{
                                                    background: level === 'CRITICAL' ? 'var(--red-light)' : level === 'HIGH' ? 'var(--orange-light)' : level === 'MEDIUM' ? 'var(--accent-light)' : 'var(--green-light)'
                                                }}>
                                                    <div className="text-2xl font-bold" style={{
                                                        color: level === 'CRITICAL' ? 'var(--red)' : level === 'HIGH' ? 'var(--orange)' : level === 'MEDIUM' ? 'var(--accent)' : 'var(--green)'
                                                    }}>{count}</div>
                                                    <p className="text-xs font-medium mt-1">{level}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Sustainability Totals */}
                                    <div className="card p-6">
                                        <h3 className="font-semibold mb-4 flex items-center gap-2"><Leaf size={18} style={{ color: 'var(--green)' }} /> Sustainability Impact</h3>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="p-4 rounded-xl text-center" style={{ background: 'var(--green-light)' }}>
                                                <div className="text-2xl font-bold" style={{ color: 'var(--green)' }}>{analytics.sustainability_totals?.paper_saved || 0}</div>
                                                <p className="text-xs mt-1">Pages Saved</p>
                                            </div>
                                            <div className="p-4 rounded-xl text-center" style={{ background: 'var(--green-light)' }}>
                                                <div className="text-2xl font-bold" style={{ color: 'var(--green)' }}>{analytics.sustainability_totals?.co2_saved_kg || 0} kg</div>
                                                <p className="text-xs mt-1">CO₂ Saved</p>
                                            </div>
                                            <div className="p-4 rounded-xl text-center" style={{ background: 'var(--green-light)' }}>
                                                <div className="text-2xl font-bold" style={{ color: 'var(--green)' }}>₹{analytics.sustainability_totals?.cost_saved_inr || 0}</div>
                                                <p className="text-xs mt-1">Cost Saved</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Score Trend */}
                                    {analytics.score_trend?.length > 0 && (
                                        <div className="card p-6">
                                            <h3 className="font-semibold mb-4 flex items-center gap-2"><Activity size={18} style={{ color: 'var(--accent)' }} /> Score Trend</h3>
                                            <div className="space-y-2">
                                                {analytics.score_trend.map((item, i) => (
                                                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                                                        <span className="text-sm font-medium flex-1 truncate">{item.policy_name}</span>
                                                        <div className="flex items-center gap-4">
                                                            <span className="text-xs px-2 py-1 rounded-full font-medium" style={{
                                                                background: item.risk_score > 70 ? 'var(--red-light)' : item.risk_score > 40 ? 'var(--orange-light)' : 'var(--green-light)',
                                                                color: item.risk_score > 70 ? 'var(--red)' : item.risk_score > 40 ? 'var(--orange)' : 'var(--green)',
                                                            }}>Risk: {item.risk_score}</span>
                                                            <span className="text-xs px-2 py-1 rounded-full font-medium" style={{
                                                                background: 'var(--green-light)', color: 'var(--green)'
                                                            }}>Green: {item.green_score}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Matched Schemes */}
                                    {analytics.schemes_matched?.length > 0 && (
                                        <div className="card p-6">
                                            <h3 className="font-semibold mb-4 flex items-center gap-2"><CheckCircle size={18} style={{ color: 'var(--accent)' }} /> Government Schemes Matched</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {analytics.schemes_matched.map((s, i) => (
                                                    <span key={i} className="px-3 py-1.5 rounded-full text-sm font-medium" style={{
                                                        background: 'var(--accent-light)', color: 'var(--accent)'
                                                    }}>{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Sectors */}
                                    {analytics.sectors_covered?.length > 0 && (
                                        <div className="card p-6">
                                            <h3 className="font-semibold mb-4 flex items-center gap-2"><Building2 size={18} /> Sectors Analyzed</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {analytics.sectors_covered.map((s, i) => (
                                                    <span key={i} className="px-3 py-1.5 rounded-full text-sm" style={{
                                                        background: 'var(--bg-tertiary)'
                                                    }}>{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <BarChart3 size={48} className="mx-auto mb-4 opacity-20" />
                                    <p style={{ color: 'var(--text-secondary)' }}>No analytics data. Upload and analyze policies to see insights.</p>
                                </div>
                            )}
                        </div>
                    )}
                </main>

                <Footer onNavigate={onNavigate} />
            </div>
        </div>
    );
}

// ═══════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════
export default function App() {
    const [user, setUser] = useState(null);
    const [loaded, setLoaded] = useState(false);
    const [profile, setProfile] = useState(null);
    const [page, setPage] = useState(null); // For static pages
    const [showProfileSetup, setShowProfileSetup] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setLoaded(true);
            if (u) {
                // Check if profile exists
                const saved = localStorage.getItem(`pair-profile-${u.uid}`);
                if (saved) {
                    setProfile(JSON.parse(saved));
                } else {
                    setShowProfileSetup(true);
                }
            }
        });
        return unsub;
    }, []);

    const handleTutorialClose = () => {
        setShowTutorial(false);
        if (user) localStorage.setItem(`pair-tutorial-done-${user.uid}`, 'true');
    };

    // Loading state — Branded loading screen
    if (!loaded) {
        return (
            <ThemeProvider>
                <div className="loading-screen">
                    <div className="loading-logo">
                        <Shield size={36} color="white" />
                    </div>
                    <div className="loading-text">pAIr</div>
                    <p className="loading-subtext">Loading your workspace...</p>
                </div>
            </ThemeProvider>
        );
    }

    // Static pages
    if (page) {
        return (
            <ThemeProvider>
                <StaticPage page={page} onBack={() => setPage(null)} onNavigate={setPage} />
            </ThemeProvider>
        );
    }

    // Not logged in
    if (!user) {
        return (
            <ThemeProvider>
                <LoginPage onNavigate={setPage} />
            </ThemeProvider>
        );
    }

    // Profile setup
    if (showProfileSetup) {
        return (
            <ThemeProvider>
                <ProfileSetup
                    user={user}
                    existingProfile={profile}
                    onCancel={() => setShowProfileSetup(false)}
                    onComplete={(p) => {
                        setProfile(p);
                        setShowProfileSetup(false);
                        // Show tutorial for first-time users
                        const tutorialDone = localStorage.getItem(`pair-tutorial-done-${user.uid}`);
                        if (!tutorialDone) {
                            setShowTutorial(true);
                        }
                    }}
                />
            </ThemeProvider>
        );
    }

    // Main app
    return (
        <ThemeProvider>
            <MainApp
                user={user}
                profile={profile}
                onLogout={logOut}
                onNavigate={setPage}
                onUpdateProfile={() => setShowProfileSetup(true)}
                onShowTutorial={() => setShowTutorial(true)}
            />
            {showTutorial && <TutorialOverlay onClose={handleTutorialClose} />}
        </ThemeProvider>
    );
}
