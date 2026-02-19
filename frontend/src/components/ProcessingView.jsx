import React, { useState, useEffect } from 'react';
import { FileText, Zap, TrendingUp, Shield, CheckCircle, Loader2 } from 'lucide-react';

export default function ProcessingView({ onCancel }) {
    const [step, setStep] = useState(0);
    const [elapsed, setElapsed] = useState(0);

    const steps = [
        { icon: FileText, label: 'Reading document...', duration: 2 },
        { icon: Zap, label: 'Extracting obligations...', duration: 3 },
        { icon: TrendingUp, label: 'Calculating risk scores...', duration: 2 },
        { icon: Shield, label: 'Matching schemes...', duration: 2 },
        { icon: CheckCircle, label: 'Generating report...', duration: 1 },
    ];

    useEffect(() => {
        const stepTimer = setInterval(() => {
            setStep(s => s < steps.length - 1 ? s + 1 : s);
        }, 2000);

        const elapsedTimer = setInterval(() => {
            setElapsed(e => e + 1);
        }, 1000);

        return () => {
            clearInterval(stepTimer);
            clearInterval(elapsedTimer);
        };
    }, []);

    return (
        <div className="max-w-xl mx-auto text-center py-16 animate-fade-in-up">
            <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse-glow"
                style={{ background: 'linear-gradient(135deg, var(--accent), var(--purple))' }}>
                <Loader2 size={40} color="white" className="animate-spin" />
            </div>

            <h2 className="text-2xl font-bold mb-2">Analyzing your document</h2>
            <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
                {elapsed}s • This usually takes 10-20 seconds
            </p>

            {/* Progress bar */}
            <div className="h-2 rounded-full mb-8 overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                <div className="h-full rounded-full progress-animated transition-all duration-700"
                    style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
            </div>

            {/* Steps */}
            <div className="space-y-3 text-left max-w-sm mx-auto">
                {steps.map((s, i) => {
                    const isDone = i < step;
                    const isCurrent = i === step;
                    const Icon = s.icon;

                    return (
                        <div key={i} className={`p-4 rounded-xl flex items-center gap-4 transition-all ${isCurrent ? 'animate-fade-in-scale' : ''}`}
                            style={{
                                background: isCurrent ? 'var(--accent-light)' : isDone ? 'var(--green-light)' : 'var(--bg-secondary)',
                                opacity: !isDone && !isCurrent ? 0.5 : 1
                            }}>
                            <Icon size={20} style={{ color: isDone ? 'var(--green)' : isCurrent ? 'var(--accent)' : 'var(--text-tertiary)' }} />
                            <span className="flex-1 text-sm font-medium">{s.label}</span>
                            {isDone && <CheckCircle size={16} style={{ color: 'var(--green)' }} />}
                        </div>
                    );
                })}
            </div>

            {onCancel && (
                <button onClick={onCancel} className="btn btn-ghost mt-8">
                    Cancel
                </button>
            )}
        </div>
    );
}
