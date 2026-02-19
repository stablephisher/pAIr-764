import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Home, Plus, AlertCircle, Loader2 } from 'lucide-react';
import ResultsView from '../components/ResultsView';
import { useAppContext } from '../context/AppContext';

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function AnalysisResult() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, language, profile } = useAppContext();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user || !id) return;

        // Fetch specific analysis
        // Since we don't have a direct /api/analysis/:id endpoint in all versions, 
        // we might need to search in history or user /api/history/id if implemented.
        // Assuming /api/history returns all, let's try to fetch all and find, OR fetch specific if backend supports it.
        // The previous App.jsx only filtered client-side.
        // BUT, I should check if backend has `GET /api/history/{id}`.
        // Looking at previous chats, it seems user added it? 
        // Or I can fallback to client-side filter if history is in context.

        // Let's try to fetch specifically or use existing context.

        const fetchAnalysis = async () => {
            setLoading(true);
            try {
                // Try fetch by ID if supported, otherwise from history list
                // Since I can't be sure of backend, I'll rely on AppContext history first if available?
                // But deep linking requires fetching.

                // Let's assume we can fetch history list and find it.
                const res = await axios.get(`${API}/api/history?user_uid=${user.uid}`);
                const all = Array.isArray(res.data) ? res.data : (res.data.analyses || []);
                const found = all.find(item => item.id === id);

                if (found) {
                    setResult(found);
                } else {
                    setError('Analysis not found.');
                }
            } catch (e) {
                setError('Failed to load analysis.');
            }
            setLoading(false);
        };

        fetchAnalysis();
    }, [user, id]);

    if (loading) return <div className="text-center py-20"><Loader2 size={40} className="animate-spin mx-auto text-accent" /></div>;

    if (error) return (
        <div className="max-w-md mx-auto text-center py-16 animate-fade-in-up">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'var(--red-light)', color: 'var(--red)' }}>
                <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Error</h3>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>{error}</p>
            <button onClick={() => navigate('/analysis/new')} className="btn btn-primary">
                New Analysis
            </button>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Analysis Results</h2>
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate('/')} className="btn btn-ghost">
                        <Home size={16} /> Home
                    </button>
                    <button onClick={() => navigate('/analysis/new')} className="btn btn-secondary">
                        <Plus size={16} /> New Analysis
                    </button>
                </div>
            </div>
            {result && <ResultsView data={result} language={language} profile={profile} />}
        </div>
    );
}
