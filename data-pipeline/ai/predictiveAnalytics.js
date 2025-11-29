const ss = require('simple-statistics');
const logger = require('../utils/logger');

/**
 * Predictive Analytics Service
 * Performs trend analysis and forecasting on time-series data
 */
class PredictiveAnalytics {
    constructor(config = {}) {
        this.config = config;
    }

    /**
     * Analyze trends in time-series data
     * @param {Array} data - Array of { date, value } objects
     * @returns {Object} Analysis result
     */
    analyzeTrends(data) {
        try {
            if (!data || data.length < 2) {
                throw new Error('Insufficient data for analysis');
            }

            // Sort by date
            const sorted = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
            const values = sorted.map(d => d.value);

            // Calculate basic stats
            const mean = ss.mean(values);
            const min = ss.min(values);
            const max = ss.max(values);
            const stdDev = ss.standardDeviation(values);

            // Linear Regression
            // Map dates to timestamps (x) and values to (y)
            const points = sorted.map(d => [new Date(d.date).getTime(), d.value]);
            const regression = ss.linearRegression(points);
            const regressionLine = ss.linearRegressionLine(regression);

            // Determine trend direction
            const trend = regression.m > 0 ? 'increasing' : regression.m < 0 ? 'decreasing' : 'stable';

            return {
                stats: { mean, min, max, stdDev },
                trend: {
                    direction: trend,
                    slope: regression.m,
                    intercept: regression.b,
                    rSquared: ss.rSquared(points, regressionLine)
                }
            };
        } catch (error) {
            logger.error(`[PredictiveAnalytics] Trend analysis failed:`, error);
            throw error;
        }
    }

    /**
     * Forecast future values
     * @param {Array} data - Array of { date, value } objects
     * @param {Number} periods - Number of periods to forecast
     * @param {String} interval - 'day', 'month', 'year'
     * @returns {Array} Forecasted values
     */
    forecast(data, periods = 7, interval = 'day') {
        try {
            const analysis = this.analyzeTrends(data);
            const { slope, intercept } = analysis.trend;

            const lastDate = new Date(data[data.length - 1].date);
            const forecast = [];

            for (let i = 1; i <= periods; i++) {
                const nextDate = new Date(lastDate);
                if (interval === 'day') nextDate.setDate(nextDate.getDate() + i);
                if (interval === 'month') nextDate.setMonth(nextDate.getMonth() + i);
                if (interval === 'year') nextDate.setFullYear(nextDate.getFullYear() + i);

                const timestamp = nextDate.getTime();
                const predictedValue = (slope * timestamp) + intercept;

                forecast.push({
                    date: nextDate.toISOString(),
                    value: predictedValue,
                    type: 'forecast'
                });
            }

            return forecast;
        } catch (error) {
            logger.error(`[PredictiveAnalytics] Forecasting failed:`, error);
            throw error;
        }
    }
}

module.exports = PredictiveAnalytics;
