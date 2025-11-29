import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LayerPanel from './LayerPanel';

describe('LayerPanel Component', () => {
    const mockLayers = [
        {
            id: '1',
            name: 'Test Layer 1',
            description: 'Description 1',
            type: 'geojson',
            is_active: true,
            is_historical: false,
        },
        {
            id: '2',
            name: 'Test Layer 2',
            description: 'Description 2',
            type: 'heatmap',
            is_active: false,
            is_historical: true,
            min_year: 1900,
            max_year: 2000,
        },
    ];

    it('renders loading state', () => {
        render(<LayerPanel layers={[]} isLoading={true} onLayerToggle={() => { }} />);
        expect(screen.getByText('Chargement...')).toBeInTheDocument();
    });

    it('renders error state', () => {
        render(<LayerPanel layers={[]} error="Failed to load" onLayerToggle={() => { }} />);
        expect(screen.getByText('❌ Failed to load')).toBeInTheDocument();
    });

    it('renders layers correctly', () => {
        render(<LayerPanel layers={mockLayers} onLayerToggle={() => { }} />);
        expect(screen.getByText('Test Layer 1')).toBeInTheDocument();
        expect(screen.getByText('Test Layer 2')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument(); // Layer count
        expect(screen.getByText('1900 - 2000')).toBeInTheDocument();
    });

    it('calls onLayerToggle when checkbox is clicked', () => {
        const handleToggle = vi.fn();
        render(<LayerPanel layers={mockLayers} onLayerToggle={handleToggle} />);

        const checkboxes = screen.getAllByRole('checkbox');
        fireEvent.click(checkboxes[0]);
        expect(handleToggle).toHaveBeenCalledWith('1');

        fireEvent.click(checkboxes[1]);
        expect(handleToggle).toHaveBeenCalledWith('2');
    });
});
