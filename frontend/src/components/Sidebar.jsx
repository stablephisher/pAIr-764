import React from 'react';
import { FileText, Globe, Upload, Trash2, X, Layers } from 'lucide-react';

export default function Sidebar({ history, onSelect, onDelete, onClear, activeId }) {
    if (!history || history.length === 0) {
        return (
            <div className="w-[260px] min-w-[260px] h-screen sticky top-0 flex flex-col border-r"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-2">
                        <Layers size={18} style={{ color: 'var(--accent)' }} />
                        <span className="font-semibold text-sm">Policies</span>
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="text-center">
                        <FileText size={32} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            No policies analyzed yet.<br/>Upload a PDF to get started.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-[260px] min-w-[260px] h-screen sticky top-0 flex flex-col border-r"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2">
                    <Layers size={18} style={{ color: 'var(--accent)' }} />
                    <span className="font-semibold text-sm">Policies</span>
                    <span className="text-xs px-1.5 py-0.5 rounded-md"
                        style={{ background: 'var(--accent-muted)', color: 'var(--accent)', fontSize: 11 }}>
                        {history.length}
                    </span>
                </div>
                <button onClick={onClear} className="p-1.5 rounded-md hover:bg-red-500/10 text-red-400 transition-all" title="Clear all">
                    <X size={14} />
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {history.map((item, idx) => {
                    const name = item.policy_metadata?.policy_name || 'Untitled Policy';
                    const authority = item.policy_metadata?.issuing_authority || '';
                    const isAuto = item.source === 'auto-fetched';
                    const isActive = item.id === activeId;
                    const risk = item.risk_assessment?.overall_risk_level || item.risk_score?.overall_band;

                    return (
                        <div
                            key={item.id || idx}
                            onClick={() => onSelect(item)}
                            className="group p-3 rounded-lg cursor-pointer transition-all relative"
                            style={{
                                background: isActive ? 'var(--accent-muted)' : 'transparent',
                                border: isActive ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
                            }}
                            onMouseEnter={e => !isActive && (e.currentTarget.style.background = 'var(--bg-hover)')}
                            onMouseLeave={e => !isActive && (e.currentTarget.style.background = 'transparent')}
                        >
                            {/* Badge row */}
                            <div className="flex items-center gap-2 mb-1.5">
                                {isAuto ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded"
                                        style={{ background: 'var(--green-muted)', color: 'var(--green)' }}>
                                        <Globe size={9} /> Auto
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded"
                                        style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}>
                                        <Upload size={9} /> Uploaded
                                    </span>
                                )}
                                {risk && (
                                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
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

                            {/* Title */}
                            <p className="text-[13px] font-medium leading-tight line-clamp-2"
                                style={{ color: 'var(--text-primary)' }}>
                                {name}
                            </p>

                            {/* Authority */}
                            {authority && (
                                <p className="text-[11px] mt-1 truncate" style={{ color: 'var(--text-muted)' }}>
                                    {authority}
                                </p>
                            )}

                            {/* Delete */}
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                                className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-400 transition-all"
                                title="Delete">
                                <Trash2 size={12} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
