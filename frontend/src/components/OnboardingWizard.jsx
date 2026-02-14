import React, { useState } from 'react';
import axios from 'axios';
import { Building2, Loader2, ArrowRight, X } from 'lucide-react';

const API = "http://localhost:8000";

// Simplified onboarding with 5 key questions
const QUESTIONS = [
    {
        id: 'business_type',
        text: 'What type of business do you own?',
        type: 'select',
        options: ['Manufacturing', 'Service', 'Trading', 'Technology', 'Handicraft']
    },
    {
        id: 'sector',
        text: 'Which sector best describes your business?',
        type: 'select',
        options: ['Textiles', 'Food Processing', 'IT/Software', 'Retail', 'Healthcare', 'Education', 'Other']
    },
    {
        id: 'employees',
        text: 'How many people does your business employ?',
        type: 'select',
        options: ['1-10', '11-50', '51-200', '201-500', 'More than 500']
    },
    {
        id: 'annual_revenue',
        text: 'What is your approximate annual revenue?',
        type: 'select',
        options: ['Less than ₹1 Crore', '₹1-5 Crore', '₹5-10 Crore', '₹10-50 Crore', 'More than ₹50 Crore']
    },
    {
        id: 'location',
        text: 'Where is your business located?',
        type: 'text',
        placeholder: 'E.g., Mumbai, Maharashtra'
    },
];

export default function OnboardingWizard({ onComplete, onSkip }) {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [selected, setSelected] = useState('');
    const [loading, setLoading] = useState(false);

    const currentQ = QUESTIONS[step];
    const progress = ((step + 1) / QUESTIONS.length) * 100;

    const handleNext = async () => {
        if (!selected) return;

        const newAnswers = { ...answers, [currentQ.id]: selected };
        setAnswers(newAnswers);

        if (step < QUESTIONS.length - 1) {
            setStep(step + 1);
            setSelected('');
        } else {
            // Final step
            setLoading(true);
            try {
                await axios.post(`${API}/api/profile`, newAnswers);
                onComplete(newAnswers);
            } catch (e) {
                console.error('Profile save error:', e);
                // Still complete even if save fails
                onComplete(newAnswers);
            }
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
            <div className="w-full max-w-lg fade-in">
                <div className="text-center mb-8">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        style={{ background: 'var(--accent)' }}>
                        <Building2 size={24} color="white" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Tell us about your business</h1>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Step {step + 1} of {QUESTIONS.length} • For personalized scheme recommendations
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="h-2 rounded-full mb-8" style={{ background: 'var(--border-light)' }}>
                    <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${progress}%`, background: 'var(--accent)' }} />
                </div>

                {/* Question Card */}
                <div className="card p-8">
                    <p className="text-lg font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
                        {currentQ.text}
                    </p>

                    {currentQ.type === 'text' ? (
                        <input
                            type="text"
                            value={selected}
                            onChange={e => setSelected(e.target.value)}
                            placeholder={currentQ.placeholder}
                            onKeyDown={e => e.key === 'Enter' && selected && handleNext()}
                            autoFocus
                        />
                    ) : (
                        <div className="space-y-3">
                            {currentQ.options.map(opt => (
                                <div key={opt}
                                    onClick={() => setSelected(opt)}
                                    className={`radio-option ${selected === opt ? 'selected' : ''}`}>
                                    <div className="radio-circle">
                                        {selected === opt && <div className="radio-dot" />}
                                    </div>
                                    <span className="text-sm font-medium">{opt}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-6">
                    <button onClick={onSkip} className="btn-ghost text-sm">
                        <X size={14} /> Skip for now
                    </button>
                    <button onClick={handleNext} disabled={!selected || loading} className="btn btn-primary">
                        {loading ? (
                            <><Loader2 size={16} className="spin" /> Saving...</>
                        ) : step === QUESTIONS.length - 1 ? (
                            <>Complete</>
                        ) : (
                            <>Next <ArrowRight size={16} /></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
