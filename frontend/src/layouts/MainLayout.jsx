import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function MainLayout() {
    return (
        <div className="flex flex-col min-h-screen" style={{ position: 'relative' }}>
            {/* Animated background blobs */}
            <div className="gradient-bg-blobs" aria-hidden="true">
                <div className="blob blob-1" />
                <div className="blob blob-2" />
                <div className="blob blob-3" />
            </div>

            <Navbar />
            <main className="flex-1" style={{ position: 'relative', zIndex: 1 }}>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
