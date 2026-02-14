import React, { useState, useEffect } from 'react';
import { FileText, Search, Brain, BarChart3, CheckCircle, Loader2, XCircle } from 'lucide-react';

const STEPS = [
    { icon: FileText, label: 'Extracting Content', desc: 'Reading and parsing your document...' },
    { icon: Search, label: 'Identifying Obligations', desc: 'AI is extracting compliance requirements...' },
    { icon: Brain, label: 'Building Action Plan', desc: 'Creating steps for full compliance...' },
    { icon: BarChart3, label: 'Risk & Scoring', desc: 'Computing risk, sustainability & ROI scores...' },
    { icon: CheckCircle, label: 'Finalizing Report', desc: 'Validating and assembling your results...' },
];

export default function ProcessingEngine({ onStop }) {
    const [step, setStep] = useState(0);
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        const si = setInterval(() => setStep(s => s < STEPS.length - 1 ? s + 1 : s), 3500);
        const ti = setInterval(() => setElapsed(e => e + 1), 1000);
        return () => { clearInterval(si); clearInterval(ti); };
    }, []);

    const progress = ((step + 1) / STEPS.length) * 100;

    return (
        <div className="max-w-md mx-auto py-20 fade-in">
            {/* Central Animation */}
            <div className="flex justify-center mb-10">
                <div className="relative">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center glow"
                        style={{ background: 'linear-gradient(135deg, var(--accent), #818cf8)' }}>
                        <Loader2 size={30} color="white" className="spin" />
                    </div>
                </div>
            </div>

            {/* Title */}
            <div className="text-center mb-8">
                <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                    Analyzing your policy...
                </h3>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    This usually takes 15-30 seconds
                </p>
            </div>

            {/* Progress Bar */}
            <div className="h-1 rounded-full mb-8 overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                <div className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                        width: `${progress}%`,
                        background: 'linear-gradient(90deg, var(--accent), #818cf8)',
                    }} />
            </div>

            {/* Steps */}
            <div className="space-y-2 stagger mb-8">
                {STEPS.map((s, i) => {
                    const Icon = s.icon;
                    const isDone = i < step;
                    const isCurrent = i === step;
                    const isPending = i > step;

                    return (
                        <div key={i}
                            className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${isCurrent ? 'fade-in' : ''}`}
                            style={{
                                background: isCurrent ? 'var(--accent-muted)' : isDone ? 'var(--green-muted)' : 'transparent',
                                border: `1px solid ${isCurrent ? 'rgba(99,102,241,0.2)' : isDone ? 'rgba(34,197,94,0.15)' : 'var(--border)'}`,
                                opacity: isPending ? 0.35 : 1,
                            }}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{
                                    background: isDone ? 'var(--green)' : isCurrent ? 'var(--accent)' : 'var(--bg-elevated)',
                                    color: isDone || isCurrent ? 'white' : 'var(--text-dim)',
                                }}>
                                {isDone ? <CheckCircle size={15} /> : isCurrent ? <Loader2 size={15} className="spin" /> : <Icon size={15} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>{s.label}</p>
                                {isCurrent && <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{s.desc}</p>}
                            </div>
                            {isDone && <span className="text-[10px] font-bold" style={{ color: 'var(--green)' }}>Done</span>}
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="text-center space-y-3">
                <p className="text-xs tabular-nums" style={{ color: 'var(--text-dim)' }}>
                    {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, '0')} elapsed
                </p>
                {onStop && (
                    <button onClick={onStop}
                        className="inline-flex items-center gap-1.5 text-[11px] font-medium px-4 py-1.5 rounded-lg transition-all"
                        style={{ color: 'var(--red)', background: 'var(--red-muted)' }}>
                        <XCircle size={12} /> Cancel
                    </button>
                )}
            </div>
        </div>
    );
}
