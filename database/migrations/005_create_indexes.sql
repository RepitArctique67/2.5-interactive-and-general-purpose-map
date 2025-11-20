-- Additional performance optimization indexes
-- This migration adds specialized indexes for common query patterns

-- Partial index for active layers only (most common query)
CREATE INDEX idx_layers_active ON layers(id) WHERE is_active = true;

-- Partial index for historical layers
CREATE INDEX idx_layers_historical ON layers(id) WHERE is_historical = true;

-- Composite index for layer filtering by type and category
CREATE INDEX idx_layers_type_category ON layers(type, category);

-- Index for year range queries on layers
CREATE INDEX idx_layers_year_range ON layers(min_year, max_year) WHERE is_historical = true;

-- Partial index for currently valid geo_features (most common query)
CREATE INDEX idx_geo_features_current ON geo_features(layer_id, geometry) 
    WHERE valid_to IS NULL 
    USING GIST;

-- Partial index for historical geo_features
CREATE INDEX idx_geo_features_historical ON geo_features(layer_id, valid_from, valid_to, geometry) 
    WHERE valid_to IS NOT NULL 
    USING GIST;

-- Index for finding features valid at a specific date
CREATE INDEX idx_geo_features_valid_at ON geo_features(layer_id, valid_from, valid_to) 
    WHERE valid_from IS NOT NULL;

-- Composite index for spatial + temporal queries (common pattern)
CREATE INDEX idx_geo_features_spatial_temporal ON geo_features 
    USING GIST(geometry, layer_id, valid_from, valid_to);

-- Index for recent timeline events (last 100 years)
CREATE INDEX idx_timeline_recent ON timeline_events(event_date DESC) 
    WHERE event_date >= '1924-01-01';

-- Index for important events only
CREATE INDEX idx_timeline_important ON timeline_events(event_date, importance) 
    WHERE importance >= 7;

-- Spatial index for events with location
CREATE INDEX idx_timeline_located ON timeline_events USING GIST(location) 
    WHERE location IS NOT NULL;

-- Index for active users
CREATE INDEX idx_users_active_login ON users(last_login_at DESC) 
    WHERE is_active = true;

-- Index for contributors and admins
CREATE INDEX idx_users_elevated ON users(role, id) 
    WHERE role IN ('contributor', 'admin');

-- Index for recent contributions
CREATE INDEX idx_contributions_recent ON user_contributions(created_at DESC) 
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';

-- Composite index for contribution review workflow
CREATE INDEX idx_contributions_review ON user_contributions(status, created_at) 
    WHERE status = 'pending';

-- Add statistics collection for query optimization
ANALYZE layers;
ANALYZE geo_features;
ANALYZE timeline_events;
ANALYZE users;
ANALYZE user_contributions;

-- Comments
COMMENT ON INDEX idx_layers_active IS 'Partial index for active layers only';
COMMENT ON INDEX idx_geo_features_current IS 'Partial index for currently valid features';
COMMENT ON INDEX idx_geo_features_spatial_temporal IS 'Composite GIST index for spatial + temporal queries';
COMMENT ON INDEX idx_timeline_important IS 'Index for filtering important historical events';
COMMENT ON INDEX idx_contributions_review IS 'Index for pending contribution review workflow';
