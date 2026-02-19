import React from 'react';

export default function MiniBarChart({ data, title }) {
    // data = [{ label, value, color, max, suffix }]
    const maxVal = Math.max(...data.map(d => d.max || d.value), 1);
    return (
        <div>
            {title && <h4 className="font-semibold mb-4 text-sm">{title}</h4>}
            <div className="space-y-3">
                {data.map((d, i) => (
                    <div key={i} className="group cursor-pointer">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium truncate" style={{ color: 'var(--text-secondary)' }}>{d.label}</span>
                            <span className="text-xs font-bold" style={{ color: d.color }}>{d.value}{d.suffix || ''}</span>
                        </div>
                        <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                            <div className="h-full rounded-full transition-all duration-1000 ease-out group-hover:opacity-90"
                                style={{ width: `${Math.max(2, (d.value / maxVal) * 100)}%`, background: `linear-gradient(90deg, ${d.color}, ${d.color}dd)` }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
