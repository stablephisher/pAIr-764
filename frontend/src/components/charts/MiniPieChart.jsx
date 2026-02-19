import React from 'react';

export default function MiniPieChart({ data, size = 180, title }) {
    // data = [{ label, value, color }]
    const total = data.reduce((s, d) => s + d.value, 0) || 1;
    let cumulative = 0;
    const radius = size / 2 - 10;
    const center = size / 2;

    const slices = data.filter(d => d.value > 0).map((d) => {
        const startAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
        cumulative += d.value;
        const endAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
        const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
        const x1 = center + radius * Math.cos(startAngle);
        const y1 = center + radius * Math.sin(startAngle);
        const x2 = center + radius * Math.cos(endAngle);
        const y2 = center + radius * Math.sin(endAngle);
        return { ...d, path: `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`, pct: Math.round((d.value / total) * 100) };
    });

    return (
        <div className="flex flex-col items-center">
            {title && <h4 className="font-semibold mb-3 text-sm">{title}</h4>}
            <svg width={size} height={size} className="animate-fade-in">
                {slices.map((s, i) => (
                    <path key={i} d={s.path} fill={s.color} opacity={0.85} className="transition-opacity hover:opacity-100" style={{ cursor: 'pointer' }}>
                        <title>{s.label}: {s.value} ({s.pct}%)</title>
                    </path>
                ))}
                <circle cx={center} cy={center} r={radius * 0.55} fill="var(--bg)" />
                <text x={center} y={center - 4} textAnchor="middle" fill="var(--text)" fontWeight="800" fontSize="22">{total}</text>
                <text x={center} y={center + 14} textAnchor="middle" fill="var(--text-tertiary)" fontSize="10">total</text>
            </svg>
            <div className="flex flex-wrap gap-3 mt-3 justify-center">
                {slices.map((s, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                        <span style={{ color: 'var(--text-secondary)' }}>{s.label} ({s.pct}%)</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
