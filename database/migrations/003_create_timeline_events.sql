-- Create timeline_events table for historical events
CREATE TABLE IF NOT EXISTS timeline_events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_type VARCHAR(50),  -- 'political', 'natural', 'cultural', 'economic', 'military', etc.
    location GEOMETRY(Point, 4326),  -- PostGIS point geometry for event location
    related_layer_id INT REFERENCES layers(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',  -- Additional event metadata
    image_url TEXT,  -- Optional image URL for the event
    source_url TEXT,  -- Source/reference URL
    importance INT DEFAULT 5,  -- Importance scale 1-10
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create spatial index on location
CREATE INDEX idx_timeline_location ON timeline_events USING GIST(location);

-- Create index on event_date for temporal queries
CREATE INDEX idx_timeline_date ON timeline_events(event_date);

-- Create index on event_type for filtering
CREATE INDEX idx_timeline_type ON timeline_events(event_type);

-- Create index on related_layer_id
CREATE INDEX idx_timeline_layer ON timeline_events(related_layer_id);

-- Create composite index for date range queries
CREATE INDEX idx_timeline_date_type ON timeline_events(event_date, event_type);

-- Create index on importance for filtering significant events
CREATE INDEX idx_timeline_importance ON timeline_events(importance DESC);

-- Create GIN index on metadata JSONB
CREATE INDEX idx_timeline_metadata ON timeline_events USING GIN(metadata);

-- Add trigger to automatically update updated_at timestamp
CREATE TRIGGER update_timeline_events_updated_at 
    BEFORE UPDATE ON timeline_events 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add constraint to ensure importance is between 1 and 10
ALTER TABLE timeline_events 
    ADD CONSTRAINT check_importance_range 
    CHECK (importance >= 1 AND importance <= 10);

-- Add comments
COMMENT ON TABLE timeline_events IS 'Stores historical events with temporal and spatial information';
COMMENT ON COLUMN timeline_events.location IS 'PostGIS point geometry for event location (SRID 4326)';
COMMENT ON COLUMN timeline_events.event_date IS 'Date when the event occurred';
COMMENT ON COLUMN timeline_events.importance IS 'Importance scale from 1 (minor) to 10 (major)';
COMMENT ON COLUMN timeline_events.metadata IS 'Additional event metadata in JSONB format';
