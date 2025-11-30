/**
 * Performance Optimization Utilities for CesiumJS
 * Provides LOD, clustering, lazy loading, and memory management
 */

import { Cartesian3, Math as CesiumMath, Cartographic, Color, CustomDataSource, LabelStyle } from 'cesium';

// ============================================================================
// Level of Detail (LOD) System
// ============================================================================

/**
 * Setup LOD system for dynamic detail adjustment
 * @param {Viewer} viewer - Cesium viewer instance
 * @param {Object} config - LOD configuration
 * @returns {Object} LOD controller
 */
export function setupLODSystem(viewer, config = {}) {
    const {
        nearDistance = 1000000,    // 1000 km
        mediumDistance = 5000000,  // 5000 km
        farDistance = 10000000,    // 10000 km
        updateInterval = 100,      // ms
    } = config;

    let lastUpdate = Date.now();
    let currentLODLevel = 'far';

    const lodController = {
        nearDistance,
        mediumDistance,
        farDistance,
        currentLevel: currentLODLevel,

        /**
         * Get current LOD level based on camera height
         */
        getCurrentLevel() {
            const cameraHeight = viewer.camera.positionCartographic.height;

            if (cameraHeight < nearDistance) {
                return 'near';
            } else if (cameraHeight < mediumDistance) {
                return 'medium';
            } else if (cameraHeight < farDistance) {
                return 'far';
            } else {
                return 'very-far';
            }
        },

        /**
         * Check if LOD should update
         */
        shouldUpdate() {
            const now = Date.now();
            if (now - lastUpdate > updateInterval) {
                lastUpdate = now;
                const newLevel = this.getCurrentLevel();
                if (newLevel !== currentLODLevel) {
                    currentLODLevel = newLevel;
                    this.currentLevel = newLevel;
                    return true;
                }
            }
            return false;
        },
    };

    return lodController;
}

/**
 * Update entity visibility based on LOD level
 * @param {Viewer} viewer - Cesium viewer instance
 * @param {Array<Entity>} entities - Entities to update
 * @param {string} lodLevel - Current LOD level
 */
export function updateLOD(viewer, entities, lodLevel) {
    entities.forEach(entity => {
        if (!entity.properties || !entity.properties.lodLevel) {
            return;
        }

        const entityLOD = entity.properties.lodLevel.getValue();

        // Show/hide based on LOD level
        switch (lodLevel) {
            case 'near':
                entity.show = true;
                break;
            case 'medium':
                entity.show = entityLOD !== 'detail';
                break;
            case 'far':
                entity.show = entityLOD === 'major';
                break;
            case 'very-far':
                entity.show = entityLOD === 'critical';
                break;
            default:
                entity.show = true;
        }
    });
}

// ============================================================================
// Clustering System
// ============================================================================

/**
 * Create a clustering system for large point datasets
 * @param {Viewer} viewer - Cesium viewer instance
 * @param {Array} points - Array of {longitude, latitude, properties} objects
 * @param {Object} options - Clustering options
 * @returns {Object} Cluster controller
 */
export function createClusterSystem(viewer, points, options = {}) {
    const {
        pixelRange = 50,
        minimumClusterSize = 2,
        enabled = true,
        clusterColor = Color.RED,
        pointColor = Color.BLUE,
    } = options;

    const dataSource = new CustomDataSource('clustered-points');
    viewer.dataSources.add(dataSource);

    // Add points to data source
    points.forEach(point => {
        dataSource.entities.add({
            position: Cartesian3.fromDegrees(point.longitude, point.latitude),
            point: {
                pixelSize: 10,
                color: pointColor,
            },
            properties: point.properties || {},
        });
    });

    // Enable clustering
    if (enabled) {
        dataSource.clustering.enabled = true;
        dataSource.clustering.pixelRange = pixelRange;
        dataSource.clustering.minimumClusterSize = minimumClusterSize;

        // Customize cluster appearance
        dataSource.clustering.clusterEvent.addEventListener((clusteredEntities, cluster) => {
            cluster.label.show = true;
            cluster.label.text = clusteredEntities.length.toString();
            cluster.label.font = 'bold 16px sans-serif';
            cluster.label.fillColor = Color.WHITE;
            cluster.label.outlineColor = Color.BLACK;
            cluster.label.outlineWidth = 2;
            cluster.label.style = LabelStyle.FILL_AND_OUTLINE;

            cluster.billboard.show = true;
            cluster.billboard.color = clusterColor;

            // Scale cluster size based on number of points
            const size = Math.min(clusteredEntities.length, 50) + 20;
            cluster.billboard.width = size;
            cluster.billboard.height = size;
        });
    }

    return {
        dataSource,

        /**
         * Update clustering parameters
         */
        updateClustering(newOptions) {
            if (newOptions.pixelRange !== undefined) {
                dataSource.clustering.pixelRange = newOptions.pixelRange;
            }
            if (newOptions.minimumClusterSize !== undefined) {
                dataSource.clustering.minimumClusterSize = newOptions.minimumClusterSize;
            }
            if (newOptions.enabled !== undefined) {
                dataSource.clustering.enabled = newOptions.enabled;
            }
        },

        /**
         * Remove clustering system
         */
        destroy() {
            viewer.dataSources.remove(dataSource);
        },
    };
}

/**
 * Update clusters based on zoom level
 * @param {Object} clusterController - Cluster controller from createClusterSystem
 * @param {number} cameraHeight - Current camera height
 */
export function updateClusters(clusterController, cameraHeight) {
    // Adjust pixel range based on camera height
    let pixelRange;

    if (cameraHeight < 1000000) {
        pixelRange = 30; // Tight clustering when close
    } else if (cameraHeight < 5000000) {
        pixelRange = 50; // Medium clustering
    } else {
        pixelRange = 80; // Loose clustering when far
    }

    clusterController.updateClustering({ pixelRange });
}

// ============================================================================
// Lazy Loading
// ============================================================================

/**
 * Lazy load tiles based on visible bounds
 * @param {Viewer} viewer - Cesium viewer instance
 * @param {Function} loadFunction - Function to load data for bounds
 * @param {Object} options - Loading options
 * @returns {Object} Lazy loader controller
 */
export function createLazyLoader(viewer, loadFunction, options = {}) {
    const {
        updateInterval = 500,
        bufferFactor = 1.2,
    } = options;

    let lastBounds = null;
    let lastUpdate = Date.now();
    let isLoading = false;

    const controller = {
        /**
         * Get current visible bounds
         */
        getVisibleBounds() {
            const rectangle = viewer.camera.computeViewRectangle();
            if (!rectangle) return null;

            return {
                west: CesiumMath.toDegrees(rectangle.west),
                south: CesiumMath.toDegrees(rectangle.south),
                east: CesiumMath.toDegrees(rectangle.east),
                north: CesiumMath.toDegrees(rectangle.north),
            };
        },

        /**
         * Check if bounds have changed significantly
         */
        boundsChanged(newBounds) {
            if (!lastBounds || !newBounds) return true;

            const threshold = 0.1; // 10% change threshold
            const widthChange = Math.abs(newBounds.east - newBounds.west) /
                Math.abs(lastBounds.east - lastBounds.west);
            const heightChange = Math.abs(newBounds.north - newBounds.south) /
                Math.abs(lastBounds.north - lastBounds.south);

            return widthChange > (1 + threshold) || widthChange < (1 - threshold) ||
                heightChange > (1 + threshold) || heightChange < (1 - threshold);
        },

        /**
         * Update data based on current view
         */
        async update() {
            const now = Date.now();
            if (isLoading || now - lastUpdate < updateInterval) {
                return;
            }

            const bounds = this.getVisibleBounds();
            if (!bounds || !this.boundsChanged(bounds)) {
                return;
            }

            isLoading = true;
            lastUpdate = now;

            try {
                // Add buffer to bounds
                const width = bounds.east - bounds.west;
                const height = bounds.north - bounds.south;
                const buffer = (bufferFactor - 1) / 2;

                const bufferedBounds = {
                    west: bounds.west - width * buffer,
                    south: bounds.south - height * buffer,
                    east: bounds.east + width * buffer,
                    north: bounds.north + height * buffer,
                };

                await loadFunction(bufferedBounds);
                lastBounds = bounds;
            } catch (error) {
                console.error('Error in lazy loading:', error);
            } finally {
                isLoading = false;
            }
        },

        /**
         * Start automatic updates
         */
        start() {
            viewer.camera.moveEnd.addEventListener(this.update.bind(this));
        },

        /**
         * Stop automatic updates
         */
        stop() {
            viewer.camera.moveEnd.removeEventListener(this.update.bind(this));
        },
    };

    return controller;
}

// ============================================================================
// Memory Management
// ============================================================================

/**
 * Clean up entities that are not visible
 * @param {Viewer} viewer - Cesium viewer instance
 * @param {Object} options - Cleanup options
 */
export function cleanupUnusedEntities(viewer, options = {}) {
    const {
        maxDistance = 50000000, // 50,000 km
        keepRecent = 1000,
    } = options;

    const cameraPosition = viewer.camera.position;
    const entities = viewer.entities.values;
    const entitiesToRemove = [];

    // Sort entities by distance from camera
    const entitiesWithDistance = entities.map(entity => {
        if (!entity.position) return null;

        const position = entity.position.getValue(viewer.clock.currentTime);
        if (!position) return null;

        const distance = Cartesian3.distance(cameraPosition, position);
        return { entity, distance };
    }).filter(item => item !== null);

    entitiesWithDistance.sort((a, b) => a.distance - b.distance);

    // Keep only nearby entities and recent ones
    const toKeep = new Set();
    entitiesWithDistance.forEach((item, index) => {
        if (item.distance < maxDistance || index < keepRecent) {
            toKeep.add(item.entity);
        }
    });

    // Remove distant entities
    entities.forEach(entity => {
        if (!toKeep.has(entity)) {
            entitiesToRemove.push(entity);
        }
    });

    entitiesToRemove.forEach(entity => {
        viewer.entities.remove(entity);
    });

    return entitiesToRemove.length;
}

/**
 * Monitor memory usage and performance
 * @param {Viewer} viewer - Cesium viewer instance
 * @returns {Object} Memory statistics
 */
export function monitorMemoryUsage(viewer) {
    const stats = {
        entityCount: viewer.entities.values.length,
        dataSourceCount: viewer.dataSources.length,
        primitiveCount: viewer.scene.primitives.length,
    };

    // Get total entity count from all data sources
    let totalDataSourceEntities = 0;
    for (let i = 0; i < viewer.dataSources.length; i++) {
        const dataSource = viewer.dataSources.get(i);
        totalDataSourceEntities += dataSource.entities.values.length;
    }
    stats.dataSourceEntities = totalDataSourceEntities;

    // Browser memory API (if available)
    if (performance.memory) {
        stats.jsHeapSize = performance.memory.usedJSHeapSize;
        stats.jsHeapSizeLimit = performance.memory.jsHeapSizeLimit;
        stats.memoryUsagePercent = (stats.jsHeapSize / stats.jsHeapSizeLimit) * 100;
    }

    return stats;
}

/**
 * Optimize entity cache by limiting total entities
 * @param {Viewer} viewer - Cesium viewer instance
 * @param {number} maxEntities - Maximum number of entities to keep
 */
export function optimizeEntityCache(viewer, maxEntities = 10000) {
    const entities = viewer.entities.values;

    if (entities.length <= maxEntities) {
        return 0;
    }

    const cameraPosition = viewer.camera.position;

    // Calculate distance for each entity
    const entitiesWithDistance = entities.map(entity => {
        if (!entity.position) {
            return { entity, distance: Infinity };
        }

        const position = entity.position.getValue(viewer.clock.currentTime);
        if (!position) {
            return { entity, distance: Infinity };
        }

        const distance = Cartesian3.distance(cameraPosition, position);
        return { entity, distance };
    });

    // Sort by distance and keep only closest entities
    entitiesWithDistance.sort((a, b) => a.distance - b.distance);

    const toRemove = entitiesWithDistance.slice(maxEntities);
    toRemove.forEach(item => {
        viewer.entities.remove(item.entity);
    });

    return toRemove.length;
}

// ============================================================================
// Performance Monitoring
// ============================================================================

/**
 * Track frames per second
 * @param {Function} callback - Called with FPS value
 * @returns {Object} FPS tracker controller
 */
export function trackFPS(callback) {
    let lastTime = performance.now();
    let frames = 0;
    let fps = 0;
    let animationId = null;

    function update() {
        frames++;
        const currentTime = performance.now();
        const delta = currentTime - lastTime;

        if (delta >= 1000) {
            fps = Math.round((frames * 1000) / delta);
            callback(fps);
            frames = 0;
            lastTime = currentTime;
        }

        animationId = requestAnimationFrame(update);
    }

    return {
        start() {
            lastTime = performance.now();
            frames = 0;
            update();
        },

        stop() {
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        },

        getCurrentFPS() {
            return fps;
        },
    };
}

/**
 * Measure render time for the scene
 * @param {Viewer} viewer - Cesium viewer instance
 * @returns {number} Render time in milliseconds
 */
export function measureRenderTime(viewer) {
    const startTime = performance.now();
    viewer.scene.render();
    const endTime = performance.now();
    return endTime - startTime;
}

/**
 * Get comprehensive performance metrics
 * @param {Viewer} viewer - Cesium viewer instance
 * @returns {Object} Performance metrics
 */
export function getPerformanceMetrics(viewer) {
    const memory = monitorMemoryUsage(viewer);

    const metrics = {
        ...memory,
        cameraHeight: viewer.camera.positionCartographic.height,
        frameRate: viewer.scene.frameState?.frameNumber || 0,
    };

    // Scene statistics
    if (viewer.scene.debugShowFramesPerSecond) {
        metrics.fps = viewer.scene.frameState?.fps || 0;
    }

    return metrics;
}

/**
 * Create a performance monitor that logs metrics periodically
 * @param {Viewer} viewer - Cesium viewer instance
 * @param {Object} options - Monitor options
 * @returns {Object} Monitor controller
 */
export function createPerformanceMonitor(viewer, options = {}) {
    const {
        interval = 5000, // 5 seconds
        onUpdate = null,
        logToConsole = false,
    } = options;

    let intervalId = null;
    const history = [];

    const controller = {
        start() {
            intervalId = setInterval(() => {
                const metrics = getPerformanceMetrics(viewer);
                history.push({
                    timestamp: Date.now(),
                    ...metrics,
                });

                // Keep only last 100 entries
                if (history.length > 100) {
                    history.shift();
                }

                if (logToConsole) {
                    console.log('Performance Metrics:', metrics);
                }

                if (onUpdate) {
                    onUpdate(metrics);
                }
            }, interval);
        },

        stop() {
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
        },

        getHistory() {
            return [...history];
        },

        getAverages() {
            if (history.length === 0) return null;

            const avg = {
                entityCount: 0,
                cameraHeight: 0,
                memoryUsagePercent: 0,
            };

            history.forEach(entry => {
                avg.entityCount += entry.entityCount;
                avg.cameraHeight += entry.cameraHeight;
                if (entry.memoryUsagePercent) {
                    avg.memoryUsagePercent += entry.memoryUsagePercent;
                }
            });

            const count = history.length;
            avg.entityCount = Math.round(avg.entityCount / count);
            avg.cameraHeight = Math.round(avg.cameraHeight / count);
            avg.memoryUsagePercent = Math.round(avg.memoryUsagePercent / count);

            return avg;
        },
    };

    return controller;
}

export default {
    setupLODSystem,
    updateLOD,
    createClusterSystem,
    updateClusters,
    createLazyLoader,
    cleanupUnusedEntities,
    monitorMemoryUsage,
    optimizeEntityCache,
    trackFPS,
    measureRenderTime,
    getPerformanceMetrics,
    createPerformanceMonitor,
};
