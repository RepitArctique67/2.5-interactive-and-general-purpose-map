import React from 'react';
import { Search, X } from 'lucide-react';
import Input from '../shared/Input';

const LayerSearch = ({ value, onChange, onClear }) => {
    return (
        <div className="relative mb-4">
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Search layers..."
                leftIcon={<Search size={14} />}
                rightIcon={
                    value ? (
                        <button
                            onClick={onClear}
                            className="p-1 hover:bg-slate-700 rounded-full transition-colors"
                        >
                            <X size={14} />
                        </button>
                    ) : null
                }
                className="bg-slate-900/50 border-slate-700/50 focus:bg-slate-900/80 h-9 text-sm"
            />
        </div>
    );
};

export default LayerSearch;
