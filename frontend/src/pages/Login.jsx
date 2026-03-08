import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Globe, Bot, Loader2, Sparkles } from 'lucide-react';
import { signInWithGoogle } from '../firebase';
import { useAppContext } from '../context/AppContext';
import useTranslate from '../hooks/useTranslate';

export default function Login() {
    const { user, profile, language } = useAppContext();
    const navigate = useNavigate();
    const [signingIn, setSigningIn] = useState(false);
    const [error, setError] = useState(null);
    const lang = language?.code || 'en';
    const { gt } = useTranslate(lang);

    // Redirect authenticated users away from login page
    useEffect(() => {
        if (user) {
            navigate(profile ? '/dashboard' : '/onboarding', { replace: true });
        }
    }, [user, profile, navigate]);

    const handleGoogleSignIn = async () => {
        setSigningIn(true);
        setError(null);
        try {
            await signInWithGoogle();
        } catch (e) {
            console.error('Sign-in error:', e);
            setError(e.message || 'Sign-in failed. Please try again.');
            setSigningIn(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
            <div className="max-w-md w-full animate-fade-in-up" style={{ position: 'relative', zIndex: 2 }}>
                {/* Logo */}
                <div className="text-center mb-8">
                    <img src="/pair-logo.png" alt="pAIr" className="h-14 w-auto mx-auto mb-4" style={{ objectFit: 'contain' }} />
                    <h1 className="text-3xl font-bold mb-2">{gt('Welcome to pAIr')}</h1>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {gt('Your AI-powered compliance partner for Indian MSMEs')}
                    </p>
                </div>

                {/* Login Card */}
                <div className="card p-8" style={{ backdropFilter: 'blur(24px)' }}>
                    {/* Features list */}
                    <div className="space-y-3 mb-8">
                        {[
                            { icon: Bot, text: gt('7 AI agents analyze policies automatically') },
                            { icon: Shield, text: gt('Compliance risk scoring and action plans') },
                            { icon: Globe, text: gt('Available in 16 Indian languages') },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                                    <item.icon size={16} />
                                </div>
                                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Google Sign-In */}
                    <button onClick={handleGoogleSignIn} disabled={signingIn}
                        className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl text-sm font-semibold transition-all"
                        style={{
                            background: 'var(--surface-solid)',
                            border: '1.5px solid var(--border)',
                            color: 'var(--text)',
                            boxShadow: 'var(--shadow-sm)'
                        }}
                        onMouseEnter={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-muted)'; }}
                        onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'var(--shadow-sm)'; }}>
                        {signingIn ? (
                            <><Loader2 size={18} className="animate-spin" /> {gt('Signing in...')}</>
                        ) : (
                            <>
                                <svg width="18" height="18" viewBox="0 0 48 48">
                                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                                </svg>
                                {gt('Continue with Google')}
                            </>
                        )}
                    </button>

                    {error && (
                        <div className="mt-4 p-3 rounded-lg text-xs" style={{ background: 'var(--red-light)', color: 'var(--red)' }}>
                            {error}
                        </div>
                    )}

                    {/* Trust note */}
                    <p className="text-center text-xs mt-6" style={{ color: 'var(--text-tertiary)' }}>
                        <Shield size={12} className="inline mr-1" style={{ verticalAlign: 'middle' }} />
                        {gt('Secured with Firebase Auth. We never store your password.')}
                    </p>
                </div>

                {/* Bottom badge */}
                <div className="text-center mt-6">
                    <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        <Sparkles size={12} />
                        Code Unnati Innovation Marathon 4.0 - Team pAIr
                    </span>
                </div>
            </div>
        </div>
    );
}
