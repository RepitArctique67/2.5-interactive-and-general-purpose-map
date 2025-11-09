const pool = require('../config/database');

const { mockLayers } = require('../utils/mockData');
const logger = require('../utils/logger');

class Layer {
    static async findAll(filters = {}) {
        try {
            let query = 'SELECT * FROM layers WHERE 1=1';
            const params = [];
            let paramIndex = 1;

            if (filters.type) {
                query += ` AND type = $${paramIndex}`;
                params.push(filters.type);
                paramIndex++;
            }

            if (filters.category) {
                query += ` AND category = $${paramIndex}`;
                params.push(filters.category);
                paramIndex++;
            }

            if (filters.is_historical !== undefined) {
                query += ` AND is_historical = $${paramIndex}`;
                params.push(filters.is_historical);
                paramIndex++;
            }

            if (filters.is_active !== undefined) {
                query += ` AND is_active = $${paramIndex}`;
                params.push(filters.is_active);
                paramIndex++;
            }

            query += ' ORDER BY id ASC';

            const result = await pool.query(query, params);
            return result.rows;
        } catch (error) {
            logger.warn('⚠️ Database error in Layer.findAll, returning mock data:', error.message);
            return mockLayers;
        }
    }

    static async findById(id) {
        const query = 'SELECT * FROM layers WHERE id = $1';
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    static async create(layerData) {
        const query = `
      INSERT INTO layers (
        name, type, category, description, source_url,
        is_active, is_historical, min_year, max_year,
        zoom_min, zoom_max, opacity, config, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;

        const values = [
            layerData.name,
            layerData.type,
            layerData.category || null,
            layerData.description || null,
            layerData.source_url || null,
            layerData.is_active !== undefined ? layerData.is_active : true,
            layerData.is_historical || false,
            layerData.min_year || null,
            layerData.max_year || null,
            layerData.zoom_min || 0,
            layerData.zoom_max || 22,
            layerData.opacity || 1.0,
            JSON.stringify(layerData.config || {}),
            JSON.stringify(layerData.metadata || {})
        ];

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async update(id, layerData) {
        const fields = [];
        const values = [];
        let paramIndex = 1;

        Object.keys(layerData).forEach(key => {
            if (layerData[key] !== undefined && key !== 'id') {
                fields.push(`${key} = $${paramIndex}`);
                values.push(
                    (key === 'config' || key === 'metadata')
                        ? JSON.stringify(layerData[key])
                        : layerData[key]
                );
                paramIndex++;
            }
        });

        if (fields.length === 0) {
            throw new Error('Aucune donnée à mettre à jour');
        }

        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        const query = `
      UPDATE layers 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async delete(id) {
        const query = 'DELETE FROM layers WHERE id = $1 RETURNING id';
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    static async getFeatureCount(layerId) {
        const query = 'SELECT COUNT(*) FROM geo_features WHERE layer_id = $1';
        const result = await pool.query(query, [layerId]);
        return parseInt(result.rows[0].count);
    }
}

module.exports = Layer;
