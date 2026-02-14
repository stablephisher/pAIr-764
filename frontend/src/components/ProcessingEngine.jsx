import React, { useState, useEffect } from 'react';
import { FileText, Search, Brain, BarChart3, CheckCircle, Loader2 } from 'lucide-react';

const STEPS = [
    { icon: FileText, label: 'Reading PDF', desc: 'Extracting text from your document...' },
    { icon: Search, label: 'Analyzing Policy', desc: 'Gemini AI is identifying obligations & deadlines...' },
    { icon: Brain, label: 'Planning Compliance', desc: 'Creating your action plan...' },
    { icon: BarChart3, label: 'Scoring & Risk', desc: 'Calculating risk, sustainability & ROI...' },
    { icon: CheckCircle, label: 'Finalizing', desc: 'Validating results...' },
];

export default function ProcessingEngine({ onStop }) {
    const [step, setStep] = useState(0);
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        const stepInterval = setInterval(() => {
            setStep(s => s < STEPS.length - 1 ? s + 1 : s);
        }, 3000);
        const timerInterval = setInterval(() => {
            setElapsed(e => e + 1);
        }, 1000);
        return () => { clearInterval(stepInterval); clearInterval(timerInterval); };
    }, []);

    return (
        <div className="max-w-md mx-auto py-16 fade-up">
            {/* Animated logo */}
            <div className="flex justify-center mb-8">
                <div className="relative">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
                        style={{ background: 'var(--accent-muted)', border: '2px solid var(--accent)' }}>
                        <Loader2 size={32} className="spin" style={{ color: 'var(--accent)' }} />
                    </div>
                    <div className="absolute -inset-3 rounded-3xl pulse-glow"
                        style={{ border: '1px solid var(--accent)', opacity: 0.3 }} />
                </div>
            </div>

            {/* Steps */}
            <div className="space-y-3 mb-8">
                {STEPS.map((s, i) => {
                    const Icon = s.icon;
                    const isDone = i < step;
                    const isCurrent = i === step;

                    return (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg transition-all"
                            style={{
                                background: isCurrent ? 'var(--accent-muted)' : isDone ? 'var(--green-muted)' : 'var(--bg-card)',
                                border: `1px solid ${isCurrent ? 'rgba(99,102,241,0.3)' : isDone ? 'rgba(16,185,129,0.2)' : 'var(--border)'}`,
                                opacity: i > step ? 0.4 : 1,
                            }}>
                            <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                                style={{
                                    background: isDone ? 'var(--green)' : isCurrent ? 'var(--accent)' : 'var(--bg-elevated)',
                                    color: isDone || isCurrent ? 'white' : 'var(--text-muted)',
                                }}>
                                {isDone ? <CheckCircle size={14} /> : isCurrent ? <Loader2 size={14} className="spin" /> : <Icon size={14} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{s.label}</p>
                                {isCurrent && (
                                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{s.desc}</p>
                                )}
                            </div>
                            {isDone && <span className="text-xs" style={{ color: 'var(--green)' }}>Done</span>}
                        </div>
                    );
                })}
            </div>

            {/* Timer + Stop */}
            <div className="text-center space-y-3">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Elapsed: {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, '0')}
                </p>
                {onStop && (
                    <button onClick={onStop} className="text-xs px-4 py-2 rounded-lg transition-all"
                        style={{ background: 'var(--red-muted)', color: 'var(--red)' }}>
                        Cancel Analysis
                    </button>
                )}
            </div>
        </div>
    );
}
