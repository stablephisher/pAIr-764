import React, { useState, useEffect, useRef, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGoogle, logOut } from './firebase';
import axios from 'axios';
import {
    Upload, FileText, Sparkles, LogOut, ChevronDown,
    Languages, X, BarChart3, ClipboardList, AlertCircle, Menu, Zap
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

// ───── Login Page ─────
function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const login = async () => {
        setLoading(true);
        setError('');
        try {
            await signInWithGoogle();
        } catch (e) {
            setError(e.message || 'Sign-in failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-6"
            style={{ background: 'var(--bg-primary)' }}>
            <div className="w-full max-w-sm text-center fade-up">
                {/* Logo */}
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                    style={{ background: 'linear-gradient(135deg, var(--accent), #818cf8)' }}>
                    <Zap size={28} color="white" />
                </div>

                <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    pAIr
                </h1>
                <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
                    AI-Powered Policy Compliance for Indian MSMEs
                </p>

                <button onClick={login} disabled={loading}
                    className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl text-sm font-medium transition-all"
                    style={{
                        background: 'white',
                        color: '#1a1a1a',
                        opacity: loading ? 0.7 : 1,
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
                    <p className="mt-4 text-xs flex items-center justify-center gap-1"
                        style={{ color: 'var(--red)' }}>
                        <AlertCircle size={12} /> {error}
                    </p>
                )}

                <p className="mt-6 text-xs" style={{ color: 'var(--text-muted)' }}>
                    By signing in, you agree to our Terms of Service
                </p>
            </div>
        </div>
    );
}

// ───── Main App ─────
export default function App() {
    // Auth
    const [user, setUser] = useState(null);
    const [authReady, setAuthReady] = useState(false);

    // Onboarding
    const [businessProfile, setBusinessProfile] = useState(null);
    const [showOnboarding, setShowOnboarding] = useState(false);

    // Analysis
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('IDLE'); // IDLE | PROCESSING | SUCCESS | ERROR
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    // History
    const [history, setHistory] = useState([]);
    const [activeId, setActiveId] = useState(null);

    // UI
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeView, setActiveView] = useState('results'); // results | dashboard
    const [lang, setLang] = useState('English');
    const [showLangMenu, setShowLangMenu] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const fileInputRef = useRef(null);
    const abortRef = useRef(null);

    // Auth listener
    useEffect(() => {
        if (!auth) {
            setAuthReady(true);
            return;
        }
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setAuthReady(true);
            if (u) {
                loadProfile(u.uid);
                loadHistory(u.uid);
            }
        });
        return unsub;
    }, []);

    const loadProfile = async (uid) => {
        try {
            const res = await axios.get(`${API}/api/profile/${uid}`);
            if (res.data?.profile) {
                setBusinessProfile(res.data.profile);
                setShowOnboarding(false);
            } else {
                setShowOnboarding(true);
            }
        } catch {
            setShowOnboarding(true);
        }
    };

    const loadHistory = async (uid) => {
        try {
            const res = await axios.get(`${API}/api/history`, { params: { user_uid: uid } });
            const records = res.data?.history || res.data || [];
            setHistory(Array.isArray(records) ? records : []);
        } catch {
            setHistory([]);
        }
    };

    // File handling
    const handleFile = (f) => {
        if (!f) return;
        const ext = f.name.split('.').pop().toLowerCase();
        if (!['pdf', 'txt', 'doc', 'docx'].includes(ext)) {
            setError('Please upload a PDF, TXT, or DOC file.');
            return;
        }
        setFile(f);
        setError('');
    };

    const onDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer?.files?.[0];
        if (f) handleFile(f);
    };

    // Analysis
    const analyze = async () => {
        if (!file) return;
        setStatus('PROCESSING');
        setData(null);
        setError('');

        const controller = new AbortController();
        abortRef.current = controller;

        try {
            const formData = new FormData();
            formData.append('file', file);
            if (user?.uid) formData.append('user_uid', user.uid);
            if (businessProfile) formData.append('business_profile', JSON.stringify(businessProfile));

            const res = await axios.post(`${API}/api/analyze`, formData, {
                signal: controller.signal,
                timeout: 120000,
            });

            const result = res.data?.analysis || res.data;
            setData(result);
            setStatus('SUCCESS');
            setActiveView('results');
            if (user?.uid) loadHistory(user.uid);
        } catch (e) {
            if (axios.isCancel(e)) {
                setStatus('IDLE');
            } else {
                setError(e.response?.data?.detail || e.message || 'Analysis failed.');
                setStatus('ERROR');
            }
        }
    };

    const cancelAnalysis = () => {
        abortRef.current?.abort();
        setStatus('IDLE');
    };

    // History select
    const selectHistory = (record) => {
        const analysis = record.analysis || record;
        setData(analysis);
        setStatus('SUCCESS');
        setActiveView('results');
        setActiveId(record.id || record.timestamp);
    };

    const deleteHistory = (id) => {
        setHistory(h => h.filter(r => (r.id || r.timestamp) !== id));
        if (activeId === id) {
            setData(null);
            setStatus('IDLE');
            setActiveId(null);
        }
    };

    const clearHistory = () => {
        setHistory([]);
        setData(null);
        setStatus('IDLE');
        setActiveId(null);
    };

    // Translation
    const handleTranslate = async () => {
        if (!data || lang === 'English') return;
        try {
            const res = await axios.post(`${API}/api/translate`, {
                text: JSON.stringify(data),
                target_language: lang,
            });
            if (res.data?.translated) {
                try { setData(JSON.parse(res.data.translated)); } catch { /* keep original */ }
            }
        } catch (e) {
            console.error('Translation error:', e);
        }
    };

    // Onboarding handlers
    const onOnboardingComplete = async (profile) => {
        setBusinessProfile(profile);
        setShowOnboarding(false);
        if (user?.uid) {
            try {
                await axios.post(`${API}/api/profile/${user.uid}`, { profile });
            } catch { /* silent */ }
        }
    };

    const handleLogout = async () => {
        await logOut();
        setUser(null);
        setBusinessProfile(null);
        setData(null);
        setHistory([]);
        setStatus('IDLE');
    };

    // ───── RENDER ─────
    if (!authReady) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center"
                style={{ background: 'var(--bg-primary)' }}>
                <div className="w-8 h-8 border-2 rounded-full spin"
                    style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
            </div>
        );
    }

    // Not logged in → Login
    if (!user) return <LoginPage />;

    // Logged in, no profile → Onboarding (full page)
    if (showOnboarding) {
        return <OnboardingWizard
            onComplete={onOnboardingComplete}
            onSkip={() => setShowOnboarding(false)}
        />;
    }

    // ───── Main Layout ─────
    return (
        <div className="min-h-screen w-full flex" style={{ background: 'var(--bg-primary)' }}>
            {/* Sidebar */}
            <div className={`transition-all duration-300 ${sidebarOpen ? 'w-72' : 'w-0'} overflow-hidden flex-shrink-0`}
                style={{ borderRight: sidebarOpen ? '1px solid var(--border)' : 'none' }}>
                <Sidebar
                    history={history}
                    onSelect={selectHistory}
                    onDelete={deleteHistory}
                    onClear={clearHistory}
                    activeId={activeId}
                />
            </div>

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar */}
                <header className="flex items-center justify-between px-5 py-3 flex-shrink-0"
                    style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-1.5 rounded-lg transition-all"
                            style={{ color: 'var(--text-muted)' }}>
                            <Menu size={18} />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                                style={{ background: 'var(--accent)', color: 'white' }}>
                                <Zap size={14} />
                            </div>
                            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>pAIr</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Language */}
                        <div className="relative">
                            <button onClick={() => setShowLangMenu(!showLangMenu)}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all"
                                style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                                <Languages size={13} />
                                {lang}
                                <ChevronDown size={11} />
                            </button>
                            {showLangMenu && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowLangMenu(false)} />
                                    <div className="absolute right-0 top-full mt-1 w-40 rounded-xl py-1 z-50 max-h-64 overflow-y-auto"
                                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                                        {LANGUAGES.map(l => (
                                            <button key={l} onClick={() => { setLang(l); setShowLangMenu(false); }}
                                                className="w-full text-left px-3 py-2 text-xs transition-all"
                                                style={{
                                                    color: l === lang ? 'var(--accent)' : 'var(--text-secondary)',
                                                    background: l === lang ? 'var(--accent-muted)' : 'transparent',
                                                }}>
                                                {l}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* User */}
                        <div className="flex items-center gap-2 pl-2 ml-1" style={{ borderLeft: '1px solid var(--border)' }}>
                            {user.photoURL ? (
                                <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full" />
                            ) : (
                                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium"
                                    style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}>
                                    {(user.displayName || 'U')[0]}
                                </div>
                            )}
                            <button onClick={handleLogout} title="Sign out"
                                className="p-1.5 rounded-lg transition-all"
                                style={{ color: 'var(--text-muted)' }}>
                                <LogOut size={15} />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-3xl mx-auto">

                        {/* STATUS: IDLE → Upload Area */}
                        {status === 'IDLE' && (
                            <div className="fade-up">
                                {/* Welcome */}
                                <div className="text-center mb-6">
                                    <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                                        {data ? 'Analyze Another Policy' : 'Upload a Policy Document'}
                                    </h2>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                        Upload a PDF, TXT, or DOC to get instant AI-powered compliance analysis
                                    </p>
                                </div>

                                {/* Drop Zone */}
                                <div
                                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={onDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className="rounded-2xl p-10 text-center cursor-pointer transition-all"
                                    style={{
                                        border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border-light)'}`,
                                        background: dragOver ? 'var(--accent-muted)' : 'var(--bg-card)',
                                    }}>
                                    <input ref={fileInputRef} type="file" className="hidden"
                                        accept=".pdf,.txt,.doc,.docx"
                                        onChange={e => handleFile(e.target.files[0])} />
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                                        style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}>
                                        <Upload size={22} />
                                    </div>
                                    <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                                        {dragOver ? 'Drop file here' : 'Click or drag file to upload'}
                                    </p>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                        PDF, TXT, DOC up to 10MB
                                    </p>
                                </div>

                                {/* Selected File */}
                                {file && (
                                    <div className="mt-4 flex items-center justify-between p-3 rounded-xl"
                                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                                        <div className="flex items-center gap-2.5">
                                            <FileText size={16} style={{ color: 'var(--accent)' }} />
                                            <div>
                                                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                                    {file.name}
                                                </div>
                                                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                    {(file.size / 1024).toFixed(1)} KB
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                                className="p-1.5 rounded-lg transition-all"
                                                style={{ color: 'var(--text-muted)' }}>
                                                <X size={14} />
                                            </button>
                                            <button onClick={analyze}
                                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                                                style={{ background: 'var(--accent)', color: 'white' }}>
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

                        {/* STATUS: PROCESSING */}
                        {status === 'PROCESSING' && (
                            <ProcessingEngine onStop={cancelAnalysis} />
                        )}

                        {/* STATUS: ERROR */}
                        {status === 'ERROR' && (
                            <div className="fade-up text-center py-12">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                                    style={{ background: 'var(--red-muted)', color: 'var(--red)' }}>
                                    <AlertCircle size={22} />
                                </div>
                                <h3 className="text-base font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                                    Analysis Failed
                                </h3>
                                <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>{error}</p>
                                <button onClick={() => { setStatus('IDLE'); setError(''); }}
                                    className="px-4 py-2 rounded-lg text-sm font-medium"
                                    style={{ background: 'var(--accent)', color: 'white' }}>
                                    Try Again
                                </button>
                            </div>
                        )}

                        {/* STATUS: SUCCESS → Results or Dashboard */}
                        {status === 'SUCCESS' && data && (
                            <div className="fade-up">
                                {/* View Toggle */}
                                <div className="flex items-center gap-1 mb-5 p-1 rounded-xl w-fit"
                                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                                    <button onClick={() => setActiveView('results')}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all"
                                        style={{
                                            background: activeView === 'results' ? 'var(--accent)' : 'transparent',
                                            color: activeView === 'results' ? 'white' : 'var(--text-muted)',
                                        }}>
                                        <ClipboardList size={13} /> Analysis
                                    </button>
                                    <button onClick={() => setActiveView('dashboard')}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all"
                                        style={{
                                            background: activeView === 'dashboard' ? 'var(--accent)' : 'transparent',
                                            color: activeView === 'dashboard' ? 'white' : 'var(--text-muted)',
                                        }}>
                                        <BarChart3 size={13} /> Scores
                                    </button>
                                </div>

                                {/* New Analysis Button */}
                                <div className="flex justify-end mb-4">
                                    <button onClick={() => { setStatus('IDLE'); setFile(null); setActiveId(null); }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
                                        style={{ background: 'var(--bg-card)', color: 'var(--accent)', border: '1px solid var(--border)' }}>
                                        <Upload size={12} /> New Analysis
                                    </button>
                                </div>

                                {activeView === 'results' ? (
                                    <ResultsView data={data}
                                        onTranslate={lang !== 'English' ? handleTranslate : null} />
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
