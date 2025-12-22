import React, { useState } from 'react';
import { FileText, ChevronRight, Trash2, X, Upload, Globe, Layers } from 'lucide-react';

export default function Sidebar({ history, onSelect, onDelete, onClear }) {
    const [activeTab, setActiveTab] = useState('all');

    // Detect source with fallback for legacy items
    const isAutoFetched = (item) => {
        if (item.source === 'auto-fetched') return true;
        const authority = item.policy_metadata?.issuing_authority?.toLowerCase() || '';
        return authority.includes('msme') || authority.includes('ministry');
    };

    const userUploads = history.filter(item => !isAutoFetched(item));
    const autoFetched = history.filter(item => isAutoFetched(item));

    const displayHistory = activeTab === 'all' ? history
        : activeTab === 'uploads' ? userUploads
            : autoFetched;

    return (
        <div className="sidebar">
            {/* Header */}
            <div className="sidebar-header">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <Layers size={18} className="text-white" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                                Analysis Hub
                            </h2>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                {history.length} policies
                            </p>
                        </div>
                    </div>
                    {history.length > 0 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onClear(); }}
                            className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-all"
                            title="Clear All"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        All ({history.length})
                    </button>
                    <button
                        className={`tab ${activeTab === 'uploads' ? 'active' : ''}`}
                        onClick={() => setActiveTab('uploads')}
                    >
                        <Upload size={12} className="inline mr-1" />
                        Uploads
                    </button>
                    <button
                        className={`tab ${activeTab === 'fetched' ? 'active' : ''}`}
                        onClick={() => setActiveTab('fetched')}
                    >
                        <Globe size={12} className="inline mr-1" />
                        Auto
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="sidebar-content">
                {displayHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div
                            className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                            style={{ backgroundColor: 'var(--bg-tertiary)' }}
                        >
                            <FileText size={22} style={{ color: 'var(--text-muted)' }} />
                        </div>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                            {activeTab === 'fetched' ? 'No auto-fetched policies'
                                : activeTab === 'uploads' ? 'No uploaded policies'
                                    : 'No policies analyzed yet'}
                        </p>
                    </div>
                ) : (
                    displayHistory.map((item, idx) => (
                        <HistoryItem
                            key={item.id || idx}
                            item={item}
                            isAuto={isAutoFetched(item)}
                            onSelect={onSelect}
                            onDelete={onDelete}
                        />
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="sidebar-footer flex justify-between">
                <span>{userUploads.length} uploaded</span>
                <span style={{ color: 'var(--success)' }}>{autoFetched.length} auto-fetched</span>
            </div>
        </div>
    );
}

function HistoryItem({ item, isAuto, onSelect, onDelete }) {
    return (
        <div className="history-item group animate-fadeIn" onClick={() => onSelect(item)}>
            {/* Badge */}
            <span className={`badge ${isAuto ? 'badge-auto' : 'badge-uploaded'}`}>
                {isAuto ? (
                    <><Globe size={10} /> Auto-Fetched</>
                ) : (
                    <><Upload size={10} /> Uploaded</>
                )}
            </span>

            {/* Title */}
            <h3
                className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-blue-500 transition-colors"
                style={{ color: 'var(--text-primary)' }}
            >
                {item.policy_metadata?.policy_name || "Unknown Policy"}
            </h3>

            {/* Authority */}
            <p className="text-xs line-clamp-1" style={{ color: 'var(--text-muted)' }}>
                {item.policy_metadata?.issuing_authority || "Unknown Authority"}
            </p>

            {/* Delete Button (on hover) */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                }}
                className="absolute right-2 bottom-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-red-500 transition-all"
                title="Delete"
            >
                <Trash2 size={14} />
            </button>

            {/* Arrow */}
            <ChevronRight
                size={16}
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all"
                style={{ color: 'var(--text-muted)' }}
            />
        </div>
    );
}
