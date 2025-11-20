-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',  -- 'user', 'contributor', 'admin'
    is_active BOOLEAN DEFAULT true,
    preferences JSONB DEFAULT '{}',  -- User preferences (theme, default layers, etc.)
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);

-- Create indexes on users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true;

-- Create GIN index on preferences JSONB
CREATE INDEX idx_users_preferences ON users USING GIN(preferences);

-- Create user_contributions table for tracking user contributions
CREATE TABLE IF NOT EXISTS user_contributions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contribution_type VARCHAR(50) NOT NULL,  -- 'add_feature', 'edit_feature', 'add_layer', 'edit_layer', 'add_event'
    entity_type VARCHAR(50) NOT NULL,  -- 'geo_feature', 'layer', 'timeline_event'
    entity_id INT,  -- ID of the contributed entity
    data JSONB NOT NULL,  -- Contribution data
    status VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'approved', 'rejected'
    review_notes TEXT,  -- Notes from reviewer
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by INT REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes on user_contributions table
CREATE INDEX idx_contributions_user ON user_contributions(user_id);
CREATE INDEX idx_contributions_status ON user_contributions(status);
CREATE INDEX idx_contributions_type ON user_contributions(contribution_type);
CREATE INDEX idx_contributions_entity ON user_contributions(entity_type, entity_id);
CREATE INDEX idx_contributions_reviewer ON user_contributions(reviewed_by);

-- Create composite index for user's pending contributions
CREATE INDEX idx_contributions_user_status ON user_contributions(user_id, status);

-- Create GIN index on contribution data
CREATE INDEX idx_contributions_data ON user_contributions USING GIN(data);

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add constraint to ensure valid role
ALTER TABLE users 
    ADD CONSTRAINT check_user_role 
    CHECK (role IN ('user', 'contributor', 'admin'));

-- Add constraint to ensure valid contribution status
ALTER TABLE user_contributions 
    ADD CONSTRAINT check_contribution_status 
    CHECK (status IN ('pending', 'approved', 'rejected'));

-- Add constraint to ensure valid contribution type
ALTER TABLE user_contributions 
    ADD CONSTRAINT check_contribution_type 
    CHECK (contribution_type IN ('add_feature', 'edit_feature', 'delete_feature', 'add_layer', 'edit_layer', 'add_event', 'edit_event'));

-- Add constraint to ensure valid entity type
ALTER TABLE user_contributions 
    ADD CONSTRAINT check_entity_type 
    CHECK (entity_type IN ('geo_feature', 'layer', 'timeline_event'));

-- Add comments
COMMENT ON TABLE users IS 'User accounts with role-based access control';
COMMENT ON COLUMN users.role IS 'User role: user (read-only), contributor (can submit), admin (full access)';
COMMENT ON COLUMN users.preferences IS 'User preferences stored as JSONB';

COMMENT ON TABLE user_contributions IS 'Tracks user contributions with approval workflow';
COMMENT ON COLUMN user_contributions.status IS 'Contribution status: pending, approved, or rejected';
COMMENT ON COLUMN user_contributions.data IS 'Full contribution data in JSONB format';

-- Create view for pending contributions count by user
CREATE OR REPLACE VIEW user_contribution_stats AS
SELECT 
    u.id AS user_id,
    u.username,
    COUNT(CASE WHEN uc.status = 'pending' THEN 1 END) AS pending_count,
    COUNT(CASE WHEN uc.status = 'approved' THEN 1 END) AS approved_count,
    COUNT(CASE WHEN uc.status = 'rejected' THEN 1 END) AS rejected_count,
    COUNT(*) AS total_contributions
FROM users u
LEFT JOIN user_contributions uc ON u.id = uc.user_id
GROUP BY u.id, u.username;

COMMENT ON VIEW user_contribution_stats IS 'Aggregated contribution statistics per user';
