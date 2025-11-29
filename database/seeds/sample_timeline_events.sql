-- Sample Timeline Events

INSERT INTO timeline_events (title, description, event_date, event_type, location, related_layer_id, importance, metadata)
VALUES
-- Historical Events
(
    'French Revolution',
    'A period of radical political and societal change in France.',
    '1789-07-14',
    'political',
    ST_SetSRID(ST_MakePoint(2.3690, 48.8530), 4326), -- Bastille
    (SELECT id FROM layers WHERE is_historical = true LIMIT 1),
    10,
    '{"participants": ["Louis XVI", "Robespierre"], "outcome": "Republic"}'
),
(
    'Moon Landing',
    'Apollo 11 mission lands the first humans on the Moon.',
    '1969-07-20',
    'scientific',
    ST_SetSRID(ST_MakePoint(-80.6041, 28.6083), 4326), -- Kennedy Space Center
    (SELECT id FROM layers WHERE category = 'imagery' LIMIT 1),
    10,
    '{"astronauts": ["Neil Armstrong", "Buzz Aldrin"], "spacecraft": "Apollo 11"}'
),
(
    'Fall of Berlin Wall',
    'The guarding of the Berlin Wall was relinquished.',
    '1989-11-09',
    'political',
    ST_SetSRID(ST_MakePoint(13.4050, 52.5200), 4326), -- Berlin
    (SELECT id FROM layers WHERE is_historical = true LIMIT 1),
    9,
    '{"significance": "End of Cold War symbol"}'
),
-- Natural Events
(
    'Krakatoa Eruption',
    'Massive volcanic eruption in Indonesia.',
    '1883-08-27',
    'natural',
    ST_SetSRID(ST_MakePoint(105.4230, -6.1020), 4326),
    (SELECT id FROM layers WHERE category = 'topographic' LIMIT 1),
    8,
    '{"vei": 6, "casualties": 36000}'
),
-- Cultural Events
(
    'Woodstock Festival',
    'Music festival attracting an audience of more than 400,000.',
    '1969-08-15',
    'cultural',
    ST_SetSRID(ST_MakePoint(-74.8818, 41.7013), 4326), -- Bethel, NY
    (SELECT id FROM layers WHERE type = 'base' LIMIT 1),
    7,
    '{"performers": ["Jimi Hendrix", "Janis Joplin"], "attendance": 400000}'
);
