import React, { useState, useEffect } from 'react';
import { 
    X, ChevronRight, ChevronLeft, Sparkles, Shield, Search, 
    BarChart3, Brain, Globe, Bot, Zap, CheckCircle, FileCheck,
    Building2, TrendingUp, Bell, ArrowRight, Rocket
} from 'lucide-react';

const TUTORIAL_STEPS = [
    {
        id: 'welcome',
        title: 'Welcome to pAIr!',
        subtitle: 'Your AI Compliance Partner',
        description: 'pAIr uses 7 autonomous AI agents to help Indian MSMEs stay compliant with government policies — automatically and in your language.',
        icon: Sparkles,
        color: '#7c3aed',
        highlight: null,
    },
    {
        id: 'agents',
        title: 'Meet Your AI Agents',
        subtitle: 'Powered by 7 Specialized Agents',
        description: 'Each agent has a specific role: finding policies, analyzing them, planning compliance actions, scoring risks, generating documents, verifying accuracy, and translating to your language.',
        icon: Bot,
        color: '#6366f1',
        features: [
            { icon: Search, label: 'Ingestion', desc: 'Finds relevant policies' },
            { icon: Brain, label: 'Reasoning', desc: 'Analyzes requirements' },
            { icon: FileCheck, label: 'Planning', desc: 'Creates action plans' },
            { icon: BarChart3, label: 'Scoring', desc: 'Calculates risk scores' },
        ],
    },
    {
        id: 'profile',
        title: 'Set Up Your Business',
        subtitle: 'Profile → Add Business',
        description: 'Add your business details like sector, type, state, GSTIN, and Udyam number. pAIr uses this to find policies relevant to YOUR business.',
        icon: Building2,
        color: '#059669',
        tip: 'Tip: Add multiple businesses to manage all your ventures in one place!',
    },
    {
        id: 'analysis',
        title: 'Analyze Your Business',
        subtitle: 'Analysis → Select Business → Analyze',
        description: 'Select any of your businesses and click Analyze. pAIr will automatically find relevant policies and give you compliance insights, risk scores, and action plans.',
        icon: Zap,
        color: '#d97706',
        tip: 'Tip: Analysis results are saved in your history for future reference.',
    },
    {
        id: 'discover',
        title: 'Discover New Policies',
        subtitle: 'Discover → Search',
        description: 'Use Policy Discovery to search for new government schemes, subsidies, and regulations. pAIr scans official sources in real-time.',
        icon: Search,
        color: '#0891b2',
        tip: 'Tip: Search for schemes like "MSME loan" or "technology subsidy" to find helpful programs.',
    },
    {
        id: 'dashboard',
        title: 'Track Your Compliance',
        subtitle: 'Dashboard → Analytics',
        description: 'Your dashboard shows compliance scores, risk assessments, sustainability metrics, and upcoming deadlines — all in one place.',
        icon: TrendingUp,
        color: '#ec4899',
        metrics: [
            { label: 'Compliance', value: '85%' },
            { label: 'Risk Score', value: 'Low' },
            { label: 'Sustainability', value: '72%' },
        ],
    },
    {
        id: 'languages',
        title: 'Your Language, Your Way',
        subtitle: '16 Indian Languages Supported',
        description: 'Use the language selector in the navbar to switch to Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, and more. All content gets translated instantly!',
        icon: Globe,
        color: '#7c3aed',
        languages: ['हिंदी', 'தமிழ்', 'తెలుగు', 'বাংলা', 'मराठी', 'ગુજરાતી'],
    },
    {
        id: 'ready',
        title: "You're All Set!",
        subtitle: 'Start Your Compliance Journey',
        description: 'Add your business profile and let pAIr handle the rest. Compliance has never been this easy.',
        icon: Rocket,
        color: '#059669',
        cta: true,
    },
];

export default function Tutorial({ onComplete, onSkip }) {
    const [step, setStep] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const currentStep = TUTORIAL_STEPS[step];
    const progress = ((step + 1) / TUTORIAL_STEPS.length) * 100;

    const goNext = () => {
        if (step < TUTORIAL_STEPS.length - 1) {
            setIsAnimating(true);
            setTimeout(() => {
                setStep(step + 1);
                setIsAnimating(false);
            }, 150);
        } else {
            onComplete();
        }
    };

    const goPrev = () => {
        if (step > 0) {
            setIsAnimating(true);
            setTimeout(() => {
                setStep(step - 1);
                setIsAnimating(false);
            }, 150);
        }
    };

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight' || e.key === 'Enter') goNext();
            if (e.key === 'ArrowLeft') goPrev();
            if (e.key === 'Escape') onSkip();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [step]);

    const IconComponent = currentStep.icon;

    return (
        <div className="tutorial-overlay">
            <div className={`tutorial-card ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                style={{ transition: 'all 0.15s ease-out', maxWidth: '480px', width: '90%' }}>
                
                {/* Progress bar */}
                <div className="h-1 rounded-full mb-6" style={{ background: 'var(--bg-tertiary)' }}>
                    <div className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${progress}%`, background: 'linear-gradient(90deg, var(--accent), var(--purple))' }} />
                </div>

                {/* Skip button */}
                <button onClick={onSkip}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 transition-colors"
                    style={{ color: 'var(--text-tertiary)' }}>
                    <X size={18} />
                </button>

                {/* Step indicator */}
                <div className="text-xs font-medium mb-4" style={{ color: 'var(--text-tertiary)' }}>
                    Step {step + 1} of {TUTORIAL_STEPS.length}
                </div>

                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 mx-auto"
                    style={{ background: `${currentStep.color}20`, color: currentStep.color }}>
                    <IconComponent size={32} />
                </div>

                {/* Content */}
                <h2 className="text-2xl font-bold mb-1 text-center" style={{ color: 'var(--text)' }}>
                    {currentStep.title}
                </h2>
                <p className="text-sm font-medium mb-4 text-center" style={{ color: currentStep.color }}>
                    {currentStep.subtitle}
                </p>
                <p className="text-sm mb-6 text-center leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {currentStep.description}
                </p>

                {/* Features grid */}
                {currentStep.features && (
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {currentStep.features.map((f, i) => (
                            <div key={i} className="p-3 rounded-xl text-center"
                                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                                <f.icon size={20} className="mx-auto mb-1.5" style={{ color: 'var(--accent)' }} />
                                <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{f.label}</p>
                                <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Tip */}
                {currentStep.tip && (
                    <div className="p-3 rounded-xl mb-6 flex items-start gap-2"
                        style={{ background: 'var(--accent-light)', border: '1px solid var(--accent-muted)' }}>
                        <Sparkles size={14} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                        <p className="text-xs" style={{ color: 'var(--accent)' }}>{currentStep.tip}</p>
                    </div>
                )}

                {/* Metrics */}
                {currentStep.metrics && (
                    <div className="flex items-center justify-center gap-4 mb-6">
                        {currentStep.metrics.map((m, i) => (
                            <div key={i} className="text-center">
                                <p className="text-lg font-bold" style={{ color: currentStep.color }}>{m.value}</p>
                                <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{m.label}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Languages */}
                {currentStep.languages && (
                    <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                        {currentStep.languages.map((l, i) => (
                            <span key={i} className="px-3 py-1.5 rounded-full text-xs font-medium"
                                style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                                {l}
                            </span>
                        ))}
                    </div>
                )}

                {/* Navigation */}
                <div className="flex items-center gap-3">
                    {step > 0 && (
                        <button onClick={goPrev}
                            className="btn btn-secondary flex-1 gap-1.5">
                            <ChevronLeft size={16} /> Back
                        </button>
                    )}
                    <button onClick={goNext}
                        className="btn btn-primary flex-1 gap-1.5"
                        style={currentStep.cta ? { background: 'linear-gradient(90deg, var(--accent), var(--purple))' } : {}}>
                        {step === TUTORIAL_STEPS.length - 1 ? (
                            <>Get Started <Rocket size={16} /></>
                        ) : (
                            <>Next <ChevronRight size={16} /></>
                        )}
                    </button>
                </div>

                {/* Dot indicators */}
                <div className="flex items-center justify-center gap-1.5 mt-5">
                    {TUTORIAL_STEPS.map((_, i) => (
                        <button key={i} onClick={() => setStep(i)}
                            className="w-2 h-2 rounded-full transition-all"
                            style={{
                                background: i === step ? 'var(--accent)' : 'var(--bg-tertiary)',
                                transform: i === step ? 'scale(1.3)' : 'scale(1)',
                            }} />
                    ))}
                </div>
            </div>
        </div>
    );
}
