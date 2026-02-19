import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import UploadView from '../components/UploadView';
import ProcessingView from '../components/ProcessingView';
import ResultsView from '../components/ResultsView';
import { useAppContext } from '../context/AppContext';

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Analysis() {
    const { user, language, profile, refreshHistory } = useAppContext();
    const navigate = useNavigate();
    const [status, setStatus] = useState('IDLE'); // IDLE | PROCESSING | DONE | ERROR
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    const handleAnalyze = async (file) => {
        setStatus('PROCESSING');
        setError(null);

        const fd = new FormData();
        fd.append('file', file);
        if (user?.uid) fd.append('user_uid', user.uid);
        fd.append('language', language.code);

        try {
            const res = await axios.post(`${API}/api/analyze`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 120000, // 2 min timeout for large documents
            });

            // Refresh history in context
            if (refreshHistory) await refreshHistory();

            // If response has an id, we can navigate to the result page
            if (res.data?.id) {
                navigate(`/analysis/${res.data.id}`);
            } else {
                // Show results inline if no id returned
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
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Analysis Results</h2>
                    <div className="flex items-center gap-2">
                        <button onClick={() => navigate('/')} className="btn btn-ghost">Home</button>
                        <button onClick={() => { setStatus('IDLE'); setResult(null); }} className="btn btn-secondary">New Analysis</button>
                    </div>
                </div>
                <ResultsView data={result} language={language} profile={profile} />
            </div>
        );
    }

    return (
        <div>
            {status === 'ERROR' && (
                <div className="max-w-2xl mx-auto mb-4 p-4 rounded-xl flex items-center gap-3" style={{ background: 'var(--red-light)' }}>
                    <span style={{ color: 'var(--red)' }}>⚠️</span>
                    <p className="flex-1 text-sm" style={{ color: 'var(--red)' }}>{error}</p>
                    <button onClick={() => setStatus('IDLE')} className="btn btn-sm btn-ghost" style={{ color: 'var(--red)' }}>Retry</button>
                </div>
            )}
            <UploadView onAnalyze={handleAnalyze} />
        </div>
    );
}
