CREATE TABLE pipeline_jobs (
    id SERIAL PRIMARY KEY,
    job_type VARCHAR(50) NOT NULL,
    source VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending',
    progress INT DEFAULT 0,
    total_items INT,
    processed_items INT DEFAULT 0,
    error_message TEXT,
    metadata JSONB,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE data_sources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL,
    config JSONB NOT NULL,
    last_update TIMESTAMP,
    update_frequency VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE data_quality_metrics (
    id SERIAL PRIMARY KEY,
    layer_id INT, -- Can be null for global metrics
    completeness_score FLOAT,
    accuracy_score FLOAT,
    consistency_score FLOAT,
    timeliness_score FLOAT,
    overall_score FLOAT,
    issues JSONB,
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
