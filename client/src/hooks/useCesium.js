import { useEffect, useRef, useState, useCallback } from 'react';
import { ScreenSpaceEventHandler, ScreenSpaceEventType, defined } from 'cesium';
import {
    pickEntity,
    highlightEntity,
    unhighlightEntity,
    flyToLocation,
    trackEntity,
    loadGeoJsonLayer,
    removeGeoJsonLayer,
    createCustomMarker,
} from '../utils/cesiumHelpers';

/**
 * Custom hook for managing Cesium viewer and interactions
 * @param {Object} viewerRef - Ref to the Cesium viewer instance
 * @param {Object} options - Hook configuration options
 * @returns {Object} Cesium interaction utilities
 */
export function useCesium(viewerRef, options = {}) {
    const {
        enableSelection = true,
        enableHover = true,
        enablePopups = true,
        onEntityClick = null,
        onEntityHover = null,
        onCameraMove = null,
    } = options;

    const [selectedEntity, setSelectedEntity] = useState(null);
    const [hoveredEntity, setHoveredEntity] = useState(null);
    const [popup, setPopup] = useState(null);
    const [layers, setLayers] = useState(new Map());

    const eventHandlerRef = useRef(null);
    const previousHoveredRef = useRef(null);

    // Initialize event handlers
    useEffect(() => {
        if (!viewerRef.current) return;

        const viewer = viewerRef.current;
        const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
        eventHandlerRef.current = handler;

        // Click event
        if (enableSelection) {
            handler.setInputAction((movement) => {
                const entity = pickEntity(viewer, movement.position);

                // Unhighlight previous selection
                if (selectedEntity) {
                    unhighlightEntity(selectedEntity);
                }

                if (entity) {
                    setSelectedEntity(entity);
                    highlightEntity(viewer, entity, {
                        color: Cesium.Color.YELLOW,
                        scale: 1.5,
                    });

                    // Show popup if enabled
                    if (enablePopups) {
                        const position = entity.position?.getValue(viewer.clock.currentTime);
                        if (position) {
                            const canvasPosition = viewer.scene.cartesianToCanvasCoordinates(position);
                            if (canvasPosition) {
                                setPopup({
                                    entity,
                                    position: canvasPosition,
                                    properties: entity.properties,
                                });
                            }
                        }
                    }

                    // Call custom click handler
                    if (onEntityClick) {
                        onEntityClick(entity);
                    }
                } else {
                    setSelectedEntity(null);
                    setPopup(null);
                }
            }, ScreenSpaceEventType.LEFT_CLICK);
        }

        // Hover event
        if (enableHover) {
            handler.setInputAction((movement) => {
                const entity = pickEntity(viewer, movement.endPosition);

                // Unhighlight previous hovered entity
                if (previousHoveredRef.current && previousHoveredRef.current !== selectedEntity) {
                    unhighlightEntity(previousHoveredRef.current);
                }

                if (entity && entity !== selectedEntity) {
                    setHoveredEntity(entity);
                    highlightEntity(viewer, entity, {
                        color: Cesium.Color.CYAN,
                        scale: 1.2,
                    });
                    previousHoveredRef.current = entity;

                    // Call custom hover handler
                    if (onEntityHover) {
                        onEntityHover(entity);
                    }

                    // Change cursor
                    viewer.canvas.style.cursor = 'pointer';
                } else {
                    setHoveredEntity(null);
                    previousHoveredRef.current = null;
                    viewer.canvas.style.cursor = 'default';
                }
            }, ScreenSpaceEventType.MOUSE_MOVE);
        }

        // Camera move event
        if (onCameraMove) {
            viewer.camera.moveEnd.addEventListener(() => {
                const cameraPosition = {
                    longitude: Cesium.Math.toDegrees(viewer.camera.positionCartographic.longitude),
                    latitude: Cesium.Math.toDegrees(viewer.camera.positionCartographic.latitude),
                    height: viewer.camera.positionCartographic.height,
                };
                onCameraMove(cameraPosition);
            });
        }

        // Cleanup
        return () => {
            if (handler && !handler.isDestroyed()) {
                handler.destroy();
            }
        };
    }, [viewerRef, enableSelection, enableHover, enablePopups, onEntityClick, onEntityHover, onCameraMove]);

    /**
     * Select an entity programmatically
     */
    const selectEntity = useCallback((entity) => {
        if (!viewerRef.current) return;

        // Unhighlight previous selection
        if (selectedEntity) {
            unhighlightEntity(selectedEntity);
        }

        if (entity) {
            setSelectedEntity(entity);
            highlightEntity(viewerRef.current, entity, {
                color: Cesium.Color.YELLOW,
                scale: 1.5,
            });

            // Fly to entity
            const position = entity.position?.getValue(viewerRef.current.clock.currentTime);
            if (position) {
                const cartographic = Cesium.Cartographic.fromCartesian(position);
                flyToLocation(
                    viewerRef.current,
                    Cesium.Math.toDegrees(cartographic.longitude),
                    Cesium.Math.toDegrees(cartographic.latitude),
                    100000,
                    2
                );
            }
        }
    }, [viewerRef, selectedEntity]);

    /**
     * Clear current selection
     */
    const clearSelection = useCallback(() => {
        if (selectedEntity) {
            unhighlightEntity(selectedEntity);
            setSelectedEntity(null);
            setPopup(null);
        }
    }, [selectedEntity]);

    /**
     * Add a GeoJSON layer
     */
    const addLayer = useCallback(async (layerId, geojsonData, layerOptions = {}) => {
        if (!viewerRef.current) return null;

        try {
            const dataSource = await loadGeoJsonLayer(
                viewerRef.current,
                geojsonData,
                {
                    name: layerId,
                    ...layerOptions,
                }
            );

            setLayers(prev => new Map(prev).set(layerId, {
                dataSource,
                visible: true,
                options: layerOptions,
            }));

            return dataSource;
        } catch (error) {
            console.error(`Error adding layer ${layerId}:`, error);
            return null;
        }
    }, [viewerRef]);

    /**
     * Remove a layer
     */
    const removeLayer = useCallback((layerId) => {
        if (!viewerRef.current) return;

        const layer = layers.get(layerId);
        if (layer) {
            viewerRef.current.dataSources.remove(layer.dataSource);
            setLayers(prev => {
                const newLayers = new Map(prev);
                newLayers.delete(layerId);
                return newLayers;
            });
        }
    }, [viewerRef, layers]);

    /**
     * Toggle layer visibility
     */
    const toggleLayer = useCallback((layerId, visible) => {
        const layer = layers.get(layerId);
        if (layer) {
            layer.dataSource.show = visible !== undefined ? visible : !layer.dataSource.show;
            setLayers(prev => new Map(prev).set(layerId, {
                ...layer,
                visible: layer.dataSource.show,
            }));
        }
    }, [layers]);

    /**
     * Fly to a location
     */
    const flyTo = useCallback((longitude, latitude, height = 10000, duration = 3) => {
        if (!viewerRef.current) return;
        return flyToLocation(viewerRef.current, longitude, latitude, height, duration);
    }, [viewerRef]);

    /**
     * Track an entity with camera
     */
    const trackEntityCamera = useCallback((entity) => {
        if (!viewerRef.current) return;
        trackEntity(viewerRef.current, entity);
    }, [viewerRef]);

    /**
     * Add a custom marker
     */
    const addMarker = useCallback((longitude, latitude, markerOptions = {}) => {
        if (!viewerRef.current) return null;
        return createCustomMarker(viewerRef.current, longitude, latitude, markerOptions);
    }, [viewerRef]);

    /**
     * Show popup for an entity
     */
    const showPopup = useCallback((entity, customContent = null) => {
        if (!viewerRef.current || !entity) return;

        const position = entity.position?.getValue(viewerRef.current.clock.currentTime);
        if (position) {
            const canvasPosition = viewerRef.current.scene.cartesianToCanvasCoordinates(position);
            if (canvasPosition) {
                setPopup({
                    entity,
                    position: canvasPosition,
                    properties: entity.properties,
                    customContent,
                });
            }
        }
    }, [viewerRef]);

    /**
     * Hide popup
     */
    const hidePopup = useCallback(() => {
        setPopup(null);
    }, []);

    /**
     * Get all entities in the viewer
     */
    const getAllEntities = useCallback(() => {
        if (!viewerRef.current) return [];
        return viewerRef.current.entities.values;
    }, [viewerRef]);

    /**
     * Get entities by property filter
     */
    const getEntitiesByFilter = useCallback((filterFn) => {
        if (!viewerRef.current) return [];
        return viewerRef.current.entities.values.filter(filterFn);
    }, [viewerRef]);

    /**
     * Clear all entities
     */
    const clearAllEntities = useCallback(() => {
        if (!viewerRef.current) return;
        viewerRef.current.entities.removeAll();
        setSelectedEntity(null);
        setHoveredEntity(null);
        setPopup(null);
    }, [viewerRef]);

    /**
     * Update layer style
     */
    const updateLayerStyle = useCallback((layerId, styleFunction) => {
        const layer = layers.get(layerId);
        if (layer && layer.dataSource) {
            const entities = layer.dataSource.entities.values;
            entities.forEach(entity => {
                if (entity.properties) {
                    const style = styleFunction(entity.properties);
                    // Apply style to entity
                    if (style && entity.point) {
                        if (style.color) entity.point.color = style.color;
                        if (style.size) entity.point.pixelSize = style.size;
                    }
                }
            });
        }
    }, [layers]);

    return {
        // State
        selectedEntity,
        hoveredEntity,
        popup,
        layers: Array.from(layers.keys()),

        // Selection methods
        selectEntity,
        clearSelection,

        // Layer management
        addLayer,
        removeLayer,
        toggleLayer,
        updateLayerStyle,

        // Camera controls
        flyTo,
        trackEntity: trackEntityCamera,

        // Entity management
        addMarker,
        getAllEntities,
        getEntitiesByFilter,
        clearAllEntities,

        // Popup controls
        showPopup,
        hidePopup,
    };
}

export default useCesium;
