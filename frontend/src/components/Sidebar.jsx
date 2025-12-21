import React from 'react';
import { History, FileText, ChevronRight, Trash2, XCircle } from 'lucide-react';

export default function Sidebar({ history, onSelect, onDelete, onClear }) {
    return (
        <div className="w-80 h-screen bg-surface border-r border-gray-800 flex flex-col fixed left-0 top-0 overflow-y-auto z-10 transition-transform transform">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <History className="text-blue-500" size={20} />
                    <h2 className="font-bold text-gray-200">History</h2>
                </div>
                {history.length > 0 && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onClear(); }}
                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 bg-red-900/20 px-2 py-1 rounded"
                    >
                        <XCircle size={12} /> Clear All
                    </button>
                )}
            </div>

            <div className="flex-1 p-2 space-y-2">
                {history.length === 0 ? (
                    <div className="text-gray-500 text-sm text-center py-8">
                        No history yet.
                    </div>
                ) : (
                    history.map((item, idx) => (
                        <div key={item.id || idx} className="group relative">
                            <button
                                onClick={() => onSelect(item)}
                                className="w-full text-left p-3 rounded-lg hover:bg-white/5 border border-transparent hover:border-gray-700 transition-all pr-10"
                            >
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-gray-300 text-sm line-clamp-2 hover:text-blue-400">
                                        {item.policy_metadata.policy_name || "Unknown Policy"}
                                    </h3>
                                    <span className="text-xs text-gray-500 mt-1 block">
                                        {item.policy_metadata.issuing_authority}
                                    </span>
                                </div>
                            </button>
                            {/* Arrow */}
                            <ChevronRight size={16} className="absolute right-2 top-3 text-gray-600 opacity-0 group-hover:opacity-100 transition-all pointer-events-none" />

                            {/* Delete Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(item.id);
                                }}
                                className="absolute right-2 bottom-2 p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-900/20 rounded opacity-0 group-hover:opacity-100 transition-all z-20"
                                title="Delete"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))
                )
                }
            </div >
        </div >
    );
}
