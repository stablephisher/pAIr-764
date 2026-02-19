import React, { useState } from 'react';
import axios from 'axios';
import { ArrowLeft, Zap, Moon, Sun, Settings, Loader2, CheckCircle, ArrowRight, Building2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function ProfileSetup({ user, onComplete, existingProfile, onCancel }) {
    const { theme, toggleTheme } = useTheme();
    const isEditing = !!existingProfile;
    const [step, setStep] = useState(0);
    const [profile, setProfile] = useState({
        business_name: existingProfile?.business_name || '',
        business_type: existingProfile?.business_type || '',
        sector: existingProfile?.sector || '',
        employees: existingProfile?.employees || '',
        revenue: existingProfile?.revenue || '',
        location: existingProfile?.location || '',
        business_description: existingProfile?.business_description || '',
        products_services: existingProfile?.products_services || '',
        compliance_concerns: existingProfile?.compliance_concerns || '',
        years_in_business: existingProfile?.years_in_business || '',
    });
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.post(`${API}/api/profile/${user.uid}`, profile);
            localStorage.setItem(`pair-profile-${user.uid}`, JSON.stringify(profile));
            onComplete(profile);
        } catch (e) {
            console.error('Profile save error:', e);
            localStorage.setItem(`pair-profile-${user.uid}`, JSON.stringify(profile));
            onComplete(profile);
        }
    };

    const steps = [
        { field: 'business_name', title: "What's your business name?", type: 'text', placeholder: 'e.g., Sharma Textiles Pvt. Ltd.' },
        { field: 'business_type', title: 'What type of business do you operate?', options: ['Manufacturing', 'Service', 'Trading', 'Technology', 'Handicraft', 'Food Processing'] },
        { field: 'sector', title: 'Which sector best describes your business?', options: ['Textiles', 'IT/Software', 'Food & Beverage', 'Healthcare', 'Retail', 'Education', 'Construction', 'Other'] },
        { field: 'employees', title: 'How many employees do you have?', options: ['1-10', '11-50', '51-200', '201-500', '500+'] },
        { field: 'revenue', title: "What's your annual revenue?", options: ['Less than ₹1 Cr', '₹1-5 Crore', '₹5-10 Crore', '₹10-50 Crore', 'More than ₹50 Cr'] },
        { field: 'location', title: 'Where is your business located?', type: 'text', placeholder: 'e.g., Mumbai, Maharashtra' },
        { field: 'years_in_business', title: 'How long have you been in business?', options: ['Less than 1 year', '1-3 years', '3-5 years', '5-10 years', '10+ years'] },
        { field: 'business_description', title: 'Describe your business in a few lines', type: 'textarea', placeholder: 'What does your business do? Tell us about your operations...' },
        { field: 'products_services', title: 'What products/services do you offer?', type: 'text', placeholder: 'e.g., Cotton textiles, IT consulting, Food delivery' },
        { field: 'compliance_concerns', title: 'What compliance areas concern you most?', type: 'textarea', placeholder: 'e.g., GST compliance, environmental regulations, labor laws...' },
    ];

    // EDITING MODE: Single-form view
    if (isEditing) {
        const canSave = profile.business_name?.trim() && profile.business_type?.trim();
        return (
            <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
                <header className="topbar justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={onCancel} className="btn btn-ghost btn-icon" title="Go back">
                            <ArrowLeft size={18} />
                        </button>
                        <div className="flex items-center gap-2">
                            <Zap size={20} style={{ color: 'var(--accent)' }} />
                            <span className="font-bold">pAIr</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={toggleTheme} className="btn btn-ghost btn-icon">
                            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                        </button>
                        <div className="flex items-center gap-2">
                            {user.photoURL && <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />}
                            <span className="text-sm font-medium hidden sm:block">{user.displayName?.split(' ')[0]}</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto px-4 py-8">
                    <div className="max-w-2xl mx-auto animate-fade-in-up">
                        <div className="text-center mb-8">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                                style={{ background: 'var(--accent)', color: 'white' }}>
                                <Settings size={24} />
                            </div>
                            <h1 className="text-2xl font-bold mb-2">Edit Business Profile</h1>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                Update your details to improve AI recommendations
                            </p>
                        </div>

                        <div className="space-y-6">
                            {steps.map((field, i) => (
                                <div key={field.field} className="card p-6 animate-fade-in-up" style={{ animationDelay: `${i * 0.04}s` }}>
                                    <label className="block font-semibold mb-3 text-sm">{field.title}</label>
                                    {field.type === 'text' ? (
                                        <input type="text" value={profile[field.field]}
                                            onChange={e => setProfile({ ...profile, [field.field]: e.target.value })}
                                            placeholder={field.placeholder} className="input" />
                                    ) : field.type === 'textarea' ? (
                                        <textarea value={profile[field.field]}
                                            onChange={e => setProfile({ ...profile, [field.field]: e.target.value })}
                                            placeholder={field.placeholder} rows={3} className="input" style={{ resize: 'none' }} />
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {field.options.map(opt => (
                                                <button key={opt}
                                                    onClick={() => setProfile({ ...profile, [field.field]: opt })}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${profile[field.field] === opt
                                                        ? 'text-white shadow-md' : ''}`}
                                                    style={profile[field.field] === opt
                                                        ? { background: 'var(--accent)' }
                                                        : { background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between mt-8 mb-12">
                            <button onClick={onCancel} className="btn btn-ghost">Cancel</button>
                            <button onClick={handleSave} disabled={!canSave || saving} className="btn btn-primary gap-2">
                                {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><CheckCircle size={16} /> Save Changes</>}
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // NEW USER MODE: Step-by-step wizard
    const currentStep = steps[step];
    const progress = ((step + 1) / steps.length) * 100;
    const isLastStep = step === steps.length - 1;
    const canProceed = profile[currentStep.field]?.trim();

    const handleNext = async () => {
        if (isLastStep) {
            await handleSave();
        } else {
            setStep(step + 1);
        }
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
            {/* Header */}
            <header className="topbar justify-between">
                <div className="flex items-center gap-2">
                    <Zap size={20} style={{ color: 'var(--accent)' }} />
                    <span className="font-bold">pAIr</span>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={toggleTheme} className="btn btn-ghost btn-icon">
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    </button>
                    <div className="flex items-center gap-2">
                        {user.photoURL && <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />}
                        <span className="text-sm font-medium hidden sm:block">{user.displayName?.split(' ')[0]}</span>
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="max-w-lg w-full animate-fade-in-up">
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                            style={{ background: 'var(--accent)', color: 'white' }}>
                            <Building2 size={24} />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Set up your profile</h1>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            Step {step + 1} of {steps.length} • Personalized recommendations
                        </p>
                    </div>

                    {/* Progress */}
                    <div className="h-1.5 rounded-full mb-8 overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                        <div className="h-full rounded-full progress-animated transition-all duration-500"
                            style={{ width: `${progress}%` }} />
                    </div>

                    {/* Question */}
                    <div className="card p-8">
                        <h2 className="text-lg font-semibold mb-6">{currentStep.title}</h2>

                        {currentStep.type === 'text' ? (
                            <input type="text" value={profile[currentStep.field]}
                                onChange={e => setProfile({ ...profile, [currentStep.field]: e.target.value })}
                                placeholder={currentStep.placeholder} className="input" autoFocus
                                onKeyDown={e => e.key === 'Enter' && canProceed && handleNext()} />
                        ) : currentStep.type === 'textarea' ? (
                            <textarea value={profile[currentStep.field]}
                                onChange={e => setProfile({ ...profile, [currentStep.field]: e.target.value })}
                                placeholder={currentStep.placeholder} rows={4} className="input" style={{ resize: 'none' }} autoFocus />
                        ) : (
                            <div className="radio-group">
                                {currentStep.options.map(opt => (
                                    <div key={opt}
                                        onClick={() => setProfile({ ...profile, [currentStep.field]: opt })}
                                        className={`radio-option ${profile[currentStep.field] === opt ? 'selected' : ''}`}>
                                        <div className="radio-circle">
                                            {profile[currentStep.field] === opt && <div className="radio-dot" />}
                                        </div>
                                        <span className="font-medium">{opt}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-6">
                        {step > 0 ? (
                            <button onClick={() => setStep(step - 1)} className="btn btn-ghost">Back</button>
                        ) : (
                            <div />
                        )}
                        <button onClick={handleNext} disabled={!canProceed || saving} className="btn btn-primary">
                            {saving ? (
                                <><Loader2 size={16} className="animate-spin" /> Saving...</>
                            ) : isLastStep ? (
                                <>Complete Setup</>
                            ) : (
                                <>Continue <ArrowRight size={16} /></>
                            )}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
