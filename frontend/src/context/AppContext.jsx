import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { LANGUAGES } from '../constants';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";
const AppContext = createContext();

export function useAppContext() {
    return useContext(AppContext);
}

export function AppProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [language, setLanguage] = useState(LANGUAGES[0]);
    const [profile, setProfile] = useState(null);
    const [history, setHistory] = useState([]);
    const [notifications, setNotifications] = useState([
        { id: 1, title: 'Compliance Update', message: 'New GST regulations for MSMEs released.', time: '2h ago', read: false },
        { id: 2, title: 'Analysis Complete', message: 'Your "Factory License" analysis is ready.', time: '5h ago', read: false },
    ]);

    // Auth Listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                try {
                    // Fetch profile
                    const profileRes = await axios.get(`${API}/api/profile/${currentUser.uid}`);
                    if (profileRes.data && Object.keys(profileRes.data).length > 0) {
                        setProfile(profileRes.data);
                    }

                    // Fetch history
                    const histRes = await axios.get(`${API}/api/history`, {
                        params: { user_uid: currentUser.uid }
                    });
                    if (histRes.data && Array.isArray(histRes.data)) {
                        setHistory(histRes.data);
                    }
                } catch (e) {
                    console.error("Error fetching user data", e);
                }
            } else {
                setProfile(null);
                setHistory([]);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Save profile to backend
    const saveProfile = useCallback(async (data) => {
        if (!user) return;
        try {
            const res = await axios.put(`${API}/api/profile/${user.uid}`, data);
            setProfile(prev => ({ ...prev, ...data }));
            return res.data;
        } catch (e) {
            console.error("Error saving profile", e);
            throw e;
        }
    }, [user]);

    // Translate content via backend
    const translateContent = useCallback(async (data, targetLang) => {
        if (!targetLang || targetLang === 'en') return data;
        try {
            const res = await axios.post(`${API}/api/translate`, {
                data,
                target_language: targetLang
            });
            return res.data;
        } catch (e) {
            console.error("Translation failed", e);
            return data; // fallback to original
        }
    }, []);

    // Refresh history
    const refreshHistory = useCallback(async () => {
        if (!user) return;
        try {
            const res = await axios.get(`${API}/api/history`, {
                params: { user_uid: user.uid }
            });
            if (res.data && Array.isArray(res.data)) setHistory(res.data);
        } catch (e) {
            console.error("Error refreshing history", e);
        }
    }, [user]);

    // Delete history item
    const deleteHistoryItem = useCallback(async (itemId) => {
        if (!user) return;
        try {
            await axios.delete(`${API}/api/history/${itemId}`, {
                params: { user_uid: user.uid }
            });
            setHistory(prev => prev.filter(h => h.id !== itemId));
        } catch (e) {
            console.error("Error deleting history item", e);
        }
    }, [user]);

    // Clear all history
    const clearHistory = useCallback(async () => {
        if (!user) return;
        try {
            await axios.delete(`${API}/api/history`, {
                params: { user_uid: user.uid }
            });
            setHistory([]);
        } catch (e) {
            console.error("Error clearing history", e);
        }
    }, [user]);

    const markAllNotificationsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    return (
        <AppContext.Provider value={{
            user, loading,
            language, setLanguage,
            profile, setProfile, saveProfile,
            history, setHistory, refreshHistory, deleteHistoryItem, clearHistory,
            notifications, markAllNotificationsRead,
            translateContent
        }}>
            {children}
        </AppContext.Provider>
    );
}
