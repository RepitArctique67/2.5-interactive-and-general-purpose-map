import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LayerPanel from './LayerPanel';

// Mock child components to simplify testing
vi.mock('./LayerItem', () => ({
    default: ({ layer, onToggle }) => (
        <div data-testid="layer-item">
            <span>{layer.name}</span>
            <button onClick={() => onToggle(layer.id)}>Toggle</button>
        </div>
    )
}));

vi.mock('./LayerGroup', () => ({
    default: ({ title, children }) => (
        <div data-testid="layer-group">
            <h3>{title}</h3>
            {children}
        </div>
    )
}));

vi.mock('./LayerSearch', () => ({
    default: ({ value, onChange }) => (
        <input
            data-testid="layer-search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    )
}));

vi.mock('../shared/Spinner', () => ({
    default: () => <div data-testid="spinner">Loading...</div>
}));

describe('LayerPanel', () => {
    const mockLayers = [
        { id: 1, name: 'Layer 1', category: 'Base', is_active: true },
        { id: 2, name: 'Layer 2', category: 'Overlay', is_active: false },
    ];
    const mockOnLayerToggle = vi.fn();

    it('renders loading state', () => {
        render(<LayerPanel isLoading={true} />);
        expect(screen.getByTestId('spinner')).toBeInTheDocument();
        expect(screen.getByText('Loading layers...')).toBeInTheDocument();
    });

    it('renders error state', () => {
        render(<LayerPanel error="Failed to fetch" />);
        expect(screen.getByText('Error loading layers')).toBeInTheDocument();
        expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
    });

    it('renders layers grouped by category', () => {
        render(<LayerPanel layers={mockLayers} />);

        expect(screen.getByText('Base')).toBeInTheDocument();
        expect(screen.getByText('Overlay')).toBeInTheDocument();
        expect(screen.getByText('Layer 1')).toBeInTheDocument();
        expect(screen.getByText('Layer 2')).toBeInTheDocument();
    });

    it('filters layers by search query', () => {
        render(<LayerPanel layers={mockLayers} />);

        const searchInput = screen.getByTestId('layer-search');
        fireEvent.change(searchInput, { target: { value: 'Layer 1' } });

        expect(screen.getByText('Layer 1')).toBeInTheDocument();
        expect(screen.queryByText('Layer 2')).not.toBeInTheDocument();
    });

    it('filters layers by active status', () => {
        render(<LayerPanel layers={mockLayers} />);

        const activeFilterBtn = screen.getByText('active');
        fireEvent.click(activeFilterBtn);

        expect(screen.getByText('Layer 1')).toBeInTheDocument();
        expect(screen.queryByText('Layer 2')).not.toBeInTheDocument();
    });

    it('calls onLayerToggle when toggle button is clicked', () => {
        render(<LayerPanel layers={mockLayers} onLayerToggle={mockOnLayerToggle} />);

        const toggleButtons = screen.getAllByText('Toggle');
        fireEvent.click(toggleButtons[0]);

        expect(mockOnLayerToggle).toHaveBeenCalledWith(1);
    });
});
