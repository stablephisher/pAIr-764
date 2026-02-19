import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { FileText, ChevronRight, Trash2, Clock, Upload, AlertCircle, Search } from 'lucide-react';

export default function History() {
    const { history, deleteHistoryItem, clearHistory } = useAppContext();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [deleting, setDeleting] = useState(null);

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        setDeleting(id);
        await deleteHistoryItem(id);
        setDeleting(null);
    };

    const filteredHistory = history.filter(item => {
        const name = item.policy_metadata?.policy_name || item.policy_name || '';
        return name.toLowerCase().includes(search.toLowerCase());
    });

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--text)' }}>
                        <Clock size={24} style={{ color: 'var(--accent)' }} /> Analysis History
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
                        {history.length} analysis record{history.length !== 1 ? 's' : ''}
                    </p>
                </div>
                {history.length > 0 && (
                    <button onClick={clearHistory} className="btn btn-sm gap-1.5"
                        style={{ background: 'var(--red-light)', color: 'var(--red)', border: '1px solid transparent' }}>
                        <Trash2 size={14} /> Clear All
                    </button>
                )}
            </div>

            {/* Search */}
            {history.length > 0 && (
                <div className="relative mb-6">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
                    <input type="text" placeholder="Search by policy name..." value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="input w-full pl-10"
                        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                </div>
            )}

            {filteredHistory.length > 0 ? (
                <div className="space-y-3">
                    {filteredHistory.map(item => (
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
                                    <p className="text-[10px] uppercase font-medium" style={{ color: 'var(--text-tertiary)' }}>Risk</p>
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
                    <p style={{ color: 'var(--text-secondary)' }}>No results for "{search}"</p>
                </div>
            ) : (
                <div className="text-center py-20 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        style={{ background: 'var(--accent-light)' }}>
                        <Upload size={28} style={{ color: 'var(--accent)' }} />
                    </div>
                    <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text)' }}>No Analysis Yet</h3>
                    <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                        Upload your first policy document to get started with AI-powered compliance analysis.
                    </p>
                    <button onClick={() => navigate('/analysis/new')} className="btn btn-primary gap-2">
                        <Upload size={16} /> Start Your First Analysis
                    </button>
                </div>
            )}
        </div>
    );
}
