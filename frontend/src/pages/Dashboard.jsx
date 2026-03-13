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

    const buildAnalyticsFromHistory = (items = []) => {
        const rows = Array.isArray(items) ? items : [];
        const riskBreakdown = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
        const riskScores = [];
        const sustainabilityScores = [];
        const profitabilityScores = [];
        const schemes = [];
        const sectors = new Set();
        let paperSaved = 0;
        let co2Saved = 0;
        let costSaved = 0;

        rows.forEach((item) => {
            const analysis = item?.analysis && typeof item.analysis === 'object' ? item.analysis : item;
            const risk = analysis?.risk_score || {};
            const sustainability = analysis?.sustainability || {};
            const profitability = analysis?.profitability || {};
            const policyMeta = analysis?.policy_metadata || {};

            const score = Number(risk?.overall_score);
            if (!Number.isNaN(score)) {
                riskScores.push(score);
            }

            const band = String(risk?.overall_band || 'MEDIUM').toUpperCase();
            if (Object.prototype.hasOwnProperty.call(riskBreakdown, band)) {
                riskBreakdown[band] += 1;
            }

            const greenScore = Number(sustainability?.green_score);
            if (!Number.isNaN(greenScore)) {
                sustainabilityScores.push(greenScore);
            }

            const roi = Number(profitability?.roi_multiplier);
            if (!Number.isNaN(roi)) {
                profitabilityScores.push(roi);
            }

            paperSaved += Number(sustainability?.paper_saved || 0);
            co2Saved += Number(sustainability?.co2_saved_kg || 0);
            costSaved += Number(sustainability?.cost_saved_inr || 0);

            const matchedSchemes = Array.isArray(analysis?.matched_schemes) ? analysis.matched_schemes : [];
            matchedSchemes.forEach((scheme) => {
                const name = typeof scheme === 'string' ? scheme : scheme?.name;
                if (name && !schemes.includes(name)) schemes.push(name);
            });

            const sector = policyMeta?.policy_type || policyMeta?.issuing_authority;
            if (sector) sectors.add(sector);
        });

        const scoreTrend = rows.slice(0, 20).map((item) => {
            const analysis = item?.analysis && typeof item.analysis === 'object' ? item.analysis : item;
            const risk = analysis?.risk_score || {};
            const sustainability = analysis?.sustainability || {};
            const policyMeta = analysis?.policy_metadata || {};
            return {
                timestamp: analysis?.timestamp || item?.timestamp,
                risk_score: Number(risk?.overall_score || 0),
                green_score: Number(sustainability?.green_score || 0),
                policy_name: policyMeta?.policy_name || 'Unknown Policy',
            };
        });

        const avg = (arr, precision = 1) => (arr.length ? Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(precision)) : 0);

        return {
            total_analyses: rows.length,
            avg_risk_score: avg(riskScores, 1),
            avg_sustainability_score: avg(sustainabilityScores, 1),
            avg_profitability_multiplier: avg(profitabilityScores, 2),
            risk_breakdown: riskBreakdown,
            sectors_covered: Array.from(sectors),
            schemes_matched: schemes,
            total_schemes: schemes.length,
            sustainability_totals: {
                paper_saved: Number(paperSaved.toFixed(0)),
                co2_saved_kg: Number(co2Saved.toFixed(2)),
                cost_saved_inr: Number(costSaved.toFixed(2)),
            },
            score_trend: scoreTrend,
        };
    };

    useEffect(() => {
        const key = user ? `pair-welcome-${user.uid}` : 'pair-welcome';
        if (!localStorage.getItem(key)) {
            setShowWelcome(true);
        }
    }, [user]);

    const fetchAnalytics = async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${API}/api/analytics/${user.uid}`, { timeout: 10000 });
            setAnalytics(res.data);
        } catch (err) {
            try {
                const fallback = await axios.get(`${API}/api/history`, { params: { user_uid: user.uid }, timeout: 10000 });
                const fallbackAnalytics = buildAnalyticsFromHistory(fallback?.data || []);
                setAnalytics(fallbackAnalytics);
            } catch (_) {
                setError('Failed to load analytics. Please ensure backend is running and reachable.');
            }
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
