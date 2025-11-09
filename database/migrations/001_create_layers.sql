CREATE TABLE IF NOT EXISTS layers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    source_url TEXT,
    is_active BOOLEAN DEFAULT true,
    is_historical BOOLEAN DEFAULT false,
    min_year INT,
    max_year INT,
    zoom_min INT DEFAULT 0,
    zoom_max INT DEFAULT 22,
    opacity FLOAT DEFAULT 1.0,
    config JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_layers_type ON layers(type);
CREATE INDEX idx_layers_category ON layers(category);

-- Insert sample data
INSERT INTO layers (name, type, category, is_active, config) VALUES
('OpenStreetMap', 'base', 'cartographic', true, '{"url": "https://a.tile.openstreetmap.org/"}'),
('Relief / Terrain', 'terrain', 'topographic', true, '{}'),
('Images Satellite', 'imagery', 'imagery', false, '{"assetId": 2}'),
('Frontières', 'data', 'administrative', false, '{}'),
('Données climatiques', 'data', 'climate', false, '{}');