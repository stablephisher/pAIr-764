import React, { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGoogle, logOut } from './firebase';
import axios from 'axios';
import {
    Upload, FileText, Sparkles, LogOut, ChevronDown,
    Languages, X, BarChart3, ClipboardList, AlertCircle,
    Menu, Zap, Shield, TrendingUp, Brain, ArrowRight, Plus
} from 'lucide-react';

import Sidebar from './components/Sidebar';
import ProcessingEngine from './components/ProcessingEngine';
import OnboardingWizard from './components/OnboardingWizard';
import ResultsView from './components/ResultsView';
import Dashboard from './components/Dashboard';

const API = "http://localhost:8000";

const LANGUAGES = [
    'English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam',
    'Bengali', 'Marathi', 'Gujarati', 'Punjabi', 'Odia', 'Assamese',
    'Urdu', 'Maithili', 'Sanskrit', 'Nepali'
];

/* ════════════════════════════════════════════
   LOGIN PAGE
   ════════════════════════════════════════════ */
function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const login = async () => {
        setLoading(true);
        setError('');
        try { await signInWithGoogle(); }
        catch (e) { setError(e.message || 'Sign-in failed'); }
        finally { setLoading(false); }
    };

    const features = [
        { icon: Shield, label: 'Compliance Analysis', desc: 'AI-powered policy obligation extraction' },
        { icon: TrendingUp, label: 'Risk Scoring', desc: 'Real-time risk, sustainability & ROI metrics' },
        { icon: Brain, label: 'Smart Matching', desc: 'Auto-match with government MSME schemes' },
    ];

    return (
        <div className="min-h-screen w-full flex mesh-bg" style={{ background: 'var(--bg-primary)' }}>
            {/* Left — Hero */}
            <div className="hidden lg:flex flex-1 flex-col justify-center px-16 xl:px-24">
                <div className="fade-in">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, var(--accent), #818cf8)' }}>
                            <Zap size={20} color="white" />
                        </div>
                        <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>pAIr</span>
                    </div>

                    <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight mb-4"
                        style={{ color: 'var(--text-primary)' }}>
                        Policy Compliance,<br />
                        <span style={{ color: 'var(--accent)' }}>Made Intelligent.</span>
                    </h1>
                    <p className="text-base mb-10 max-w-md" style={{ color: 'var(--text-muted)' }}>
                        AI-powered regulatory analysis for Indian MSMEs. Upload a policy, get instant compliance guidance.
                    </p>

                    <div className="space-y-4 stagger">
                        {features.map((f, i) => (
                            <div key={i} className="flex items-center gap-4 fade-in">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}>
                                    <f.icon size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{f.label}</p>
                                    <p className="text-xs" style={{ color: 'var(--text-dim)' }}>{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right — Login Card */}
            <div className="flex-1 lg:max-w-md xl:max-w-lg flex items-center justify-center p-8">
                <div className="w-full max-w-sm fade-in">
                    {/* Mobile logo */}
                    <div className="lg:hidden text-center mb-10">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                            style={{ background: 'linear-gradient(135deg, var(--accent), #818cf8)' }}>
                            <Zap size={24} color="white" />
                        </div>
                        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>pAIr</h1>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                            AI Policy Compliance for MSMEs
                        </p>
                    </div>

                    <div className="card card-glow p-8">
                        <h2 className="text-lg font-bold mb-1 text-center lg:text-left" style={{ color: 'var(--text-primary)' }}>
                            Get Started
                        </h2>
                        <p className="text-xs mb-8 text-center lg:text-left" style={{ color: 'var(--text-muted)' }}>
                            Sign in with your Google account to continue
                        </p>

                        <button onClick={login} disabled={loading}
                            className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl text-sm font-semibold transition-all"
                            style={{
                                background: 'white',
                                color: '#1f2937',
                                opacity: loading ? 0.7 : 1,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            }}>
                            <svg width="18" height="18" viewBox="0 0 48 48">
                                <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.9 33.1 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.6-5.6C34 6 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.2-2.6-.4-3.9z"/>
                                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.5 18.8 12 24 12c3.1 0 5.8 1.2 8 3l5.6-5.6C34 6 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.2 26.7 36 24 36c-5.4 0-9.9-3.5-11.3-8.3l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
                                <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.2 5.2C36.7 39.4 44 34 44 24c0-1.3-.2-2.6-.4-3.9z"/>
                            </svg>
                            {loading ? 'Signing in...' : 'Continue with Google'}
                        </button>

                        {error && (
                            <div className="mt-4 flex items-center gap-2 p-3 rounded-lg text-xs"
                                style={{ background: 'var(--red-muted)', color: 'var(--red)' }}>
                                <AlertCircle size={13} /> {error}
                            </div>
                        )}
                    </div>

                    <p className="text-center text-[10px] mt-6" style={{ color: 'var(--text-dim)' }}>
                        Built for Code Unnati Innovation Marathon 4.0
                    </p>
                </div>
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════
   MAIN APP
   ════════════════════════════════════════════ */
export default function App() {
    const [user, setUser] = useState(null);
    const [authReady, setAuthReady] = useState(false);
    const [businessProfile, setBusinessProfile] = useState(null);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('IDLE');
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [history, setHistory] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeView, setActiveView] = useState('results');
    const [lang, setLang] = useState('English');
    const [showLangMenu, setShowLangMenu] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const fileInputRef = useRef(null);
    const abortRef = useRef(null);

    // ── Auth ──
    useEffect(() => {
        if (!auth) { setAuthReady(true); return; }
        return onAuthStateChanged(auth, (u) => {
            setUser(u);
            setAuthReady(true);
            if (u) { loadProfile(u.uid); loadHistory(u.uid); }
        });
    }, []);

    const loadProfile = async (uid) => {
        try {
            const r = await axios.get(`${API}/api/profile/${uid}`);
            if (r.data?.profile) { setBusinessProfile(r.data.profile); setShowOnboarding(false); }
            else setShowOnboarding(true);
        } catch { setShowOnboarding(true); }
    };

    const loadHistory = async (uid) => {
        try {
            const r = await axios.get(`${API}/api/history`, { params: { user_uid: uid } });
            const records = r.data?.history || r.data || [];
            setHistory(Array.isArray(records) ? records : []);
        } catch { setHistory([]); }
    };

    // ── File ──
    const handleFile = (f) => {
        if (!f) return;
        const ext = f.name.split('.').pop().toLowerCase();
        if (!['pdf', 'txt', 'doc', 'docx'].includes(ext)) {
            setError('Unsupported format. Use PDF, TXT, or DOC.');
            return;
        }
        setFile(f);
        setError('');
    };

    // ── Analyze ──
    const analyze = async () => {
        if (!file) return;
        setStatus('PROCESSING'); setData(null); setError('');
        const controller = new AbortController();
        abortRef.current = controller;
        try {
            const fd = new FormData();
            fd.append('file', file);
            if (user?.uid) fd.append('user_uid', user.uid);
            if (businessProfile) fd.append('business_profile', JSON.stringify(businessProfile));
            const r = await axios.post(`${API}/api/analyze`, fd, { signal: controller.signal, timeout: 120000 });
            setData(r.data?.analysis || r.data);
            setStatus('SUCCESS');
            setActiveView('results');
            if (user?.uid) loadHistory(user.uid);
        } catch (e) {
            if (axios.isCancel(e)) setStatus('IDLE');
            else { setError(e.response?.data?.detail || e.message || 'Analysis failed.'); setStatus('ERROR'); }
        }
    };

    // ── History ──
    const selectHistory = (rec) => {
        setData(rec.analysis || rec);
        setStatus('SUCCESS');
        setActiveView('results');
        setActiveId(rec.id || rec.timestamp);
    };
    const deleteHistory = (id) => {
        setHistory(h => h.filter(r => (r.id || r.timestamp) !== id));
        if (activeId === id) { setData(null); setStatus('IDLE'); setActiveId(null); }
    };
    const clearHistory = () => { setHistory([]); setData(null); setStatus('IDLE'); setActiveId(null); };

    // ── Translation ──
    const handleTranslate = async () => {
        if (!data || lang === 'English') return;
        try {
            const r = await axios.post(`${API}/api/translate`, { text: JSON.stringify(data), target_language: lang });
            if (r.data?.translated) { try { setData(JSON.parse(r.data.translated)); } catch {} }
        } catch (e) { console.error('Translation:', e); }
    };

    // ── Onboarding ──
    const onOnboardingComplete = async (profile) => {
        setBusinessProfile(profile); setShowOnboarding(false);
        if (user?.uid) { try { await axios.post(`${API}/api/profile/${user.uid}`, { profile }); } catch {} }
    };

    const handleLogout = async () => {
        await logOut();
        setUser(null); setBusinessProfile(null); setData(null); setHistory([]); setStatus('IDLE');
    };

    /* ═══ RENDER ═══ */
    if (!authReady) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
                <div className="w-8 h-8 border-2 rounded-full spin"
                    style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
            </div>
        );
    }

    if (!user) return <LoginPage />;

    if (showOnboarding) {
        return <OnboardingWizard onComplete={onOnboardingComplete} onSkip={() => setShowOnboarding(false)} />;
    }

    /* ═══ MAIN LAYOUT ═══ */
    return (
        <div className="min-h-screen w-full flex" style={{ background: 'var(--bg-primary)' }}>
            {/* Sidebar */}
            <div className={`transition-all duration-300 flex-shrink-0 ${sidebarOpen ? 'w-64' : 'w-0'} overflow-hidden`}
                style={{ borderRight: sidebarOpen ? '1px solid var(--border)' : 'none' }}>
                <Sidebar history={history} onSelect={selectHistory} onDelete={deleteHistory}
                    onClear={clearHistory} activeId={activeId} />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Bar */}
                <header className="flex items-center justify-between px-5 h-14 flex-shrink-0 glass-strong"
                    style={{ borderBottom: '1px solid var(--border)' }}>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-1.5 rounded-lg transition-all hover:bg-white/5"
                            style={{ color: 'var(--text-muted)' }}>
                            <Menu size={18} />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                                style={{ background: 'linear-gradient(135deg, var(--accent), #818cf8)' }}>
                                <Zap size={13} color="white" />
                            </div>
                            <span className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>pAIr</span>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                                style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}>
                                BETA
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Language */}
                        <div className="relative">
                            <button onClick={() => setShowLangMenu(!showLangMenu)}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium btn-ghost">
                                <Languages size={13} /> {lang} <ChevronDown size={10} />
                            </button>
                            {showLangMenu && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowLangMenu(false)} />
                                    <div className="absolute right-0 top-full mt-1 w-44 rounded-xl py-1 z-50 max-h-72 overflow-y-auto glass-strong"
                                        style={{ boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}>
                                        {LANGUAGES.map(l => (
                                            <button key={l} onClick={() => { setLang(l); setShowLangMenu(false); }}
                                                className="w-full text-left px-3 py-2 text-[11px] transition-all"
                                                style={{
                                                    color: l === lang ? 'var(--accent)' : 'var(--text-secondary)',
                                                    background: l === lang ? 'var(--accent-muted)' : 'transparent',
                                                    fontWeight: l === lang ? 600 : 400,
                                                }}>
                                                {l}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* User Avatar */}
                        <div className="flex items-center gap-2 pl-3 ml-1" style={{ borderLeft: '1px solid var(--border)' }}>
                            {user.photoURL ? (
                                <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full ring-2 ring-white/10" />
                            ) : (
                                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                                    style={{ background: 'linear-gradient(135deg, var(--accent), #818cf8)', color: 'white' }}>
                                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                                </div>
                            )}
                            <button onClick={handleLogout} title="Sign out"
                                className="p-1.5 rounded-lg transition-all hover:bg-white/5"
                                style={{ color: 'var(--text-dim)' }}>
                                <LogOut size={14} />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-3xl mx-auto p-6 lg:p-8">

                        {/* ── IDLE: Upload ── */}
                        {status === 'IDLE' && (
                            <div className="fade-in">
                                <div className="text-center mb-8">
                                    <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                                        {data ? 'Analyze Another Document' : 'Upload a Policy'}
                                    </h2>
                                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                        Drop a PDF, TXT, or DOC for instant AI compliance analysis
                                    </p>
                                </div>

                                {/* Drop Zone */}
                                <div
                                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer?.files?.[0]); }}
                                    onClick={() => fileInputRef.current?.click()}
                                    className="card card-glow rounded-2xl p-12 text-center cursor-pointer transition-all group"
                                    style={{
                                        borderStyle: 'dashed',
                                        borderWidth: '2px',
                                        borderColor: dragOver ? 'var(--accent)' : 'var(--border)',
                                        background: dragOver ? 'var(--accent-muted)' : 'var(--bg-card)',
                                    }}>
                                    <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.txt,.doc,.docx"
                                        onChange={e => handleFile(e.target.files[0])} />
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-all group-hover:scale-110"
                                        style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}>
                                        <Upload size={24} />
                                    </div>
                                    <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                                        {dragOver ? 'Drop to upload' : 'Click to browse or drag a file'}
                                    </p>
                                    <p className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
                                        PDF, TXT, DOC — max 10 MB
                                    </p>
                                </div>

                                {/* Selected File Bar */}
                                {file && (
                                    <div className="mt-4 card p-4 flex items-center justify-between fade-in-scale">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                                style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}>
                                                <FileText size={16} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{file.name}</p>
                                                <p className="text-[10px]" style={{ color: 'var(--text-dim)' }}>{(file.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <button onClick={e => { e.stopPropagation(); setFile(null); }}
                                                className="p-1.5 rounded-lg transition-all hover:bg-white/5"
                                                style={{ color: 'var(--text-dim)' }}>
                                                <X size={14} />
                                            </button>
                                            <button onClick={analyze}
                                                className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm">
                                                <Sparkles size={14} /> Analyze
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <div className="mt-4 flex items-center gap-2 p-3 rounded-xl text-xs"
                                        style={{ background: 'var(--red-muted)', color: 'var(--red)' }}>
                                        <AlertCircle size={14} /> {error}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── PROCESSING ── */}
                        {status === 'PROCESSING' && (
                            <ProcessingEngine onStop={() => { abortRef.current?.abort(); setStatus('IDLE'); }} />
                        )}

                        {/* ── ERROR ── */}
                        {status === 'ERROR' && (
                            <div className="fade-in text-center py-16">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                                    style={{ background: 'var(--red-muted)', color: 'var(--red)' }}>
                                    <AlertCircle size={24} />
                                </div>
                                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Analysis Failed</h3>
                                <p className="text-xs mb-6 max-w-xs mx-auto" style={{ color: 'var(--text-muted)' }}>{error}</p>
                                <button onClick={() => { setStatus('IDLE'); setError(''); }}
                                    className="btn-primary px-6 py-2.5 rounded-xl text-sm">
                                    Try Again
                                </button>
                            </div>
                        )}

                        {/* ── SUCCESS ── */}
                        {status === 'SUCCESS' && data && (
                            <div className="fade-in">
                                {/* Controls Bar */}
                                <div className="flex items-center justify-between mb-6">
                                    {/* View Toggle */}
                                    <div className="flex gap-1 p-1 rounded-xl"
                                        style={{ background: 'var(--bg-card-solid)', border: '1px solid var(--border)' }}>
                                        <button onClick={() => setActiveView('results')}
                                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-semibold transition-all"
                                            style={{
                                                background: activeView === 'results' ? 'linear-gradient(135deg, var(--accent), #818cf8)' : 'transparent',
                                                color: activeView === 'results' ? 'white' : 'var(--text-dim)',
                                            }}>
                                            <ClipboardList size={12} /> Analysis
                                        </button>
                                        <button onClick={() => setActiveView('dashboard')}
                                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-semibold transition-all"
                                            style={{
                                                background: activeView === 'dashboard' ? 'linear-gradient(135deg, var(--accent), #818cf8)' : 'transparent',
                                                color: activeView === 'dashboard' ? 'white' : 'var(--text-dim)',
                                            }}>
                                            <BarChart3 size={12} /> Scores
                                        </button>
                                    </div>

                                    <button onClick={() => { setStatus('IDLE'); setFile(null); setActiveId(null); }}
                                        className="btn-ghost flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-medium">
                                        <Plus size={12} /> New
                                    </button>
                                </div>

                                {activeView === 'results' ? (
                                    <ResultsView data={data} onTranslate={lang !== 'English' ? handleTranslate : null} />
                                ) : (
                                    <Dashboard data={data} />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
