import React from 'react';
import { MapPin } from 'lucide-react';

const SearchResults = ({ results, onSelect }) => {
    if (results.length === 0) return null;

    return (
        <div className="py-2">
            <div className="px-3 mb-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Results</span>
            </div>
            <ul>
                {results.map((result) => (
                    <li key={result.id}>
                        <button
                            onClick={() => onSelect(result)}
                            className="w-full flex items-start gap-3 px-3 py-2 hover:bg-slate-800/50 transition-colors text-left group"
                        >
                            <MapPin size={16} className="mt-0.5 text-slate-500 group-hover:text-blue-400" />
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-slate-200 group-hover:text-white truncate">
                                    {result.name}
                                </div>
                                <div className="text-xs text-slate-500 group-hover:text-slate-400 truncate">
                                    {result.description}
                                </div>
                            </div>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SearchResults;
