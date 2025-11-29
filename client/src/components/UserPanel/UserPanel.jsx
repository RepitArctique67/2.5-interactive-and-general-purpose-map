import React, { useState, useEffect } from 'react';
import { UserCircle, X } from 'lucide-react';
import AuthForms from './AuthForms';
import UserProfile from './UserProfile';
import ContributionHistory from './ContributionHistory';
import UserPreferences from './UserPreferences';
import authService from '../../services/authService';
import { clsx } from 'clsx';
import './UserPanel.css';

const UserPanel = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('profile'); // profile, history, preferences

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        }
    }, []);

    const handleLogin = (userData) => {
        setUser(userData);
    };

    const handleLogout = () => {
        authService.logout();
        setUser(null);
        setIsOpen(false);
    };

    return (
        <div className="user-panel-container">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 transition-all shadow-lg border border-slate-700/50 backdrop-blur-sm"
            >
                {user ? (
                    <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full border border-blue-500/50"
                    />
                ) : (
                    <UserCircle size={32} />
                )}
            </button>

            {isOpen && (
                <div className="absolute top-14 right-0 w-[360px] glass-panel rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200 origin-top-right shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-900/50">
                        <h2 className="font-semibold text-slate-100">
                            {user ? 'Account' : 'Sign In'}
                        </h2>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 text-slate-400 hover:text-slate-200 rounded-full hover:bg-slate-800/50 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar">
                        {user ? (
                            <>
                                {/* Tabs */}
                                <div className="flex p-1 bg-slate-800/50 rounded-lg mb-6">
                                    {['profile', 'history', 'preferences'].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={clsx(
                                                "flex-1 py-1.5 text-xs font-medium rounded-md capitalize transition-all",
                                                activeTab === tab
                                                    ? "bg-blue-500 text-white shadow-sm"
                                                    : "text-slate-400 hover:text-slate-200"
                                            )}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>

                                {activeTab === 'profile' && (
                                    <UserProfile
                                        user={user}
                                        onLogout={handleLogout}
                                        onEditProfile={() => { }}
                                    />
                                )}
                                {activeTab === 'history' && <ContributionHistory />}
                                {activeTab === 'preferences' && <UserPreferences />}
                            </>
                        ) : (
                            <AuthForms onLogin={handleLogin} />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserPanel;
