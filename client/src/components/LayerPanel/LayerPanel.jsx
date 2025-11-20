import React from 'react';
import './LayerPanel.css';

const LayerPanel = ({ layers, onLayerToggle, isLoading, error }) => {
    if (isLoading) {
        return (
            <div className="layer-panel">
                <div className="panel-header">
                    <h2>🗺️ Couches</h2>
                </div>
                <div className="panel-content">
                    <div className="loading">Chargement...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="layer-panel">
                <div className="panel-header">
                    <h2>🗺️ Couches</h2>
                </div>
                <div className="panel-content">
                    <div className="error">❌ {error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="layer-panel">
            <div className="panel-header">
                <h2>🗺️ Couches</h2>
                <span className="layer-count">{layers.length}</span>
            </div>
            <div className="panel-content">
                {layers.map((layer) => (
                    <div key={layer.id} className="layer-item">
                        <div className="layer-info">
                            <div className="layer-name">
                                {layer.name}
                                {layer.is_historical && <span className="badge">📅</span>}
                            </div>
                            <div className="layer-description">{layer.description}</div>
                            <div className="layer-meta">
                                <span className="layer-type">{layer.type}</span>
                                {layer.is_historical && (
                                    <span className="layer-years">
                                        {layer.min_year} - {layer.max_year}
                                    </span>
                                )}
                            </div>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={layer.is_active}
                                onChange={() => onLayerToggle(layer.id)}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LayerPanel;
