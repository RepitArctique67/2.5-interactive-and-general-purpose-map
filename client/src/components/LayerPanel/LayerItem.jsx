import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff, Info, Clock, Settings2 } from 'lucide-react';
import Tooltip from '../shared/Tooltip';
import { clsx } from 'clsx';

const LayerItem = ({ layer, onToggle, onOpacityChange }) => {
    const [showOpacity, setShowOpacity] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: layer.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={clsx(
                "group relative bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 mb-2 transition-all hover:bg-slate-800/60 hover:border-slate-600/50",
                isDragging && "shadow-xl ring-2 ring-blue-500/50 bg-slate-800/80"
            )}
        >
            <div className="flex items-start gap-3">
                {/* Drag Handle */}
                <button
                    {...attributes}
                    {...listeners}
                    className="mt-1 p-1 text-slate-500 hover:text-slate-300 cursor-grab active:cursor-grabbing rounded hover:bg-slate-700/50 transition-colors"
                >
                    <GripVertical size={16} />
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium text-slate-200 truncate pr-2">
                            {layer.name}
                        </h4>
                        <div className="flex items-center gap-1">
                            {layer.is_historical && (
                                <Tooltip content={`Historical Data: ${layer.min_year} - ${layer.max_year}`}>
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                        <Clock size={10} className="mr-1" />
                                        {layer.min_year}-{layer.max_year}
                                    </span>
                                </Tooltip>
                            )}
                            <button
                                onClick={() => setShowOpacity(!showOpacity)}
                                className={clsx(
                                    "p-1.5 rounded-lg transition-colors",
                                    showOpacity ? "bg-blue-500/20 text-blue-400" : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                                )}
                            >
                                <Settings2 size={14} />
                            </button>
                        </div>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-1 mb-2">
                        {layer.description}
                    </p>

                    <div className="flex items-center justify-between gap-4">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 bg-slate-900/50 px-2 py-0.5 rounded">
                            {layer.type}
                        </span>

                        <button
                            onClick={() => onToggle(layer.id)}
                            className={clsx(
                                "flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-all border",
                                layer.is_active
                                    ? "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20"
                                    : "bg-slate-700/30 text-slate-400 border-slate-700/50 hover:bg-slate-700/50 hover:text-slate-300"
                            )}
                        >
                            {layer.is_active ? (
                                <>
                                    <Eye size={12} />
                                    <span>Visible</span>
                                </>
                            ) : (
                                <>
                                    <EyeOff size={12} />
                                    <span>Hidden</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Opacity Slider */}
            {showOpacity && (
                <div className="mt-3 pt-3 border-t border-slate-700/50 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 w-12">Opacity</span>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={layer.opacity}
                            onChange={(e) => onOpacityChange(layer.id, parseFloat(e.target.value))}
                            className="flex-1 h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 hover:[&::-webkit-slider-thumb]:bg-blue-400 [&::-webkit-slider-thumb]:transition-colors"
                        />
                        <span className="text-xs font-mono text-slate-400 w-8 text-right">
                            {Math.round(layer.opacity * 100)}%
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LayerItem;
