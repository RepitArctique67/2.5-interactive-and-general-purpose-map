import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import {
    Viewer,
    Cartesian3,
    Math as CesiumMath,
    createWorldTerrain,
    createOpenStreetMapImageryProvider,
    IonImageryProvider,
    BingMapsImageryProvider,
    BingMapsStyle,
    Color,
    Ion,
} from 'cesium';
import "cesium/Build/Cesium/Widgets/widgets.css";
import useCesium from '../../hooks/useCesium';
import { setupLODSystem, createPerformanceMonitor, updateLOD } from '../../utils/performanceUtils';
import { resetCamera } from '../../utils/cesiumHelpers';

/**
 * Enhanced Globe component with advanced CesiumJS features
 * @param {Object} props - Component props
 * @param {Array} props.layers - Layers to display on the globe
 * @param {Array} props.features - GeoJSON features to render
 * @param {Object} props.selectedFeature - Currently selected feature
 * @param {number} props.currentYear - Current timeline year
 * @param {Function} props.onEntityClick - Callback when entity is clicked
 * @param {Function} props.onEntityHover - Callback when entity is hovered
 * @param {Function} props.onCameraMove - Callback when camera moves
 * @param {string} props.terrainProvider - Terrain provider type
 * @param {string} props.imageryProvider - Imagery provider type
 * @param {boolean} props.enableLighting - Enable globe lighting
 * @param {boolean} props.enableShadows - Enable shadows
 * @param {boolean} props.enablePerformanceMonitoring - Enable performance monitoring
 */
const Globe = forwardRef((props, ref) => {
    const {
        layers = [],
        features = [],
        selectedFeature = null,
        currentYear = new Date().getFullYear(),
        onEntityClick = null,
        onEntityHover = null,
        onCameraMove = null,
        terrainProvider = 'none',
        imageryProvider = 'osm',
        enableLighting = false,
        enableShadows = false,
        enablePerformanceMonitoring = false,
    } = props;

    const containerRef = useRef(null);
    const viewerRef = useRef(null);
    const lodSystemRef = useRef(null);
    const performanceMonitorRef = useRef(null);

    // Use the custom Cesium hook for interactions
    const cesiumControls = useCesium(viewerRef, {
        enableSelection: true,
        enableHover: true,
        enablePopups: true,
        onEntityClick: (entity) => {
            if (onEntityClick) {
                onEntityClick(entity);
            }
        },
        onEntityHover: (entity) => {
            if (onEntityHover) {
                onEntityHover(entity);
            }
        },
        onCameraMove: (position) => {
            if (onCameraMove) {
                onCameraMove(position);
            }

            // Update LOD based on camera position
            if (lodSystemRef.current && lodSystemRef.current.shouldUpdate()) {
                const entities = viewerRef.current.entities.values;
                updateLOD(viewerRef.current, entities, lodSystemRef.current.currentLevel);
            }
        },
    });

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
        viewer: viewerRef.current,
        ...cesiumControls,
        resetView: () => {
            if (viewerRef.current) {
                resetCamera(viewerRef.current);
            }
        },
    }));

    // Initialize Cesium viewer
    useEffect(() => {
        if (containerRef.current && !viewerRef.current) {
            // Set Cesium Ion token if available
            const cesiumToken = import.meta.env.VITE_CESIUM_TOKEN;
            if (cesiumToken) {
                Ion.defaultAccessToken = cesiumToken;
            }

            // Create viewer with enhanced configuration
            const viewer = new Viewer(containerRef.current, {
                animation: false,
                timeline: false,
                baseLayerPicker: false,
                geocoder: false,
                homeButton: true,
                sceneModePicker: false,
                navigationHelpButton: false,
                fullscreenButton: true,
                vrButton: false,
                infoBox: false,
                selectionIndicator: false,
                shadows: enableShadows,
                shouldAnimate: false,
                // Performance optimizations
                requestRenderMode: true,
                maximumRenderTimeChange: Infinity,
            });

            // Configure terrain provider
            if (terrainProvider === 'cesium-world-terrain' && cesiumToken) {
                viewer.terrainProvider = createWorldTerrain({
                    requestWaterMask: true,
                    requestVertexNormals: true,
                });
            }

            // Configure imagery provider
            configureImageryProvider(viewer, imageryProvider);

            // Set initial camera position (view of Earth from space)
            viewer.camera.setView({
                destination: Cartesian3.fromDegrees(0, 30, 20000000),
                orientation: {
                    heading: CesiumMath.toRadians(0),
                    pitch: CesiumMath.toRadians(-90),
                    roll: 0.0,
                },
            });

            // Enable lighting
            viewer.scene.globe.enableLighting = enableLighting;

            // Performance optimizations
            viewer.scene.globe.tileCacheSize = 100;
            viewer.scene.globe.maximumScreenSpaceError = 2;

            // Enable depth testing for better performance
            viewer.scene.globe.depthTestAgainstTerrain = false;

            // Setup LOD system
            lodSystemRef.current = setupLODSystem(viewer, {
                nearDistance: 1000000,
                mediumDistance: 5000000,
                farDistance: 10000000,
            });

            // Setup performance monitoring if enabled
            if (enablePerformanceMonitoring) {
                performanceMonitorRef.current = createPerformanceMonitor(viewer, {
                    interval: 5000,
                    logToConsole: true,
                    onUpdate: (metrics) => {
                        console.log('Performance:', metrics);
                    },
                });
                performanceMonitorRef.current.start();
            }

            // Store viewer reference
            viewerRef.current = viewer;

            // Clean up on unmount
            return () => {
                if (performanceMonitorRef.current) {
                    performanceMonitorRef.current.stop();
                }
                if (viewerRef.current) {
                    viewerRef.current.destroy();
                    viewerRef.current = null;
                }
            };
        }
    }, [terrainProvider, imageryProvider, enableLighting, enableShadows, enablePerformanceMonitoring]);

    // Update layers when they change
    useEffect(() => {
        if (!viewerRef.current || !layers || layers.length === 0) return;

        // Add/update layers
        layers.forEach(async (layer) => {
            if (layer.geojsonData && layer.visible) {
                await cesiumControls.addLayer(layer.id, layer.geojsonData, {
                    stroke: layer.strokeColor || Color.YELLOW,
                    strokeWidth: layer.strokeWidth || 3,
                    fill: layer.fillColor || Color.YELLOW.withAlpha(0.3),
                    show: layer.visible,
                });
            } else if (!layer.visible) {
                cesiumControls.removeLayer(layer.id);
            }
        });
    }, [layers, cesiumControls]);

    // Update features when they change
    useEffect(() => {
        if (!viewerRef.current || !features || features.length === 0) return;

        // Clear existing features
        viewerRef.current.entities.removeAll();

        // Add new features
        features.forEach(feature => {
            if (feature.geometry && feature.geometry.coordinates) {
                const [longitude, latitude] = feature.geometry.coordinates;
                cesiumControls.addMarker(longitude, latitude, {
                    name: feature.properties?.name || 'Feature',
                    properties: feature.properties,
                    color: Color.RED,
                    size: 10,
                });
            }
        });
    }, [features, cesiumControls]);

    // Handle selected feature
    useEffect(() => {
        if (selectedFeature && viewerRef.current) {
            // Find entity by ID or properties
            const entities = viewerRef.current.entities.values;
            const entity = entities.find(e =>
                e.id === selectedFeature.id ||
                e.properties?.id?.getValue() === selectedFeature.id
            );

            if (entity) {
                cesiumControls.selectEntity(entity);
            }
        }
    }, [selectedFeature, cesiumControls]);

    // Render popup if exists
    const renderPopup = () => {
        if (!cesiumControls.popup) return null;

        const { position, entity } = cesiumControls.popup;
        const properties = entity.properties;

        return (
            <div
                style={{
                    position: 'absolute',
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    transform: 'translate(-50%, -100%)',
                    background: 'rgba(0, 0, 0, 0.8)',
                    color: 'white',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    pointerEvents: 'none',
                    zIndex: 1000,
                    maxWidth: '250px',
                }}
            >
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                    {entity.name || 'Feature'}
                </div>
                {properties && (
                    <div style={{ fontSize: '12px', opacity: 0.9 }}>
                        {Object.keys(properties).map(key => {
                            const value = properties[key]?.getValue ? properties[key].getValue() : properties[key];
                            if (typeof value === 'object') return null;
                            return (
                                <div key={key} style={{ marginBottom: '4px' }}>
                                    <strong>{key}:</strong> {String(value)}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
            <div
                ref={containerRef}
                style={{ width: '100%', height: '100%', margin: 0, padding: 0, overflow: 'hidden' }}
            />
            {renderPopup()}
        </div>
    );
});

Globe.displayName = 'Globe';

/**
 * Configure imagery provider for the viewer
 * @param {Viewer} viewer - Cesium viewer instance
 * @param {string} providerType - Type of imagery provider
 */
function configureImageryProvider(viewer, providerType) {
    // Remove existing imagery layers
    viewer.imageryLayers.removeAll();

    switch (providerType) {
        case 'osm':
            viewer.imageryLayers.addImageryProvider(
                createOpenStreetMapImageryProvider({
                    url: 'https://a.tile.openstreetmap.org/',
                })
            );
            break;

        case 'bing':
            // Requires Bing Maps API key
            if (import.meta.env.VITE_BING_MAPS_KEY) {
                viewer.imageryLayers.addImageryProvider(
                    new BingMapsImageryProvider({
                        url: 'https://dev.virtualearth.net',
                        key: import.meta.env.VITE_BING_MAPS_KEY,
                        mapStyle: BingMapsStyle.AERIAL_WITH_LABELS,
                    })
                );
            }
            break;

        case 'satellite':
            // Use Cesium Ion satellite imagery if token available
            if (import.meta.env.VITE_CESIUM_TOKEN) {
                viewer.imageryLayers.addImageryProvider(
                    IonImageryProvider.fromAssetId(2)
                );
            }
            break;

        default:
            // Default to OSM
            viewer.imageryLayers.addImageryProvider(
                createOpenStreetMapImageryProvider({
                    url: 'https://a.tile.openstreetmap.org/',
                })
            );
    }
}

export default Globe;
