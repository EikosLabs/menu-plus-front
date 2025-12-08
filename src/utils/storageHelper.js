import { errorLogger } from './errorLogger';

export class StorageHelper {
	static saveToLocalStorage(key, value) {
		try {
			localStorage.setItem(key, JSON.stringify(value));
			return true;
		} catch (error) {
			errorLogger.warn('Failed to save to localStorage', { key, error: error.message });
			return false;
		}
	}

	static getFromLocalStorage(key, defaultValue = null) {
		try {
			const value = localStorage.getItem(key);
			return value ? JSON.parse(value) : defaultValue;
		} catch (error) {
			errorLogger.warn('Failed to read from localStorage', { key, error: error.message });
			return defaultValue;
		}
	}

	static saveBusinessForUser(userId, businessId) {
		const key = `userBusinesses_${userId}`;
		const businesses = StorageHelper.getFromLocalStorage(key, []);

		if (!businesses.includes(businessId)) {
			businesses.push(businessId);
			StorageHelper.saveToLocalStorage(key, businesses);
		}
	}

	static getBusinessesForUser(userId) {
		return StorageHelper.getFromLocalStorage(`userBusinesses_${userId}`, []);
	}
}
