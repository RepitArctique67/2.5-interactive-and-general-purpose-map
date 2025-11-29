import React from 'react';
import { Gauge } from 'lucide-react';

const SpeedControl = ({ speed, onChange }) => {
    const speeds = [0.5, 1, 2, 5];

    return (
        <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-1 border border-slate-700/50 backdrop-blur-sm">
            <div className="p-1.5 text-slate-400">
                <Gauge size={16} />
            </div>
            <div className="flex gap-0.5">
                {speeds.map((s) => (
                    <button
                        key={s}
                        onClick={() => onChange(s)}
                        className={`px-2 py-1 text-[10px] font-bold rounded transition-colors ${speed === s
                                ? 'bg-blue-500 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                            }`}
                    >
                        {s}x
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SpeedControl;
