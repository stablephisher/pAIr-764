import React from 'react';
import { FileText, Globe, Trash2, X, Layers, Clock, ChevronRight } from 'lucide-react';

export default function Sidebar({ history, onSelect, onDelete, onClear, activeId }) {
    const items = history || [];

    return (
        <div className="w-full h-screen flex flex-col"
            style={{ background: 'var(--bg-secondary)' }}>
            {/* Header */}
            <div className="px-4 py-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}>
                            <Layers size={14} />
                        </div>
                        <span className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                            History
                        </span>
                        {items.length > 0 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                                style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}>
                                {items.length}
                            </span>
                        )}
                    </div>
                    {items.length > 0 && (
                        <button onClick={onClear}
                            className="p-1 rounded-md transition-all opacity-60 hover:opacity-100"
                            style={{ color: 'var(--text-muted)' }} title="Clear all">
                            <Trash2 size={13} />
                        </button>
                    )}
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                            style={{ background: 'var(--bg-elevated)' }}>
                            <FileText size={20} style={{ color: 'var(--text-dim)' }} />
                        </div>
                        <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                            No analyses yet
                        </p>
                        <p className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
                            Upload a policy document to begin
                        </p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {items.map((item, idx) => {
                            const name = item.policy_metadata?.policy_name || item.policy_metadata?.title || 'Untitled';
                            const authority = item.policy_metadata?.issuing_authority || '';
                            const isAuto = item.source === 'auto-fetched';
                            const id = item.id || item.timestamp || idx;
                            const isActive = id === activeId;
                            const risk = item.risk_assessment?.overall_risk_level || item.risk_score?.overall_band;

                            return (
                                <button key={id} onClick={() => onSelect(item)}
                                    className="w-full text-left p-3 rounded-xl transition-all group relative"
                                    style={{
                                        background: isActive
                                            ? 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))'
                                            : 'transparent',
                                        border: isActive
                                            ? '1px solid rgba(99,102,241,0.2)'
                                            : '1px solid transparent',
                                    }}
                                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>

                                    {/* Badges */}
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                                            style={{
                                                background: isAuto ? 'var(--green-muted)' : 'var(--accent-muted)',
                                                color: isAuto ? 'var(--green)' : 'var(--accent)',
                                            }}>
                                            {isAuto ? 'Auto' : 'Upload'}
                                        </span>
                                        {risk && (
                                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                                                style={{
                                                    background: risk === 'HIGH' || risk === 'CRITICAL' ? 'var(--red-muted)' :
                                                        risk === 'MEDIUM' ? 'var(--orange-muted)' : 'var(--green-muted)',
                                                    color: risk === 'HIGH' || risk === 'CRITICAL' ? 'var(--red)' :
                                                        risk === 'MEDIUM' ? 'var(--orange)' : 'var(--green)',
                                                }}>
                                                {risk}
                                            </span>
                                        )}
                                    </div>

                                    {/* Name */}
                                    <p className="text-[12px] font-medium leading-tight line-clamp-2"
                                        style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                        {name}
                                    </p>

                                    {authority && (
                                        <p className="text-[10px] mt-1 truncate" style={{ color: 'var(--text-dim)' }}>
                                            {authority}
                                        </p>
                                    )}

                                    {/* Delete on hover */}
                                    <div onClick={(e) => { e.stopPropagation(); onDelete(id); }}
                                        className="absolute top-2 right-2 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                        style={{ color: 'var(--red)' }}>
                                        <X size={11} />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
