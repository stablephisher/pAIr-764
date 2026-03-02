import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, Home, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnalyticsView from '../components/AnalyticsView';
import { useAppContext } from '../context/AppContext';
import { t } from '../i18n/translations';

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Dashboard() {
    const { user, language } = useAppContext();
    const lang = language?.code || 'en';
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            axios.get(`${API}/api/analytics/${user.uid}`)
                .then(res => setAnalytics(res.data))
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [user]);

    return (
        <div className="max-w-5xl mx-auto animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                    <BarChart3 size={24} style={{ color: 'var(--accent)' }} /> {t('Analytics Dashboard', lang)}
                </h2>
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate('/')} className="btn btn-ghost">
                        <Home size={16} /> {t('Home', lang)}
                    </button>
                    <button onClick={() => navigate(-1)} className="btn btn-secondary">
                        <ArrowLeft size={16} /> {t('Back', lang)}
                    </button>
                </div>
            </div>
            <AnalyticsView analytics={analytics} loading={loading} lang={lang} />
        </div>
    );
}
