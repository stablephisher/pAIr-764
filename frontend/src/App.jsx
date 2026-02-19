import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Shield, Loader2 } from 'lucide-react';
import { AppProvider, useAppContext } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts & Pages
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Analysis from './pages/Analysis';
import AnalysisResult from './pages/AnalysisResult';
import CompetitorAnalysis from './pages/CompetitorAnalysis';
import Resources from './pages/Resources';
import History from './pages/History';
import Team from './pages/Team';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ProfileSetup from './components/ProfileSetup';

function LoadingScreen() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center" style={{ background: 'var(--bg)' }}>
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse"
                style={{ background: 'var(--accent)', color: 'white' }}>
                <Shield size={40} />
            </div>
            <h1 className="text-2xl font-bold mb-2">pAIr</h1>
            <p className="text-gray-500">Loading your workspace...</p>
        </div>
    );
}

function AppContent() {
    const { user, profile, loading, setProfile } = useAppContext();

    if (loading) return <LoadingScreen />;

    if (!user) {
        return <Login />;
    }

    // If user is logged in but has no profile, show setup
    // We check if profile is null (it's initialized as null, then set if exists)
    // If API returns 404, profile stays null? AppContext logic: "if (res.data) setProfile(res.data)".
    // So if no profile, it remains null.
    // We need to ensure we don't get stuck if profile fetch fails but user exists.
    // Ideally AppContext sets profile to 'empty' or similar if 404.
    // For now assuming profile is null means "needs setup".

    if (!profile) {
        return <ProfileSetup user={user} onComplete={setProfile} />;
    }

    return (
        <Routes>
            <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="analysis/new" element={<Analysis />} />
                <Route path="analysis/:id" element={<AnalysisResult />} />
                <Route path="competitor-analysis" element={<CompetitorAnalysis />} />
                <Route path="resources" element={<Resources />} />
                <Route path="history" element={<History />} />
                <Route path="team" element={<Team />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    );
}

export default function App() {
    return (
        <AppProvider>
            <ThemeProvider>
                <BrowserRouter>
                    <AppContent />
                </BrowserRouter>
            </ThemeProvider>
        </AppProvider>
    );
}
