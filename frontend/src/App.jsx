import React, { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import ResultsView from './components/ResultsView';
import ProcessingEngine from './components/ProcessingEngine';
import Sidebar from './components/Sidebar';

// CONFIGURATION
// CONFIGURATION
// Public URL from serveo (valid while terminal process runs)
const API_BASE_URL = "https://311eadd9f44d4d4b-119-235-52-57.serveousercontent.com";



function App() {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('IDLE'); // IDLE, UPLOADING, PROCESSING, SUCCESS, ERROR
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState([]);
    const [showSidebar, setShowSidebar] = useState(true);
    const [showDebug, setShowDebug] = useState(false);
    const [abortController, setAbortController] = useState(null);
    const [debugLogs, setDebugLogs] = useState([]);

    // Add Log Helper
    const addLog = (msg) => {
        const timestamp = new Date().toLocaleTimeString();
        setDebugLogs(prev => [`[${timestamp}] ${msg}`, ...prev]);
        console.log(`[${timestamp}] ${msg}`);
    };

    // Axios Config for Localtunnel
    const axiosConfig = {
        headers: {
            "Bypass-Tunnel-Reminder": "true"
        }
    };

    // Poll history for updates (Simulating Real-Time Monitoring)
    React.useEffect(() => {
        fetchHistory(); // Initial fetch
        const interval = setInterval(() => {
            fetchHistory(true); // Silent poll
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const fetchHistory = async (silent = false) => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/history`, axiosConfig);
            const newHistory = res.data;

            setHistory(prev => {
                // If new item detected (ID mismatch at top), notify
                if (prev.length > 0 && newHistory.length > 0 && prev[0].id !== newHistory[0].id) {
                    if (!silent) addLog("History updated from remote.");
                }
                return newHistory;
            });
        } catch (e) {
            if (!silent) console.error("Failed to fetch history", e);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleStop = () => {
        if (abortController) {
            abortController.abort();
            setAbortController(null);
        }
        setStatus('IDLE');
        setError("Analysis stopped by user.");
    };

    const handleUpload = async () => {
        if (!file) return;

        setStatus('PROCESSING');
        setError(null);
        setDebugLogs([]); // Clear logs on new run
        addLog("Starting upload process...");

        const controller = new AbortController();
        setAbortController(controller);

        const formData = new FormData();
        formData.append('file', file);

        try {
            addLog("Sending POST request to /api/analyze...");
            // Point to Fast API Backend
            const response = await axios.post(`${API_BASE_URL}/api/analyze`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    "Bypass-Tunnel-Reminder": "true"
                },
                signal: controller.signal
            });

            addLog(`Response received! Status: ${response.status}`);
            addLog(`Data size: ${JSON.stringify(response.data).length} chars`);

            setData(response.data);
            addLog("State 'data' updated.");

            setStatus('SUCCESS');
            addLog("State 'status' set to SUCCESS.");

            fetchHistory(); // Refresh history
            addLog("Triggered history refresh.");

        } catch (err) {
            if (axios.isCancel(err)) {
                addLog('Request canceled by user.');
            } else {
                console.error(err);
                const errMsg = err.response?.data?.detail || err.message || "An error occurred";
                addLog(`ERROR: ${errMsg}`);
                setError(errMsg);
                setStatus('ERROR');
            }
        } finally {
            setAbortController(null);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-color)] text-gray-100 flex">
            {/* Debug/Logic Modal */}
            {showDebug && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-gray-900 border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <span className="p-2 bg-blue-900/30 rounded-lg text-blue-400">🤖</span>
                                How the AI Works
                            </h2>
                            <button onClick={() => setShowDebug(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>

                        <div className="space-y-8">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="p-4 bg-black/30 rounded-lg border border-gray-800">
                                    <h3 className="text-lg font-semibold text-emerald-400 mb-2">Step 1: The Analyst</h3>
                                    <p className="text-gray-400 text-sm mb-2">Google Gemini 2.0 Flash reads the PDF text and extracts structured legal obligations.</p>
                                    <div className="text-xs font-mono bg-black p-3 rounded text-gray-500 overflow-x-auto">
                                        SYSTEM_PROMPT: "You are a senior policy analyst AI... Your task is to read government policy..."
                                    </div>
                                </div>

                                <div className="p-4 bg-black/30 rounded-lg border border-gray-800">
                                    <h3 className="text-lg font-semibold text-purple-400 mb-2">Step 2: The Planner</h3>
                                    <p className="text-gray-400 text-sm mb-2">A second AI agent takes the structured data and designs a step-by-step plan for the owner.</p>
                                    <div className="text-xs font-mono bg-black p-3 rounded text-gray-500 overflow-x-auto">
                                        PLANNING_PROMPT: "You are an autonomous Compliance Planning Agent... Create a prioritized action plan..."
                                    </div>
                                </div>
                            </div>

                            {data?.debug_metadata && (
                                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                                    <h3 className="text-lg font-semibold text-white mb-4">Latest Execution Metrics</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm font-mono">
                                        <div className="flex justify-between border-b border-gray-700 pb-2">
                                            <span className="text-gray-400">Models Used:</span>
                                            <span className="text-blue-300">{data.debug_metadata.models_used.join(", ")}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-700 pb-2">
                                            <span className="text-gray-400">Analyst Time:</span>
                                            <span className="text-green-300">{data.debug_metadata.step_1_time.toFixed(2)}s</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-700 pb-2">
                                            <span className="text-gray-400">Planner Time:</span>
                                            <span className="text-green-300">{data.debug_metadata.step_2_time.toFixed(2)}s</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-700 pb-2">
                                            <span className="text-gray-400">Total Latency:</span>
                                            <span className="text-orange-300">{(data.debug_metadata.step_1_time + data.debug_metadata.step_2_time).toFixed(2)}s</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* LIVE DEBUG LOGS */}
                            <div className="p-4 bg-gray-900 rounded-lg border border-gray-700 font-mono text-xs max-h-60 overflow-y-auto">
                                <h3 className="text-white font-bold mb-2">Live Debug Console</h3>
                                {debugLogs.length === 0 ? (
                                    <span className="text-gray-600">No logs yet...</span>
                                ) : (
                                    debugLogs.map((log, i) => (
                                        <div key={i} className="text-green-400 border-b border-gray-800 py-1 last:border-0">
                                            {log}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar */}
            {showSidebar && (
                <Sidebar
                    history={history}
                    onSelect={(item) => {
                        setData(item);
                        setStatus('SUCCESS');
                    }}
                    onClear={async () => {
                        if (confirm("Are you sure you want to clear all history?")) {
                            try {
                                await axios.delete(`${API_BASE_URL}/api/history`, axiosConfig);
                                setHistory([]);
                                addLog("History cleared.");
                            } catch (e) {
                                console.error(e);
                                addLog("Failed to clear history.");
                            }
                        }
                    }}
                    onDelete={async (id) => {
                        if (!id) return;
                        try {
                            await axios.delete(`${API_BASE_URL}/api/history/${id}`, axiosConfig);
                            setHistory(prev => prev.filter(item => item.id !== id));
                            addLog(`Deleted history item ${id}`);
                        } catch (e) {
                            console.error(e);
                            addLog(`Failed to delete item ${id}`);
                        }
                    }}
                />
            )}

            <div className={`flex-1 p-4 md:p-8 transition-all ${showSidebar ? 'ml-80' : ''}`}>
                <header className="mb-12 text-center relative flex justify-center items-center">
                    {/* Toggle Sidebar Button */}
                    <button
                        onClick={() => setShowSidebar(!showSidebar)}
                        className="absolute left-0 top-1 text-gray-500 hover:text-white"
                    >
                        {showSidebar ? '← Hide History' : '→ Show History'}
                    </button>

                    {/* Debug Button */}
                    <button
                        onClick={() => setShowDebug(true)}
                        className="absolute right-0 top-1 text-sm bg-gray-800 hover:bg-gray-700 text-blue-300 px-3 py-1.5 rounded border border-gray-700 flex items-center gap-2 transition-colors"
                    >
                        <span>⚡ Check AI Logic</span>
                    </button>

                    <div>
                        <h1 className="title">Policy Ingestion Agent</h1>
                        <p className="subtitle">AI-Powered Compliance Intelligence for MSMEs</p>
                        <p className="text-emerald-400 text-xs mt-2 animate-pulse">
                            This system continuously monitors policy updates and alerts MSMEs automatically.
                        </p>
                    </div>
                </header>

                <main>
                    {status === 'IDLE' || status === 'ERROR' ? (
                        <div className="max-w-xl mx-auto">
                            <div className="card border-2 border-dashed border-gray-700 hover:border-blue-500/50 transition-colors p-10 flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
                                    <Upload className="text-blue-400" size={32} />
                                </div>

                                <h3 className="text-xl font-semibold mb-2">Upload Policy Document</h3>
                                <p className="text-gray-500 mb-8">Support for PDF documents (Govt Notifications, Gazettes)</p>

                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="file-upload"
                                />

                                <div className="flex flex-col gap-4 w-full max-w-xs">
                                    <label
                                        htmlFor="file-upload"
                                        className="btn bg-gray-800 hover:bg-gray-700 text-white w-full cursor-pointer"
                                    >
                                        {file ? file.name : "Select PDF File"}
                                    </label>

                                    <button
                                        onClick={handleUpload}
                                        disabled={!file}
                                        className="btn btn-primary w-full shadow-lg shadow-blue-900/20"
                                    >
                                        Analyze Policy
                                    </button>
                                </div>
                            </div>

                            {status === 'ERROR' && (
                                <div className="mt-6 p-4 bg-red-900/20 border border-red-900/50 rounded-lg flex items-center gap-3 text-red-200">
                                    <AlertCircle size={20} />
                                    {error}
                                </div>
                            )}
                        </div>
                    ) : status === 'PROCESSING' ? (
                        <div className="text-center">
                            <ProcessingEngine />
                            <button
                                onClick={handleStop}
                                className="mt-8 btn bg-red-900/30 text-red-400 border border-red-800 hover:bg-red-900/50"
                            >
                                Stop Analysis
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <button
                                onClick={() => { setStatus('IDLE'); setFile(null); setData(null); }}
                                className="btn bg-gray-800 hover:bg-gray-700 text-sm"
                            >
                                ← Analyze Another Document
                            </button>
                            <ResultsView data={data} />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default App;
