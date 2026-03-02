import React from 'react';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { t } from '../i18n/translations';

export default function Footer() {
    const year = new Date().getFullYear();
    const { language } = useAppContext();
    const lang = language?.code || 'en';

    const links = {
        [t('Product', lang)]: [
            { label: t('Analyze', lang), page: '/' },
            { label: t('Dashboard', lang), page: '/dashboard' },
            { label: t('Resources', lang), page: '/resources' },
        ],
        [t('Company', lang)]: [
            { label: t('Team', lang), page: '/team' },
            { label: t('History', lang), page: '/history' },
            { label: t('Settings', lang), page: '/settings' },
        ],
        [t('Support', lang)]: [
            { label: t('Manage Businesses', lang), page: '/profile' },
            { label: t('Competitor Analysis', lang), page: '/competitor-analysis' },
            { label: t('About', lang) + ' pAIr', page: '/about' },
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
