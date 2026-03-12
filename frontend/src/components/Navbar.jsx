import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Zap, BarChart3, Briefcase, Globe, Bell, ChevronDown,
    Languages, LogOut, User, Settings, Building2, Menu, X,
    Moon, Sun, FileText, ScrollText, Search
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAppContext } from '../context/AppContext';
import { LANGUAGES } from '../constants';
import { logOut } from '../firebase';
import useTranslate from '../hooks/useTranslate';

export default function Navbar() {
    const { user, profile, language, setLanguage, notifications, markAllNotificationsRead } = useAppContext();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const lang = language?.code || 'en';
    const { gt } = useTranslate(lang);

    const [langDropdown, setLangDropdown] = useState(false);
    const [notifDropdown, setNotifDropdown] = useState(false);
    const [profileDropdown, setProfileDropdown] = useState(false);
    const [mobileMenu, setMobileMenu] = useState(false);

    const unreadCount = notifications.filter(n => !n.read).length;

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    const closeAllDropdowns = () => {
        setLangDropdown(false);
        setNotifDropdown(false);
        setProfileDropdown(false);
    };

    const NavItem = ({ to, icon: Icon, label }) => (
        <Link to={to} onClick={() => setMobileMenu(false)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium ${isActive(to)
                ? 'text-white shadow-md'
                : 'hover:opacity-80'
                }`}
            style={isActive(to)
                ? { background: 'var(--accent)' }
                : { color: 'var(--text-secondary)' }
            }>
            <Icon size={16} />
            <span>{label}</span>
        </Link>
    );

    /* Avatar: Google photo with fallback to letter initial */
    const Avatar = ({ size = 32, className = '' }) => {
        if (user?.photoURL) {
            return (
                <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className={`rounded-full object-cover shadow-sm ${className}`}
                    style={{ width: size, height: size }}
                    referrerPolicy="no-referrer"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
            );
        }
        return (
            <div className={`rounded-full flex items-center justify-center font-bold text-sm text-white shadow-sm ${className}`}
                style={{ width: size, height: size, background: 'linear-gradient(135deg, var(--accent), var(--purple))' }}>
                {user?.displayName?.[0]?.toUpperCase() || 'U'}
            </div>
        );
    };

    return (
        <header className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{ background: 'var(--bg-glass)', borderColor: 'var(--border)' }}>
            <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

                {/* Logo & Mobile Menu */}
                <div className="flex items-center gap-3">
                    <button className="md:hidden btn btn-ghost btn-icon" onClick={() => setMobileMenu(!mobileMenu)}>
                        {mobileMenu ? <X size={20} /> : <Menu size={20} />}
                    </button>
                    <Link to="/" className="flex items-center gap-2">
                        <img src="/pair-logo.png" alt="pAIr" className="h-9 w-auto" style={{ objectFit: 'contain' }} />
                    </Link>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-1 ml-6 mr-auto">
                    <NavItem to="/" icon={Zap} label={gt('Home')} />
                    <NavItem to="/dashboard" icon={BarChart3} label={gt('Dashboard')} />
                    <NavItem to="/discover" icon={Search} label={gt('Discover')} />
                    <NavItem to="/competitor-analysis" icon={Briefcase} label={gt('Competitor')} />
                    <NavItem to="/resources" icon={Globe} label={gt('Resources')} />
                    <NavItem to="/policies" icon={ScrollText} label={gt('Policies')} />
                    <NavItem to="/team" icon={User} label={gt('Team')} />
                    <NavItem to="/about" icon={FileText} label={gt('About')} />
                </nav>

                {/* Right Actions */}
                <div className="flex items-center gap-1">

                    {/* Language */}
                    <div className="relative">
                        <button onClick={() => { setLangDropdown(!langDropdown); setNotifDropdown(false); setProfileDropdown(false); }}
                            className="btn btn-ghost gap-1.5 px-2 py-1.5 rounded-lg" style={{ color: 'var(--text-secondary)' }}>
                            <Languages size={16} />
                            <span className="hidden lg:inline text-xs font-medium">{language?.native || 'English'}</span>
                        </button>
                        {langDropdown && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setLangDropdown(false)} />
                                <div className="absolute right-0 mt-2 w-52 rounded-xl shadow-xl border py-1 z-20 overflow-hidden" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                                    <div className="max-h-[320px] overflow-y-auto overscroll-contain">
                                        {LANGUAGES.map(l => (
                                            <button key={l.code}
                                                onClick={() => { setLanguage(l); setLangDropdown(false); }}
                                                className="w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors"
                                                style={{ color: language.code === l.code ? 'var(--accent)' : 'var(--text)', background: language.code === l.code ? 'var(--accent-light)' : 'transparent' }}>
                                                <span className="font-medium">{l.name}</span>
                                                <span className="text-xs opacity-60">{l.native}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Notifications */}
                    <div className="relative">
                        <button onClick={() => { setNotifDropdown(!notifDropdown); setLangDropdown(false); setProfileDropdown(false); }}
                            className="btn btn-ghost btn-icon relative" style={{ color: 'var(--text-secondary)' }}>
                            <Bell size={16} />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--red)' }}></span>
                            )}
                        </button>
                        {notifDropdown && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setNotifDropdown(false)} />
                                <div className="absolute right-0 mt-2 w-80 rounded-xl shadow-xl border py-0 z-20 overflow-hidden" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                                    <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                                        <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{t('Notifications', lang)}</span>
                                        {unreadCount > 0 && (
                                            <button onClick={markAllNotificationsRead} className="text-xs font-medium" style={{ color: 'var(--accent)' }}>{t('Mark all read', lang)}</button>
                                        )}
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center" style={{ color: 'var(--text-tertiary)' }}>
                                                <Bell size={24} className="mx-auto mb-2 opacity-40" />
                                                <p className="text-sm">{t('No notifications yet', lang)}</p>
                                            </div>
                                        ) : (
                                            notifications.map(n => (
                                                <div key={n.id} className="p-3 border-b last:border-0 transition-colors"
                                                    style={{ borderColor: 'var(--border)', background: !n.read ? 'var(--accent-light)' : 'transparent' }}>
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="font-medium text-sm" style={{ color: 'var(--text)' }}>{n.title}</span>
                                                        <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{n.time}</span>
                                                    </div>
                                                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{n.message}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Theme Toggle */}
                    <button onClick={toggleTheme} className="btn btn-ghost btn-icon" style={{ color: 'var(--text-secondary)' }}>
                        {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                    </button>

                    {/* User Profile */}
                    {user ? (
                        <div className="relative ml-1">
                            <button onClick={() => { setProfileDropdown(!profileDropdown); setLangDropdown(false); setNotifDropdown(false); }}
                                className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors"
                                style={{ color: 'var(--text)' }}>
                                <Avatar size={32} />
                                <div className="hidden sm:flex flex-col items-start leading-tight">
                                    <span className="text-xs font-bold" style={{ color: 'var(--text)' }}>{user.displayName || 'User'}</span>
                                    <span className="text-[10px] truncate max-w-[120px]" style={{ color: 'var(--text-tertiary)' }}>
                                        {profile?.business_name || 'No Business'}
                                    </span>
                                </div>
                                <ChevronDown size={12} style={{ color: 'var(--text-tertiary)' }} />
                            </button>

                            {profileDropdown && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setProfileDropdown(false)} />
                                    <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-xl border py-0 z-20 overflow-hidden" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                                        <div className="px-4 py-3 border-b flex items-center gap-3" style={{ borderColor: 'var(--border)', background: 'var(--bg-tertiary)' }}>
                                            <Avatar size={36} />
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{user.displayName}</p>
                                                <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="py-1">
                                            <Link to="/profile" onClick={() => setProfileDropdown(false)}
                                                className="flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:opacity-80"
                                                style={{ color: 'var(--text-secondary)' }}>
                                                <Building2 size={16} /> {gt('Manage Businesses')}
                                            </Link>
                                            <Link to="/settings" onClick={() => setProfileDropdown(false)}
                                                className="flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:opacity-80"
                                                style={{ color: 'var(--text-secondary)' }}>
                                                <Settings size={16} /> {gt('Settings')}
                                            </Link>
                                        </div>
                                        <div className="border-t py-1" style={{ borderColor: 'var(--border)' }}>
                                            <button onClick={() => { logOut(); setProfileDropdown(false); }}
                                                className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm transition-colors"
                                                style={{ color: 'var(--red)' }}>
                                                <LogOut size={16} /> {gt('Sign Out')}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="btn btn-primary btn-sm ml-2">{gt('Sign In')}</Link>
                    )}
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenu && (
                <div className="md:hidden border-t animate-fade-in" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
                    <div className="p-3 space-y-1">
                        {[
                            { to: '/', icon: Zap, label: gt('Home') },
                            { to: '/dashboard', icon: BarChart3, label: gt('Dashboard') },
                            { to: '/competitor-analysis', icon: Briefcase, label: gt('Competitor Analysis') },
                            { to: '/resources', icon: Globe, label: gt('Resources') },
                            { to: '/policies', icon: ScrollText, label: gt('Policies') },
                            { to: '/team', icon: User, label: gt('Team') },
                            { to: '/about', icon: FileText, label: gt('About') },
                        ].map(item => (
                            <Link key={item.to} to={item.to} onClick={() => setMobileMenu(false)}
                                className="flex items-center gap-3 p-3 rounded-lg transition-all"
                                style={{
                                    background: isActive(item.to) ? 'var(--accent-light)' : 'transparent',
                                    color: isActive(item.to) ? 'var(--accent)' : 'var(--text-secondary)'
                                }}>
                                <item.icon size={18} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </header>
    );
}
