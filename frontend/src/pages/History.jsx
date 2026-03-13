import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { FileText, ChevronRight, Trash2, ScrollText, Search, AlertCircle, Plus, Zap, Shield, Leaf, TrendingUp } from 'lucide-react';
import useTranslate from '../hooks/useTranslate';

// Demo policies to show when no real data exists
const DEMO_POLICIES = [
    {
        id: 'demo-1',
        policy_metadata: { policy_name: 'GST Compliance Policy 2024' },
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        source: 'GST Portal',
        risk_score: { overall_score: 28, overall_band: 'LOW' },
        sustainability: { green_score: 85 },
        isDemo: true
    },
    {
        id: 'demo-2',
        policy_metadata: { policy_name: 'Labour Law Guidelines - MSME' },
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        source: 'Shram Suvidha',
        risk_score: { overall_score: 45, overall_band: 'MEDIUM' },
        sustainability: { green_score: 72 },
        isDemo: true
    },
    {
        id: 'demo-3',
        policy_metadata: { policy_name: 'MSME Registration Requirements' },
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        source: 'Udyam Portal',
        risk_score: { overall_score: 15, overall_band: 'LOW' },
        sustainability: { green_score: 90 },
        isDemo: true
    },
    {
        id: 'demo-4',
        policy_metadata: { policy_name: 'Environmental Clearance Norms' },
        timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        source: 'MoEFCC',
        risk_score: { overall_score: 62, overall_band: 'HIGH' },
        sustainability: { green_score: 55 },
        isDemo: true
    },
    {
        id: 'demo-5',
        policy_metadata: { policy_name: 'PLI Scheme Guidelines' },
        timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        source: 'DPIIT',
        risk_score: { overall_score: 22, overall_band: 'LOW' },
        sustainability: { green_score: 88 },
        isDemo: true
    },
];

export default function Policies() {
    const { history, deleteHistoryItem, clearHistory, language, translateContent } = useAppContext();
    const lang = language?.code || 'en';
    const { gt } = useTranslate(lang);
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [deleting, setDeleting] = useState(null);
    const [translatedNames, setTranslatedNames] = useState({});
    
    // Use demo data if no real history
    const showDemoData = history.length === 0;
    const displayData = showDemoData ? DEMO_POLICIES : history;

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (id.startsWith('demo-')) return; // Can't delete demo items
        setDeleting(id);
        await deleteHistoryItem(id);
        setDeleting(null);
    };

    const filteredPolicies = displayData.filter(item => {
        const baseName = item.policy_metadata?.policy_name || item.policy_name || '';
        const name = translatedNames[item.id] || baseName;
        return name.toLowerCase().includes(search.toLowerCase());
    });

    useEffect(() => {
        let alive = true;

        const adaptPolicyNames = async () => {
            if (!Array.isArray(displayData) || displayData.length === 0) {
                if (alive) setTranslatedNames({});
                return;
            }

            const nextMap = {};
            const limited = displayData.slice(0, 30);

            await Promise.all(limited.map(async (item) => {
                const baseName = item.policy_metadata?.policy_name || item.policy_name || '';
                if (!baseName) return;

                const hasNonLatin = /[^\u0000-\u00ff]/.test(baseName);
                if (!hasNonLatin && lang === 'en') {
                    nextMap[item.id] = baseName;
                    return;
                }

                try {
                    const translated = await translateContent({ text: baseName }, lang);
                    nextMap[item.id] = translated?.text || baseName;
                } catch (_) {
                    nextMap[item.id] = baseName;
                }
            }));

            if (alive) setTranslatedNames(nextMap);
        };

        adaptPolicyNames();
        return () => { alive = false; };
    }, [displayData, lang, translateContent]);

    const avgRisk = filteredPolicies.length
        ? Math.round(filteredPolicies.reduce((sum, item) => sum + Number(item.risk_score?.overall_score || 0), 0) / filteredPolicies.length)
        : 0;

    const avgGreen = filteredPolicies.length
        ? Math.round(filteredPolicies.reduce((sum, item) => sum + Number(item.sustainability?.green_score || 0), 0) / filteredPolicies.length)
        : 0;

    const getRiskColor = (score) => {
        if (score > 70) return 'var(--red)';
        if (score > 40) return 'var(--orange)';
        return 'var(--green)';
    };

    return (
        <div className="w-full px-4 md:px-6 py-2 md:py-4 space-y-5">
            <div className="card p-5 md:p-6" style={{ background: 'linear-gradient(135deg, var(--surface-elevated), var(--accent-light))' }}>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--text)' }}>
                            <ScrollText size={24} style={{ color: 'var(--accent)' }} /> {gt('All Policies')}
                        </h1>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
                            {showDemoData ? gt('Sample policies - analyze your first policy to see real data') : `${history.length} ${gt('policies analyzed')}`}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => navigate('/analysis')} className="btn btn-primary btn-sm gap-1.5">
                            <Plus size={14} /> {gt('Analyze New Policy')}
                        </button>
                        {!showDemoData && history.length > 0 && (
                            <button onClick={clearHistory} className="btn btn-sm gap-1.5"
                                style={{ background: 'var(--red-light)', color: 'var(--red)', border: '1px solid transparent' }}>
                                <Trash2 size={14} /> {gt('Clear All')}
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
                    <div className="p-3 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                        <p className="text-xs font-semibold uppercase" style={{ color: 'var(--text-tertiary)' }}>{gt('Visible Policies')}</p>
                        <p className="text-xl font-bold" style={{ color: 'var(--text)' }}>{filteredPolicies.length}</p>
                    </div>
                    <div className="p-3 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                        <p className="text-xs font-semibold uppercase" style={{ color: 'var(--text-tertiary)' }}>{gt('Average Risk')}</p>
                        <p className="text-xl font-bold" style={{ color: getRiskColor(avgRisk) }}>{avgRisk}</p>
                    </div>
                    <div className="p-3 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                        <p className="text-xs font-semibold uppercase" style={{ color: 'var(--text-tertiary)' }}>{gt('Average Green')}</p>
                        <p className="text-xl font-bold" style={{ color: 'var(--green)' }}>{avgGreen}</p>
                    </div>
                    <div className="p-3 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                        <p className="text-xs font-semibold uppercase" style={{ color: 'var(--text-tertiary)' }}>{gt('Data Mode')}</p>
                        <p className="text-xl font-bold" style={{ color: showDemoData ? 'var(--orange)' : 'var(--accent)' }}>
                            {showDemoData ? gt('Demo') : gt('Live')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Demo Banner */}
            {showDemoData && (
                <div className="mb-6 p-4 rounded-xl flex items-center justify-between" style={{ background: 'linear-gradient(135deg, var(--accent-light), var(--purple-light, #f3e8ff))' }}>
                    <div className="flex items-center gap-3">
                        <Zap size={20} style={{ color: 'var(--accent)' }} />
                        <div>
                            <p className="font-semibold" style={{ color: 'var(--text)' }}>{gt('Demo Mode - Sample Policies')}</p>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{gt('These are example policies. Start your first analysis to see real insights!')}</p>
                        </div>
                    </div>
                    <button onClick={() => navigate('/analysis')} className="btn btn-primary btn-sm gap-1.5">
                        <Plus size={14} /> {gt('Start Analysis')}
                    </button>
                </div>
            )}

            {/* Search */}
            <div className="relative mb-2">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
                <input type="text" placeholder={gt('Search policies...')} value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="input w-full pl-10"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text)' }} />
            </div>

            {filteredPolicies.length > 0 ? (
                <div className="space-y-3">
                    {filteredPolicies.map(item => (
                        <div key={item.id}
                            onClick={() => {
                                if (item.isDemo) {
                                    // For demo policies, navigate to analysis result with demo ID
                                    navigate(`/analysis/${item.id}`);
                                } else {
                                    navigate(`/analysis/${item.id}`);
                                }
                            }}
                            className={`card p-4 md:p-5 transition-all ${item.isDemo ? 'opacity-85 cursor-pointer hover:opacity-100' : 'cursor-pointer card-hover'}`}
                            style={item.isDemo ? { border: '1px dashed var(--border)' } : {}}>
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                                        <FileText size={22} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-semibold truncate" style={{ color: 'var(--text)' }}>
                                                {translatedNames[item.id] || item.policy_metadata?.policy_name || item.policy_name || 'Policy Document'}
                                            </h3>
                                            {item.isDemo && <span className="badge badge-gray text-[10px]">Demo</span>}
                                        </div>
                                        <div className="flex items-center gap-2 md:gap-3 mt-1 flex-wrap">
                                            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                                {item.timestamp ? new Date(item.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown date'}
                                            </span>
                                            {item.source && (
                                                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-tertiary)' }}>{item.source}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-3 md:gap-4 flex-shrink-0">
                                    <div className="text-center px-3 py-2 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                                        <div className="flex items-center gap-1 justify-center">
                                            <Shield size={14} style={{ color: getRiskColor(item.risk_score?.overall_score || 0) }} />
                                            <p className="text-lg font-bold" style={{ color: getRiskColor(item.risk_score?.overall_score || 0) }}>
                                                {item.risk_score?.overall_score || 0}
                                            </p>
                                        </div>
                                        <p className="text-[10px] uppercase font-medium" style={{ color: 'var(--text-tertiary)' }}>Risk</p>
                                    </div>
                                    <div className="text-center px-3 py-2 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                                        <div className="flex items-center gap-1 justify-center">
                                            <Leaf size={14} style={{ color: 'var(--green)' }} />
                                            <p className="text-lg font-bold" style={{ color: 'var(--green)' }}>
                                                {item.sustainability?.green_score || 0}
                                            </p>
                                        </div>
                                        <p className="text-[10px] uppercase font-medium" style={{ color: 'var(--text-tertiary)' }}>Green</p>
                                    </div>

                                    {!item.isDemo && (
                                        <button onClick={(e) => handleDelete(e, item.id)}
                                            disabled={deleting === item.id}
                                            className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--text-tertiary)' }}>
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                    <ChevronRight size={16} style={{ color: 'var(--text-tertiary)' }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                    <AlertCircle size={32} className="mx-auto mb-3" style={{ color: 'var(--text-tertiary)' }} />
                    <p style={{ color: 'var(--text-secondary)' }}>{gt('No results for')} "{search}"</p>
                </div>
            )}
        </div>
    );
}
