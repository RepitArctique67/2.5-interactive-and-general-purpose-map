import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import useSearch from '../../hooks/useSearch';
import SearchResults from './SearchResults';
import RecentSearches from './RecentSearches';
import './SearchBar.css';

const SearchBar = ({ onLocationSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);
    const {
        query,
        setQuery,
        results,
        isLoading,
        recentSearches,
        addToRecent,
        clearRecent
    } = useSearch();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (location) => {
        addToRecent(location);
        setQuery(location.name);
        setIsOpen(false);
        if (onLocationSelect) {
            onLocationSelect(location);
        }
    };

    return (
        <div ref={wrapperRef} className="search-container">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                    ) : (
                        <Search className="h-4 w-4 text-slate-400" />
                    )}
                </div>

                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    className="search-input"
                    placeholder="Search location..."
                />

                {query && (
                    <button
                        onClick={() => {
                            setQuery('');
                            setIsOpen(true);
                        }}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {isOpen && (results.length > 0 || recentSearches.length > 0) && (
                <div className="search-dropdown">
                    {results.length > 0 ? (
                        <SearchResults results={results} onSelect={handleSelect} />
                    ) : (
                        <RecentSearches
                            searches={recentSearches}
                            onSelect={handleSelect}
                            onClear={clearRecent}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
