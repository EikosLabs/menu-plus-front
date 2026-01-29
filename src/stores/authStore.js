import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../services/authService';
import menuService from '../services/menuService';
import { AppError } from '../utils/AppError';
import { ERROR_TYPES } from '../utils/errorTypes';

/**
 * Auth Store - Centralized authentication state management
 * Replaces useAuth hook and eliminates prop drilling for user data
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: true,
      isSuperAdmin: false,

      // Actions
      /**
       * Initialize auth state from stored tokens
       * Should be called on app startup
       */
      initialize: async () => {
        if (!authService.isAuthenticated()) {
          set({ isLoading: false, isAuthenticated: false, user: null });
          return false;
        }

        if (authService.isTokenExpired()) {
          try {
            await authService.refreshToken();
          } catch {
            get().logout();
            return false;
          }
        }

        try {
          await get().loadUserData();
          return true;
        } catch {
          get().logout();
          return false;
        }
      },

      /**
       * Load user data from token and API
       */
      loadUserData: async () => {
        const userId = authService.getUserId();
        if (!userId) {
          throw new AppError(ERROR_TYPES.UNAUTHORIZED, 'No user ID found');
        }

        const role = authService.getRoleFromToken();
        const isSuperAdmin = authService.isSuperAdmin();

        if (isSuperAdmin) {
          set({
            user: {
              id: userId,
              name: 'Super Administrator',
              email: 'superadmin@menusesqr.online',
              role: role || 'Super Admin',
            },
            isAuthenticated: true,
            isSuperAdmin: true,
            isLoading: false,
          });
        } else {
          try {
            const businesses = await menuService.getUserBusinesses();
            const businessName = businesses.length > 0 ? businesses[0].name : 'Mi Negocio';

            set({
              user: {
                id: userId,
                name: businessName,
                email: `user_${userId}@example.com`,
                role: role || 'Owner',
                businessId: businesses.length > 0 ? businesses[0].id : null,
              },
              isAuthenticated: true,
              isSuperAdmin: false,
              isLoading: false,
            });
          } catch {
            // Use default values on error
            set({
              user: {
                id: userId,
                name: 'Mi Negocio',
                email: `user_${userId}@example.com`,
                role: 'Owner',
              },
              isAuthenticated: true,
              isSuperAdmin: false,
              isLoading: false,
            });
          }
        }
      },

      /**
       * Login with email and password
       */
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          await authService.login(email, password);
          await get().loadUserData();
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      /**
       * Register a new user
       */
      register: async (fullName, email, userName, password) => {
        set({ isLoading: true });
        try {
          const result = await authService.register(fullName, email, userName, password);
          set({ isLoading: false });
          return result;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      /**
       * Request magic link for passwordless auth
       */
      requestMagicLink: async (email, fullName = null) => {
        set({ isLoading: true });
        try {
          const result = await authService.requestMagicLink(email, fullName);
          set({ isLoading: false });
          return result;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      /**
       * Logout and clear all auth state
       */
      logout: () => {
        authService.logout();
        set({
          user: null,
          isAuthenticated: false,
          isSuperAdmin: false,
          isLoading: false,
        });
      },

      /**
       * Refresh user data from API
       */
      refreshUser: async () => {
        if (!authService.isAuthenticated()) return;
        await get().loadUserData();
      },

      /**
       * Update user data locally (for optimistic updates)
       */
      updateUser: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Only persist non-sensitive data
        user: state.user ? { id: state.user.id, name: state.user.name } : null,
      }),
    }
  )
);

// Selectors for optimized re-renders
export const selectUser = (state) => state.user;
export const selectIsAuthenticated = (state) => state.isAuthenticated;
export const selectIsSuperAdmin = (state) => state.isSuperAdmin;
export const selectIsLoading = (state) => state.isLoading;
