-- Table Partitioning Strategy
-- Note: In PostgreSQL, converting an existing table to a partitioned table is complex.
-- This migration assumes we are setting up partitioning for *future* large tables or 
-- creating new partitioned tables and migrating data.
-- For this project, we will demonstrate partitioning on a new table 'audit_logs' 
-- and show how 'geo_features' could be partitioned if it were created from scratch.

-- 1. Create a partitioned table for Audit Logs (Range Partitioning by Date)
-- This is useful for keeping logs for a certain period and dropping old partitions easily.
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL,
    user_id INT,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    details JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    PRIMARY KEY (id, created_at) -- Partition key must be part of primary key
) PARTITION BY RANGE (created_at);

-- Create partitions for the next 12 months
CREATE TABLE audit_logs_y2025m01 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE audit_logs_y2025m02 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
CREATE TABLE audit_logs_y2025m03 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');
-- ... and so on. In production, use pg_partman to automate this.

-- Create index on the partitioned table
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- 2. (Optional) Example of List Partitioning for GeoFeatures by Layer Type
-- This would require creating a new table and migrating data, so we'll just define the structure
-- for reference or future migration.

/*
CREATE TABLE geo_features_partitioned (
    id SERIAL,
    layer_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    geometry GEOMETRY(Geometry, 4326) NOT NULL,
    properties JSONB DEFAULT '{}',
    valid_from DATE,
    valid_to DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id, type)
) PARTITION BY LIST (type);

CREATE TABLE geo_features_point PARTITION OF geo_features_partitioned FOR VALUES IN ('point', 'multipoint');
CREATE TABLE geo_features_line PARTITION OF geo_features_partitioned FOR VALUES IN ('line', 'multiline');
CREATE TABLE geo_features_polygon PARTITION OF geo_features_partitioned FOR VALUES IN ('polygon', 'multipolygon');
*/

-- 3. Function to automatically create partitions for audit_logs
CREATE OR REPLACE FUNCTION create_audit_partition_if_not_exists()
RETURNS TRIGGER AS $$
DECLARE
    partition_date TEXT;
    partition_name TEXT;
    start_date TEXT;
    end_date TEXT;
BEGIN
    partition_date := to_char(NEW.created_at, 'YYYYMM');
    partition_name := 'audit_logs_y' || to_char(NEW.created_at, 'YYYY') || 'm' || to_char(NEW.created_at, 'MM');
    start_date := to_char(NEW.created_at, 'YYYY-MM-01');
    end_date := to_char(NEW.created_at + INTERVAL '1 month', 'YYYY-MM-01');

    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = partition_name) THEN
        EXECUTE format('CREATE TABLE %I PARTITION OF audit_logs FOR VALUES FROM (%L) TO (%L)', 
            partition_name, start_date, end_date);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: Triggers on partitioned tables for auto-creation is tricky in PG < 13.
-- Better to use a scheduled job or pg_partman.
-- For now, we stick to pre-created partitions.

COMMENT ON TABLE audit_logs IS 'Partitioned table for system audit logs';
