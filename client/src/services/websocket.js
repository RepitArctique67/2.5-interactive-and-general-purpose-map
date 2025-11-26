import useLayerStore from '../store/layerStore';
import useTimelineStore from '../store/timelineStore';

class WebSocketService {
    constructor() {
        this.socket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectInterval = 3000;
        this.listeners = new Map();
    }

    connect() {
        const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

        this.socket = new WebSocket(WS_URL);

        this.socket.onopen = () => {
            console.log('WebSocket connected');
            this.reconnectAttempts = 0;
        };

        this.socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        this.socket.onclose = () => {
            console.log('WebSocket disconnected');
            this.attemptReconnect();
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            setTimeout(() => this.connect(), this.reconnectInterval);
        }
    }

    handleMessage(message) {
        const { type, payload } = message;

        // Notify generic listeners
        if (this.listeners.has(type)) {
            this.listeners.get(type).forEach(callback => callback(payload));
        }

        // Handle specific system events directly
        switch (type) {
            case 'LAYER_UPDATE':
                this.handleLayerUpdate(payload);
                break;
            case 'TIMELINE_EVENT':
                this.handleTimelineEvent(payload);
                break;
            default:
                break;
        }
    }

    handleLayerUpdate(payload) {
        // Example: Update layer opacity or visibility from external source
        const { layerId, updates } = payload;
        const store = useLayerStore.getState();

        if (updates.opacity !== undefined) {
            store.setLayerOpacity(layerId, updates.opacity);
        }
        if (updates.visible !== undefined) {
            store.toggleLayerVisibility(layerId); // This toggles, maybe we need setVisibility
        }
    }

    handleTimelineEvent(payload) {
        const { action, value } = payload;
        const store = useTimelineStore.getState();

        if (action === 'SET_YEAR') {
            store.setCurrentYear(value);
        } else if (action === 'PLAY') {
            store.setPlaying(true);
        } else if (action === 'PAUSE') {
            store.setPlaying(false);
        }
    }

    subscribe(type, callback) {
        if (!this.listeners.has(type)) {
            this.listeners.set(type, new Set());
        }
        this.listeners.get(type).add(callback);

        // Return unsubscribe function
        return () => {
            if (this.listeners.has(type)) {
                this.listeners.get(type).delete(callback);
            }
        };
    }

    send(type, payload) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({ type, payload }));
        } else {
            console.warn('WebSocket is not connected');
        }
    }
}

// Singleton instance
const websocketService = new WebSocketService();
export default websocketService;
