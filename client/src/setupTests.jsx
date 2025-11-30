import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock ResizeObserver
globalThis.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
};

// Mock MapLibre GL
vi.mock('react-map-gl/maplibre', () => {
    return {
        default: ({ children, onLoad }) => {
            // Simulate onLoad
            setTimeout(() => {
                onLoad && onLoad({ target: { flyTo: vi.fn(), fitBounds: vi.fn() } });
            }, 0);
            return <div data-testid="map-container">{children}</div>;
        },
        Source: ({ children }) => <div>{children}</div>,
        Layer: () => <div>Layer</div>,
        NavigationControl: () => <div>NavigationControl</div>,
        ScaleControl: () => <div>ScaleControl</div>,
        FullscreenControl: () => <div>FullscreenControl</div>,
    };
});
