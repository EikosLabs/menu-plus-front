import { create } from 'zustand';
import menuService from '../services/menuService';

/**
 * Business Store - Centralized business/restaurant state management
 * Replaces prop drilling for businesses data across components
 */
export const useBusinessStore = create((set, get) => ({
  // State
  businesses: [],
  selectedBusinessId: null,
  isLoading: false,
  error: null,

  // Computed (via selectors below)
  
  // Actions
  /**
   * Fetch all businesses for current user
   */
  fetchBusinesses: async () => {
    set({ isLoading: true, error: null });
    try {
      const businesses = await menuService.getUserBusinesses();
      set({ 
        businesses, 
        isLoading: false,
        // Auto-select first business if none selected
        selectedBusinessId: get().selectedBusinessId || (businesses[0]?.id ?? null)
      });
      return businesses;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  /**
   * Select a business by ID
   */
  selectBusiness: (businessId) => {
    set({ selectedBusinessId: businessId });
  },

  /**
   * Add a new business to the store
   */
  addBusiness: (business) => {
    set((state) => ({
      businesses: [...state.businesses, business],
      selectedBusinessId: business.id,
    }));
  },

  /**
   * Update a business in the store
   */
  updateBusiness: (businessId, updates) => {
    set((state) => ({
      businesses: state.businesses.map((b) =>
        b.id === businessId ? { ...b, ...updates } : b
      ),
    }));
  },

  /**
   * Remove a business from the store
   */
  removeBusiness: (businessId) => {
    set((state) => {
      const filtered = state.businesses.filter((b) => b.id !== businessId);
      return {
        businesses: filtered,
        selectedBusinessId: 
          state.selectedBusinessId === businessId 
            ? (filtered[0]?.id ?? null) 
            : state.selectedBusinessId,
      };
    });
  },

  /**
   * Update a menu within a business
   */
  updateMenu: (businessId, menuId, updates) => {
    set((state) => ({
      businesses: state.businesses.map((b) =>
        b.id === businessId
          ? {
              ...b,
              menus: b.menus?.map((m) =>
                m.id === menuId ? { ...m, ...updates } : m
              ),
            }
          : b
      ),
    }));
  },

  /**
   * Add a menu to a business
   */
  addMenu: (businessId, menu) => {
    set((state) => ({
      businesses: state.businesses.map((b) =>
        b.id === businessId
          ? { ...b, menus: [...(b.menus || []), menu] }
          : b
      ),
    }));
  },

  /**
   * Clear all business data (on logout)
   */
  clear: () => {
    set({
      businesses: [],
      selectedBusinessId: null,
      isLoading: false,
      error: null,
    });
  },
}));

// Selectors for optimized re-renders
export const selectBusinesses = (state) => state.businesses;
export const selectSelectedBusinessId = (state) => state.selectedBusinessId;
export const selectSelectedBusiness = (state) => 
  state.businesses.find((b) => b.id === state.selectedBusinessId) ?? null;
export const selectIsLoading = (state) => state.isLoading;
export const selectError = (state) => state.error;

// Derived selectors
export const selectBusinessById = (businessId) => (state) =>
  state.businesses.find((b) => b.id === businessId) ?? null;

export const selectMenusByBusinessId = (businessId) => (state) => {
  const business = state.businesses.find((b) => b.id === businessId);
  return business?.menus ?? [];
};
