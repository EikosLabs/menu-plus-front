import { create } from 'zustand';

/**
 * UI Store - Centralized UI state management
 * Handles modals, loading states, notifications, and other UI concerns
 */
export const useUIStore = create((set, get) => ({
  // Modal State
  activeModal: null,
  modalData: null,

  // Global Loading
  globalLoading: false,
  loadingMessage: null,

  // Notifications/Toasts
  notifications: [],

  // Sidebar state
  sidebarOpen: true,

  // Actions - Modals
  openModal: (modalId, data = null) => {
    set({ activeModal: modalId, modalData: data });
  },

  closeModal: () => {
    set({ activeModal: null, modalData: null });
  },

  // Check if a specific modal is open
  isModalOpen: (modalId) => get().activeModal === modalId,

  // Actions - Loading
  setGlobalLoading: (loading, message = null) => {
    set({ globalLoading: loading, loadingMessage: message });
  },

  // Actions - Notifications
  addNotification: (notification) => {
    const id = Date.now().toString();
    const newNotification = {
      id,
      type: 'info',
      duration: 5000,
      ...notification,
    };

    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    // Auto-remove after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },

  // Convenience methods for different notification types
  showSuccess: (message, options = {}) => {
    return get().addNotification({ type: 'success', message, ...options });
  },

  showError: (message, options = {}) => {
    return get().addNotification({ type: 'error', message, duration: 8000, ...options });
  },

  showWarning: (message, options = {}) => {
    return get().addNotification({ type: 'warning', message, ...options });
  },

  showInfo: (message, options = {}) => {
    return get().addNotification({ type: 'info', message, ...options });
  },

  // Actions - Sidebar
  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  setSidebarOpen: (open) => {
    set({ sidebarOpen: open });
  },
}));

// Modal IDs - Constants for type safety
export const MODAL_IDS = {
  // Business modals
  ADD_BUSINESS: 'add-business',
  EDIT_BUSINESS: 'edit-business',
  DELETE_BUSINESS: 'delete-business',
  
  // Menu modals
  ADD_MENU: 'add-menu',
  EDIT_MENU: 'edit-menu',
  DELETE_MENU: 'delete-menu',
  
  // Menu Item modals
  ADD_MENU_ITEM: 'add-menu-item',
  EDIT_MENU_ITEM: 'edit-menu-item',
  DELETE_MENU_ITEM: 'delete-menu-item',
  
  // Section modals
  SECTION_MANAGER: 'section-manager',
  
  // QR modals
  QR_CODE: 'qr-code',
  
  // Flyer modals
  MENU_CARD: 'menu-card',
  PROMOTIONAL_FLYER: 'promotional-flyer',
  SAVED_FLYERS: 'saved-flyers',
  
  // AI modals
  AI_SCANNER: 'ai-scanner',
  IMAGE_ANALYSIS: 'image-analysis',
  
  // Confirmation modals
  CONFIRM_ACTION: 'confirm-action',
};

// Selectors
export const selectActiveModal = (state) => state.activeModal;
export const selectModalData = (state) => state.modalData;
export const selectGlobalLoading = (state) => state.globalLoading;
export const selectNotifications = (state) => state.notifications;
export const selectSidebarOpen = (state) => state.sidebarOpen;
