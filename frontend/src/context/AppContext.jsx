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
    const [profile, setProfileState] = useState(null);
    const [history, setHistory] = useState([]);
    const [notifications, setNotifications] = useState([]);

    // Profile setter that also persists to localStorage
    const setProfile = useCallback((profileData) => {
        if (typeof profileData === 'function') {
            setProfileState(prev => {
                const newProfile = profileData(prev);
                if (newProfile && user) {
                    localStorage.setItem(`pair-profile-${user.uid}`, JSON.stringify(newProfile));
                }
                return newProfile;
            });
        } else {
            setProfileState(profileData);
            if (profileData && user) {
                localStorage.setItem(`pair-profile-${user.uid}`, JSON.stringify(profileData));
            }
        }
    }, [user]);

    // Auth Listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Try loading profile from localStorage immediately as fallback
                let localProfile = null;
                try {
                    const cached = localStorage.getItem(`pair-profile-${currentUser.uid}`);
                    if (cached) {
                        localProfile = JSON.parse(cached);
                        // Only treat as valid if it has business_name (a required field)
                        if (localProfile && localProfile.business_name) {
                            setProfileState(localProfile);
                        } else {
                            localProfile = null;
                        }
                    }
                } catch (e) {
                    console.warn("Failed to load cached profile", e);
                }

                try {
                    // Fetch profile from API
                    const profileRes = await axios.get(`${API}/api/profile/${currentUser.uid}`);
                    if (profileRes.data && Object.keys(profileRes.data).length > 0 && profileRes.data.business_name) {
                        setProfileState(profileRes.data);
                        localStorage.setItem(`pair-profile-${currentUser.uid}`, JSON.stringify(profileRes.data));
                    }
                    // If API returned empty {}, keep localStorage profile if we had one

                    // Fetch history
                    const histRes = await axios.get(`${API}/api/history`, {
                        params: { user_uid: currentUser.uid }
                    });
                    if (histRes.data && Array.isArray(histRes.data)) {
                        setHistory(histRes.data);
                    }

                    // Fetch notifications from backend
                    try {
                        const notifRes = await axios.get(`${API}/api/notifications`, {
                            params: { user_uid: currentUser.uid }
                        });
                        if (notifRes.data && Array.isArray(notifRes.data)) {
                            setNotifications(notifRes.data);
                        }
                    } catch (ne) {
                        console.warn("Notifications fetch failed", ne);
                    }
                } catch (e) {
                    console.error("Error fetching user data (backend may be offline)", e);
                    // localStorage profile is already set above if available
                }
            } else {
                setProfileState(null);
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
            setProfileState(prev => {
                const updated = { ...prev, ...data };
                localStorage.setItem(`pair-profile-${user.uid}`, JSON.stringify(updated));
                return updated;
            });
            return res.data;
        } catch (e) {
            console.error("Error saving profile", e);
            // Still update locally even if backend fails
            setProfileState(prev => {
                const updated = { ...prev, ...data };
                localStorage.setItem(`pair-profile-${user.uid}`, JSON.stringify(updated));
                return updated;
            });
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

    const markAllNotificationsRead = useCallback(async () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        if (user) {
            try {
                await axios.post(`${API}/api/notifications/read-all`, null, {
                    params: { user_uid: user.uid }
                });
            } catch (e) {
                console.warn("Failed to mark notifications read on backend", e);
            }
        }
    }, [user]);

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
