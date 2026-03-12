import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { FileText, ChevronRight, Trash2, ScrollText, Search, AlertCircle, Plus } from 'lucide-react';
import useTranslate from '../hooks/useTranslate';

export default function Policies() {
    const { history, deleteHistoryItem, clearHistory, language } = useAppContext();
    const lang = language?.code || 'en';
    const { gt } = useTranslate(lang);
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [deleting, setDeleting] = useState(null);

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        setDeleting(id);
        await deleteHistoryItem(id);
        setDeleting(null);
    };

    const filteredPolicies = history.filter(item => {
        const name = item.policy_metadata?.policy_name || item.policy_name || '';
        return name.toLowerCase().includes(search.toLowerCase());
    });

    return (
        <div className="w-full px-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--text)' }}>
                        <ScrollText size={24} style={{ color: 'var(--accent)' }} /> {gt('All Policies')}
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
                        {history.length} {gt('policies analyzed')}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate('/analysis/new')} className="btn btn-primary btn-sm gap-1.5">
                        <Plus size={14} /> {gt('Analyze New Policy')}
                    </button>
                    {history.length > 0 && (
                        <button onClick={clearHistory} className="btn btn-sm gap-1.5"
                            style={{ background: 'var(--red-light)', color: 'var(--red)', border: '1px solid transparent' }}>
                            <Trash2 size={14} /> {gt('Clear All')}
                        </button>
                    )}
                </div>
            </div>

            {/* Search */}
            {history.length > 0 && (
                <div className="relative mb-6">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
                    <input type="text" placeholder={gt('Search policies...')} value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="input w-full pl-10"
                        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                </div>
            )}

            {filteredPolicies.length > 0 ? (
                <div className="space-y-3">
                    {filteredPolicies.map(item => (
                        <div key={item.id}
                            onClick={() => navigate(`/analysis/${item.id}`)}
                            className="card p-4 flex items-center justify-between cursor-pointer transition-all card-hover">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                                    <FileText size={20} />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>
                                        {item.policy_metadata?.policy_name || item.policy_name || 'Policy Document'}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                            {item.timestamp ? new Date(item.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown date'}
                                        </span>
                                        {item.source && (
                                            <span className="badge badge-gray text-[10px]">{item.source}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                                <div className="text-right">
                                    <p className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
                                        {item.risk_score?.overall_score || 0}%
                                    </p>
                                    <p className="text-[10px] uppercase font-medium" style={{ color: 'var(--text-tertiary)' }}>{gt('Risk')}</p>
                                </div>
                                <button onClick={(e) => handleDelete(e, item.id)}
                                    disabled={deleting === item.id}
                                    className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--text-tertiary)' }}>
                                    <Trash2 size={14} />
                                </button>
                                <ChevronRight size={16} style={{ color: 'var(--text-tertiary)' }} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : history.length > 0 ? (
                <div className="text-center py-16 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                    <AlertCircle size={32} className="mx-auto mb-3" style={{ color: 'var(--text-tertiary)' }} />
                    <p style={{ color: 'var(--text-secondary)' }}>{gt('No results for')} "{search}"</p>
                </div>
            ) : (
                <div className="text-center py-20 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        style={{ background: 'var(--accent-light)' }}>
                        <ScrollText size={28} style={{ color: 'var(--accent)' }} />
                    </div>
                    <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text)' }}>{gt('No Policies Analyzed Yet')}</h3>
                    <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                        {gt('Start analyzing government policies to see compliance insights, risk scores, and action plans.')}
                    </p>
                    <button onClick={() => navigate('/analysis/new')} className="btn btn-primary gap-2">
                        <Plus size={16} /> {gt('Analyze Your First Policy')}
                    </button>
                </div>
            )}
        </div>
    );
}
