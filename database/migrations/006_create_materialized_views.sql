-- Create materialized view for layer statistics
-- This view aggregates statistics for each layer to avoid expensive count/area queries
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_layer_statistics AS
SELECT 
    l.id AS layer_id,
    l.name AS layer_name,
    l.type AS layer_type,
    COUNT(gf.id) AS feature_count,
    COUNT(DISTINCT gf.type) AS geometry_types_count,
    MIN(gf.valid_from) AS min_date,
    MAX(gf.valid_to) AS max_date,
    ST_Extent(gf.geometry) AS bbox,
    NOW() AS last_updated
FROM layers l
LEFT JOIN geo_features gf ON l.id = gf.layer_id
GROUP BY l.id, l.name, l.type;

-- Create index on the materialized view
CREATE UNIQUE INDEX idx_mv_layer_stats_id ON mv_layer_statistics(layer_id);

-- Create materialized view for timeline distribution
-- This view helps in rendering the timeline histogram without scanning the whole table
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_timeline_distribution AS
SELECT 
    DATE_TRUNC('year', event_date) AS year_bucket,
    event_type,
    COUNT(*) AS event_count,
    NOW() AS last_updated
FROM timeline_events
GROUP BY 1, 2
ORDER BY 1 DESC;

-- Create index on timeline distribution
CREATE INDEX idx_mv_timeline_dist_year ON mv_timeline_distribution(year_bucket);

-- Create materialized view for regional feature counts
-- Useful for "clustering" or showing density at low zoom levels
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_regional_counts AS
SELECT 
    l.id AS layer_id,
    -- Grid size approx 1 degree (approx 111km)
    FLOOR(ST_X(ST_Centroid(gf.geometry)::geometry)) AS grid_x,
    FLOOR(ST_Y(ST_Centroid(gf.geometry)::geometry)) AS grid_y,
    COUNT(*) AS count,
    NOW() AS last_updated
FROM layers l
JOIN geo_features gf ON l.id = gf.layer_id
GROUP BY 1, 2, 3;

-- Create index on regional counts
CREATE INDEX idx_mv_regional_counts_layer ON mv_regional_counts(layer_id);
CREATE INDEX idx_mv_regional_counts_grid ON mv_regional_counts(grid_x, grid_y);

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_layer_statistics;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_timeline_distribution;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_regional_counts;
END;
$$ LANGUAGE plpgsql;

-- Comment on views
COMMENT ON MATERIALIZED VIEW mv_layer_statistics IS 'Cached statistics for layers to improve dashboard performance';
COMMENT ON MATERIALIZED VIEW mv_timeline_distribution IS 'Cached histogram data for timeline visualization';
COMMENT ON MATERIALIZED VIEW mv_regional_counts IS 'Cached spatial density data for clustering';
