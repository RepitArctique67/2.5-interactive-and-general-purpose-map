import {
    Cartesian3,
    Color,
    GeoJsonDataSource,
    HeightReference,
    VerticalOrigin,
    HorizontalOrigin,
    LabelStyle,
    Math as CesiumMath,
    Cartographic,
    defined,
    Entity,
    PointGraphics,
    BillboardGraphics,
    PolygonGraphics,
    PolylineGraphics,
} from 'cesium';

/**
 * CesiumJS Helper Utilities
 * Provides comprehensive utilities for working with CesiumJS
 */

// ============================================================================
// GeoJSON Rendering
// ============================================================================

/**
 * Load and render GeoJSON data on the globe
 * @param {Viewer} viewer - Cesium viewer instance
 * @param {Object} geojsonData - GeoJSON data object
 * @param {Object} options - Styling and configuration options
 * @returns {Promise<GeoJsonDataSource>} The loaded data source
 */
export async function loadGeoJsonLayer(viewer, geojsonData, options = {}) {
    const {
        name = 'GeoJSON Layer',
        stroke = Color.YELLOW,
        strokeWidth = 3,
        fill = Color.YELLOW.withAlpha(0.3),
        markerColor = Color.RED,
        markerSize = 48,
        clampToGround = true,
        show = true,
    } = options;

    try {
        const dataSource = await GeoJsonDataSource.load(geojsonData, {
            stroke,
            strokeWidth,
            fill,
            markerColor,
            markerSize,
            clampToGround,
        });

        dataSource.name = name;
        dataSource.show = show;

        await viewer.dataSources.add(dataSource);

        // Apply custom styling if provided
        if (options.styleFunction) {
            const entities = dataSource.entities.values;
            entities.forEach(entity => {
                styleGeoJsonFeature(entity, entity.properties, options.styleFunction);
            });
        }

        return dataSource;
    } catch (error) {
        console.error('Error loading GeoJSON layer:', error);
        throw error;
    }
}

/**
 * Apply custom styling to a GeoJSON feature
 * @param {Entity} entity - Cesium entity
 * @param {Object} properties - Feature properties
 * @param {Function} styleFunction - Function that returns style based on properties
 */
export function styleGeoJsonFeature(entity, properties, styleFunction) {
    if (!styleFunction || !properties) return;

    const style = styleFunction(properties);

    // Apply point styling
    if (entity.point) {
        if (style.pointColor) entity.point.color = style.pointColor;
        if (style.pointSize) entity.point.pixelSize = style.pointSize;
        if (style.pointOutlineColor) entity.point.outlineColor = style.pointOutlineColor;
        if (style.pointOutlineWidth) entity.point.outlineWidth = style.pointOutlineWidth;
    }

    // Apply polygon styling
    if (entity.polygon) {
        if (style.fillColor) entity.polygon.material = style.fillColor;
        if (style.outlineColor) entity.polygon.outlineColor = style.outlineColor;
        if (style.outlineWidth) entity.polygon.outlineWidth = style.outlineWidth;
    }

    // Apply polyline styling
    if (entity.polyline) {
        if (style.lineColor) entity.polyline.material = style.lineColor;
        if (style.lineWidth) entity.polyline.width = style.lineWidth;
    }

    // Apply billboard styling
    if (entity.billboard && style.image) {
        entity.billboard.image = style.image;
        if (style.scale) entity.billboard.scale = style.scale;
    }
}

/**
 * Remove a GeoJSON layer from the viewer
 * @param {Viewer} viewer - Cesium viewer instance
 * @param {string} layerName - Name of the layer to remove
 * @returns {boolean} True if layer was removed
 */
export function removeGeoJsonLayer(viewer, layerName) {
    const dataSources = viewer.dataSources;
    for (let i = 0; i < dataSources.length; i++) {
        const dataSource = dataSources.get(i);
        if (dataSource.name === layerName) {
            dataSources.remove(dataSource);
            return true;
        }
    }
    return false;
}

// ============================================================================
// 3D Visualization
// ============================================================================

/**
 * Add 3D buildings to the scene
 * @param {Viewer} viewer - Cesium viewer instance
 * @param {Object} buildingData - Building data with height information
 * @param {Object} options - Styling options
 */
export function add3DBuildings(viewer, buildingData, options = {}) {
    const {
        color = Color.WHITE.withAlpha(0.8),
        outlineColor = Color.BLACK,
        extrudedHeight = 'height',
    } = options;

    buildingData.features.forEach(feature => {
        const coordinates = feature.geometry.coordinates;
        const properties = feature.properties;
        const height = properties[extrudedHeight] || 10;

        const entity = viewer.entities.add({
            name: properties.name || 'Building',
            polygon: {
                hierarchy: Cartesian3.fromDegreesArray(coordinates[0].flat()),
                extrudedHeight: height,
                material: color,
                outline: true,
                outlineColor: outlineColor,
                outlineWidth: 2,
            },
            properties: properties,
        });
    });
}

/**
 * Create a heatmap visualization from point data
 * @param {Viewer} viewer - Cesium viewer instance
 * @param {Array} points - Array of {longitude, latitude, value} objects
 * @param {Object} options - Heatmap configuration
 */
export function createHeatmap(viewer, points, options = {}) {
    const {
        radius = 50000, // meters
        minValue = 0,
        maxValue = 100,
        colorScale = ['blue', 'cyan', 'lime', 'yellow', 'red'],
    } = options;

    points.forEach(point => {
        const { longitude, latitude, value } = point;

        // Normalize value to 0-1
        const normalizedValue = (value - minValue) / (maxValue - minValue);

        // Get color from scale
        const colorIndex = Math.floor(normalizedValue * (colorScale.length - 1));
        const color = Color.fromCssColorString(colorScale[colorIndex]);

        viewer.entities.add({
            position: Cartesian3.fromDegrees(longitude, latitude),
            ellipse: {
                semiMinorAxis: radius,
                semiMajorAxis: radius,
                material: color.withAlpha(0.5),
                height: 0,
            },
            properties: {
                value: value,
                type: 'heatmap',
            },
        });
    });
}

// ============================================================================
// Camera Controls
// ============================================================================

/**
 * Fly camera to a specific location with smooth animation
 * @param {Viewer} viewer - Cesium viewer instance
 * @param {number} longitude - Target longitude
 * @param {number} latitude - Target latitude
 * @param {number} height - Camera height in meters
 * @param {number} duration - Animation duration in seconds
 * @returns {Promise} Resolves when flight is complete
 */
export function flyToLocation(viewer, longitude, latitude, height = 10000000, duration = 3) {
    return new Promise((resolve) => {
        viewer.camera.flyTo({
            destination: Cartesian3.fromDegrees(longitude, latitude, height),
            duration: duration,
            complete: resolve,
        });
    });
}

/**
 * Track an entity with the camera
 * @param {Viewer} viewer - Cesium viewer instance
 * @param {Entity} entity - Entity to track
 */
export function trackEntity(viewer, entity) {
    if (!entity || !entity.position) return;

    viewer.trackedEntity = entity;
}

/**
 * Reset camera to default view
 * @param {Viewer} viewer - Cesium viewer instance
 * @param {number} duration - Animation duration in seconds
 */
export function resetCamera(viewer, duration = 2) {
    viewer.trackedEntity = undefined;

    viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(0, 30, 20000000),
        orientation: {
            heading: CesiumMath.toRadians(0),
            pitch: CesiumMath.toRadians(-90),
            roll: 0.0,
        },
        duration: duration,
    });
}

/**
 * Fly to a bounding box
 * @param {Viewer} viewer - Cesium viewer instance
 * @param {Array} bbox - [west, south, east, north] in degrees
 * @param {number} duration - Animation duration in seconds
 */
export function flyToBoundingBox(viewer, bbox, duration = 2) {
    const [west, south, east, north] = bbox;

    const rectangle = {
        west: CesiumMath.toRadians(west),
        south: CesiumMath.toRadians(south),
        east: CesiumMath.toRadians(east),
        north: CesiumMath.toRadians(north),
    };

    viewer.camera.flyTo({
        destination: viewer.camera.getRectangleCameraCoordinates(rectangle),
        duration: duration,
    });
}

// ============================================================================
// Coordinate Transformations
// ============================================================================

/**
 * Convert Cartesian3 coordinates to latitude/longitude
 * @param {Cartesian3} cartesian - Cartesian coordinates
 * @returns {Object} {longitude, latitude, height}
 */
export function cartesianToLatLon(cartesian) {
    const cartographic = Cartographic.fromCartesian(cartesian);
    return {
        longitude: CesiumMath.toDegrees(cartographic.longitude),
        latitude: CesiumMath.toDegrees(cartographic.latitude),
        height: cartographic.height,
    };
}

/**
 * Convert latitude/longitude to Cartesian3 coordinates
 * @param {number} longitude - Longitude in degrees
 * @param {number} latitude - Latitude in degrees
 * @param {number} height - Height in meters (default: 0)
 * @returns {Cartesian3} Cartesian coordinates
 */
export function latLonToCartesian(longitude, latitude, height = 0) {
    return Cartesian3.fromDegrees(longitude, latitude, height);
}

/**
 * Get the camera's current position in lat/lon
 * @param {Viewer} viewer - Cesium viewer instance
 * @returns {Object} {longitude, latitude, height}
 */
export function getCameraPosition(viewer) {
    return cartesianToLatLon(viewer.camera.position);
}

// ============================================================================
// Entity Management
// ============================================================================

/**
 * Create a custom marker at a location
 * @param {Viewer} viewer - Cesium viewer instance
 * @param {number} longitude - Longitude in degrees
 * @param {number} latitude - Latitude in degrees
 * @param {Object} options - Marker options
 * @returns {Entity} Created entity
 */
export function createCustomMarker(viewer, longitude, latitude, options = {}) {
    const {
        name = 'Marker',
        color = Color.RED,
        size = 10,
        label = null,
        image = null,
        height = 0,
        properties = {},
    } = options;

    const position = Cartesian3.fromDegrees(longitude, latitude, height);

    const entityConfig = {
        name: name,
        position: position,
        properties: properties,
    };

    // Add point or billboard
    if (image) {
        entityConfig.billboard = {
            image: image,
            verticalOrigin: VerticalOrigin.BOTTOM,
            horizontalOrigin: HorizontalOrigin.CENTER,
            heightReference: HeightReference.CLAMP_TO_GROUND,
        };
    } else {
        entityConfig.point = {
            pixelSize: size,
            color: color,
            outlineColor: Color.WHITE,
            outlineWidth: 2,
            heightReference: HeightReference.CLAMP_TO_GROUND,
        };
    }

    // Add label if provided
    if (label) {
        entityConfig.label = {
            text: label,
            font: '14px sans-serif',
            fillColor: Color.WHITE,
            outlineColor: Color.BLACK,
            outlineWidth: 2,
            style: LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: VerticalOrigin.BOTTOM,
            pixelOffset: new Cartesian3(0, -20, 0),
            heightReference: HeightReference.CLAMP_TO_GROUND,
        };
    }

    return viewer.entities.add(entityConfig);
}

/**
 * Highlight an entity with visual effects
 * @param {Viewer} viewer - Cesium viewer instance
 * @param {Entity} entity - Entity to highlight
 * @param {Object} options - Highlight options
 */
export function highlightEntity(viewer, entity, options = {}) {
    const {
        color = Color.YELLOW,
        scale = 1.5,
        outlineWidth = 4,
    } = options;

    // Store original styling
    if (!entity._originalStyle) {
        entity._originalStyle = {};

        if (entity.point) {
            entity._originalStyle.pointColor = entity.point.color;
            entity._originalStyle.pointSize = entity.point.pixelSize;
            entity._originalStyle.pointOutlineWidth = entity.point.outlineWidth;
        }

        if (entity.billboard) {
            entity._originalStyle.billboardScale = entity.billboard.scale;
        }

        if (entity.polygon) {
            entity._originalStyle.polygonMaterial = entity.polygon.material;
            entity._originalStyle.polygonOutlineWidth = entity.polygon.outlineWidth;
        }
    }

    // Apply highlight styling
    if (entity.point) {
        entity.point.color = color;
        entity.point.pixelSize = entity._originalStyle.pointSize * scale;
        entity.point.outlineWidth = outlineWidth;
    }

    if (entity.billboard) {
        entity.billboard.scale = entity._originalStyle.billboardScale * scale;
    }

    if (entity.polygon) {
        entity.polygon.material = color.withAlpha(0.5);
        entity.polygon.outlineWidth = outlineWidth;
    }
}

/**
 * Remove highlight from an entity
 * @param {Entity} entity - Entity to unhighlight
 */
export function unhighlightEntity(entity) {
    if (!entity._originalStyle) return;

    // Restore original styling
    if (entity.point && entity._originalStyle.pointColor) {
        entity.point.color = entity._originalStyle.pointColor;
        entity.point.pixelSize = entity._originalStyle.pointSize;
        entity.point.outlineWidth = entity._originalStyle.pointOutlineWidth;
    }

    if (entity.billboard && entity._originalStyle.billboardScale) {
        entity.billboard.scale = entity._originalStyle.billboardScale;
    }

    if (entity.polygon && entity._originalStyle.polygonMaterial) {
        entity.polygon.material = entity._originalStyle.polygonMaterial;
        entity.polygon.outlineWidth = entity._originalStyle.polygonOutlineWidth;
    }

    delete entity._originalStyle;
}

/**
 * Remove all entities from the viewer
 * @param {Viewer} viewer - Cesium viewer instance
 */
export function clearAllEntities(viewer) {
    viewer.entities.removeAll();
}

/**
 * Remove entities by property filter
 * @param {Viewer} viewer - Cesium viewer instance
 * @param {Function} filterFn - Function that returns true for entities to remove
 */
export function removeEntitiesByFilter(viewer, filterFn) {
    const entitiesToRemove = [];

    viewer.entities.values.forEach(entity => {
        if (filterFn(entity)) {
            entitiesToRemove.push(entity);
        }
    });

    entitiesToRemove.forEach(entity => {
        viewer.entities.remove(entity);
    });
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Calculate distance between two points on Earth
 * @param {number} lon1 - First point longitude
 * @param {number} lat1 - First point latitude
 * @param {number} lon2 - Second point longitude
 * @param {number} lat2 - Second point latitude
 * @returns {number} Distance in meters
 */
export function calculateDistance(lon1, lat1, lon2, lat2) {
    const point1 = Cartesian3.fromDegrees(lon1, lat1);
    const point2 = Cartesian3.fromDegrees(lon2, lat2);
    return Cartesian3.distance(point1, point2);
}

/**
 * Pick an entity at screen coordinates
 * @param {Viewer} viewer - Cesium viewer instance
 * @param {Object} position - Screen position {x, y}
 * @returns {Entity|undefined} Picked entity or undefined
 */
export function pickEntity(viewer, position) {
    const pickedObject = viewer.scene.pick(position);
    if (defined(pickedObject) && defined(pickedObject.id)) {
        return pickedObject.id;
    }
    return undefined;
}

/**
 * Get all entities within a bounding box
 * @param {Viewer} viewer - Cesium viewer instance
 * @param {Array} bbox - [west, south, east, north] in degrees
 * @returns {Array<Entity>} Entities within the bounding box
 */
export function getEntitiesInBounds(viewer, bbox) {
    const [west, south, east, north] = bbox;
    const entities = [];

    viewer.entities.values.forEach(entity => {
        if (entity.position) {
            const position = entity.position.getValue(viewer.clock.currentTime);
            if (position) {
                const cartographic = Cartographic.fromCartesian(position);
                const lon = CesiumMath.toDegrees(cartographic.longitude);
                const lat = CesiumMath.toDegrees(cartographic.latitude);

                if (lon >= west && lon <= east && lat >= south && lat <= north) {
                    entities.push(entity);
                }
            }
        }
    });

    return entities;
}

export default {
    loadGeoJsonLayer,
    styleGeoJsonFeature,
    removeGeoJsonLayer,
    add3DBuildings,
    createHeatmap,
    flyToLocation,
    trackEntity,
    resetCamera,
    flyToBoundingBox,
    cartesianToLatLon,
    latLonToCartesian,
    getCameraPosition,
    createCustomMarker,
    highlightEntity,
    unhighlightEntity,
    clearAllEntities,
    removeEntitiesByFilter,
    calculateDistance,
    pickEntity,
    getEntitiesInBounds,
};
