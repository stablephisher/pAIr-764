import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { LANGUAGES } from '../constants';
import {
    Settings as SettingsIcon, Moon, Sun, Globe, Bell, Shield, Database,
    Download, Trash2, Save, Loader2, ChevronRight, Check, Monitor
} from 'lucide-react';

export default function Settings() {
    const { user, language, setLanguage, clearHistory, history, saveProfile, profile } = useAppContext();
    const { theme, toggleTheme } = useTheme();

    const [notifPrefs, setNotifPrefs] = useState({
        email_notifications: profile?.settings?.email_notifications ?? true,
        analysis_alerts: profile?.settings?.analysis_alerts ?? true,
        scheme_updates: profile?.settings?.scheme_updates ?? true,
        weekly_digest: profile?.settings?.weekly_digest ?? false,
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [clearing, setClearing] = useState(false);

    const handleSavePrefs = async () => {
        setSaving(true);
        try {
            await saveProfile({ settings: notifPrefs });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const handleClearHistory = async () => {
        if (!window.confirm('Are you sure you want to delete all analysis history? This action cannot be undone.')) return;
        setClearing(true);
        try {
            await clearHistory();
        } catch (e) {
            console.error(e);
        } finally {
            setClearing(false);
        }
    };

    const handleExportData = () => {
        const data = {
            profile: profile,
            history: history,
            exportedAt: new Date().toISOString(),
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pair-data-export-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const Toggle = ({ checked, onChange, label, description }) => (
        <div className="flex items-center justify-between py-3">
            <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{label}</p>
                {description && <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{description}</p>}
            </div>
            <button onClick={onChange}
                className="relative w-11 h-6 rounded-full transition-colors"
                style={{ background: checked ? 'var(--accent)' : 'var(--bg-tertiary)' }}>
                <div className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all"
                    style={{ left: checked ? '24px' : '4px' }} />
            </button>
        </div>
    );

    if (!user) return <div className="p-8 text-center" style={{ color: 'var(--text-secondary)' }}>Please sign in.</div>;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-2">
                <SettingsIcon size={24} style={{ color: 'var(--accent)' }} />
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Settings</h1>
            </div>

            {/* ═══ APPEARANCE ═══ */}
            <div className="card p-6" style={{ border: '1px solid var(--border)' }}>
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
                    <Monitor size={18} style={{ color: 'var(--accent)' }} /> Appearance
                </h2>
                <div className="space-y-1">
                    <div className="flex items-center justify-between py-3">
                        <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Theme</p>
                            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Switch between light and dark mode</p>
                        </div>
                        <button onClick={toggleTheme} className="btn btn-secondary btn-sm gap-2">
                            {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
                            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                        </button>
                    </div>
                </div>
            </div>

            {/* ═══ LANGUAGE ═══ */}
            <div className="card p-6" style={{ border: '1px solid var(--border)' }}>
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
                    <Globe size={18} style={{ color: 'var(--accent)' }} /> Language & Region
                </h2>
                <div>
                    <p className="text-sm font-medium mb-3" style={{ color: 'var(--text)' }}>Preferred Language</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {LANGUAGES.map(l => (
                            <button key={l.code} onClick={() => setLanguage(l)}
                                className="p-3 rounded-lg text-left transition-all border"
                                style={{
                                    background: language.code === l.code ? 'var(--accent-light)' : 'var(--bg-secondary)',
                                    borderColor: language.code === l.code ? 'var(--accent)' : 'var(--border)',
                                    color: language.code === l.code ? 'var(--accent)' : 'var(--text-secondary)'
                                }}>
                                <span className="text-sm font-medium block">{l.name}</span>
                                <span className="text-xs opacity-70">{l.native}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ═══ NOTIFICATIONS ═══ */}
            <div className="card p-6" style={{ border: '1px solid var(--border)' }}>
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
                    <Bell size={18} style={{ color: 'var(--accent)' }} /> Notifications
                </h2>
                <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                    <Toggle label="Email Notifications" description="Receive important updates via email"
                        checked={notifPrefs.email_notifications}
                        onChange={() => setNotifPrefs(p => ({ ...p, email_notifications: !p.email_notifications }))} />
                    <Toggle label="Analysis Alerts" description="Get notified when your analysis is complete"
                        checked={notifPrefs.analysis_alerts}
                        onChange={() => setNotifPrefs(p => ({ ...p, analysis_alerts: !p.analysis_alerts }))} />
                    <Toggle label="Scheme Updates" description="Be alerted about new government schemes"
                        checked={notifPrefs.scheme_updates}
                        onChange={() => setNotifPrefs(p => ({ ...p, scheme_updates: !p.scheme_updates }))} />
                    <Toggle label="Weekly Digest" description="Receive a weekly summary of compliance updates"
                        checked={notifPrefs.weekly_digest}
                        onChange={() => setNotifPrefs(p => ({ ...p, weekly_digest: !p.weekly_digest }))} />
                </div>
                <div className="mt-4 flex justify-end">
                    <button onClick={handleSavePrefs} disabled={saving} className="btn btn-primary btn-sm gap-1.5">
                        {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Save size={14} />}
                        {saved ? 'Saved!' : 'Save Preferences'}
                    </button>
                </div>
            </div>

            {/* ═══ DATA & PRIVACY ═══ */}
            <div className="card p-6" style={{ border: '1px solid var(--border)' }}>
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
                    <Database size={18} style={{ color: 'var(--accent)' }} /> Data & Privacy
                </h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Export Your Data</p>
                            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Download your profile and analysis history as JSON</p>
                        </div>
                        <button onClick={handleExportData} className="btn btn-secondary btn-sm gap-1.5">
                            <Download size={14} /> Export
                        </button>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                        <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Clear All History</p>
                            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                {history.length} analysis record{history.length !== 1 ? 's' : ''} stored
                            </p>
                        </div>
                        <button onClick={handleClearHistory} disabled={clearing || history.length === 0} className="btn btn-sm gap-1.5"
                            style={{ background: 'var(--red-light)', color: 'var(--red)', border: '1px solid var(--red)' }}>
                            {clearing ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                            Clear History
                        </button>
                    </div>
                </div>
            </div>

            {/* ═══ ABOUT ═══ */}
            <div className="card p-6" style={{ border: '1px solid var(--border)' }}>
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
                    <Shield size={18} style={{ color: 'var(--accent)' }} /> About pAIr
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>VERSION</p>
                        <p className="font-bold" style={{ color: 'var(--text)' }}>3.0.0 BETA</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>TEAM</p>
                        <p className="font-bold" style={{ color: 'var(--text)' }}>Team 13494</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>EVENT</p>
                        <p className="font-bold" style={{ color: 'var(--text)' }}>Code Unnati 4.0</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>POWERED BY</p>
                        <p className="font-bold" style={{ color: 'var(--text)' }}>Google Gemini AI</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
