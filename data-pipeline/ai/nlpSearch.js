const OpenAI = require('openai');
const logger = require('../utils/logger');

/**
 * Natural Language Search Service
 * Interprets natural language queries to search for map data
 */
class NLPSearch {
    constructor(config = {}) {
        this.config = config;
        this.apiKey = process.env.OPENAI_API_KEY;

        if (this.apiKey) {
            this.openai = new OpenAI({ apiKey: this.apiKey });
        } else {
            logger.warn('[NLPSearch] No OpenAI API key found. Using fallback keyword search.');
        }
    }

    /**
     * Process a natural language query
     * @param {String} query - User query (e.g., "Show me all castles in France built before 1500")
     * @returns {Object} Structured search parameters
     */
    async processQuery(query) {
        try {
            if (this.openai) {
                return await this.processWithOpenAI(query);
            } else {
                return this.processWithFallback(query);
            }
        } catch (error) {
            logger.error(`[NLPSearch] Query processing failed:`, error);
            return this.processWithFallback(query);
        }
    }

    /**
     * Process query using OpenAI GPT
     */
    async processWithOpenAI(query) {
        const completion = await this.openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `You are a map search assistant. Convert the user's natural language query into a structured JSON object with the following fields:
          - type: feature type (e.g., 'building', 'road', 'city', 'poi')
          - location: geographic scope (e.g., 'France', 'Paris')
          - timeRange: { start: year, end: year }
          - filters: key-value pairs for other attributes
          
          Return ONLY the JSON object.`
                },
                {
                    role: "user",
                    content: query
                }
            ],
            temperature: 0,
        });

        const content = completion.choices[0].message.content;
        try {
            return JSON.parse(content);
        } catch (e) {
            logger.warn('[NLPSearch] Failed to parse OpenAI response as JSON');
            return this.processWithFallback(query);
        }
    }

    /**
     * Fallback processing using regex/keywords
     */
    processWithFallback(query) {
        const result = {
            originalQuery: query,
            filters: {}
        };

        const lowerQuery = query.toLowerCase();

        // Extract years
        const yearMatch = lowerQuery.match(/(\d{4})/g);
        if (yearMatch) {
            if (yearMatch.length === 1) {
                result.timeRange = { start: parseInt(yearMatch[0]), end: parseInt(yearMatch[0]) };
            } else {
                result.timeRange = { start: Math.min(...yearMatch), end: Math.max(...yearMatch) };
            }
        }

        // Extract common types
        const types = ['building', 'road', 'city', 'river', 'park', 'castle', 'church'];
        for (const type of types) {
            if (lowerQuery.includes(type)) {
                result.type = type;
                break;
            }
        }

        return result;
    }
}

module.exports = NLPSearch;
