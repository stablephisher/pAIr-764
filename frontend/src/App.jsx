import React, { useState, useEffect, createContext, useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGoogle, logOut } from './firebase';
import axios from 'axios';
import {
    Upload, FileText, LogOut, ChevronDown, Languages, X,
    BarChart3, ClipboardList, Menu, Shield, Zap, Moon, Sun,
    User, Settings, HelpCircle, Home, Info, Mail, FileCheck,
    Lock, ExternalLink, ChevronRight, Loader2, Building2,
    CheckCircle, AlertCircle, TrendingUp, Leaf, Scale, Clock,
    ArrowRight, Plus, Trash2
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
                        <div className="flex gap-3">
                            <a href="https://twitter.com" target="_blank" rel="noopener" className="btn btn-ghost btn-icon">
                                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener" className="btn btn-ghost btn-icon">
                                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                            </a>
                            <a href="https://github.com" target="_blank" rel="noopener" className="btn btn-ghost btn-icon">
                                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                            </a>
                        </div>
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
// STATIC PAGES (About, FAQ, etc.)
// ═══════════════════════════════════════
function StaticPage({ page, onBack }) {
    const { theme, toggleTheme } = useTheme();

    const pages = {
        about: {
            title: 'About pAIr',
            content: (
                <div className="space-y-6">
                    <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                        pAIr (Policy AI Reader) is an AI-powered platform designed to help Indian MSMEs navigate complex government policies and regulations.
                    </p>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { icon: Shield, title: 'Compliance Analysis', desc: 'AI-powered extraction of compliance obligations from policy documents' },
                            { icon: TrendingUp, title: 'Risk Scoring', desc: 'Real-time assessment of compliance risks, sustainability, and profitability' },
                            { icon: Zap, title: 'Scheme Matching', desc: 'Automatic matching with relevant government schemes and benefits' },
                        ].map((item, i) => (
                            <div key={i} className="card p-6">
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
                </div>
            ),
        },
        faq: {
            title: 'Frequently Asked Questions',
            content: (
                <div className="space-y-4">
                    {[
                        { q: 'What is pAIr?', a: 'pAIr is an AI-powered platform that analyzes government policy documents and provides compliance guidance, risk scores, and scheme matching for Indian MSMEs.' },
                        { q: 'How does the analysis work?', a: 'Upload a PDF of a government policy. Our AI extracts key compliance obligations, calculates risk scores across multiple dimensions (compliance, sustainability, profitability, ethics), and matches you with relevant government schemes.' },
                        { q: 'What languages are supported?', a: 'We support 10 Indian languages including Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, and Punjabi. Translation is processed instantly.' },
                        { q: 'Is my data secure?', a: 'Yes. We use industry-standard encryption and your documents are processed securely. We do not store or share your business information with third parties.' },
                        { q: 'How accurate is the AI analysis?', a: 'Our AI is trained on thousands of Indian policy documents and achieves high accuracy. However, we recommend verifying critical compliance decisions with qualified professionals.' },
                        { q: 'What types of policies can I analyze?', a: 'Any government policy document in PDF format - MSME schemes, environmental regulations, labor laws, tax policies, industry-specific guidelines, and more.' },
                        { q: 'Is there a limit on document uploads?', a: 'Free users can analyze up to 5 documents per month. Premium plans offer unlimited analysis.' },
                        { q: 'Can I export the analysis results?', a: 'Yes, you can export analysis results as PDF reports or share them directly with your team.' },
                    ].map((item, i) => (
                        <details key={i} className="card group">
                            <summary className="p-5 cursor-pointer flex items-center justify-between font-medium">
                                {item.q}
                                <ChevronDown size={18} className="transition-transform group-open:rotate-180" />
                            </summary>
                            <div className="px-5 pb-5 pt-0">
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.a}</p>
                            </div>
                        </details>
                    ))}
                </div>
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
                <button onClick={onBack} className="flex items-center gap-2 font-semibold">
                    <Zap size={20} style={{ color: 'var(--accent)' }} />
                    <span>pAIr</span>
                </button>
                <div className="flex items-center gap-2">
                    <button onClick={toggleTheme} className="btn btn-ghost btn-icon">
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    </button>
                    <button onClick={onBack} className="btn btn-secondary">
                        Back to App
                    </button>
                </div>
            </header>

            {/* Content */}
            <main className="container py-12 animate-fade-in-up">
                <h1 className="text-3xl font-bold mb-8">{pageData.title}</h1>
                {pageData.content}
            </main>

            <Footer onNavigate={(p) => { /* handled by parent */ }} />
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
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
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
function ProfileSetup({ user, onComplete }) {
    const { theme, toggleTheme } = useTheme();
    const [step, setStep] = useState(0);
    const [profile, setProfile] = useState({
        business_name: '',
        business_type: '',
        sector: '',
        employees: '',
        revenue: '',
        location: '',
    });
    const [saving, setSaving] = useState(false);

    const steps = [
        {
            field: 'business_name',
            title: "What's your business name?",
            type: 'text',
            placeholder: 'e.g., Sharma Textiles Pvt. Ltd.',
        },
        {
            field: 'business_type',
            title: 'What type of business do you operate?',
            options: ['Manufacturing', 'Service', 'Trading', 'Technology', 'Handicraft', 'Food Processing'],
        },
        {
            field: 'sector',
            title: 'Which sector best describes your business?',
            options: ['Textiles', 'IT/Software', 'Food & Beverage', 'Healthcare', 'Retail', 'Education', 'Construction', 'Other'],
        },
        {
            field: 'employees',
            title: 'How many employees do you have?',
            options: ['1-10', '11-50', '51-200', '201-500', '500+'],
        },
        {
            field: 'revenue',
            title: "What's your annual revenue?",
            options: ['Less than ₹1 Cr', '₹1-5 Crore', '₹5-10 Crore', '₹10-50 Crore', 'More than ₹50 Cr'],
        },
        {
            field: 'location',
            title: 'Where is your business located?',
            type: 'text',
            placeholder: 'e.g., Mumbai, Maharashtra',
        },
    ];

    const currentStep = steps[step];
    const progress = ((step + 1) / steps.length) * 100;
    const isLastStep = step === steps.length - 1;

    const handleNext = async () => {
        if (isLastStep) {
            setSaving(true);
            try {
                await axios.post(`${API}/api/profile`, { uid: user.uid, ...profile });
                localStorage.setItem(`pair-profile-${user.uid}`, JSON.stringify(profile));
                onComplete(profile);
            } catch (e) {
                console.error('Profile save error:', e);
                // Still complete even if save fails
                localStorage.setItem(`pair-profile-${user.uid}`, JSON.stringify(profile));
                onComplete(profile);
            }
        } else {
            setStep(step + 1);
        }
    };

    const canProceed = profile[currentStep.field]?.trim();

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
                            <input
                                type="text"
                                value={profile[currentStep.field]}
                                onChange={e => setProfile({ ...profile, [currentStep.field]: e.target.value })}
                                placeholder={currentStep.placeholder}
                                className="input"
                                autoFocus
                                onKeyDown={e => e.key === 'Enter' && canProceed && handleNext()}
                            />
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
                            <button onClick={() => setStep(step - 1)} className="btn btn-ghost">
                                Back
                            </button>
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
                                    <p className="text-sm font-medium truncate">{item.policy_name || 'Policy'}</p>
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
    const analysis = data.analysis || {};
    const summary = analysis.summary || {};
    const scores = analysis.scores || {};
    const obligations = data.obligations || [];

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
                    <h2 className="text-2xl font-bold mb-2">{data.policy_name || 'Policy Analysis'}</h2>
                    <div className="flex flex-wrap gap-2">
                        {summary.sector && <span className="badge badge-gray">{summary.sector}</span>}
                        {summary.policy_type && <span className="badge badge-accent">{summary.policy_type}</span>}
                        {summary.applicable && <span className="badge badge-green">APPLICABLE</span>}
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
                            {summary.summary && (
                                <div>
                                    <h4 className="font-semibold mb-3">Summary</h4>
                                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{summary.summary}</p>
                                </div>
                            )}
                            {summary.risk_assessment && (
                                <div>
                                    <h4 className="font-semibold mb-3">Risk Assessment</h4>
                                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{summary.risk_assessment}</p>
                                </div>
                            )}
                            {summary.matched_schemes?.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-3">Matched Schemes</h4>
                                    <div className="space-y-3">
                                        {summary.matched_schemes.map((s, i) => (
                                            <div key={i} className="p-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                                                <p className="font-medium">{s.name || s}</p>
                                                {s.description && <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{s.description}</p>}
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
                        <div className="space-y-4">
                            {summary.compliance_actions?.length > 0 ? (
                                summary.compliance_actions.map((action, i) => (
                                    <div key={i} className="p-4 rounded-xl flex items-start gap-3" style={{ background: 'var(--bg-secondary)' }}>
                                        <ArrowRight size={18} style={{ color: 'var(--accent)' }} className="flex-shrink-0 mt-0.5" />
                                        <p className="text-sm">{action}</p>
                                    </div>
                                ))
                            ) : (
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
function MainApp({ user, profile, onLogout, onNavigate, onUpdateProfile }) {
    const { theme, toggleTheme } = useTheme();
    const [state, setState] = useState('IDLE'); // IDLE | PROCESSING | SUCCESS | ERROR
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [language, setLanguage] = useState(LANGUAGES[0]);
    const [langDropdown, setLangDropdown] = useState(false);
    const [userDropdown, setUserDropdown] = useState(false);

    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState([]);
    const [activeId, setActiveId] = useState(null);

    useEffect(() => {
        loadHistory();
    }, [user]);

    const loadHistory = async () => {
        try {
            const res = await axios.get(`${API}/api/history?uid=${user.uid}`);
            setHistory(res.data.analyses || []);
        } catch (e) {
            console.error('Load history error:', e);
        }
    };

    const analyze = async (file) => {
        setState('PROCESSING');
        setError(null);

        const fd = new FormData();
        fd.append('file', file);
        fd.append('uid', user.uid);
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

    const loadAnalysis = async (id) => {
        setActiveId(id);
        setState('PROCESSING');
        try {
            const res = await axios.get(`${API}/api/analysis/${id}?uid=${user.uid}`);
            setResult(res.data);
            setState('SUCCESS');
        } catch (e) {
            console.error('Load analysis error:', e);
            setError('Failed to load analysis');
            setState('ERROR');
        }
    };

    const deleteAnalysis = async (id, e) => {
        e.stopPropagation();
        if (!confirm('Delete this analysis?')) return;
        try {
            await axios.delete(`${API}/api/analysis/${id}?uid=${user.uid}`);
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
                                    <div className="fixed inset-0 z-100" onClick={() => setLangDropdown(false)} />
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
                                    <div className="fixed inset-0 z-100" onClick={() => setUserDropdown(false)} />
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

    // Loading state
    if (!loaded) {
        return (
            <ThemeProvider>
                <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
                    <div className="text-center animate-fade-in">
                        <Loader2 size={32} className="animate-spin mx-auto mb-4" style={{ color: 'var(--accent)' }} />
                        <p style={{ color: 'var(--text-tertiary)' }}>Loading...</p>
                    </div>
                </div>
            </ThemeProvider>
        );
    }

    // Static pages
    if (page) {
        return (
            <ThemeProvider>
                <StaticPage page={page} onBack={() => setPage(null)} />
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
                    onComplete={(p) => {
                        setProfile(p);
                        setShowProfileSetup(false);
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
            />
        </ThemeProvider>
    );
}
