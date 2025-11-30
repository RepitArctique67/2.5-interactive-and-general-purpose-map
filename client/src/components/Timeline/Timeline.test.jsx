import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Timeline from './Timeline';

// Mock child components
vi.mock('./PlaybackControls', () => ({
    default: ({ isPlaying, onPlayPause, onReset, onStepForward, onStepBackward }) => (
        <div data-testid="playback-controls">
            <button onClick={onPlayPause}>{isPlaying ? 'Pause' : 'Play'}</button>
            <button onClick={onReset}>Reset</button>
            <button onClick={onStepForward}>Forward</button>
            <button onClick={onStepBackward}>Backward</button>
        </div>
    )
}));

vi.mock('./SpeedControl', () => ({
    default: ({ speed, onChange }) => (
        <div data-testid="speed-control">
            <button onClick={() => onChange(speed * 2)}>Speed</button>
        </div>
    )
}));

vi.mock('./TimelineMarker', () => ({
    default: ({ label }) => <div data-testid="timeline-marker">{label}</div>
}));

describe('Timeline', () => {
    const mockOnYearChange = vi.fn();
    const defaultProps = {
        currentYear: 2000,
        onYearChange: mockOnYearChange,
        minYear: 1900,
        maxYear: 2025,
        events: []
    };

    beforeEach(() => {
        vi.useFakeTimers();
        mockOnYearChange.mockClear();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders current year', () => {
        render(<Timeline {...defaultProps} />);
        expect(screen.getByText('2000')).toBeInTheDocument();
    });

    it('calls onYearChange when slider changes', () => {
        render(<Timeline {...defaultProps} />);
        const slider = screen.getByRole('slider');
        fireEvent.change(slider, { target: { value: '2010' } });
        expect(mockOnYearChange).toHaveBeenCalledWith(2010);
    });

    it('handles play/pause toggle', () => {
        render(<Timeline {...defaultProps} />);
        const playButton = screen.getByText('Play');

        fireEvent.click(playButton);
        expect(screen.getByText('Pause')).toBeInTheDocument();

        fireEvent.click(playButton); // Pause
        expect(screen.getByText('Play')).toBeInTheDocument();
    });

    it('increments year when playing', () => {
        // We need to pass a functional update mock to verify state updates inside interval
        // But Timeline uses onYearChange prop directly inside interval.
        // Let's check implementation: onYearChange((prevYear) => ...)
        // So we need to mock onYearChange to handle function or value

        // Actually, in the test, we can just check if onYearChange is called.
        // But since it passes a function, we need to invoke it to see the result if we want to be precise.
        // Or just verify it was called with a function.

        render(<Timeline {...defaultProps} />);
        const playButton = screen.getByText('Play');

        fireEvent.click(playButton);

        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(mockOnYearChange).toHaveBeenCalled();
        // Verify the argument is a function
        const callArg = mockOnYearChange.mock.calls[0][0];
        expect(typeof callArg).toBe('function');
        expect(callArg(2000)).toBe(2001);
    });

    it('stops playing when reaching max year', () => {
        render(<Timeline {...defaultProps} currentYear={2024} maxYear={2025} />);
        const playButton = screen.getByText('Play');
        fireEvent.click(playButton);

        act(() => {
            vi.advanceTimersByTime(1000);
        });

        const callArg = mockOnYearChange.mock.calls[0][0];
        // The component calls onYearChange with a function: prevYear => ...
        // We need to execute that function to verify the result
        const result = callArg(2025);
        expect(result).toBe(2025);
    });

    it('resets to minYear', () => {
        render(<Timeline {...defaultProps} />);
        const resetButton = screen.getByText('Reset');
        fireEvent.click(resetButton);
        expect(mockOnYearChange).toHaveBeenCalledWith(1900);
    });
});
