import React from 'react';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import useTranslate from '../hooks/useTranslate';

export default function Footer() {
    const year = new Date().getFullYear();
    const { language } = useAppContext();
    const lang = language?.code || 'en';
    const { gt } = useTranslate(lang);

    const links = {
        [gt('Product')]: [
            { label: gt('Analyze'), page: '/' },
            { label: gt('Dashboard'), page: '/dashboard' },
            { label: gt('Resources'), page: '/resources' },
        ],
        [gt('Company')]: [
            { label: gt('Team'), page: '/team' },
            { label: gt('Policies'), page: '/policies' },
            { label: gt('Settings'), page: '/settings' },
        ],
        [gt('Support')]: [
            { label: gt('Manage Businesses'), page: '/profile' },
            { label: gt('Competitor Analysis'), page: '/competitor-analysis' },
            { label: gt('About') + ' pAIr', page: '/about' },
        ],
    };

    return (
        <footer className="footer py-12 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="w-full max-w-[1280px] mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <img src="/pair-logo.png" alt="pAIr" className="h-8 w-auto" style={{ objectFit: 'contain' }} />
                        </div>
                        <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            {gt('Helping small businesses navigate government policies so they can focus on what they do best.')}
                        </p>
                    </div>

                    {/* Links */}
                    {Object.entries(links).map(([category, items]) => (
                        <div key={category}>
                            <h4 className="font-semibold mb-4" style={{ color: 'var(--text)' }}>{category}</h4>
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
                        Made with <Heart size={12} fill="var(--red)" stroke="none" /> by <span className="font-semibold" style={{ color: 'var(--text)' }}>Team pAIr</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
