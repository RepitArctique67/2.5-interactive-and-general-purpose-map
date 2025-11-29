import React from 'react';
import { History, X } from 'lucide-react';

const RecentSearches = ({ searches, onSelect, onClear }) => {
    if (searches.length === 0) return null;

    return (
        <div className="py-2">
            <div className="flex items-center justify-between px-3 mb-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recent</span>
                <button
                    onClick={onClear}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                    Clear
                </button>
            </div>
            <ul>
                {searches.map((search) => (
                    <li key={search.id}>
                        <button
                            onClick={() => onSelect(search)}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-800/50 transition-colors text-left group"
                        >
                            <History size={14} className="text-slate-500 group-hover:text-slate-400" />
                            <div className="flex-1 min-w-0">
                                <div className="text-sm text-slate-300 truncate group-hover:text-slate-100">
                                    {search.name}
                                </div>
                            </div>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RecentSearches;
