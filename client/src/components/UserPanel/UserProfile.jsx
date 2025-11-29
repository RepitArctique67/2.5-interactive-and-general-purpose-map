import React from 'react';
import { User, LogOut, Settings, Map } from 'lucide-react';
import Button from '../shared/Button';

const UserProfile = ({ user, onLogout, onEditProfile }) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-16 h-16 rounded-full border-2 border-blue-500 shadow-lg shadow-blue-500/20"
                />
                <div>
                    <h3 className="text-lg font-bold text-white">{user.name}</h3>
                    <p className="text-sm text-slate-400">{user.email}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 text-[10px] uppercase font-bold bg-blue-500/20 text-blue-400 rounded-full">
                        {user.role}
                    </span>
                </div>
            </div>

            <div className="space-y-2">
                <Button
                    variant="secondary"
                    className="w-full justify-start"
                    leftIcon={<User size={16} />}
                    onClick={onEditProfile}
                >
                    Edit Profile
                </Button>
                <Button
                    variant="secondary"
                    className="w-full justify-start"
                    leftIcon={<Map size={16} />}
                >
                    My Maps
                </Button>
                <Button
                    variant="secondary"
                    className="w-full justify-start"
                    leftIcon={<Settings size={16} />}
                >
                    Account Settings
                </Button>
            </div>

            <div className="pt-4 border-t border-slate-700/50">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    leftIcon={<LogOut size={16} />}
                    onClick={onLogout}
                >
                    Sign Out
                </Button>
            </div>
        </div>
    );
};

export default UserProfile;
