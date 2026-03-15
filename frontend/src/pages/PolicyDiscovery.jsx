import React, { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, Globe, Shield, TrendingUp, AlertCircle, CheckCircle2, ExternalLink, Mic, MicOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext, apiClient } from '../context/AppContext';
import useTranslate from '../hooks/useTranslate';

export default function PolicyDiscovery() {
    const { user, language } = useAppContext();
    const lang = language?.code || 'en';
    const { gt } = useTranslate(lang);
    const navigate = useNavigate();

    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [scanStatus, setScanStatus] = useState(null);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [listening, setListening] = useState(false);

    // Fetch discovery status on mount
    useEffect(() => {
        apiClient.get(`/api/discover/status`)
            .then(res => setScanStatus(res.data))
            .catch(() => {});
    }, []);

    const runDiscovery = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiClient.post(`/api/discover/policies`, {
                user_uid: user?.uid,
            }, { timeout: 60000 });
            setPolicies(res.data.policies || []);
            setScanStatus(prev => ({
                ...prev,
                last_scan: new Date().toISOString(),
                total_scans: (prev?.total_scans || 0) + 1,
            }));
            // If scan returned errors internally (no API keys etc), show soft warning
            if (res.data.errors?.length > 0 && res.data.policies?.length === 0) {
                setError('Search API keys not configured. Please add TAVILY_API_KEY or SERPER_API_KEY to the backend environment.');
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Discovery scan failed. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [user]);

    const runSearch = useCallback(async () => {
        if (!searchQuery.trim()) return;
        setLoading(true);
        try {
            const res = await apiClient.post(`/api/search/policies`, {
                query: searchQuery,
                top_k: 10,
            });
            setSearchResults(res.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Search failed');
        } finally {
            setLoading(false);
        }
    }, [searchQuery]);

    // Voice input via Web Speech API
    const toggleVoice = useCallback(() => {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            setError('Voice input not supported in this browser');
            return;
        }
        if (listening) {
            setListening(false);
            return;
        }
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
        recognition.interimResults = false;
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setSearchQuery(transcript);
            setListening(false);
        };
        recognition.onerror = () => setListening(false);
        recognition.onend = () => setListening(false);
        recognition.start();
        setListening(true);
    }, [listening, lang]);

    const analyzePolicy = async (policy) => {
        try {
            const res = await apiClient.post(`/api/discover/analyze`, {
                user_uid: user?.uid,
                business_profile: null,
                source_ids: null,
            });
            if (res.data.analyses?.length > 0) {
                navigate(`/analysis/${res.data.analyses[0].analysis_id || 'latest'}`);
            }
        } catch (err) {
            setError('Analysis failed: ' + (err.response?.data?.detail || err.message));
        }
    };

    return (
        <div className="w-full px-6 animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 mt-9">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <Globe size={24} style={{ color: 'var(--accent)' }} />
                        {gt('Policy Discovery')}
                    </h2>
                    <p className="text-sm opacity-70 mt-1">
                        {gt('Auto-discover relevant government policies and schemes for your business')}
                    </p>
                </div>
                <button
                    onClick={runDiscovery}
                    disabled={loading}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    {loading ? gt('Scanning...') : gt('Discover Policies')}
                </button>
            </div>

            {/* Search Bar */}
            <div className="card mb-3">
                <div className="flex items-center gap-2 p-4">
                    <Search size={18} className="opacity-50 flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && runSearch()}
                        placeholder={gt('Search policies by keyword, sector, or compliance area...')}
                        className="input input-bordered flex-1 min-w-0"
                    />
                    <button
                        onClick={toggleVoice}
                        className={`btn btn-ghost btn-icon flex-shrink-0 ${listening ? 'btn-error' : ''}`}
                        title={gt('Voice search')}
                    >
                        {listening ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>
                    <button onClick={runSearch} disabled={loading} className="btn btn-secondary flex-shrink-0">
                        {gt('Search')}
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="alert alert-error mb-4 flex items-center gap-2">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="ml-auto btn btn-ghost btn-sm">✕</button>
                </div>
            )}

            {/* Scan Status */}
            {scanStatus && (
                <div className="card mb-4 bg-base-200">
                    <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                            <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />
                            {gt('Discovery')}: {scanStatus.enabled ? gt('Active') : gt('Disabled')}
                        </span>
                        {scanStatus.last_scan && (
                            <span className="opacity-70">
                                {gt('Last scan')}: {new Date(scanStatus.last_scan).toLocaleString()}
                            </span>
                        )}
                        <span className="opacity-70">
                            {gt('Total scans')}: {scanStatus.total_scans || 0}
                        </span>
                    </div>
                </div>
            )}

            {/* Semantic Search Results */}
            {searchResults && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Search size={18} />
                        {gt('Search Results')} ({searchResults.total})
                    </h3>
                    {searchResults.results?.length === 0 ? (
                        <p className="opacity-60">{gt('No matching policies found. Try running a discovery scan first.')}</p>
                    ) : (
                        <div className="space-y-3">
                            {searchResults.results?.map((r, i) => (
                                <div key={i} className="card hover:shadow-lg transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h4 className="font-semibold">{r.metadata?.title || 'Untitled Policy'}</h4>
                                            <p className="text-sm opacity-70 mt-1">{r.metadata?.source || ''}</p>
                                        </div>
                                        <span className="badge badge-primary">{(r.similarity_score * 100).toFixed(0)}% match</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Discovered Policies */}
            {policies.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Shield size={18} />
                        {gt('Discovered Policies')} ({policies.length})
                    </h3>
                    <div className="space-y-3">
                        {policies.map((p, i) => (
                            <div key={p.discovery_id || i} className="card hover:shadow-lg transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h4 className="font-semibold">{p.title}</h4>
                                        <p className="text-sm opacity-70 mt-1 line-clamp-2">
                                            {p.content_snippet}
                                        </p>
                                        <div className="flex items-center gap-3 mt-2 text-xs">
                                            <span className="flex items-center gap-1 opacity-60">
                                                <Globe size={12} /> {p.source}
                                            </span>
                                            {p.sectors?.map(s => (
                                                <span key={s} className="badge badge-sm badge-outline">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 ml-4">
                                        <span className="badge badge-primary">
                                            <TrendingUp size={12} className="mr-1" />
                                            {(p.relevance_score * 100).toFixed(0)}%
                                        </span>
                                        <div className="flex gap-1">
                                            {p.url && (
                                                <a
                                                    href={p.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-ghost btn-xs"
                                                >
                                                    <ExternalLink size={12} />
                                                </a>
                                            )}
                                            <button
                                                onClick={() => analyzePolicy(p)}
                                                className="btn btn-primary btn-xs"
                                            >
                                                {gt('Analyze')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loading && policies.length === 0 && !searchResults && (
                <div className="text-center py-16 opacity-60">
                    <Globe size={48} className="mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">{gt('No policies discovered yet')}</h3>
                    <p className="text-sm mt-2">
                        {gt('Click "Discover Policies" to scan government sources for relevant regulations and schemes.')}
                    </p>
                </div>
            )}
        </div>
    );
}
