import React, { useState, useEffect, useRef } from 'react';
import PlaybackControls from './PlaybackControls';
import SpeedControl from './SpeedControl';
import TimelineMarker from './TimelineMarker';
import { Calendar } from 'lucide-react';
import './Timeline.css';

const Timeline = ({ currentYear, onYearChange, minYear = 1900, maxYear = 2025, events = [] }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const intervalRef = useRef(null);

    // Mock events if none provided
    const displayEvents = events.length > 0 ? events : [
        { year: 1914, label: 'WWI Start', type: 'political' },
        { year: 1939, label: 'WWII Start', type: 'political' },
        { year: 1969, label: 'Moon Landing', type: 'scientific' },
        { year: 1989, label: 'Berlin Wall Fall', type: 'political' },
        { year: 2000, label: 'New Millennium', type: 'cultural' },
        { year: 2020, label: 'COVID-19', type: 'natural' }
    ];

    useEffect(() => {
        if (isPlaying) {
            intervalRef.current = setInterval(() => {
                onYearChange((prevYear) => {
                    if (prevYear >= maxYear) {
                        setIsPlaying(false);
                        return maxYear;
                    }
                    return prevYear + 1;
                });
            }, 1000 / playbackSpeed);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isPlaying, playbackSpeed, maxYear, onYearChange]);

    const handleSliderChange = (e) => {
        onYearChange(parseInt(e.target.value));
    };

    const handleStepForward = () => {
        if (currentYear < maxYear) onYearChange(currentYear + 1);
    };

    const handleStepBackward = () => {
        if (currentYear > minYear) onYearChange(currentYear - 1);
    };

    const handleReset = () => {
        onYearChange(minYear);
        setIsPlaying(false);
    };

    return (
        <div className="timeline-container">
            <div className="timeline-content glass-panel">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-slate-200">
                        <Calendar size={18} className="text-blue-400" />
                        <span className="font-semibold text-sm">Timeline</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <SpeedControl speed={playbackSpeed} onChange={setPlaybackSpeed} />
                        <PlaybackControls
                            isPlaying={isPlaying}
                            onPlayPause={() => setIsPlaying(!isPlaying)}
                            onReset={handleReset}
                            onStepForward={handleStepForward}
                            onStepBackward={handleStepBackward}
                        />
                    </div>
                </div>

                {/* Year Display */}
                <div className="text-center mb-6 relative">
                    <span className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-lg font-mono">
                        {currentYear}
                    </span>
                    <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent -z-10" />
                </div>

                {/* Slider */}
                <div className="relative px-2">
                    <div className="flex justify-between text-xs font-medium text-slate-500 mb-2">
                        <span>{minYear}</span>
                        <span>{maxYear}</span>
                    </div>

                    <div className="relative h-8 flex items-center">
                        {/* Track Background */}
                        <div className="absolute w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-100"
                                style={{ width: `${((currentYear - minYear) / (maxYear - minYear)) * 100}%` }}
                            />
                        </div>

                        {/* Markers */}
                        {displayEvents.map((event, index) => (
                            <TimelineMarker
                                key={index}
                                year={event.year}
                                label={event.label}
                                type={event.type}
                                minYear={minYear}
                                maxYear={maxYear}
                            />
                        ))}

                        {/* Input Range */}
                        <input
                            type="range"
                            min={minYear}
                            max={maxYear}
                            value={currentYear}
                            onChange={handleSliderChange}
                            className="absolute w-full h-full opacity-0 cursor-pointer z-20"
                        />

                        {/* Custom Thumb (Visual only, follows input) */}
                        <div
                            className="absolute w-5 h-5 bg-white rounded-full shadow-lg shadow-blue-500/50 border-2 border-blue-500 pointer-events-none transition-all duration-100 z-30"
                            style={{
                                left: `${((currentYear - minYear) / (maxYear - minYear)) * 100}%`,
                                transform: 'translateX(-50%)'
                            }}
                        >
                            <div className="absolute inset-0 m-1 bg-blue-500 rounded-full animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Timeline;
