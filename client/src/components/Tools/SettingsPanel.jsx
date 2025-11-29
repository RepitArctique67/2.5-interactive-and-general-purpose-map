import React from 'react';
import { Moon, Sun, Monitor, Globe, Shield } from 'lucide-react';

const SettingsPanel = () => {
    return (
        <div className="space-y-6">
            {/* Appearance */}
            <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Appearance</h4>
                <div className="bg-slate-900/50 rounded-lg p-1 flex border border-slate-700/50">
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md bg-slate-800 text-white shadow-sm">
                        <Moon size={14} />
                        <span className="text-xs font-medium">Dark</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-slate-400 hover:text-slate-200">
                        <Sun size={14} />
                        <span className="text-xs font-medium">Light</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-slate-400 hover:text-slate-200">
                        <Monitor size={14} />
                        <span className="text-xs font-medium">System</span>
                    </button>
                </div>
            </div>

            {/* Map Settings */}
            <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Map Quality</h4>
                <div className="space-y-2">
                    <label className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50 cursor-pointer">
                        <span className="text-sm text-slate-300">High Quality Rendering</span>
                        <input type="checkbox" defaultChecked className="accent-blue-500" />
                    </label>
                    <label className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50 cursor-pointer">
                        <span className="text-sm text-slate-300">Enable Shadows</span>
                        <input type="checkbox" defaultChecked className="accent-blue-500" />
                    </label>
                    <label className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50 cursor-pointer">
                        <span className="text-sm text-slate-300">Atmosphere Effect</span>
                        <input type="checkbox" defaultChecked className="accent-blue-500" />
                    </label>
                </div>
            </div>

            {/* General */}
            <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">General</h4>
                <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50 text-left">
                    <div className="flex items-center gap-2">
                        <Globe size={16} className="text-slate-400" />
                        <span className="text-sm text-slate-300">Language</span>
                    </div>
                    <span className="text-xs text-slate-500">English</span>
                </button>
                <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50 text-left">
                    <div className="flex items-center gap-2">
                        <Shield size={16} className="text-slate-400" />
                        <span className="text-sm text-slate-300">Privacy & Data</span>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default SettingsPanel;
