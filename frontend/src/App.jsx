import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Shield, Zap } from 'lucide-react';
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
import About from './pages/About';
import ProfileSetup from './components/ProfileSetup';

function LoadingScreen() {
    return (
        <div className="loading-screen">
            <div className="loading-logo">
                <Zap size={36} color="white" fill="white" />
            </div>
            <div className="loading-text">pAIr</div>
            <div className="loading-subtext">Your AI Compliance Partner</div>
        </div>
    );
}

/* Guard wrapper — redirects to login for protected routes */
function RequireAuth({ children }) {
    const { user, profile, profileChecked, setProfile } = useAppContext();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Wait until profile check is complete
    if (!profileChecked) {
        return <LoadingScreen />;
    }

    // No profile → show onboarding (outside MainLayout to avoid double navbar)
    if (!profile) {
        return <Navigate to="/onboarding" replace />;
    }

    return children;
}

/* Onboarding route — only for users without a profile */
function OnboardingRoute() {
    const { user, profile, profileChecked, setProfile } = useAppContext();
    const navigate = useNavigate();

    if (!user) return <Navigate to="/login" replace />;
    if (!profileChecked) return <LoadingScreen />;
    if (profile) return <Navigate to="/dashboard" replace />;

    return (
        <ProfileSetup
            user={user}
            onComplete={(p) => {
                setProfile(p);
                navigate('/dashboard', { replace: true });
            }}
        />
    );
}

function AppContent() {
    const { loading } = useAppContext();

    if (loading) return <LoadingScreen />;

    return (
        <Routes>
            {/* Onboarding — outside MainLayout (no navbar) */}
            <Route path="/onboarding" element={<OnboardingRoute />} />

            {/* Public + Protected routes inside MainLayout */}
            <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="about" element={<About />} />
                <Route path="team" element={<Team />} />
                <Route path="login" element={<Login />} />

                {/* Protected routes — login required */}
                <Route path="dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
                <Route path="analysis/new" element={<RequireAuth><Analysis /></RequireAuth>} />
                <Route path="analysis/:id" element={<RequireAuth><AnalysisResult /></RequireAuth>} />
                <Route path="competitor-analysis" element={<RequireAuth><CompetitorAnalysis /></RequireAuth>} />
                <Route path="resources" element={<RequireAuth><Resources /></RequireAuth>} />
                <Route path="history" element={<RequireAuth><History /></RequireAuth>} />
                <Route path="profile" element={<RequireAuth><Profile /></RequireAuth>} />
                <Route path="settings" element={<RequireAuth><Settings /></RequireAuth>} />
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
