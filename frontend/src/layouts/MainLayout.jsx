import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function MainLayout() {
    const location = useLocation();

    return (
        <div className="flex flex-col min-h-screen font-sans" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
            <Navbar />
            <main className="flex-1 w-full max-w-[1280px] mx-auto px-6 pt-10 pb-16">
                <div key={location.pathname} className="animate-fade-in-up">
                    <Outlet />
                </div>
            </main>
            <Footer />
        </div>
    );
}
