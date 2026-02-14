import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Building2, Loader2, ArrowRight, Sparkles, SkipForward } from 'lucide-react';

const API = "http://localhost:8000";

export default function OnboardingWizard({ onComplete, onSkip }) {
    const [question, setQuestion] = useState(null);
    const [answers, setAnswers] = useState({});
    const [selected, setSelected] = useState('');
    const [freeText, setFreeText] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState(1);
    const [totalSteps, setTotalSteps] = useState(13);
    const [error, setError] = useState(null);

    useEffect(() => { loadFirst(); }, []);

    const loadFirst = async () => {
        try {
            const res = await axios.get(`${API}/api/onboarding/start`);
            setQuestion(res.data.question);
            if (res.data.total_questions) setTotalSteps(res.data.total_questions);
            setStep(1);
            setError(null);
        } catch (e) {
            console.error('Onboarding start error:', e);
            setError("Backend is starting up. Please wait a moment and retry.");
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
                onComplete(res.data.profile || newAnswers);
            } else {
                setQuestion(res.data.question);
                setSelected('');
                setFreeText('');
                setStep(s => s + 1);
            }
        } catch (e) {
            console.error('Onboarding error:', e.response?.data || e.message);
            setError("Failed to process answer. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const progress = Math.min(95, (step / totalSteps) * 100);
    const currentAnswer = question?.type === 'free_text' ? freeText : selected;

    if (loading) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center mesh-bg"
                style={{ background: 'var(--bg-primary)' }}>
                <div className="text-center fade-in">
                    <Loader2 size={32} className="spin mx-auto mb-4" style={{ color: 'var(--accent)' }} />
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading questions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 mesh-bg"
            style={{ background: 'var(--bg-primary)' }}>
            <div className="w-full max-w-xl fade-in">
                {/* Brand */}
                <div className="text-center mb-10">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                        style={{ background: 'linear-gradient(135deg, var(--accent), #818cf8)' }}>
                        <Building2 size={24} color="white" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                        Tell us about your business
                    </h1>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        Step {step} of {totalSteps} — Personalized scheme matching
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 rounded-full mb-8 overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                    <div className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{
                            width: `${progress}%`,
                            background: 'linear-gradient(90deg, var(--accent), #818cf8)',
                        }} />
                </div>

                {/* Error State */}
                {error && !question && (
                    <div className="card card-glow p-8 text-center mb-6">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                            style={{ background: 'var(--orange-muted)', color: 'var(--orange)' }}>
                            <Sparkles size={20} />
                        </div>
                        <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                            Connecting to server...
                        </p>
                        <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>{error}</p>
                        <div className="flex items-center justify-center gap-3">
                            <button onClick={loadFirst}
                                className="btn-primary px-5 py-2.5 rounded-xl text-sm">
                                Retry
                            </button>
                            <button onClick={onSkip}
                                className="btn-ghost px-5 py-2.5 rounded-xl text-sm">
                                Skip
                            </button>
                        </div>
                    </div>
                )}

                {/* Question Card */}
                {question && (
                    <div className="card card-glow p-7 mb-6">
                        <p className="text-[15px] font-semibold mb-6 leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                            {question.text}
                        </p>

                        {question.type === 'free_text' ? (
                            <input
                                type="text"
                                value={freeText}
                                onChange={e => setFreeText(e.target.value)}
                                placeholder={question.placeholder || "Type your answer..."}
                                onKeyDown={e => e.key === 'Enter' && freeText && submit()}
                                autoFocus
                                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                                style={{
                                    background: 'var(--bg-elevated)',
                                    border: '1px solid var(--border)',
                                    color: 'var(--text-primary)',
                                }}
                                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                            />
                        ) : (
                            <div className="space-y-2.5">
                                {(question.options || []).map(opt => {
                                    const val = typeof opt === 'string' ? opt : (opt.value || opt.label);
                                    const label = typeof opt === 'string' ? opt : opt.label;
                                    const isSelected = selected === val;

                                    return (
                                        <button key={val} onClick={() => setSelected(val)}
                                            className="w-full text-left px-4 py-3.5 rounded-xl transition-all flex items-center gap-3"
                                            style={{
                                                background: isSelected
                                                    ? 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))'
                                                    : 'var(--bg-elevated)',
                                                border: `1.5px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                                                boxShadow: isSelected ? '0 0 20px rgba(99,102,241,0.1)' : 'none',
                                            }}>
                                            <div className="w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                                                style={{ borderColor: isSelected ? 'var(--accent)' : 'var(--text-dim)' }}>
                                                {isSelected && (
                                                    <div className="w-2.5 h-2.5 rounded-full"
                                                        style={{ background: 'var(--accent)' }} />
                                                )}
                                            </div>
                                            <span className="text-sm" style={{
                                                color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)'
                                            }}>{label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {error && question && (
                            <p className="text-xs mt-4 px-1" style={{ color: 'var(--red)' }}>{error}</p>
                        )}
                    </div>
                )}

                {/* Actions */}
                {(question || error) && (
                    <div className="flex items-center justify-between">
                        <button onClick={onSkip}
                            className="flex items-center gap-1.5 text-sm px-4 py-2.5 rounded-xl btn-ghost">
                            <SkipForward size={14} /> Skip for now
                        </button>
                        {question && (
                            <button onClick={submit} disabled={submitting || !currentAnswer}
                                className="btn-primary flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm">
                                {submitting ? (
                                    <><Loader2 size={15} className="spin" /> Processing...</>
                                ) : (
                                    <>Continue <ArrowRight size={15} /></>
                                )}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
