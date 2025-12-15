import { AppError } from '../utils/AppError';
import { ERROR_TYPES } from '../utils/errorTypes';
import { errorLogger } from '../utils/errorLogger';

/**
 * SuperAdmin Service for system-wide management and analytics
 */
class SuperAdminService {
    constructor(apiClient) {
        this.apiClient = apiClient;
    }

    /**
     * Get comprehensive system statistics
     */
    async getSystemStatistics() {
        try {
            const response = await this.apiClient.get('/superadmin/statistics');
            return response.isEmpty ? null : response.data;
        } catch (error) {
            errorLogger.error(error, { endpoint: '/superadmin/statistics' });
            throw new AppError(
                ERROR_TYPES.API_ERROR,
                'Error al cargar estadísticas del sistema',
                { originalError: error }
            );
        }
    }

    /**
     * Get user activity and engagement metrics
     */
    async getUserActivity() {
        try {
            const response = await this.apiClient.get('/superadmin/user-activity');
            return response.isEmpty ? null : response.data;
        } catch (error) {
            errorLogger.error(error, { endpoint: '/superadmin/user-activity' });
            throw new AppError(
                ERROR_TYPES.API_ERROR,
                'Error al cargar actividad de usuarios',
                { originalError: error }
            );
        }
    }

    /**
     * Get business overview and analytics
     */
    async getBusinessOverview() {
        try {
            const response = await this.apiClient.get('/superadmin/business-overview');
            return response.isEmpty ? null : response.data;
        } catch (error) {
            errorLogger.error(error, { endpoint: '/superadmin/business-overview' });
            throw new AppError(
                ERROR_TYPES.API_ERROR,
                'Error al cargar overview de negocios',
                { originalError: error }
            );
        }
    }

    /**
     * Get users with filtering and pagination
     */
    async getUsers(params = {}) {
        try {
            const {
                page = 1,
                pageSize = 20,
                search = '',
                role = '',
                email = '',
                createdFrom = null,
                createdTo = null,
                sortBy = 'CreatedAt',
                sortDirection = 'desc'
            } = params;

            const queryParams = new URLSearchParams({
                page: page.toString(),
                pageSize: pageSize.toString(),
                ...(search && { search }),
                ...(role && { role }),
                ...(email && { email }),
                ...(createdFrom && { createdFrom: createdFrom }),
                ...(createdTo && { createdTo: createdTo }),
                sortBy,
                sortDirection
            });

            const response = await this.apiClient.get(`/superadmin/users?${queryParams}`);
            return response.isEmpty ? null : response.data;
        } catch (error) {
            errorLogger.error(error, { endpoint: '/superadmin/users', params });
            throw new AppError(
                ERROR_TYPES.API_ERROR,
                'Error al cargar usuarios',
                { originalError: error }
            );
        }
    }

    /**
     * Get user by ID
     */
    async getUserById(userId) {
        try {
            const response = await this.apiClient.get(`/superadmin/users/${userId}`);
            return response.isEmpty ? null : response.data;
        } catch (error) {
            errorLogger.error(error, { endpoint: `/superadmin/users/${userId}` });
            throw new AppError(
                ERROR_TYPES.API_ERROR,
                'Error al cargar usuario',
                { originalError: error }
            );
        }
    }

    /**
     * Delete user
     */
    async deleteUser(userId) {
        try {
            await this.apiClient.delete(`/superadmin/users/${userId}`);
            return true;
        } catch (error) {
            errorLogger.error(error, { endpoint: `/superadmin/users/${userId}` });
            throw new AppError(
                ERROR_TYPES.API_ERROR,
                'Error al eliminar usuario',
                { originalError: error }
            );
        }
    }

    /**
     * Toggle user active status
     */
    async toggleUserStatus(userId) {
        try {
            await this.apiClient.patch(`/superadmin/users/${userId}/toggle-status`);
            return true;
        } catch (error) {
            errorLogger.error(error, { endpoint: `/superadmin/users/${userId}/toggle-status` });
            throw new AppError(
                ERROR_TYPES.API_ERROR,
                'Error al cambiar estado del usuario',
                { originalError: error }
            );
        }
    }

    /**
     * Get business by ID
     */
    async getBusinessById(businessId) {
        try {
            const response = await this.apiClient.get(`/superadmin/businesses/${businessId}`);
            return response.isEmpty ? null : response.data;
        } catch (error) {
            errorLogger.error(error, { endpoint: `/superadmin/businesses/${businessId}` });
            throw new AppError(
                ERROR_TYPES.API_ERROR,
                'Error al cargar negocio',
                { originalError: error }
            );
        }
    }

    /**
     * Toggle business active status
     */
    async toggleBusinessStatus(businessId) {
        try {
            await this.apiClient.patch(`/superadmin/businesses/${businessId}/toggle-status`);
            return true;
        } catch (error) {
            errorLogger.error(error, { endpoint: `/superadmin/businesses/${businessId}/toggle-status` });
            throw new AppError(
                ERROR_TYPES.API_ERROR,
                'Error al cambiar estado del negocio',
                { originalError: error }
            );
        }
    }
}

export default SuperAdminService;