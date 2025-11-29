import React from 'react';
import { Bell, Shield, Eye } from 'lucide-react';

const UserPreferences = () => {
    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Notifications</h4>
                <div className="space-y-2">
                    <label className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50 cursor-pointer">
                        <div className="flex items-center gap-2">
                            <Bell size={16} className="text-slate-400" />
                            <span className="text-sm text-slate-300">Email Notifications</span>
                        </div>
                        <input type="checkbox" defaultChecked className="accent-blue-500" />
                    </label>
                </div>
            </div>

            <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Privacy</h4>
                <div className="space-y-2">
                    <label className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50 cursor-pointer">
                        <div className="flex items-center gap-2">
                            <Shield size={16} className="text-slate-400" />
                            <span className="text-sm text-slate-300">Public Profile</span>
                        </div>
                        <input type="checkbox" defaultChecked className="accent-blue-500" />
                    </label>
                    <label className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50 cursor-pointer">
                        <div className="flex items-center gap-2">
                            <Eye size={16} className="text-slate-400" />
                            <span className="text-sm text-slate-300">Show Activity</span>
                        </div>
                        <input type="checkbox" defaultChecked className="accent-blue-500" />
                    </label>
                </div>
            </div>
        </div>
    );
};

export default UserPreferences;
