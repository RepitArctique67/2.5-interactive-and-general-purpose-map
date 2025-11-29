import React from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';
import { clsx } from 'clsx';
import Tooltip from '../shared/Tooltip';

const PlaybackControls = ({ isPlaying, onPlayPause, onReset, onStepForward, onStepBackward }) => {
    return (
        <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-1 border border-slate-700/50 backdrop-blur-sm">
            <Tooltip content="Reset">
                <button
                    onClick={onReset}
                    className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded transition-colors"
                >
                    <RotateCcw size={16} />
                </button>
            </Tooltip>

            <div className="w-px h-4 bg-slate-700/50 mx-1" />

            <Tooltip content="Previous Year">
                <button
                    onClick={onStepBackward}
                    className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded transition-colors"
                >
                    <SkipBack size={16} />
                </button>
            </Tooltip>

            <Tooltip content={isPlaying ? "Pause" : "Play"}>
                <button
                    onClick={onPlayPause}
                    className={clsx(
                        "p-2 rounded-lg transition-all shadow-lg",
                        isPlaying
                            ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                            : "bg-blue-500 text-white hover:bg-blue-600 border border-blue-400/30 shadow-blue-500/20"
                    )}
                >
                    {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                </button>
            </Tooltip>

            <Tooltip content="Next Year">
                <button
                    onClick={onStepForward}
                    className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded transition-colors"
                >
                    <SkipForward size={16} />
                </button>
            </Tooltip>
        </div>
    );
};

export default PlaybackControls;
