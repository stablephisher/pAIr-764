import React, { useState } from 'react';
import { Upload, FileText, Zap, X, AlertCircle, History, ChevronRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function UploadView({ onAnalyze }) {
    const { history } = useAppContext();
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [error, setError] = useState(null);

    const handleFile = (f) => {
        if (f?.type === 'application/pdf') {
            if (f.size > 10 * 1024 * 1024) {
                setError('File size exceeds 10MB limit');
                return;
            }
            setFile(f);
            setError(null);
        } else {
            setError('Please select a valid PDF file');
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        handleFile(e.dataTransfer.files[0]);
    };

    const handleAnalyze = () => {
        if (file) onAnalyze(file);
    };

    return (
        <div className="max-w-2xl mx-auto py-12 animate-fade-in-up">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-3">Upload a Policy Document</h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Get instant compliance analysis, risk scores, and scheme recommendations
                </p>
            </div>

            <div className={`upload-zone ${dragging ? 'dragging' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}>
                <input type="file" id="file" accept=".pdf" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
                <label htmlFor="file" className="cursor-pointer">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce"
                        style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                        <Upload size={28} />
                    </div>
                    <p className="font-medium mb-1">Click to upload or drag and drop</p>
                    <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>PDF files only (max 10MB)</p>
                </label>
            </div>

            {file && (
                <div className="card p-4 mt-4 flex items-center justify-between animate-fade-in-scale">
                    <div className="flex items-center gap-3">
                        <FileText size={20} style={{ color: 'var(--accent)' }} />
                        <span className="font-medium truncate">{file.name}</span>
                        <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                    </div>
                    <button onClick={() => setFile(null)} className="btn btn-ghost btn-icon">
                        <X size={16} />
                    </button>
                </div>
            )}

            {error && (
                <div className="mt-4 p-4 rounded-xl flex items-center gap-3" style={{ background: 'var(--red-light)' }}>
                    <AlertCircle size={18} style={{ color: 'var(--red)' }} />
                    <p className="text-sm" style={{ color: 'var(--red)' }}>{error}</p>
                </div>
            )}

            {file && !error && (
                <button onClick={handleAnalyze} className="btn btn-primary w-full mt-6 py-4 text-base">
                    <Zap size={18} /> Analyze Document
                </button>
            )}

            <div className="text-center mt-8">
                <button onClick={() => navigate('/profile')} className="text-sm hover:underline" style={{ color: 'var(--text-secondary)' }}>
                    Update business profile →
                </button>
            </div>

            {/* Inline Recent History */}
            {history && history.length > 0 && (
                <div className="mt-10">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <History size={18} style={{ color: 'var(--accent)' }} /> Recent Analyses
                    </h3>
                    <div className="space-y-2">
                        {history.slice(0, 5).map(item => (
                            <div key={item.id}
                                onClick={() => navigate(`/analysis/${item.id}`)}
                                className="card p-4 flex items-center justify-between cursor-pointer group transition-all hover:shadow-md"
                                style={{ borderLeft: '3px solid var(--accent)' }}>
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <FileText size={18} className="flex-shrink-0" style={{ color: 'var(--accent)' }} />
                                    <div className="min-w-0">
                                        <p className="font-medium text-sm truncate">{item.policy_name || item.policy_metadata?.policy_name || 'Policy Document'}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="badge badge-gray text-[10px]">{item.source === 'auto' ? 'AUTO' : 'UPLOAD'}</span>
                                            {item.risk_score?.overall_score != null && (
                                                <span className="text-[10px] font-medium" style={{ color: item.risk_score.overall_score > 70 ? 'var(--red)' : item.risk_score.overall_score > 40 ? 'var(--orange)' : 'var(--green)' }}>
                                                    Risk: {item.risk_score.overall_score}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--text-tertiary)' }} />
                            </div>
                        ))}
                    </div>
                    <button onClick={() => navigate('/history')}
                        className="btn btn-secondary w-full mt-4 gap-2 text-sm">
                        <History size={16} /> View Full History
                    </button>
                </div>
            )}
        </div>
    );
}
