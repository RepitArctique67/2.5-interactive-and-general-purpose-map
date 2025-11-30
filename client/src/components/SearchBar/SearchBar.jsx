import React, { useState, useRef, useEffect } from 'react';
import { Search, X, MapPin, Clock, Loader2 } from 'lucide-react';
import useSearch from '../../hooks/useSearch';
import { useMap } from '../../hooks/useMap';
import { clsx } from 'clsx';

const SearchBar = () => {
    const {
        query,
        setQuery,
        results,
        isLoading,
        error,
        recentSearches,
        addToRecent,
        clearRecent
    } = useSearch();

    const { flyTo } = useMap();
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (result) => {
        addToRecent(result);
        setQuery(result.name);
        setIsOpen(false);

        // Fly to location
        flyTo({
            center: [result.lon, result.lat],
            zoom: 12,
            pitch: 45
        });
    };

    const handleInputChange = (e) => {
        setQuery(e.target.value);
        if (!isOpen) setIsOpen(true);
    };

    return (
        <div ref={wrapperRef} className="absolute top-4 left-4 z-20 w-80 sm:w-96 font-sans">
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-400 transition-colors">
                    {isLoading ? (
                        <Loader2 className="animate-spin" size={18} />
                    ) : (
                        <Search size={18} />
                    )}
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Search locations..."
                    className="block w-full pl-10 pr-10 py-2.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 shadow-lg transition-all"
                />
                {query && (
                    <button
                        onClick={() => {
                            setQuery('');
                            setIsOpen(true);
                        }}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Dropdown Results */}
            {isOpen && (
                <div className="absolute mt-2 w-full bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {error && (
                        <div className="p-3 text-sm text-red-400 bg-red-900/20 border-b border-red-900/20">
                            {error}
                        </div>
                    )}

                    {/* Search Results */}
                    {results.length > 0 && (
                        <div className="py-2">
                            <div className="px-3 pb-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Results
                            </div>
                            {results.map((result) => (
                                <button
                                    key={result.id}
                                    onClick={() => handleSelect(result)}
                                    className="w-full px-4 py-2 text-left hover:bg-slate-800/50 transition-colors flex items-start gap-3 group"
                                >
                                    <MapPin size={16} className="mt-1 text-slate-500 group-hover:text-blue-400 transition-colors" />
                                    <div>
                                        <div className="text-sm font-medium text-slate-200 group-hover:text-white">
                                            {result.name}
                                        </div>
                                        <div className="text-xs text-slate-500 truncate max-w-[280px]">
                                            {result.description}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Recent Searches */}
                    {results.length === 0 && recentSearches.length > 0 && (
                        <div className="py-2 border-t border-slate-800/50">
                            <div className="px-3 pb-1 flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Recent
                                </span>
                                <button
                                    onClick={clearRecent}
                                    className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    Clear
                                </button>
                            </div>
                            {recentSearches.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleSelect(item)}
                                    className="w-full px-4 py-2 text-left hover:bg-slate-800/50 transition-colors flex items-center gap-3 group"
                                >
                                    <Clock size={14} className="text-slate-600 group-hover:text-purple-400 transition-colors" />
                                    <span className="text-sm text-slate-400 group-hover:text-slate-200">
                                        {item.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {results.length === 0 && recentSearches.length === 0 && !isLoading && query && (
                        <div className="p-8 text-center text-slate-500">
                            <MapPin size={24} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No locations found</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
