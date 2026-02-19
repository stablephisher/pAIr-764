import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, ArrowLeft } from 'lucide-react';
import CompetitorAnalysisView from '../components/CompetitorAnalysisView';
import { useAppContext } from '../context/AppContext';

export default function CompetitorAnalysis() {
    const { profile } = useAppContext();
    const navigate = useNavigate();

    return (
        <div className="max-w-5xl mx-auto animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                    <Briefcase size={24} style={{ color: 'var(--accent)' }} /> Competitor Analysis
                </h2>
                <button onClick={() => navigate('/')} className="btn btn-ghost">
                    <ArrowLeft size={16} /> Back
                </button>
            </div>
            <CompetitorAnalysisView profile={profile} onBack={() => navigate('/')} />
        </div>
    );
}
