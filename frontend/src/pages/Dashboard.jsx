import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, Home, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnalyticsView from '../components/AnalyticsView';
import WelcomeModal from '../components/WelcomeModal';
import { useAppContext } from '../context/AppContext';
import useTranslate from '../hooks/useTranslate';

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Dashboard() {
    const { user, language } = useAppContext();
    const lang = language?.code || 'en';
    const { gt } = useTranslate(lang);
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showWelcome, setShowWelcome] = useState(false);

    useEffect(() => {
        const key = user ? `pair-welcome-${user.uid}` : 'pair-welcome';
        if (!localStorage.getItem(key)) {
            setShowWelcome(true);
        }
    }, [user]);

    const fetchAnalytics = async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${API}/api/analytics/${user.uid}`, { timeout: 10000 });
            setAnalytics(res.data);
        } catch (err) {
            setError('Failed to load analytics. Check your connection.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [user]);

    const closeWelcome = () => {
        const key = user ? `pair-welcome-${user.uid}` : 'pair-welcome';
        localStorage.setItem(key, '1');
        setShowWelcome(false);
    };

    return (
        <div className="w-full px-6 animate-fade-in-up">
            {showWelcome && <WelcomeModal onClose={closeWelcome} />}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                    <BarChart3 size={24} style={{ color: 'var(--accent)' }} /> {gt('Analytics Dashboard')}
                </h2>
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate('/')} className="btn btn-ghost">
                        <Home size={16} /> {gt('Home')}
                    </button>
                    <button onClick={() => navigate(-1)} className="btn btn-secondary">
                        <ArrowLeft size={16} /> {gt('Back')}
                    </button>
                </div>
            </div>
            <AnalyticsView analytics={analytics} loading={loading} error={error} onRetry={fetchAnalytics} lang={lang} />
        </div>
    );
}
