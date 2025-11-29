import React from 'react';
import Tooltip from '../shared/Tooltip';

const TimelineMarker = ({ year, label, type, minYear, maxYear }) => {
    const position = ((year - minYear) / (maxYear - minYear)) * 100;

    const colors = {
        political: 'bg-red-500',
        natural: 'bg-green-500',
        cultural: 'bg-purple-500',
        scientific: 'bg-blue-500',
        default: 'bg-slate-400'
    };

    const color = colors[type] || colors.default;

    return (
        <div
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 -ml-1 cursor-pointer group z-10"
            style={{ left: `${position}%` }}
        >
            <Tooltip content={`${year}: ${label}`}>
                <div className={`w-2 h-2 rounded-full ${color} ring-2 ring-slate-900 transition-all group-hover:scale-150 group-hover:ring-white/50`} />
            </Tooltip>
        </div>
    );
};

export default TimelineMarker;
