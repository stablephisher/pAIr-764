import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, ArrowLeft } from 'lucide-react';
import ResourcesView from '../components/ResourcesView';
import { useAppContext } from '../context/AppContext';
import useTranslate from '../hooks/useTranslate';

export default function Resources() {
    const navigate = useNavigate();
    const { language } = useAppContext();
    const lang = language?.code || 'en';
    const { gt } = useTranslate(lang);

    return (
        <div className="w-full px-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                    <Globe size={24} style={{ color: 'var(--accent)' }} /> {gt('Business Resources')}
                </h2>
                <button onClick={() => navigate('/')} className="btn btn-ghost">
                    <ArrowLeft size={16} /> {gt('Back')}
                </button>
            </div>
            <ResourcesView />
        </div>
    );
}
