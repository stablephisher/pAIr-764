import React, { useState } from 'react';
import { Shield, Loader2, AlertCircle, Moon, Sun, Zap } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { signInWithGoogle } from '../firebase';

export default function LoginPage() {
    const { theme, toggleTheme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const login = async () => {
        setLoading(true);
        setError('');
        try {
            await signInWithGoogle();
        } catch (e) {
            setError(e.message || 'Sign-in failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
            {/* Header */}
            <header className="flex items-center justify-between px-6 h-16 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
                        <Zap size={18} color="white" fill="white" />
                    </div>
                    <span className="font-bold text-lg" style={{ color: 'var(--text)' }}>pAIr</span>
                </div>
                <button onClick={toggleTheme} className="btn btn-ghost btn-icon" aria-label="Toggle theme" style={{ color: 'var(--text-secondary)' }}>
                    {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </button>
            </header>

            {/* Hero */}
            <main className="flex-1 flex items-center justify-center px-4">
                <div className="max-w-md w-full">
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
                            style={{ background: 'linear-gradient(135deg, var(--accent), var(--purple))', boxShadow: '0 8px 32px rgba(99, 102, 241, 0.25)' }}>
                            <Shield size={36} color="white" />
                        </div>
                        <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--text)' }}>Welcome to pAIr</h1>
                        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                            AI-powered policy compliance for Indian MSMEs
                        </p>
                    </div>

                    <div className="card p-8" style={{ border: '1px solid var(--border)' }}>
                        <button onClick={login} disabled={loading}
                            className="btn w-full py-4 justify-center gap-3 text-base font-medium transition-all"
                            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                            {loading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                            )}
                            {loading ? 'Signing in...' : 'Continue with Google'}
                        </button>

                        {error && (
                            <div className="mt-4 p-3 rounded-lg flex items-center gap-2" style={{ background: 'var(--red-light)' }}>
                                <AlertCircle size={16} style={{ color: 'var(--red)' }} />
                                <p className="text-sm" style={{ color: 'var(--red)' }}>{error}</p>
                            </div>
                        )}

                        <p className="text-xs text-center mt-6" style={{ color: 'var(--text-tertiary)' }}>
                            By continuing, you agree to our Terms and Privacy Policy
                        </p>
                    </div>

                    <p className="text-center mt-8 text-sm" style={{ color: 'var(--text-tertiary)' }}>Code Unnati Innovation Marathon 4.0</p>
                </div>
            </main>
        </div>
    );
}
