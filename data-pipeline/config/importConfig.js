/**
 * Import Configuration
 * Defines data sources and import rules
 */
module.exports = {
    sources: {
        osm: {
            name: 'OpenStreetMap',
            type: 'osm_xml',
            defaultLayer: 'base_map',
            updateFrequency: 'weekly',
        },
        natural_earth: {
            name: 'Natural Earth',
            type: 'shapefile',
            collections: [
                {
                    name: 'Countries',
                    file: 'ne_10m_admin_0_countries.shp',
                    layer: 'administrative',
                    scale: '1:10m',
                },
                {
                    name: 'Populated Places',
                    file: 'ne_10m_populated_places.shp',
                    layer: 'cities',
                    scale: '1:10m',
                },
                {
                    name: 'Rivers',
                    file: 'ne_10m_rivers_lake_centerlines.shp',
                    layer: 'water',
                    scale: '1:10m',
                }
            ]
        },
        custom: {
            name: 'Custom GeoJSON',
            type: 'geojson',
        }
    },

    defaults: {
        srid: 4326,
        batchSize: 500,
        concurrency: 2,
    },

    validation: {
        enforceGeometry: true,
        fixOrientation: true, // Fix polygon ring orientation
    }
};
