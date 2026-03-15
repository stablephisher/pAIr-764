import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Home, Plus, AlertCircle, Loader2 } from 'lucide-react';
import ResultsView from '../components/ResultsView';
import { useAppContext, apiClient } from '../context/AppContext';
import useTranslate from '../hooks/useTranslate';

// Demo analysis data for when clicking demo policies
const DEMO_ANALYSIS_DATA = {
    'demo-1': {
        id: 'demo-1',
        policy_metadata: { 
            policy_name: 'GST Compliance Policy 2024',
            summary: 'Comprehensive guidelines for GST compliance for MSMEs with new provisions for small businesses.',
            effective_date: '2024-01-01',
            source: 'GST Portal'
        },
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        risk_score: { 
            overall_score: 28, 
            overall_band: 'LOW',
            compliance_risk: 25,
            operational_risk: 30,
            financial_risk: 20
        },
        impact_analysis: {
            compliance_impact: 'Low - Standard GST procedures apply',
            operational_impact: 'Minimal changes to existing processes',
            financial_impact: 'Potential savings through simplified compliance',
            profitability_score: 78
        },
        sustainability: { 
            green_score: 85,
            environmental_impact: 'Positive - Digital compliance reduces paper usage',
            sustainability_initiatives: ['Digital invoicing', 'Paperless transactions', 'Online filing']
        },
        recommendations: [
            'Implement digital GST filing system',
            'Train staff on new compliance procedures',
            'Set up automated tax calculation',
            'Regular compliance audits'
        ],
        action_items: [
            { task: 'Update GST registration', priority: 'High', deadline: '30 days' },
            { task: 'Implement digital invoicing', priority: 'Medium', deadline: '45 days' },
            { task: 'Staff training program', priority: 'Medium', deadline: '60 days' }
        ],
        isDemo: true
    },
    'demo-2': {
        id: 'demo-2',
        policy_metadata: { 
            policy_name: 'Labour Law Guidelines - MSME',
            summary: 'Updated labour compliance requirements for small and medium enterprises.',
            effective_date: '2024-02-15',
            source: 'Shram Suvidha'
        },
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        risk_score: { 
            overall_score: 45, 
            overall_band: 'MEDIUM',
            compliance_risk: 50,
            operational_risk: 40,
            financial_risk: 45
        },
        impact_analysis: {
            compliance_impact: 'Medium - Additional documentation required',
            operational_impact: 'Moderate changes to HR processes',
            financial_impact: 'Increased compliance costs but better protection',
            profitability_score: 65
        },
        sustainability: { 
            green_score: 72,
            environmental_impact: 'Neutral - Focus on worker welfare',
            sustainability_initiatives: ['Employee wellness programs', 'Safe working conditions', 'Fair wage policies']
        },
        recommendations: [
            'Update employee contracts',
            'Implement new safety protocols',
            'Enhance record keeping systems',
            'Regular compliance reviews'
        ],
        action_items: [
            { task: 'Review all employee contracts', priority: 'High', deadline: '45 days' },
            { task: 'Update safety protocols', priority: 'High', deadline: '30 days' },
            { task: 'Implement new record system', priority: 'Medium', deadline: '90 days' }
        ],
        isDemo: true
    },
    'demo-3': {
        id: 'demo-3',
        policy_metadata: { 
            policy_name: 'MSME Registration Requirements',
            summary: 'Streamlined registration process for micro, small, and medium enterprises.',
            effective_date: '2024-01-15',
            source: 'Udyam Portal'
        },
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        risk_score: { 
            overall_score: 15, 
            overall_band: 'LOW',
            compliance_risk: 15,
            operational_risk: 10,
            financial_risk: 20
        },
        impact_analysis: {
            compliance_impact: 'Low - Simplified registration process',
            operational_impact: 'Positive - Easier business setup',
            financial_impact: 'Benefits through subsidies and incentives',
            profitability_score: 85
        },
        sustainability: { 
            green_score: 90,
            environmental_impact: 'Highly Positive - Digital-first approach',
            sustainability_initiatives: ['Online registration', 'Paperless processes', 'Green business incentives']
        },
        recommendations: [
            'Complete Udyam registration online',
            'Explore available subsidies',
            'Maintain digital records',
            'Regular status updates'
        ],
        action_items: [
            { task: 'Complete Udyam registration', priority: 'High', deadline: '15 days' },
            { task: 'Apply for relevant subsidies', priority: 'Medium', deadline: '30 days' },
            { task: 'Set up digital record system', priority: 'Low', deadline: '60 days' }
        ],
        isDemo: true
    },
    'demo-4': {
        id: 'demo-4',
        policy_metadata: { 
            policy_name: 'Environmental Clearance Norms',
            summary: 'Updated environmental compliance requirements for manufacturing businesses.',
            effective_date: '2024-03-01',
            source: 'MoEFCC'
        },
        timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        risk_score: { 
            overall_score: 62, 
            overall_band: 'HIGH',
            compliance_risk: 70,
            operational_risk: 55,
            financial_risk: 60
        },
        impact_analysis: {
            compliance_impact: 'High - Strict environmental monitoring required',
            operational_impact: 'Significant - New processes and equipment needed',
            financial_impact: 'High initial investment, long-term compliance benefits',
            profitability_score: 45
        },
        sustainability: { 
            green_score: 55,
            environmental_impact: 'Critical - Major environmental compliance focus',
            sustainability_initiatives: ['Waste management systems', 'Emission control', 'Water treatment', 'Green technology adoption']
        },
        recommendations: [
            'Conduct environmental impact assessment',
            'Install emission monitoring systems',
            'Implement waste management protocols',
            'Seek expert environmental consultancy'
        ],
        action_items: [
            { task: 'Environmental impact assessment', priority: 'Critical', deadline: '30 days' },
            { task: 'Install monitoring equipment', priority: 'High', deadline: '60 days' },
            { task: 'Waste management system setup', priority: 'High', deadline: '90 days' }
        ],
        isDemo: true
    },
    'demo-5': {
        id: 'demo-5',
        policy_metadata: { 
            policy_name: 'PLI Scheme Guidelines',
            summary: 'Production Linked Incentive scheme benefits and compliance requirements.',
            effective_date: '2024-01-01',
            source: 'DPIIT'
        },
        timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        risk_score: { 
            overall_score: 22, 
            overall_band: 'LOW',
            compliance_risk: 20,
            operational_risk: 25,
            financial_risk: 20
        },
        impact_analysis: {
            compliance_impact: 'Low - Standard reporting requirements',
            operational_impact: 'Positive - Production efficiency focus',
            financial_impact: 'Highly Positive - Direct financial incentives',
            profitability_score: 92
        },
        sustainability: { 
            green_score: 88,
            environmental_impact: 'Positive - Focus on efficient production',
            sustainability_initiatives: ['Energy efficient production', 'Waste reduction', 'Technology upgrades', 'Skill development']
        },
        recommendations: [
            'Apply for PLI scheme eligibility',
            'Optimize production processes',
            'Maintain detailed production records',
            'Regular performance monitoring'
        ],
        action_items: [
            { task: 'Submit PLI application', priority: 'High', deadline: '21 days' },
            { task: 'Set up production monitoring', priority: 'Medium', deadline: '45 days' },
            { task: 'Staff training on new processes', priority: 'Medium', deadline: '60 days' }
        ],
        isDemo: true
    }
};

export default function AnalysisResult() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, language, profile } = useAppContext();
    const lang = language?.code || 'en';
    const { gt } = useTranslate(lang);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check if this is a demo policy
        if (id && id.startsWith('demo-')) {
            const demoData = DEMO_ANALYSIS_DATA[id];
            if (demoData) {
                setResult(demoData);
                setLoading(false);
                return;
            } else {
                setError('Demo analysis not found.');
                setLoading(false);
                return;
            }
        }

        if (!user || !id) return;

        const fetchAnalysis = async () => {
            setLoading(true);
            try {
                const res = await apiClient.get(`/api/history?user_uid=${user.uid}`);
                const all = Array.isArray(res.data) ? res.data : (res.data.analyses || []);
                const found = all.find(item => item.id === id);

                if (found) {
                    setResult(found);
                } else {
                    setError('Analysis not found.');
                }
            } catch (e) {
                setError('Failed to load analysis.');
            }
            setLoading(false);
        };

        fetchAnalysis();
    }, [user, id]);

    if (loading) return <div className="text-center py-20"><Loader2 size={40} className="animate-spin mx-auto text-accent" /></div>;

    if (error) return (
        <div className="w-full px-6 text-center py-16 animate-fade-in-up">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'var(--red-light)', color: 'var(--red)' }}>
                <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Error</h3>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>{error}</p>
            <button onClick={() => navigate('/analysis')} className="btn btn-primary">
                New Analysis
            </button>
        </div>
    );

    return (
        <div className="w-full px-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{gt('Analysis Results')}</h2>
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate('/')} className="btn btn-ghost">
                        <Home size={16} /> {gt('Home')}
                    </button>
                    <button onClick={() => navigate('/analysis')} className="btn btn-secondary">
                        <Plus size={16} /> New Analysis
                    </button>
                </div>
            </div>
            {result && <ResultsView data={result} language={lang} profile={profile} />}
        </div>
    );
}
