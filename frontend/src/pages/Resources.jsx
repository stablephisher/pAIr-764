import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, ArrowLeft } from 'lucide-react';
import ResourcesView from '../components/ResourcesView';

export default function Resources() {
    const navigate = useNavigate();

    return (
        <div className="max-w-5xl mx-auto animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                    <Globe size={24} style={{ color: 'var(--accent)' }} /> Business Resources
                </h2>
                <button onClick={() => navigate('/')} className="btn btn-ghost">
                    <ArrowLeft size={16} /> Back
                </button>
            </div>
            <ResourcesView />
        </div>
    );
}
