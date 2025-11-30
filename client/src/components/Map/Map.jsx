import React, { useRef, useMemo } from 'react';
import Map, { Source, Layer, NavigationControl, ScaleControl, FullscreenControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useMap } from '../../hooks/useMap';
import Spinner from '../shared/Spinner';

const MapView = ({ layers = [], isLoading = false }) => {
    const mapRef = useRef(null);
    const { setMapInstance } = useMap();

    // Initial view state
    const initialViewState = {
        longitude: 0,
        latitude: 20,
        zoom: 2,
        pitch: 0, // 2D view by default, can be tilted
        bearing: 0
    };

    // Filter visible layers
    const visibleLayers = useMemo(() => {
        return layers.filter(l => l.visible);
    }, [layers]);

    // Handle map load
    const onMapLoad = (event) => {
        setMapInstance(event.target);
    };

    return (
        <div className="w-full h-full relative bg-slate-900">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-50 bg-slate-900/50 backdrop-blur-sm">
                    <Spinner size="xl" />
                    <span className="ml-3 text-white font-medium">Loading Map...</span>
                </div>
            )}

            <Map
                ref={mapRef}
                initialViewState={initialViewState}
                style={{ width: '100%', height: '100%' }}
                mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
                onLoad={onMapLoad}
                attributionControl={true}
            >
                {/* Controls */}
                <NavigationControl position="top-right" showCompass={true} showZoom={true} visualizePitch={true} />
                <ScaleControl position="bottom-right" />
                <FullscreenControl position="top-right" />

                {/* Layers */}
                {visibleLayers.map(layer => (
                    <Source
                        key={layer.id}
                        id={layer.id}
                        type={layer.type === 'geojson' ? 'geojson' : 'vector'}
                        data={layer.geojsonData} // Use geojsonData from useLayerData
                        url={layer.url}
                    >
                        <Layer
                            id={`${layer.id}-layer`}
                            type={layer.style?.type || 'fill'}
                            paint={{
                                'fill-color': layer.style?.color || '#3b82f6',
                                'fill-opacity': layer.opacity || 0.6,
                                'line-color': '#ffffff',
                                'line-width': 1,
                                'circle-radius': 6,
                                'circle-color': layer.style?.color || '#3b82f6'
                            }}
                            layout={{
                                visibility: 'visible'
                            }}
                        />
                        {/* 2.5D Extrusion for buildings if applicable */}
                        {layer.is3D && (
                            <Layer
                                id={`${layer.id}-extrusion`}
                                type="fill-extrusion"
                                paint={{
                                    'fill-extrusion-color': layer.style?.color || '#3b82f6',
                                    'fill-extrusion-height': ['get', 'height'],
                                    'fill-extrusion-base': ['get', 'min_height'],
                                    'fill-extrusion-opacity': layer.opacity || 0.8
                                }}
                            />
                        )}
                    </Source>
                ))}
            </Map>
        </div>
    );
};

export default MapView;
