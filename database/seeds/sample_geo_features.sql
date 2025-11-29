-- Sample Geo Features
-- Paris Coordinates: 2.3522, 48.8566

INSERT INTO geo_features (layer_id, name, type, geometry, properties, valid_from, valid_to) 
VALUES 
-- Paris (Point)
(
    (SELECT id FROM layers WHERE type = 'base' LIMIT 1),
    'Paris',
    'point',
    ST_SetSRID(ST_MakePoint(2.3522, 48.8566), 4326),
    '{"population": 2148000, "country": "France", "capital": true}',
    '1800-01-01',
    NULL
),
-- London (Point)
(
    (SELECT id FROM layers WHERE type = 'base' LIMIT 1),
    'London',
    'point',
    ST_SetSRID(ST_MakePoint(-0.1276, 51.5074), 4326),
    '{"population": 8982000, "country": "UK", "capital": true}',
    '1800-01-01',
    NULL
),
-- New York (Point)
(
    (SELECT id FROM layers WHERE type = 'base' LIMIT 1),
    'New York',
    'point',
    ST_SetSRID(ST_MakePoint(-74.0060, 40.7128), 4326),
    '{"population": 8468000, "country": "USA", "capital": false}',
    '1624-01-01',
    NULL
),
-- Seine River (LineString - Simplified)
(
    (SELECT id FROM layers WHERE category = 'topographic' LIMIT 1),
    'Seine',
    'line',
    ST_SetSRID(ST_GeomFromText('LINESTRING(2.3522 48.8566, 2.3200 48.8600, 2.2900 48.8500)'), 4326),
    '{"length_km": 777, "type": "river"}',
    NULL,
    NULL
),
-- Central Park (Polygon - Simplified)
(
    (SELECT id FROM layers WHERE type = 'base' LIMIT 1),
    'Central Park',
    'polygon',
    ST_SetSRID(ST_GeomFromText('POLYGON((-73.981 40.768, -73.958 40.800, -73.949 40.796, -73.973 40.764, -73.981 40.768))'), 4326),
    '{"area_acres": 843, "type": "park"}',
    '1857-01-01',
    NULL
);
