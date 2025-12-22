import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, AlertCircle, Sun, Moon, Zap, Globe } from 'lucide-react';
import ResultsView from './components/ResultsView';
import ProcessingEngine from './components/ProcessingEngine';
import Sidebar from './components/Sidebar';

const API_BASE_URL = "http://localhost:8000";

// 15+ Indian Languages
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
    { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
    { code: 'as', name: 'Assamese', native: 'অসমীয়া' },
    { code: 'ur', name: 'Urdu', native: 'اردو' },
    { code: 'sa', name: 'Sanskrit', native: 'संस्कृतम्' },
    { code: 'ne', name: 'Nepali', native: 'नेपाली' },
    { code: 'kok', name: 'Konkani', native: 'कोंकणी' },
];

function App() {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('IDLE');
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState([]);
    const [showSidebar, setShowSidebar] = useState(true);
    const [showDebug, setShowDebug] = useState(false);
    const [showSources, setShowSources] = useState(false);
    const [abortController, setAbortController] = useState(null);
    const [debugLogs, setDebugLogs] = useState([]);
    const [theme, setTheme] = useState('dark');
    const [isDragging, setIsDragging] = useState(false);
    const [language, setLanguage] = useState('en');
    const [showLanguages, setShowLanguages] = useState(false);
    const [translatedData, setTranslatedData] = useState(null);
    const [isTranslating, setIsTranslating] = useState(false);

    // Auto-translate when language changes
    useEffect(() => {
        const translateData = async () => {
            if (!data || language === 'en') {
                setTranslatedData(null);
                return;
            }

            setIsTranslating(true);
            try {
                const response = await axios.post(`${API_BASE_URL}/api/translate`, {
                    data: data,
                    target_language: language
                });
                setTranslatedData(response.data);
            } catch (err) {
                console.error('Translation failed:', err);
                setTranslatedData(null);
            } finally {
                setIsTranslating(false);
            }
        };

        translateData();
    }, [language, data]);

    // Theme Effect
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const addLog = (msg) => {
        const timestamp = new Date().toLocaleTimeString();
        setDebugLogs(prev => [`[${timestamp}] ${msg}`, ...prev]);
    };

    // Poll history
    useEffect(() => {
        fetchHistory();
        const interval = setInterval(() => fetchHistory(true), 3000);
        return () => clearInterval(interval);
    }, []);

    const fetchHistory = async (silent = false) => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/history`);
            setHistory(res.data);
        } catch (e) {
            if (!silent) console.error("Failed to fetch history", e);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    // Drag and Drop Handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile && droppedFile.type === 'application/pdf') {
            setFile(droppedFile);
            setError(null);
        } else {
            setError('Please drop a PDF file.');
        }
    };

    const handleStop = () => {
        abortController?.abort();
        setAbortController(null);
        setStatus('IDLE');
        setError("Analysis stopped by user.");
    };

    const handleUpload = async () => {
        if (!file) return;

        setStatus('PROCESSING');
        setError(null);
        setDebugLogs([]);
        addLog("Starting upload...");

        const controller = new AbortController();
        setAbortController(controller);

        const formData = new FormData();
        formData.append('file', file);

        try {
            addLog(`Connecting to ${API_BASE_URL}...`);
            const response = await axios.post(`${API_BASE_URL}/api/analyze`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 300000,
                signal: controller.signal
            });

            setData(response.data);
            setStatus('SUCCESS');
            fetchHistory();
            addLog("Analysis complete!");

        } catch (err) {
            if (axios.isCancel(err)) {
                addLog('Canceled by user.');
            } else {
                const errMsg = err.response?.data?.detail || err.message || "An error occurred";
                addLog(`ERROR: ${errMsg}`);
                setError(errMsg);
                setStatus('ERROR');
            }
        } finally {
            setAbortController(null);
        }
    };

    return (
        <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-primary)' }}>
            {/* Sidebar */}
            {showSidebar && (
                <Sidebar
                    history={history}
                    onSelect={(item) => { setData(item); setStatus('SUCCESS'); }}
                    onClear={async () => {
                        if (confirm("Clear all history?")) {
                            await axios.delete(`${API_BASE_URL}/api/history`);
                            setHistory([]);
                        }
                    }}
                    onDelete={async (id) => {
                        await axios.delete(`${API_BASE_URL}/api/history/${id}`);
                        setHistory(prev => prev.filter(item => item.id !== id));
                    }}
                />
            )}

            {/* Main Content */}
            <div className={`main-content ${showSidebar ? 'sidebar-open' : ''}`}>
                {/* Header */}
                <div className="app-header">
                    <div className="header-left">
                        <button
                            onClick={() => setShowSidebar(!showSidebar)}
                            className="btn btn-secondary text-sm"
                        >
                            {showSidebar ? '← Hide' : '→ History'}
                        </button>
                    </div>

                    <div className="text-center">
                        <h1 className="title">Policy Ingestion Agent</h1>
                        <p className="subtitle" style={{ marginBottom: 0 }}>
                            AI-Powered Compliance Intelligence
                        </p>
                    </div>

                    <div className="header-right">
                        {/* Language Selector */}
                        <div className="relative">
                            <button
                                onClick={() => setShowLanguages(!showLanguages)}
                                className="theme-toggle"
                                title="Change Language"
                            >
                                🌍
                            </button>
                            {showLanguages && (
                                <div
                                    className="absolute right-0 top-12 w-48 max-h-64 overflow-y-auto rounded-xl shadow-xl z-50"
                                    style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
                                >
                                    {LANGUAGES.map(lang => (
                                        <button
                                            key={lang.code}
                                            onClick={() => { setLanguage(lang.code); setShowLanguages(false); }}
                                            className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-500/10 flex justify-between items-center ${language === lang.code ? 'bg-blue-500/20' : ''}`}
                                            style={{ color: 'var(--text-primary)' }}
                                        >
                                            <span>{lang.name}</span>
                                            <span style={{ color: 'var(--text-muted)' }}>{lang.native}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={toggleTheme}
                            className="theme-toggle"
                            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                        >
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <button
                            onClick={() => setShowSources(true)}
                            className="btn btn-secondary text-sm"
                            title="Manage URL Sources"
                        >
                            🌐 Sources
                        </button>
                        <button
                            onClick={() => setShowDebug(true)}
                            className="btn btn-secondary text-sm"
                        >
                            <Zap size={16} /> AI Logic
                        </button>
                    </div>
                </div>

                {/* Main Area */}
                <main>
                    {status === 'IDLE' || status === 'ERROR' ? (
                        <div className="upload-area animate-fadeIn">
                            <div
                                className={`upload-box ${isDragging ? 'dragging' : ''}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                style={isDragging ? {
                                    borderColor: 'var(--accent-primary)',
                                    backgroundColor: 'rgba(59, 130, 246, 0.05)'
                                } : {}}
                            >
                                <div
                                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                                    style={{ backgroundColor: 'var(--bg-tertiary)' }}
                                >
                                    <Upload size={28} style={{ color: isDragging ? 'var(--accent-primary)' : 'var(--text-secondary)' }} />
                                </div>

                                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                                    {isDragging ? 'Drop PDF Here' : 'Upload Policy Document'}
                                </h3>
                                <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                                    {isDragging ? 'Release to upload' : 'Drag & drop or click to browse'}
                                </p>

                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="file-upload"
                                />

                                <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
                                    {file ? (
                                        <div
                                            className="flex items-center justify-between p-3 rounded-lg"
                                            style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
                                        >
                                            <span className="text-sm truncate flex-1" style={{ color: 'var(--text-primary)' }}>
                                                📄 {file.name}
                                            </span>
                                            <button
                                                onClick={() => setFile(null)}
                                                className="ml-2 p-1.5 rounded-lg hover:bg-red-500/20 text-red-500 transition-all"
                                                title="Remove file"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ) : (
                                        <label
                                            htmlFor="file-upload"
                                            className="btn btn-secondary cursor-pointer w-full"
                                        >
                                            📁 Select PDF File
                                        </label>
                                    )}

                                    <button
                                        onClick={handleUpload}
                                        disabled={!file}
                                        className="btn btn-primary w-full"
                                    >
                                        🚀 Analyze Policy
                                    </button>
                                </div>
                            </div>

                            {status === 'ERROR' && (
                                <div
                                    className="mt-4 p-4 rounded-lg flex items-center gap-3"
                                    style={{
                                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                        border: '1px solid rgba(239, 68, 68, 0.2)',
                                        color: 'var(--danger)'
                                    }}
                                >
                                    <AlertCircle size={20} />
                                    {error}
                                </div>
                            )}
                        </div>
                    ) : status === 'PROCESSING' ? (
                        <div className="text-center animate-fadeIn">
                            <ProcessingEngine />
                            <button
                                onClick={handleStop}
                                className="mt-6 btn"
                                style={{
                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                    color: 'var(--danger)',
                                    border: '1px solid rgba(239, 68, 68, 0.2)'
                                }}
                            >
                                Stop Analysis
                            </button>
                        </div>
                    ) : (
                        <div className="animate-fadeIn">
                            <div className="flex items-center justify-between mb-6">
                                <button
                                    onClick={() => { setStatus('IDLE'); setFile(null); setData(null); setTranslatedData(null); }}
                                    className="btn btn-secondary"
                                >
                                    ← Analyze Another
                                </button>
                                {isTranslating && (
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                            Translating to {LANGUAGES.find(l => l.code === language)?.name || language}...
                                        </span>
                                    </div>
                                )}
                            </div>
                            <ResultsView data={translatedData || data} language={language} />
                        </div>
                    )}
                </main>
            </div>

            {/* Debug Modal */}
            {showDebug && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
                    onClick={() => setShowDebug(false)}
                >
                    <div
                        className="card max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">AI Pipeline Info</h2>
                            <button onClick={() => setShowDebug(false)} className="text-gray-400 hover:text-red-500">
                                ✕
                            </button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                                <h3 className="font-medium text-green-500 mb-2">Step 1: Analyst</h3>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    Gemini 2.5 Flash extracts structured legal obligations from the PDF.
                                </p>
                            </div>
                            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                                <h3 className="font-medium text-purple-500 mb-2">Step 2: Planner</h3>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    A second AI agent creates actionable compliance steps for MSME owners.
                                </p>
                            </div>
                        </div>

                        {data?.debug_metadata && (
                            <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                                <h3 className="font-medium mb-3">Last Execution</h3>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>Models: <span className="text-blue-400">{data.debug_metadata.models_used?.join(', ')}</span></div>
                                    <div>Step 1: <span className="text-green-400">{data.debug_metadata.step_1_time?.toFixed(1)}s</span></div>
                                    <div>Step 2: <span className="text-purple-400">{data.debug_metadata.step_2_time?.toFixed(1)}s</span></div>
                                    <div>Total: <span className="text-orange-400">{(data.debug_metadata.step_1_time + data.debug_metadata.step_2_time)?.toFixed(1)}s</span></div>
                                </div>
                            </div>
                        )}

                        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                            <h3 className="font-medium mb-2">Debug Log</h3>
                            <div className="text-xs font-mono max-h-40 overflow-y-auto" style={{ color: 'var(--text-muted)' }}>
                                {debugLogs.length === 0 ? 'No logs yet...' : debugLogs.map((log, i) => (
                                    <div key={i} className="py-1 border-b border-gray-700/50">{log}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Sources Modal */}
            {showSources && (
                <SourcesModal onClose={() => setShowSources(false)} />
            )}
        </div>
    );
}

// Sources Modal Component
function SourcesModal({ onClose }) {
    const [sources, setSources] = useState([]);
    const [newUrl, setNewUrl] = useState('');
    const [newName, setNewName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSources();
    }, []);

    const fetchSources = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/sources');
            setSources(res.data);
        } catch (e) {
            console.error('Failed to fetch sources', e);
        } finally {
            setLoading(false);
        }
    };

    const addSource = async () => {
        if (!newUrl || !newName) return;
        try {
            await axios.post('http://localhost:8000/api/sources', {
                name: newName,
                url: newUrl
            });
            setNewUrl('');
            setNewName('');
            fetchSources();
        } catch (e) {
            console.error('Failed to add source', e);
        }
    };

    const removeSource = async (name) => {
        try {
            await axios.delete(`http://localhost:8000/api/sources/${encodeURIComponent(name)}`);
            fetchSources();
        } catch (e) {
            console.error('Failed to remove source', e);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
            onClick={onClose}
        >
            <div
                className="card max-w-lg w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">🌐 URL Sources</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500">✕</button>
                </div>

                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                    Add government portal URLs to automatically fetch new policy PDFs.
                </p>

                {/* Add New Source */}
                <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    <h3 className="font-medium text-sm mb-3">Add New Source</h3>
                    <div className="flex flex-col gap-2">
                        <input
                            type="text"
                            placeholder="Source Name (e.g. MSME Ministry)"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full p-2 rounded-lg text-sm"
                            style={{
                                backgroundColor: 'var(--bg-primary)',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-primary)'
                            }}
                        />
                        <input
                            type="url"
                            placeholder="URL (e.g. https://msme.gov.in/notifications)"
                            value={newUrl}
                            onChange={(e) => setNewUrl(e.target.value)}
                            className="w-full p-2 rounded-lg text-sm"
                            style={{
                                backgroundColor: 'var(--bg-primary)',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-primary)'
                            }}
                        />
                        <button
                            onClick={addSource}
                            disabled={!newUrl || !newName}
                            className="btn btn-primary text-sm"
                        >
                            + Add Source
                        </button>
                    </div>
                </div>

                {/* Sources List */}
                <div className="space-y-2">
                    <h3 className="font-medium text-sm mb-2">Active Sources</h3>
                    {loading ? (
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</p>
                    ) : sources.length === 0 ? (
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No sources configured.</p>
                    ) : (
                        sources.map((source, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between p-3 rounded-lg"
                                style={{ backgroundColor: 'var(--bg-tertiary)' }}
                            >
                                <div>
                                    <p className="font-medium text-sm">{source.name}</p>
                                    <p className="text-xs truncate max-w-xs" style={{ color: 'var(--text-muted)' }}>
                                        {source.url}
                                    </p>
                                </div>
                                <button
                                    onClick={() => removeSource(source.name)}
                                    className="p-2 hover:bg-red-500/10 rounded-lg text-red-500"
                                    title="Remove"
                                >
                                    ✕
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
