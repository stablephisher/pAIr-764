import React from 'react';
import { Github, Twitter, Linkedin, Mail, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
    const year = new Date().getFullYear();

    const links = {
        product: [
            { label: 'Analyze', page: '/' },
            { label: 'Dashboard', page: '/dashboard' },
            { label: 'Resources', page: '/resources' },
        ],
        company: [
            { label: 'Our Team', page: '/team' },
            { label: 'History', page: '/history' },
            { label: 'Settings', page: '/settings' },
        ],
        support: [
            { label: 'Manage Businesses', page: '/profile' },
            { label: 'Competitor Analysis', page: '/competitor-analysis' },
        ],
    };

    return (
        <footer className="footer py-12 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="w-full max-w-[1280px] mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
                                <span className="font-bold text-white">P</span>
                            </div>
                            <span className="font-bold text-xl" style={{ color: 'var(--text)' }}>pAIr</span>
                        </div>
                        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                            AI-powered compliance navigator for Indian MSMEs. Making regulatory adherence simple, automated, and intelligent.
                        </p>
                        <div className="flex gap-4">
                            <a href="https://github.com" target="_blank" rel="noopener noreferrer"
                                className="transition-colors" style={{ color: 'var(--text-tertiary)' }}
                                onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                                onMouseLeave={e => e.target.style.color = 'var(--text-tertiary)'}>
                                <Github size={18} />
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                                className="transition-colors" style={{ color: 'var(--text-tertiary)' }}
                                onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                                onMouseLeave={e => e.target.style.color = 'var(--text-tertiary)'}>
                                <Twitter size={18} />
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                                className="transition-colors" style={{ color: 'var(--text-tertiary)' }}
                                onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                                onMouseLeave={e => e.target.style.color = 'var(--text-tertiary)'}>
                                <Linkedin size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    {Object.entries(links).map(([category, items]) => (
                        <div key={category}>
                            <h4 className="font-semibold mb-4 capitalize" style={{ color: 'var(--text)' }}>{category}</h4>
                            <ul className="space-y-2">
                                {items.map((item, i) => (
                                    <li key={i}>
                                        <Link to={item.page}
                                            className="text-sm transition-colors inline-block"
                                            style={{ color: 'var(--text-secondary)' }}
                                            onMouseEnter={e => { e.target.style.color = 'var(--accent)'; e.target.style.textDecoration = 'underline'; }}
                                            onMouseLeave={e => { e.target.style.color = 'var(--text-secondary)'; e.target.style.textDecoration = 'none'; }}>
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="pt-8 flex flex-col md:flex-row items-center justify-between border-t" style={{ borderColor: 'var(--border)' }}>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>© {year} pAIr Inc. All rights reserved.</p>
                    <div className="flex items-center gap-1 text-xs mt-4 md:mt-0" style={{ color: 'var(--text-tertiary)' }}>
                        Made with <Heart size={12} fill="var(--red)" stroke="none" /> for <span className="font-semibold" style={{ color: 'var(--text)' }}>Startup India</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
