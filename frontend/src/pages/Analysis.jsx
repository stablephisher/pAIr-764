import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProcessingView from '../components/ProcessingView';
import ResultsView from '../components/ResultsView';
import { useAppContext } from '../context/AppContext';
import useTranslate from '../hooks/useTranslate';
import { Building2, Zap, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Analysis() {
    const { user, language, profile, refreshHistory } = useAppContext();
    const lang = language?.code || 'en';
    const { gt } = useTranslate(lang);
    const navigate = useNavigate();
    const [status, setStatus] = useState('IDLE'); // IDLE | PROCESSING | DONE | ERROR
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [selectedBiz, setSelectedBiz] = useState(0);

    const businesses = profile?.businesses?.length > 0
        ? profile.businesses
        : profile?.business_name
            ? [{ business_name: profile.business_name, sector: profile.sector, business_type: profile.business_type, state: profile.state, gstin: profile.gstin, udyam: profile.udyam }]
            : [];

    const handleAnalyze = async () => {
        const biz = businesses[selectedBiz];
        if (!biz) return;

        setStatus('PROCESSING');
        setError(null);

        try {
            const res = await axios.post(`${API}/api/smart-analysis`, {
                user_uid: user?.uid,
                business_name: biz.business_name || '',
                sector: biz.sector || '',
                business_type: biz.business_type || '',
                state: biz.state || '',
                gstin: biz.gstin || '',
                udyam: biz.udyam || '',
                language: language.code,
            }, { timeout: 120000 });

            if (refreshHistory) await refreshHistory();

            if (res.data?.id) {
                navigate(`/analysis/${res.data.id}`);
            } else {
                setResult(res.data);
                setStatus('DONE');
            }
        } catch (e) {
            console.error('Analysis error:', e);
            setError(e.response?.data?.detail || 'Analysis failed. Please try again.');
            setStatus('ERROR');
        }
    };

    if (status === 'PROCESSING') {
        return <ProcessingView onCancel={() => setStatus('IDLE')} />;
    }

    if (status === 'DONE' && result) {
        return (
            <div className="w-full px-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{gt('Analysis Results')}</h2>
                    <div className="flex items-center gap-2">
                        <button onClick={() => navigate('/')} className="btn btn-ghost">{gt('Home')}</button>
                        <button onClick={() => { setStatus('IDLE'); setResult(null); }} className="btn btn-secondary">{gt('New Analysis')}</button>
                    </div>
                </div>
                <ResultsView data={result} language={lang} profile={profile} />
            </div>
        );
    }

    return (
        <div className="w-full px-6 py-8 animate-fade-in-up">
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-4"
                    style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                    <Zap size={14} /> {gt('AI-Powered Analysis')}
                </div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>
                    {gt('Smart Business Analysis')}
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {gt('Select a business to get AI-driven compliance, risk, and sustainability insights.')}
                </p>
            </div>

            {status === 'ERROR' && (
                <div className="mb-6 p-4 rounded-xl flex items-center gap-3" style={{ background: 'var(--red-light)' }}>
                    <AlertCircle size={18} style={{ color: 'var(--red)' }} />
                    <p className="flex-1 text-sm" style={{ color: 'var(--red)' }}>{error}</p>
                    <button onClick={() => setStatus('IDLE')} className="btn btn-sm btn-ghost" style={{ color: 'var(--red)' }}>Dismiss</button>
                </div>
            )}

            {businesses.length === 0 ? (
                <div className="card p-8 text-center" style={{ border: '1px solid var(--border)' }}>
                    <Building2 size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-medium mb-2" style={{ color: 'var(--text)' }}>{gt('No businesses found')}</p>
                    <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{gt('Add a business in your profile to start analysis.')}</p>
                    <button onClick={() => navigate('/profile')} className="btn btn-primary btn-sm gap-1.5">
                        <Building2 size={14} /> {gt('Go to Profile')}
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                        {gt('Select a business to analyze')}:
                    </p>
                    {businesses.map((biz, idx) => (
                        <button key={idx} onClick={() => setSelectedBiz(idx)}
                            className="w-full text-left card p-5 transition-all"
                            style={{
                                border: selectedBiz === idx ? '2px solid var(--accent)' : '1px solid var(--border)',
                                background: selectedBiz === idx ? 'var(--accent-light)' : 'var(--bg-secondary)',
                            }}>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{
                                        background: selectedBiz === idx ? 'var(--accent)' : 'var(--bg-tertiary)',
                                        color: selectedBiz === idx ? 'white' : 'var(--text-secondary)',
                                    }}>
                                    <Building2 size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-sm" style={{ color: 'var(--text)' }}>
                                        {biz.business_name || 'Unnamed Business'}
                                    </h3>
                                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                        {[biz.sector, biz.business_type, biz.state].filter(Boolean).join(' • ') || 'No details'}
                                    </p>
                                    {(biz.gstin || biz.udyam) && (
                                        <div className="flex gap-3 mt-1">
                                            {biz.gstin && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}>GST: {biz.gstin}</span>}
                                            {biz.udyam && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}>UDYAM: {biz.udyam}</span>}
                                        </div>
                                    )}
                                </div>
                                {selectedBiz === idx && <CheckCircle size={20} style={{ color: 'var(--accent)' }} />}
                            </div>
                        </button>
                    ))}

                    <button onClick={handleAnalyze} disabled={businesses.length === 0}
                        className="btn btn-primary w-full py-3 gap-2 text-base mt-4">
                        <Zap size={18} /> {gt('Analyze')} {businesses[selectedBiz]?.business_name || gt('Business')}
                        <ArrowRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}
