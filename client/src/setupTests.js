import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
};

// Mock Cesium
vi.mock('cesium', () => {
    return {
        Viewer: class {
            constructor() {
                this.scene = {
                    canvas: {
                        addEventListener: vi.fn(),
                        removeEventListener: vi.fn(),
                    },
                    camera: {
                        flyTo: vi.fn(),
                        setView: vi.fn(),
                    },
                    requestRender: vi.fn(),
                };
                this.dataSources = {
                    add: vi.fn(),
                    remove: vi.fn(),
                    removeAll: vi.fn(),
                };
                this.entities = {
                    add: vi.fn(),
                    remove: vi.fn(),
                    removeAll: vi.fn(),
                };
                this.destroy = vi.fn();
            }
        },
        Cartesian3: {
            fromDegrees: vi.fn(),
        },
        Color: {
            fromCssColorString: vi.fn(),
            RED: 'red',
            BLUE: 'blue',
        },
        ScreenSpaceEventHandler: class {
            setInputAction() { }
            destroy() { }
        },
        ScreenSpaceEventType: {
            LEFT_CLICK: 0,
            MOUSE_MOVE: 1,
        },
        defined: (val) => val !== undefined && val !== null,
    };
});

// Mock vite-plugin-cesium
vi.mock('vite-plugin-cesium', () => ({
    default: () => ({}),
}));
