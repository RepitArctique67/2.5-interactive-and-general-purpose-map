import { useEffect, useRef, useState, useCallback } from 'react';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import * as turf from '@turf/turf';
import { useMap } from './useMap';

export const useDraw = () => {
    const { map } = useMap();
    const drawRef = useRef(null);
    const [measurements, setMeasurements] = useState([]);

    // Callback to update measurements from draw events
    const updateMeasurements = useCallback((e) => {
        if (!drawRef.current) return;

        const data = drawRef.current.getAll();

        const newMeasurements = data.features.map(feature => {
            if (feature.geometry.type === 'LineString') {
                const length = turf.length(feature);
                return {
                    id: feature.id,
                    type: 'Distance',
                    value: length < 1 ? `${(length * 1000).toFixed(0)} m` : `${length.toFixed(2)} km`
                };
            } else if (feature.geometry.type === 'Polygon') {
                const area = turf.area(feature);
                return {
                    id: feature.id,
                    type: 'Area',
                    value: area < 10000 ? `${area.toFixed(0)} m²` : `${(area / 1000000).toFixed(2)} km²`
                };
            }
            return null;
        }).filter(Boolean);

        setMeasurements(newMeasurements);
    }, []);

    // Effect 1: Initialize MapboxDraw and add control
    useEffect(() => {
        if (!map) return;

        // Only initialize if not already done
        if (!drawRef.current) {
            const draw = new MapboxDraw({
                displayControlsDefault: false,
                controls: {},
                styles: [
                    // Styles (simplified for brevity, can be expanded)
                    {
                        'id': 'gl-draw-line',
                        'type': 'line',
                        'filter': ['all', ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
                        'layout': { 'line-cap': 'round', 'line-join': 'round' },
                        'paint': { 'line-color': '#3b82f6', 'line-dasharray': [0.2, 2], 'line-width': 2 }
                    },
                    {
                        'id': 'gl-draw-polygon-fill',
                        'type': 'fill',
                        'filter': ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
                        'paint': { 'fill-color': '#3b82f6', 'fill-outline-color': '#3b82f6', 'fill-opacity': 0.1 }
                    },
                    {
                        'id': 'gl-draw-polygon-stroke-active',
                        'type': 'line',
                        'filter': ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
                        'layout': { 'line-cap': 'round', 'line-join': 'round' },
                        'paint': { 'line-color': '#3b82f6', 'line-dasharray': [0.2, 2], 'line-width': 2 }
                    },
                    {
                        'id': 'gl-draw-point-stroke-active',
                        'type': 'circle',
                        'filter': ['all', ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
                        'paint': { 'circle-radius': 5, 'circle-color': '#fff', 'circle-stroke-width': 2, 'circle-stroke-color': '#3b82f6' }
                    }
                ]
            });

            map.addControl(draw, 'top-left'); // Position doesn't matter as we hide controls, but 'top-left' is safe
            drawRef.current = draw;
        }

        // Cleanup: Remove control when map changes or component unmounts
        return () => {
            if (map && drawRef.current) {
                try {
                    map.removeControl(drawRef.current);
                } catch (e) {
                    // console.warn('Error removing draw control:', e);
                }
                drawRef.current = null;
            }
        };
    }, [map]);

    // Effect 2: Attach event listeners
    useEffect(() => {
        if (!map || !drawRef.current) return;

        map.on('draw.create', updateMeasurements);
        map.on('draw.update', updateMeasurements);
        map.on('draw.delete', updateMeasurements);

        return () => {
            map.off('draw.create', updateMeasurements);
            map.off('draw.update', updateMeasurements);
            map.off('draw.delete', updateMeasurements);
        };
    }, [map, updateMeasurements]); // Re-run if map or callback changes

    const changeMode = useCallback((mode) => {
        if (drawRef.current) {
            drawRef.current.changeMode(mode);
        }
    }, []);

    const deleteAll = useCallback(() => {
        if (drawRef.current) {
            drawRef.current.deleteAll();
            setMeasurements([]);
        }
    }, []);

    const setColor = useCallback((color) => {
        if (drawRef.current) {
            const selected = drawRef.current.getSelected();
            if (selected.features.length > 0) {
                selected.features.forEach(feature => {
                    drawRef.current.setFeatureProperty(feature.id, 'user_color', color);
                });
                // Trigger update to re-render styles if needed (MapboxDraw handles this usually)
            }
        }
    }, []);

    return {
        changeMode,
        deleteAll,
        measurements,
        setColor
    };
};
