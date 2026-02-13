// pAIr v3 — Onboarding Wizard Component
// Adaptive decision-tree questionnaire for business profiling
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronRight, Building2, CheckCircle2, Loader2 } from 'lucide-react';

const API_BASE_URL = "http://localhost:8000";

export default function OnboardingWizard({ onComplete, onSkip }) {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answers, setAnswers] = useState({});
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [freeTextInput, setFreeTextInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [error, setError] = useState(null);

  // Start the onboarding
  useEffect(() => {
    startOnboarding();
  }, []);

  const startOnboarding = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/onboarding/start`);
      setCurrentQuestion(res.data.question);
      setQuestionCount(1);
      setLoading(false);
    } catch (e) {
      setError("Failed to load onboarding questions");
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!currentQuestion) return;

    const answer = currentQuestion.type === 'free_text' ? freeTextInput : selectedAnswer;
    if (!answer) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/onboarding/answer`, {
        current_question_id: currentQuestion.id,
        answer: answer,
        answers_so_far: { ...answers, [currentQuestion.id]: answer },
      });

      const newAnswers = { ...answers, [currentQuestion.id]: answer };
      setAnswers(newAnswers);

      if (res.data.is_complete) {
        // Onboarding complete — generate profile
        setProgress(100);
        if (res.data.profile) {
          onComplete(res.data.profile);
        } else {
          // Generate profile separately
          const profileRes = await axios.post(`${API_BASE_URL}/api/onboarding/profile`, {
            answers: newAnswers,
          });
          onComplete(profileRes.data.profile);
        }
      } else {
        setCurrentQuestion(res.data.question);
        setSelectedAnswer('');
        setFreeTextInput('');
        setQuestionCount(prev => prev + 1);
        setProgress(Math.min(90, questionCount * 8));
      }
    } catch (e) {
      setError("Failed to submit answer. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 size={40} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
        <p className="mt-4 text-sm" style={{ color: 'var(--text-secondary)' }}>Loading questionnaire...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}>
          <Building2 size={28} />
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Tell us about your business
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Answer a few questions so we can find the best policies and schemes for you
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full mb-8" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%`, backgroundColor: 'var(--accent-primary)' }} />
      </div>

      {/* Question Card */}
      {currentQuestion && (
        <div className="card p-6 mb-6">
          <div className="flex items-start gap-3 mb-6">
            <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}>
              {questionCount}
            </span>
            <div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {currentQuestion.question || currentQuestion.text}
              </h3>
              {currentQuestion.description && (
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {currentQuestion.description}
                </p>
              )}
            </div>
          </div>

          {/* Options */}
          {currentQuestion.type === 'free_text' ? (
            <div className="mt-4">
              <input
                type="text"
                value={freeTextInput}
                onChange={(e) => setFreeTextInput(e.target.value)}
                placeholder={currentQuestion.placeholder || "Type your answer..."}
                className="w-full p-3 rounded-lg text-sm"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                }}
                onKeyDown={(e) => e.key === 'Enter' && freeTextInput && submitAnswer()}
              />
            </div>
          ) : (
            <div className="grid gap-3 mt-4">
              {(currentQuestion.options || []).map((opt) => {
                const value = typeof opt === 'string' ? opt : opt.value || opt.label;
                const label = typeof opt === 'string' ? opt : opt.label;
                const desc = typeof opt === 'object' ? opt.description : null;
                const isSelected = selectedAnswer === value;

                return (
                  <button
                    key={value}
                    onClick={() => setSelectedAnswer(value)}
                    className="w-full text-left p-4 rounded-xl transition-all border"
                    style={{
                      backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-tertiary)',
                      borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                        style={{ borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-color)' }}>
                        {isSelected && (
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--accent-primary)' }} />
                        )}
                      </div>
                      <div>
                        <span className="font-medium text-sm">{label}</span>
                        {desc && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{desc}</p>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {error && (
            <p className="text-sm mt-3" style={{ color: 'var(--danger)' }}>{error}</p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <button onClick={onSkip} className="btn btn-secondary text-sm">
          Skip for now
        </button>
        <button
          onClick={submitAnswer}
          disabled={submitting || (!selectedAnswer && !freeTextInput)}
          className="btn btn-primary flex items-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Next <ChevronRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
