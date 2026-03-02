import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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
    const [language, setLanguageState] = useState(() => {
        try {
            const saved = localStorage.getItem('pair-language');
            if (saved) return JSON.parse(saved);
        } catch (_) { /* */ }
        return LANGUAGES[0];
    });
    const [profile, setProfileState] = useState(null);
    const [history, setHistory] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const notifPollRef = useRef(null);

    // Persist language choice
    const setLanguage = useCallback((lang) => {
        setLanguageState(lang);
        try { localStorage.setItem('pair-language', JSON.stringify(lang)); } catch (_) { /* */ }
    }, []);

    // Profile setter — Firestore is source of truth
    const setProfile = useCallback((profileData) => {
        if (typeof profileData === 'function') {
            setProfileState(prev => profileData(prev));
        } else {
            setProfileState(profileData);
        }
    }, []);

    // Auth Listener — Firestore-first
    useEffect(() => {
        if (!auth) { setLoading(false); return; }
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // 1. Fetch profile from Firestore via backend — SINGLE SOURCE OF TRUTH
                try {
                    const profileRes = await axios.get(`${API}/api/profile/${currentUser.uid}`);
                    if (profileRes.data && Object.keys(profileRes.data).length > 0 && profileRes.data.business_name) {
                        setProfileState(profileRes.data);
                    }
                } catch (e) {
                    console.warn("Profile fetch failed — trying localStorage fallback", e);
                    try {
                        const cached = localStorage.getItem(`pair-profile-${currentUser.uid}`);
                        if (cached) { const l = JSON.parse(cached); if (l?.business_name) setProfileState(l); }
                    } catch (_) { /* */ }
                }

                // 2. Fetch history & notifications in parallel
                try {
                    const [histRes, notifRes] = await Promise.allSettled([
                        axios.get(`${API}/api/history`, { params: { user_uid: currentUser.uid } }),
                        axios.get(`${API}/api/notifications`, { params: { user_uid: currentUser.uid } }),
                    ]);
                    if (histRes.status === 'fulfilled' && Array.isArray(histRes.value.data)) setHistory(histRes.value.data);
                    if (notifRes.status === 'fulfilled' && Array.isArray(notifRes.value.data)) setNotifications(notifRes.value.data);
                } catch (_) { /* */ }
            } else {
                setProfileState(null);
                setHistory([]);
                setNotifications([]);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Poll notifications every 60s for logged-in users
    useEffect(() => {
        if (notifPollRef.current) clearInterval(notifPollRef.current);
        if (!user) return;
        notifPollRef.current = setInterval(async () => {
            try {
                const res = await axios.get(`${API}/api/notifications`, { params: { user_uid: user.uid } });
                if (res.data && Array.isArray(res.data)) setNotifications(res.data);
            } catch (_) { /* silent */ }
        }, 60000);
        return () => { if (notifPollRef.current) clearInterval(notifPollRef.current); };
    }, [user]);

    // Save profile to Firestore via backend
    const saveProfile = useCallback(async (data) => {
        if (!user) return;
        try {
            await axios.put(`${API}/api/profile/${user.uid}`, data);
            setProfileState(prev => {
                const updated = { ...prev, ...data };
                try { localStorage.setItem(`pair-profile-${user.uid}`, JSON.stringify(updated)); } catch (_) { /* */ }
                return updated;
            });
        } catch (e) {
            console.error("Error saving profile to Firestore", e);
            setProfileState(prev => ({ ...prev, ...data }));
            throw e;
        }
    }, [user]);

    // Translate content via backend
    const translateContent = useCallback(async (data, targetLang) => {
        if (!targetLang || targetLang === 'en') return data;
        try {
            const res = await axios.post(`${API}/api/translate`, { data, target_language: targetLang });
            return res.data;
        } catch (e) { return data; }
    }, []);

    const refreshHistory = useCallback(async () => {
        if (!user) return;
        try {
            const res = await axios.get(`${API}/api/history`, { params: { user_uid: user.uid } });
            if (res.data && Array.isArray(res.data)) setHistory(res.data);
        } catch (_) { /* */ }
    }, [user]);

    const refreshNotifications = useCallback(async () => {
        if (!user) return;
        try {
            const res = await axios.get(`${API}/api/notifications`, { params: { user_uid: user.uid } });
            if (res.data && Array.isArray(res.data)) setNotifications(res.data);
        } catch (_) { /* */ }
    }, [user]);

    const deleteHistoryItem = useCallback(async (itemId) => {
        if (!user) return;
        try {
            await axios.delete(`${API}/api/history/${itemId}`, { params: { user_uid: user.uid } });
            setHistory(prev => prev.filter(h => h.id !== itemId));
        } catch (_) { /* */ }
    }, [user]);

    const clearHistory = useCallback(async () => {
        if (!user) return;
        try { await axios.delete(`${API}/api/history`, { params: { user_uid: user.uid } }); setHistory([]); } catch (_) { /* */ }
    }, [user]);

    const markAllNotificationsRead = useCallback(async () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        if (user) {
            try { await axios.post(`${API}/api/notifications/read-all`, null, { params: { user_uid: user.uid } }); } catch (_) { /* */ }
        }
    }, [user]);

    return (
        <AppContext.Provider value={{
            user, loading,
            language, setLanguage,
            profile, setProfile, saveProfile,
            history, setHistory, refreshHistory, deleteHistoryItem, clearHistory,
            notifications, markAllNotificationsRead, refreshNotifications,
            translateContent
        }}>
            {children}
        </AppContext.Provider>
    );
}
