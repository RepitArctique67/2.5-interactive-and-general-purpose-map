import React, { useEffect, useRef } from 'react';
import { Viewer } from 'cesium';
import "cesium/Build/Cesium/Widgets/widgets.css";

const Globe = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current) {
            const viewer = new Viewer(containerRef.current, {
                terrainProvider: undefined, // Use default for now
                animation: true,
                timeline: true,
            });

            // Clean up on unmount
            return () => {
                if (viewer) {
                    viewer.destroy();
                }
            };
        }
    }, []);

    return (
        <div
            ref={containerRef}
            style={{ width: '100%', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}
        />
    );
};

export default Globe;
