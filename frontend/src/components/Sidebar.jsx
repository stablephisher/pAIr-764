import React from 'react';
import { FileText, Trash2, Upload, Zap } from 'lucide-react';

export default function Sidebar({ history, activeId, onSelect, onDelete }) {
    return (
        <div className="sidebar">
            <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
                <h3 className="font-semibold text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Analysis History
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                {history.length === 0 ? (
                    <div className="text-center py-12 px-4">
                        <FileText size={32} style={{ color: 'var(--text-tertiary)' }} className="mx-auto mb-3" />
                        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                            No analyses yet
                        </p>
                    </div>
                ) : (
                    history.map(item => {
                        const isActive = item.id === activeId;
                        const riskColor = item.risk_score > 70 ? 'var(--red)' : item.risk_score > 40 ? 'var(--orange)' : 'var(--green)';

                        return (
                            <div key={item.id}
                                onClick={() => onSelect(item.id)}
                                className={`sidebar-item ${isActive ? 'active' : ''} group relative`}>
                                <FileText size={16} style={{ color: isActive ? 'var(--accent)' : 'var(--text-secondary)', flexShrink: 0 }} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                        {item.policy_name || 'Policy Analysis'}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="badge badge-gray text-[9px]">
                                            {item.source === 'auto' ? <Zap size={8} /> : <Upload size={8} />}
                                        </span>
                                        {item.risk_score != null && (
                                            <span className="text-xs font-semibold" style={{ color: riskColor }}>
                                                {item.risk_score}% risk
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button onClick={(e) => onDelete(item.id, e)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-red-50 rounded"
                                    style={{ color: 'var(--red)' }}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
