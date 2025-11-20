-- Enable PostGIS extension if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create geo_features table for storing geospatial data
CREATE TABLE IF NOT EXISTS geo_features (
    id SERIAL PRIMARY KEY,
    layer_id INT NOT NULL REFERENCES layers(id) ON DELETE CASCADE,
    name VARCHAR(255),
    type VARCHAR(50) NOT NULL,  -- 'point', 'line', 'polygon', 'multipolygon'
    geometry GEOMETRY(Geometry, 4326) NOT NULL,  -- PostGIS geometry with SRID 4326 (WGS84)
    properties JSONB DEFAULT '{}',  -- Flexible attribute storage
    valid_from DATE,  -- Temporal validity start
    valid_to DATE,    -- Temporal validity end (NULL = still valid)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create spatial index using GIST for efficient spatial queries
CREATE INDEX idx_geo_features_geometry ON geo_features USING GIST(geometry);

-- Create index on layer_id for filtering by layer
CREATE INDEX idx_geo_features_layer ON geo_features(layer_id);

-- Create composite index on temporal validity for time-based queries
CREATE INDEX idx_geo_features_dates ON geo_features(valid_from, valid_to);

-- Create index on type for filtering by geometry type
CREATE INDEX idx_geo_features_type ON geo_features(type);

-- Create GIN index on properties JSONB for efficient property queries
CREATE INDEX idx_geo_features_properties ON geo_features USING GIN(properties);

-- Create composite index for common query pattern: layer + temporal filter
CREATE INDEX idx_geo_features_layer_dates ON geo_features(layer_id, valid_from, valid_to);

-- Add trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_geo_features_updated_at 
    BEFORE UPDATE ON geo_features 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add constraint to ensure valid_to is after valid_from
ALTER TABLE geo_features 
    ADD CONSTRAINT check_valid_dates 
    CHECK (valid_to IS NULL OR valid_to >= valid_from);

-- Add comment on table
COMMENT ON TABLE geo_features IS 'Stores geospatial features with PostGIS geometry and temporal validity';
COMMENT ON COLUMN geo_features.geometry IS 'PostGIS geometry column with SRID 4326 (WGS84)';
COMMENT ON COLUMN geo_features.properties IS 'JSONB storage for flexible feature attributes';
COMMENT ON COLUMN geo_features.valid_from IS 'Start date of temporal validity';
COMMENT ON COLUMN geo_features.valid_to IS 'End date of temporal validity (NULL = currently valid)';
