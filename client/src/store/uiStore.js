import { create } from 'zustand';

/**
 * Store for managing global UI state
 */
const useUIStore = create((set) => ({
    // State
    sidebarOpen: true,
    activePanel: 'layers', // 'layers', 'tools', 'settings', etc.
    modals: {}, // Map of modalId -> boolean (open/closed)

    // Actions
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

    setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),

    setActivePanel: (panelId) => set({ activePanel: panelId }),

    openModal: (modalId) => set((state) => ({
        modals: { ...state.modals, [modalId]: true }
    })),

    closeModal: (modalId) => set((state) => ({
        modals: { ...state.modals, [modalId]: false }
    }))
}));

export default useUIStore;
