import React, { useState } from 'react';
import { ArrowLeft, Zap, Moon, Sun, Settings, Loader2, CheckCircle, ArrowRight, Building2, Sparkles, MapPin, Users, TrendingUp, Factory, ShoppingBag, Briefcase, Heart } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { apiClient } from '../context/AppContext';

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
    const [showWelcome, setShowWelcome] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await apiClient.post(`/api/profile/${user.uid}`, profile);
            localStorage.setItem(`pair-profile-${user.uid}`, JSON.stringify(profile));

            if (!isEditing) {
                // New user — show welcome screen briefly, then redirect
                setSaving(false);
                setShowWelcome(true);

                // Trigger smart-analysis in background (non-blocking, fire-and-forget)
                apiClient.post(`/api/smart-analysis`, {
                    user_uid: user.uid,
                    profile: profile,
                }).catch(() => { /* non-blocking */ });

                // Redirect to dashboard after a brief welcome animation
                setTimeout(() => {
                    onComplete(profile);
                }, 2500);
            } else {
                onComplete(profile);
            }
        } catch (e) {
            console.error('Profile save error:', e);
            // Still let the user proceed even if backend fails
            localStorage.setItem(`pair-profile-${user.uid}`, JSON.stringify(profile));
            if (!isEditing) {
                setSaving(false);
                setShowWelcome(true);
                setTimeout(() => onComplete(profile), 2000);
            } else {
                onComplete(profile);
            }
        }
    };

    const steps = [
        {
            field: 'business_name',
            title: `Welcome${user?.displayName ? ', ' + user.displayName.split(' ')[0] : ''}! 👋`,
            subtitle: "Let's start with your business name",
            type: 'text',
            placeholder: 'e.g., Sharma Textiles Pvt. Ltd.',
            icon: Building2
        },
        {
            field: 'business_type',
            title: 'What type of business do you operate?',
            subtitle: 'This helps us find the right regulations for you',
            options: ['Manufacturing', 'Service', 'Trading', 'Technology', 'Handicraft', 'Food Processing'],
            icon: Factory
        },
        {
            field: 'sector',
            title: 'Which sector best describes your work?',
            subtitle: 'We\'ll match you with sector-specific policies',
            options: ['Textiles', 'IT/Software', 'Food & Beverage', 'Healthcare', 'Retail', 'Education', 'Construction', 'Agriculture', 'Other'],
            icon: Briefcase
        },
        {
            field: 'employees',
            title: 'How many people work with you?',
            subtitle: 'Labour law requirements vary by team size',
            options: ['1-10', '11-50', '51-200', '201-500', '500+'],
            icon: Users
        },
        {
            field: 'revenue',
            title: "What's your annual revenue range?",
            subtitle: 'This determines your MSME classification & eligible schemes',
            options: ['Less than ₹1 Cr', '₹1-5 Crore', '₹5-10 Crore', '₹10-50 Crore', 'More than ₹50 Cr'],
            icon: TrendingUp
        },
        {
            field: 'location',
            title: 'Where is your business located?',
            subtitle: 'State-specific regulations will be included',
            type: 'text',
            placeholder: 'e.g., Mumbai, Maharashtra',
            icon: MapPin
        },
        {
            field: 'years_in_business',
            title: 'How long have you been in business?',
            subtitle: 'New businesses get additional startup scheme recommendations',
            options: ['Less than 1 year', '1-3 years', '3-5 years', '5-10 years', '10+ years'],
            icon: ShoppingBag
        },
        {
            field: 'business_description',
            title: `Tell us about ${profile.business_name || 'your business'}`,
            subtitle: 'A brief description helps our AI understand your operations',
            type: 'textarea',
            placeholder: 'What does your business do? Tell us about your main operations...',
            icon: Sparkles
        },
        {
            field: 'products_services',
            title: 'What products or services do you offer?',
            subtitle: 'We\'ll check product-specific compliance requirements',
            type: 'text',
            placeholder: 'e.g., Cotton textiles, IT consulting, Food delivery',
            icon: ShoppingBag
        },
        {
            field: 'compliance_concerns',
            title: 'Any compliance areas that concern you?',
            subtitle: 'Our AI will prioritize these in your analysis',
            type: 'textarea',
            placeholder: 'e.g., GST compliance, environmental regulations, labor laws, import/export...',
            icon: Heart
        },
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
                            {user.photoURL && <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />}
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
                                    <label className="block font-semibold mb-3 text-sm">{field.subtitle || field.title}</label>
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

    // WELCOME SCREEN — shown briefly after profile save
    if (showWelcome) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
                <div className="text-center animate-fade-in-up max-w-md px-6">
                    {/* Animated gradient orb */}
                    <div className="relative mx-auto mb-8" style={{ width: 120, height: 120 }}>
                        <div className="absolute inset-0 rounded-full animate-pulse-glow"
                            style={{ background: 'var(--gradient-accent)', opacity: 0.3, filter: 'blur(20px)' }} />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
                                style={{ background: 'var(--gradient-accent)', color: 'white' }}>
                                <Sparkles size={36} />
                            </div>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold mb-3" style={{ background: 'var(--gradient-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        You're all set! 🎉
                    </h1>
                    <p className="text-base mb-3" style={{ color: 'var(--text-secondary)' }}>
                        Welcome to <strong>pAIr</strong>, {user?.displayName?.split(' ')[0] || 'there'}!
                    </p>
                    <p className="text-sm mb-8" style={{ color: 'var(--text-tertiary)' }}>
                        Our AI agents are already analyzing policies and schemes relevant to <strong>{profile.business_name}</strong>.
                        Redirecting to your dashboard...
                    </p>
                    <div className="h-1.5 rounded-full overflow-hidden mx-auto" style={{ background: 'var(--bg-tertiary)', maxWidth: '200px' }}>
                        <div className="h-full rounded-full progress-animated" style={{ width: '100%', transition: 'width 2s ease' }} />
                    </div>
                </div>
            </div>
        );
    }

    // NEW USER MODE: Step-by-step wizard
    const currentStep = steps[step];
    const StepIcon = currentStep.icon || Building2;
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
            {/* Animated background blobs */}
            <div className="gradient-bg-blobs" aria-hidden="true">
                <div className="blob blob-1" />
                <div className="blob blob-2" />
                <div className="blob blob-3" />
            </div>

            {/* Header */}
            <header className="topbar justify-between" style={{ position: 'relative', zIndex: 10 }}>
                <div className="flex items-center gap-2">
                    <Zap size={20} style={{ color: 'var(--accent)' }} />
                    <span className="font-bold">pAIr</span>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={toggleTheme} className="btn btn-ghost btn-icon">
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    </button>
                    <div className="flex items-center gap-2">
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                                style={{ background: 'var(--gradient-accent)', color: 'white' }}>
                                {user?.displayName?.[0] || '?'}
                            </div>
                        )}
                        <span className="text-sm font-medium hidden sm:block">{user?.displayName?.split(' ')[0]}</span>
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className="flex-1 flex items-center justify-center px-4 py-12" style={{ position: 'relative', zIndex: 5 }}>
                <div className="max-w-lg w-full animate-fade-in-up">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                            style={{ background: 'var(--gradient-accent)', color: 'white' }}>
                            <StepIcon size={28} />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">{currentStep.title}</h1>
                        {currentStep.subtitle && (
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                {currentStep.subtitle}
                            </p>
                        )}
                        <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
                            Step {step + 1} of {steps.length}
                        </p>
                    </div>

                    {/* Progress */}
                    <div className="h-1.5 rounded-full mb-8 overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                        <div className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${progress}%`, background: 'var(--gradient-accent)' }} />
                    </div>

                    {/* Question */}
                    <div className="card p-8" style={{ backdropFilter: 'blur(24px)' }}>
                        {currentStep.type === 'text' ? (
                            <input type="text" value={profile[currentStep.field]}
                                onChange={e => setProfile({ ...profile, [currentStep.field]: e.target.value })}
                                placeholder={currentStep.placeholder} className="input text-lg" autoFocus
                                onKeyDown={e => e.key === 'Enter' && canProceed && handleNext()} />
                        ) : currentStep.type === 'textarea' ? (
                            <textarea value={profile[currentStep.field]}
                                onChange={e => setProfile({ ...profile, [currentStep.field]: e.target.value })}
                                placeholder={currentStep.placeholder} rows={4} className="input" style={{ resize: 'none' }} autoFocus />
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                {currentStep.options.map(opt => (
                                    <button key={opt}
                                        onClick={() => setProfile({ ...profile, [currentStep.field]: opt })}
                                        className="p-4 rounded-xl text-sm font-medium transition-all text-left"
                                        style={profile[currentStep.field] === opt
                                            ? { background: 'var(--accent)', color: 'white', boxShadow: '0 4px 16px var(--accent-glow)' }
                                            : { background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-6">
                        {step > 0 ? (
                            <button onClick={() => setStep(step - 1)} className="btn btn-ghost gap-1">
                                <ArrowLeft size={16} /> Back
                            </button>
                        ) : (
                            <div />
                        )}
                        <button onClick={handleNext} disabled={!canProceed || saving} className="btn btn-primary gap-2">
                            {saving ? (
                                <><Loader2 size={16} className="animate-spin" /> Saving...</>
                            ) : isLastStep ? (
                                <><Sparkles size={16} /> Complete Setup</>
                            ) : (
                                <>Continue <ArrowRight size={16} /></>
                            )}
                        </button>
                    </div>

                    {/* Skip hint for optional fields */}
                    {(currentStep.field === 'business_description' || currentStep.field === 'compliance_concerns') && (
                        <p className="text-center text-xs mt-4" style={{ color: 'var(--text-tertiary)' }}>
                            You can skip this and fill it later from Settings
                        </p>
                    )}
                </div>
            </main>
        </div>
    );
}
