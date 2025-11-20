import React from 'react';
import './Timeline.css';

const Timeline = ({ currentYear, onYearChange, minYear = 1900, maxYear = 2025 }) => {
    const handleSliderChange = (e) => {
        onYearChange(parseInt(e.target.value));
    };

    return (
        <div className="timeline-container">
            <div className="timeline-content">
                <div className="timeline-header">
                    <span className="timeline-icon">⏱️</span>
                    <span className="timeline-label">Ligne temporelle</span>
                </div>
                <div className="timeline-year-display">
                    <span className="year-value">{currentYear}</span>
                </div>
                <div className="timeline-slider-wrapper">
                    <span className="year-marker">{minYear}</span>
                    <input
                        type="range"
                        min={minYear}
                        max={maxYear}
                        value={currentYear}
                        onChange={handleSliderChange}
                        className="timeline-slider"
                    />
                    <span className="year-marker">{maxYear}</span>
                </div>
            </div>
        </div>
    );
};

export default Timeline;
