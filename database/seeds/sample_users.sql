-- Sample Users
-- Passwords are 'password123' hashed with bcrypt (cost 10)

INSERT INTO users (username, email, password_hash, role, is_active, preferences)
VALUES
(
    'admin',
    'admin@example.com',
    '$2a$10$x.z.y.z.y.z.y.z.y.z.y.z.y.z.y.z.y.z.y.z.y.z.y.z.y.z', -- Placeholder hash
    'admin',
    true,
    '{"theme": "dark", "notifications": true}'
),
(
    'contributor',
    'contributor@example.com',
    '$2a$10$x.z.y.z.y.z.y.z.y.z.y.z.y.z.y.z.y.z.y.z.y.z.y.z.y.z', -- Placeholder hash
    'contributor',
    true,
    '{"theme": "light", "default_layer": 1}'
),
(
    'user',
    'user@example.com',
    '$2a$10$x.z.y.z.y.z.y.z.y.z.y.z.y.z.y.z.y.z.y.z.y.z.y.z.y.z', -- Placeholder hash
    'user',
    true,
    '{}'
);

-- Note: In a real environment, use proper bcrypt hashes. 
-- The hash above is invalid and just for illustration.
-- The application code handles hashing on creation.
