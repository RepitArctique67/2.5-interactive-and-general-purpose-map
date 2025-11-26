/**
 * Utility for data synchronization and offline support
 */

const STORAGE_PREFIX = 'app_sync_';

export const syncUtils = {
    /**
     * Save data to local storage with timestamp
     * @param {string} key 
     * @param {any} data 
     */
    saveLocal(key, data) {
        try {
            const payload = {
                data,
                timestamp: Date.now(),
                version: 1
            };
            localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(payload));
        } catch (e) {
            console.error('Error saving to local storage', e);
        }
    },

    /**
     * Load data from local storage
     * @param {string} key 
     * @returns {any} data or null
     */
    loadLocal(key) {
        try {
            const item = localStorage.getItem(STORAGE_PREFIX + key);
            if (!item) return null;

            const payload = JSON.parse(item);
            return payload.data;
        } catch (e) {
            console.error('Error loading from local storage', e);
            return null;
        }
    },

    /**
     * Add action to offline queue
     * @param {Object} action { type, payload, id }
     */
    queueOfflineAction(action) {
        const queue = this.loadLocal('offline_queue') || [];
        queue.push({ ...action, timestamp: Date.now() });
        this.saveLocal('offline_queue', queue);
    },

    /**
     * Get and clear offline queue
     * @returns {Array} queue
     */
    getOfflineQueue() {
        const queue = this.loadLocal('offline_queue') || [];
        this.saveLocal('offline_queue', []);
        return queue;
    },

    /**
     * Check if online
     * @returns {boolean}
     */
    isOnline() {
        return navigator.onLine;
    }
};

export default syncUtils;
