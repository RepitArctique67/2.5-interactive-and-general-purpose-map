const { sequelize } = require('../config/sequelize');
const logger = require('./logger');

/**
 * Query Optimizer
 * Utilities for analyzing and optimizing database queries
 */
class QueryOptimizer {
    /**
     * Analyze a query execution plan
     * @param {String} query - SQL query
     * @param {Array} replacements - Query parameters
     * @returns {Object} Analysis result
     */
    async analyzeQuery(query, replacements = []) {
        try {
            const explainQuery = `EXPLAIN (ANALYZE, FORMAT JSON) ${query}`;
            const result = await sequelize.query(explainQuery, {
                replacements,
                type: sequelize.QueryTypes.SELECT,
            });

            const plan = result[0]['QUERY PLAN'][0]['Plan'];
            return this.parsePlan(plan);
        } catch (error) {
            logger.error('Error analyzing query:', error);
            throw error;
        }
    }

    /**
     * Parse query plan to find potential issues
     */
    parsePlan(plan) {
        const issues = [];

        const traverse = (node) => {
            // Check for sequential scans on large tables
            if (node['Node Type'] === 'Seq Scan') {
                if (node['Total Cost'] > 1000) { // Arbitrary threshold
                    issues.push({
                        type: 'High Cost Seq Scan',
                        table: node['Relation Name'],
                        cost: node['Total Cost'],
                        suggestion: 'Consider adding an index on the filter columns',
                    });
                }
            }

            // Check for nested loops with high cost
            if (node['Node Type'] === 'Nested Loop' && node['Total Cost'] > 5000) {
                issues.push({
                    type: 'Expensive Nested Loop',
                    cost: node['Total Cost'],
                    suggestion: 'Check join conditions or consider hash join',
                });
            }

            if (node['Plans']) {
                node['Plans'].forEach(traverse);
            }
        };

        traverse(plan);

        return {
            executionTime: plan['Actual Total Time'],
            totalCost: plan['Total Cost'],
            issues,
            rawPlan: plan,
        };
    }

    /**
     * Refresh materialized views
     */
    async refreshViews() {
        try {
            logger.info('Refreshing materialized views...');
            await sequelize.query('SELECT refresh_materialized_views()');
            logger.info('Materialized views refreshed successfully');
        } catch (error) {
            logger.error('Error refreshing views:', error);
            throw error;
        }
    }

    /**
     * Vacuum analyze tables
     * @param {Array} tables - List of tables to analyze
     */
    async analyzeTables(tables = ['geo_features', 'timeline_events', 'layers']) {
        try {
            for (const table of tables) {
                logger.info(`Analyzing table ${table}...`);
                await sequelize.query(`ANALYZE ${table}`);
            }
            logger.info('Tables analyzed successfully');
        } catch (error) {
            logger.error('Error analyzing tables:', error);
            throw error;
        }
    }
}

module.exports = new QueryOptimizer();
