import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Globe, Building2, Scale, Briefcase, BookOpen, ExternalLink, Loader2 } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function ResourcesView() {
    const [resources, setResources] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${API}/api/resources`).then(r => { setResources(r.data); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-center py-16"><Loader2 size={32} className="animate-spin mx-auto" style={{ color: 'var(--accent)' }} /></div>;
    if (!resources) return null;

    const groups = resources.resources || {};
    const labels = { government_portals: 'Government Portals', compliance_resources: 'Compliance & Tax', business_tools: 'Business Tools', learning_resources: 'Learning & Support' };
    const icons = { government_portals: Building2, compliance_resources: Scale, business_tools: Briefcase, learning_resources: BookOpen };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="card p-6">
                <h3 className="text-xl font-bold flex items-center gap-2 mb-1"><Globe size={22} style={{ color: 'var(--accent)' }} /> Business Resources</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Curated, verified resources for Indian MSMEs</p>
            </div>
            {Object.entries(groups).map(([key, items]) => {
                const Icon = icons[key] || Globe;
                return (
                    <div key={key} className="card p-6">
                        <h4 className="font-semibold mb-4 flex items-center gap-2"><Icon size={18} style={{ color: 'var(--accent)' }} /> {labels[key] || key}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {items.map((r, i) => (
                                <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                                    className="p-4 rounded-xl flex items-start gap-3 transition-all hover:shadow-md group"
                                    style={{ background: 'var(--bg-secondary)', textDecoration: 'none', color: 'inherit' }}>
                                    <ExternalLink size={16} className="flex-shrink-0 mt-0.5 opacity-50 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--accent)' }} />
                                    <div>
                                        <p className="font-medium text-sm group-hover:underline">{r.name}</p>
                                        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{r.desc}</p>
                                        <span className="badge badge-gray text-[10px] mt-2">{r.category}</span>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
