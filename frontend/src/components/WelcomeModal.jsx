import React from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';

export default function WelcomeModal({ onClose }) {
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
        }}>
            <div style={{
                position: 'relative',
                width: '90%',
                maxWidth: '400px',
                background: '#fff',
                borderRadius: '16px',
                padding: '28px',
                textAlign: 'center',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            }}>
                <button onClick={onClose} style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9ca3af',
                }}>
                    <X size={20} />
                </button>

                <Sparkles size={40} color="#6366f1" style={{ marginBottom: '16px' }} />
                
                <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111', marginBottom: '8px' }}>
                    Welcome to pAIr!
                </h2>
                
                <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.6, marginBottom: '20px' }}>
                    Your AI-powered compliance partner for Indian MSMEs. Add your business in <strong>Profile</strong>, then analyze policies tailored to you.
                </p>

                <button onClick={onClose} style={{
                    width: '100%',
                    padding: '12px',
                    background: '#6366f1',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                }}>
                    Get Started <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
}
