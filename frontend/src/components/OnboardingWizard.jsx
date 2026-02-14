import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Building2, ChevronRight, Loader2, ArrowRight } from 'lucide-react';

const API = "http://localhost:8000";

export default function OnboardingWizard({ onComplete, onSkip }) {
    const [question, setQuestion] = useState(null);
    const [answers, setAnswers] = useState({});
    const [selected, setSelected] = useState('');
    const [freeText, setFreeText] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState(0);
    const [totalSteps, setTotalSteps] = useState(13);
    const [error, setError] = useState(null);

    useEffect(() => { loadFirst(); }, []);

    const loadFirst = async () => {
        try {
            const res = await axios.get(`${API}/api/onboarding/start`);
            setQuestion(res.data.question);
            if (res.data.total_questions) setTotalSteps(res.data.total_questions);
            setStep(1);
        } catch (e) {
            setError("Could not load questions. Backend may be offline.");
        } finally {
            setLoading(false);
        }
    };

    const submit = async () => {
        if (!question) return;
        const answer = question.type === 'free_text' ? freeText : selected;
        if (!answer) return;

        setSubmitting(true);
        setError(null);

        try {
            const res = await axios.post(`${API}/api/onboarding/answer`, {
                current_question_id: question.id,
                answer,
                answers_so_far: { ...answers, [question.id]: answer },
            });

            const newAnswers = { ...answers, [question.id]: answer };
            setAnswers(newAnswers);

            if (res.data.is_complete) {
                if (res.data.profile) {
                    onComplete(res.data.profile);
                } else {
                    const profileRes = await axios.post(`${API}/api/onboarding/profile`, { answers: newAnswers });
                    onComplete(profileRes.data.profile);
                }
            } else {
                setQuestion(res.data.question);
                setSelected('');
                setFreeText('');
                setStep(s => s + 1);
            }
        } catch (e) {
            console.error('Onboarding error:', e.response?.data || e.message);
            setError("Something went wrong. Try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
                <Loader2 size={28} className="spin" style={{ color: 'var(--accent)' }} />
            </div>
        );
    }

    const progress = Math.min(95, (step / totalSteps) * 100);
    const answer = question?.type === 'free_text' ? freeText : selected;

    return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-primary)' }}>
            <div className="w-full max-w-lg fade-up">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                        style={{ background: 'var(--accent)', color: 'white' }}>
                        <Building2 size={22} />
                    </div>
                    <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                        Tell us about your business
                    </h1>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        Step {step} — We'll match you with the right schemes & policies
                    </p>
                </div>

                {/* Progress */}
                <div className="h-1 rounded-full mb-6" style={{ background: 'var(--bg-elevated)' }}>
                    <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${progress}%`, background: 'var(--accent)' }} />
                </div>

                {/* Question */}
                {question && (
                    <div className="rounded-2xl p-6 mb-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                        <p className="text-base font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>
                            {question.text}
                        </p>

                        {question.type === 'free_text' ? (
                            <input
                                type="text"
                                value={freeText}
                                onChange={e => setFreeText(e.target.value)}
                                placeholder={question.placeholder || "Type your answer..."}
                                onKeyDown={e => e.key === 'Enter' && freeText && submit()}
                                className="w-full p-3 rounded-lg text-sm outline-none transition-all"
                                style={{
                                    background: 'var(--bg-elevated)',
                                    border: '1px solid var(--border-light)',
                                    color: 'var(--text-primary)',
                                }}
                                autoFocus
                            />
                        ) : (
                            <div className="space-y-2">
                                {(question.options || []).map(opt => {
                                    const val = typeof opt === 'string' ? opt : (opt.value || opt.label);
                                    const label = typeof opt === 'string' ? opt : opt.label;
                                    const isSelected = selected === val;

                                    return (
                                        <button key={val} onClick={() => setSelected(val)}
                                            className={`w-full text-left p-3.5 rounded-xl transition-all flex items-center gap-3 ${isSelected ? 'selected' : ''}`}
                                            style={{
                                                background: isSelected ? 'var(--accent-muted)' : 'var(--bg-elevated)',
                                                border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                                                color: 'var(--text-primary)',
                                            }}>
                                            <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                                                style={{ borderColor: isSelected ? 'var(--accent)' : 'var(--border-light)' }}>
                                                {isSelected && <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} />}
                                            </div>
                                            <span className="text-sm">{label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {error && <p className="text-xs mt-3" style={{ color: 'var(--red)' }}>{error}</p>}
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between">
                    <button onClick={onSkip} className="text-sm px-4 py-2 rounded-lg transition-all"
                        style={{ color: 'var(--text-muted)', background: 'var(--bg-card)' }}>
                        Skip for now
                    </button>
                    <button onClick={submit} disabled={submitting || !answer}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
                        style={{
                            background: (!answer || submitting) ? 'var(--bg-elevated)' : 'var(--accent)',
                            color: (!answer || submitting) ? 'var(--text-muted)' : 'white',
                            opacity: (!answer || submitting) ? 0.5 : 1,
                            cursor: (!answer || submitting) ? 'not-allowed' : 'pointer',
                        }}>
                        {submitting ? <><Loader2 size={14} className="spin" /> Processing...</> :
                            <>Next <ArrowRight size={14} /></>}
                    </button>
                </div>
            </div>
        </div>
    );
}
