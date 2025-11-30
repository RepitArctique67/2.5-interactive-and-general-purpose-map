import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MapView from './Map';
import { useLayers } from '../../hooks/useLayers';
import { useTimeline } from '../../hooks/useTimeline';
import { useMap } from '../../hooks/useMap';

// Mock hooks
vi.mock('../../hooks/useLayers');
vi.mock('../../hooks/useTimeline');
vi.mock('../../hooks/useMap');

describe('MapView', () => {
    beforeEach(() => {
        useLayers.mockReturnValue({ layers: [], isLoading: false });
        useTimeline.mockReturnValue({ currentYear: 2025 });
        useMap.mockReturnValue({ setMapInstance: vi.fn() });
    });

    it('renders map container', () => {
        render(<MapView />);
        expect(screen.getByTestId('map-container')).toBeInTheDocument();
    });

    it('renders loading spinner when loading', () => {
        render(<MapView isLoading={true} />);
        expect(screen.getByText('Loading Map...')).toBeInTheDocument();
    });

    it('renders visible layers', () => {
        const mockLayers = [
            { id: '1', visible: true, type: 'geojson', geojsonData: {} },
            { id: '2', visible: false, type: 'geojson', geojsonData: {} }
        ];

        // We need to pass layers as props now
        render(<MapView layers={mockLayers} />);

        // Since we mock Source/Layer as divs, we can check if they are rendered
        // But our mock implementation of Source just renders children, and Layer renders "Layer"
        // So we expect 1 "Layer" text for the visible layer
        expect(screen.getAllByText('Layer')).toHaveLength(1);
    });
});
