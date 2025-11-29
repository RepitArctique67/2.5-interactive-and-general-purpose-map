import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Layers } from 'lucide-react';
import { clsx } from 'clsx';

const LayerGroup = ({ title, count, children, defaultExpanded = true }) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <div className="mb-4">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-2 mb-2 rounded-lg hover:bg-slate-800/50 transition-colors group"
            >
                <div className="flex items-center gap-2">
                    {isExpanded ? (
                        <ChevronDown size={16} className="text-slate-500 group-hover:text-slate-300" />
                    ) : (
                        <ChevronRight size={16} className="text-slate-500 group-hover:text-slate-300" />
                    )}
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-slate-200">
                        {title}
                    </span>
                </div>
                <span className="text-xs font-medium text-slate-600 bg-slate-800/50 px-2 py-0.5 rounded-full group-hover:bg-slate-700/50 group-hover:text-slate-400">
                    {count}
                </span>
            </button>

            <div
                className={clsx(
                    "space-y-2 transition-all duration-300 ease-in-out overflow-hidden",
                    isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                )}
            >
                {children}
            </div>
        </div>
    );
};

export default LayerGroup;
