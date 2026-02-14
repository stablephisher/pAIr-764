import React, { useState, useEffect } from 'react';
import { FileText, Search, Brain, BarChart3, CheckCircle, Loader2 } from 'lucide-react';

const STEPS = [
    { icon: FileText, label: 'Extracting Content' },
    { icon: Search, label: 'Analyzing Obligations' },
    { icon: Brain, label: 'AI Processing' },
    { icon: BarChart3, label: 'Scoring Metrics' },
    { icon: CheckCircle, label: 'Matching Schemes' },
];

export default function ProcessingEngine() {
    const [step, setStep] = useState(0);
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        const stepInterval = setInterval(() => {
            setStep(s => (s < STEPS.length - 1 ? s + 1 : s));
        }, 2000);

        const timeInterval = setInterval(() => {
            setElapsed(e => e + 1);
        }, 1000);

        return () => {
            clearInterval(stepInterval);
            clearInterval(timeInterval);
        };
    }, []);

    const progress = ((step + 1) / STEPS.length) * 100;

    return (
        <div className="max-w-xl mx-auto text-center fade-in">
            <div className="card p-12">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
                    style={{ background: 'var(--accent-light)' }}>
                    <Loader2 size={32} className="spin" style={{ color: 'var(--accent)' }} />
                </div>

                <h3 className="text-xl font-bold mb-2">Analyzing your policy...</h3>
                <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
                    {elapsed}s elapsed
                </p>

                {/* Progress Bar */}
                <div className="h-2 rounded-full mb-8" style={{ background: 'var(--border-light)' }}>
                    <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${progress}%`, background: 'var(--accent)' }} />
                </div>

                {/* Steps */}
                <div className="space-y-3">
                    {STEPS.map((s, i) => {
                        const Icon = s.icon;
                        const isDone = i < step;
                        const isCurrent = i === step;
                        const isPending = i > step;

                        return (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg transition-all"
                                style={{
                                    background: isCurrent ? 'var(--accent-light)' : isDone ? 'var(--green-light)' : 'transparent',
                                    opacity: isPending ? 0.4 : 1
                                }}>
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{
                                        background: isDone ? 'var(--green-light)' : isCurrent ? 'var(--accent-light)' : 'var(--bg-hover)',
                                        color: isDone ? 'var(--green)' : isCurrent ? 'var(--accent)' : 'var(--text-tertiary)'
                                    }}>
                                    <Icon size={16} />
                                </div>
                                <span className="text-sm font-medium">{s.label}</span>
                                {isDone && <CheckCircle size={16} style={{ color: 'var(--green)', marginLeft: 'auto' }} />}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
