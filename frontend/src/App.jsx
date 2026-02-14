import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGoogle, logOut } from './firebase';
import axios from 'axios';
import {
    Upload, FileText, LogOut, ChevronDown, Languages, X,
    BarChart3, ClipboardList, Menu, Shield, Zap
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
    'Urdu', 'Maithili',  'Sanskrit', 'Nepali'
];

/* ════════════════════════════════════
   LOGIN PAGE - Clean & Minimal
   ════════════════════════════════════ */
function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [error, setState] = useState('');

    const login = async () => {
        setLoading(true);
        setError('');
        try { await signInWithGoogle(); }
        catch (e) { setError(e.message || 'Sign-in failed'); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center" style={{ background: 'var(--bg)' }}>
            <div className="w-full max-w-md px-6">
                <div className="text-center mb-10 fade-in">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                        style={{ background: 'var(--accent)' }}>
                        <Shield size={28} color="white" />
                    </div>
                    <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                        pAIr
                    </h1>
                    <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                        AI-powered policy compliance for MSMEs
                    </p>
                </div>

                <div className="card p-8 fade-in">
                    <button onClick={login} disabled={loading} className="btn btn-primary w-full">
                        {loading ? 'Signing in...' : 'Sign in with Google'}
                    </button>
                    {error && (
                        <p className="text-xs mt-4 text-center" style={{ color: 'var(--red)' }}>{error}</p>
                    )}
                </div>

                <footer className="text-center mt-8">
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        Code Unnati Innovation Marathon 4.0
                    </p>
                </footer>
            </div>
        </div>
    );
}

/* ════════════════════════════════════
   MAIN APP
   ════════════════════════════════════ */
export default function App() {
    const [user, setUser] = useState(null);
    const [loaded, setLoaded] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    
    // UI State
    const [state, setState] = useState('IDLE'); // IDLE | PROCESSING | ERROR | SUCCESS
    const [view, setView] = useState('upload'); // upload | results | dashboard
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [language, setLanguage] = useState('English');
    const [langOpen, setLangOpen] = useState(false);
    
    // Data
    const [file, setFile] = useState(null);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState([]);
    const [activeId, setActiveId] = useState(null);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, u => {
            setUser(u);
            setLoaded(true);
            if (u) loadHistory(u);
        });
        return unsub;
    }, []);

    const loadHistory = async (u) => {
        try {
            const res = await axios.get(`${API}/api/history?uid=${u.uid}`);
            setHistory(res.data.analyses || []);
        } catch (e) {
            console.error('Load history error:', e);
        }
    };

    const handleFileSelect = (e) => {
        const f = e.target.files?.[0];
        if (f && f.type === 'application/pdf') {
            setFile(f);
            setError(null);
        } else {
            setError('Please select a valid PDF file');
        }
    };

    const analyze = async () => {
        if (!file || !user) return;
        
        setState('PROCESSING');
        const fd = new FormData();
        fd.append('file', file);
        fd.append('uid', user.uid);
        fd.append('language', language);

        try {
            const res = await axios.post(`${API}/api/analyze`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResult(res.data);
            setState('SUCCESS');
            setView('results');
            setFile(null);
            loadHistory(user);
        } catch (e) {
            console.error('Analysis error:', e);
            setError(e.response?.data?.detail || 'Analysis failed. Please try again.');
            setState('ERROR');
        }
    };

    const loadPastAnalysis = async (id) => {
        setActiveId(id);
        setState('PROCESSING');
        try {
            const res = await axios.get(`${API}/api/analysis/${id}?uid=${user.uid}`);
            setResult(res.data);
            setState('SUCCESS');
            setView('results');
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
                setView('upload');
                setResult(null);
            }
        } catch (e) {
            console.error('Delete error:', e);
        }
    };

    const newAnalysis = () => {
        setState('IDLE');
        setView('upload');
        setFile(null);
        setResult(null);
        setError(null);
        setActiveId(null);
    };

    if (!loaded) {
        return <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
            <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Loading...</span>
        </div>;
    }

    if (!user) return <LoginPage />;
    if (showOnboarding) return <OnboardingWizard onComplete={() => setShowOnboarding(false)} onSkip={() => setShowOnboarding(false)} />;

    return (
        <div className="flex w-full h-screen" style={{ background: 'var(--bg)' }}>
            {/* SIDEBAR */}
            {sidebarOpen && <Sidebar history={history} activeId={activeId} onSelect={loadPastAnalysis} onDelete={deleteAnalysis} />}

            {/* MAIN */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* TOPBAR */}
                <div className="topbar justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="btn-ghost p-2">
                            <Menu size={20} />
                        </button>
                        <div className="flex items-center gap-2">
                            <Zap size={20} style={{ color: 'var(--accent)' }} />
                            <span className="font-bold text-lg">pAIr</span>
                            <span className="badge badge-accent" style={{ fontSize: '9px' }}>BETA</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Language Selector */}
                        <div className="relative">
                            <button onClick={() => setLangOpen(!langOpen)} className="btn-ghost flex items-center gap-2 px-3 py-2">
                                <Languages size={16} />
                                <span className="text-sm">{language}</span>
                                <ChevronDown size={14} />
                            </button>
                            {langOpen && (
                                <div className="absolute right-0 mt-2 card w-48 max-h-64 overflow-y-auto shadow-lg z-50">
                                    {LANGUAGES.map(lang => (
                                        <button key={lang} onClick={() => { setLanguage(lang); setLangOpen(false); }}
                                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition">
                                            {lang}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button onClick={logOut} className="btn-ghost px-3 py-2">
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>

                {/* CONTENT */}
                <div className="flex-1 overflow-auto p-6">
                    {state === 'PROCESSING' && <ProcessingEngine />}

                    {state === 'IDLE' && view === 'upload' && (
                        <div className="max-w-2xl mx-auto fade-in">
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold mb-2">Upload a Policy Document</h2>
                                <p style={{ color: 'var(--text-secondary)' }}>
                                    Get instant compliance analysis, risk scores, and scheme matching
                                </p>
                            </div>

                            <div className="card p-10 text-center">
                                <input type="file" id="file-upload" accept=".pdf" onChange={handleFileSelect} className="hidden" />
                                <label htmlFor="file-upload" className="cursor-pointer">
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                                        style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                                        <Upload size={28} />
                                    </div>
                                    <p className="font-medium mb-1">Click to upload or drag and drop</p>
                                    <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>PDF files only</p>
                                </label>

                                {file && (
                                    <div className="mt-6 p-4 rounded-lg flex items-center justify-between"
                                        style={{ background: 'var(--bg-hover)' }}>
                                        <div className="flex items-center gap-3">
                                            <FileText size={20} style={{ color: 'var(--accent)' }} />
                                            <span className="text-sm font-medium">{file.name}</span>
                                        </div>
                                        <button onClick={() => setFile(null)} className="btn-ghost p-1">
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}

                                {error && (
                                    <div className="mt-4 p-3 rounded-lg" style={{ background: 'var(--red-light)' }}>
                                        <p className="text-sm" style={{ color: 'var(--red)' }}>{error}</p>
                                    </div>
                                )}

                                {file && !error && (
                                    <button onClick={analyze} className="btn btn-primary mt-6 w-full">
                                        <Zap size={16} />
                                        Analyze Document
                                    </button>
                                )}
                            </div>

                            <div className="text-center mt-6">
                                <button onClick={() => setShowOnboarding(true)} className="btn-ghost text-sm">
                                    Complete personalization questionnaire →
                                </button>
                            </div>
                        </div>
                    )}

                    {state === 'SUCCESS' && result && view === 'results' && (
                        <div className="max-w-6xl mx-auto fade-in">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">Analysis Results</h2>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setView('dashboard')} className={`btn ${view === 'dashboard' ? 'btn-primary' : 'btn-ghost'}`}>
                                        <BarChart3 size={16} />
                                        Scores
                                    </button>
                                    <button onClick={() => setView('results')} className={`btn ${view === 'results' ? 'btn-primary' : 'btn-ghost'}`}>
                                        <ClipboardList size={16} />
                                        Details
                                    </button>
                                    <button onClick={newAnalysis} className="btn-ghost">
                                        New Analysis
                                    </button>
                                </div>
                            </div>

                            {view === 'results' && <ResultsView data={result} />}
                            {view === 'dashboard' && <Dashboard data={result} />}
                        </div>
                    )}

                    {state === 'ERROR' && (
                        <div className="max-w-xl mx-auto text-center fade-in">
                            <div className="card p-10">
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                                    style={{ background: 'var(--red-light)', color: 'var(--red)' }}>
                                    <X size={28} />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Analysis Failed</h3>
                                <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>{error}</p>
                                <button onClick={newAnalysis} className="btn btn-primary">
                                    Try Again
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
