exports.mockLayers = [
    {
        id: 1,
        name: 'OpenStreetMap',
        type: 'base',
        category: 'cartographic',
        description: 'Base map from OpenStreetMap',
        is_active: true,
        is_historical: false,
        opacity: 1.0,
        config: {
            url: 'https://a.tile.openstreetmap.org/',
            attribution: '© OpenStreetMap contributors'
        }
    },
    {
        id: 2,
        name: 'Historical Borders 1900',
        type: 'data',
        category: 'administrative',
        description: 'World borders in 1900',
        is_active: true,
        is_historical: true,
        min_year: 1900,
        max_year: 1900,
        opacity: 0.8,
        config: {
            color: '#ff0000'
        }
    }
];
