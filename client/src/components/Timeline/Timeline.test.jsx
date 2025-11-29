import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Timeline from './Timeline';

describe('Timeline Component', () => {
    it('renders correctly with default props', () => {
        render(<Timeline currentYear={2025} onYearChange={() => { }} />);
        expect(screen.getByText('Ligne temporelle')).toBeInTheDocument();
        // 2025 might appear multiple times (current year and max year)
        const yearElements = screen.getAllByText('2025');
        expect(yearElements.length).toBeGreaterThan(0);
    });

    it('displays min and max years', () => {
        render(<Timeline currentYear={2000} onYearChange={() => { }} minYear={1950} maxYear={2050} />);
        expect(screen.getByText('1950')).toBeInTheDocument();
        expect(screen.getByText('2050')).toBeInTheDocument();
    });

    it('calls onYearChange when slider value changes', () => {
        const handleYearChange = vi.fn();
        render(<Timeline currentYear={2000} onYearChange={handleYearChange} />);

        const slider = screen.getByRole('slider');
        fireEvent.change(slider, { target: { value: '2010' } });

        expect(handleYearChange).toHaveBeenCalledWith(2010);
    });
});
