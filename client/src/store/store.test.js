import { describe, it, expect, beforeEach } from 'vitest';
import useLayerStore from './layerStore';

describe('layerStore', () => {
    beforeEach(() => {
        useLayerStore.setState({ layers: {}, activeLayerId: null });
    });

    it('adds a layer', () => {
        const layer = { id: 1, name: 'Test Layer' };
        useLayerStore.getState().addLayer(layer);

        const state = useLayerStore.getState();
        expect(state.layers[1]).toEqual({
            ...layer,
            visible: true,
            opacity: 1.0
        });
    });

    it('sets multiple layers', () => {
        const layers = [
            { id: 1, name: 'L1' },
            { id: 2, name: 'L2', visible: false }
        ];
        useLayerStore.getState().setLayers(layers);

        const state = useLayerStore.getState();
        expect(Object.keys(state.layers)).toHaveLength(2);
        expect(state.layers[2].visible).toBe(false);
    });

    it('toggles layer visibility', () => {
        const layer = { id: 1, name: 'Test Layer', visible: true };
        useLayerStore.getState().addLayer(layer);

        useLayerStore.getState().toggleLayerVisibility(1);
        expect(useLayerStore.getState().layers[1].visible).toBe(false);

        useLayerStore.getState().toggleLayerVisibility(1);
        expect(useLayerStore.getState().layers[1].visible).toBe(true);
    });

    it('sets layer opacity', () => {
        const layer = { id: 1, name: 'Test Layer', opacity: 1.0 };
        useLayerStore.getState().addLayer(layer);

        useLayerStore.getState().setLayerOpacity(1, 0.5);
        expect(useLayerStore.getState().layers[1].opacity).toBe(0.5);

        // Clamping
        useLayerStore.getState().setLayerOpacity(1, 1.5);
        expect(useLayerStore.getState().layers[1].opacity).toBe(1.0);

        useLayerStore.getState().setLayerOpacity(1, -0.5);
        expect(useLayerStore.getState().layers[1].opacity).toBe(0.0);
    });

    it('removes a layer', () => {
        const layer = { id: 1, name: 'Test Layer' };
        useLayerStore.getState().addLayer(layer);

        useLayerStore.getState().removeLayer(1);
        expect(useLayerStore.getState().layers[1]).toBeUndefined();
    });

    it('gets visible layers', () => {
        const layers = [
            { id: 1, name: 'L1', visible: true },
            { id: 2, name: 'L2', visible: false },
            { id: 3, name: 'L3', visible: true }
        ];
        useLayerStore.getState().setLayers(layers);

        const visibleLayers = useLayerStore.getState().getVisibleLayers();
        expect(visibleLayers).toHaveLength(2);
        expect(visibleLayers.map(l => l.id)).toEqual([1, 3]);
    });
});
