/**
 * Helper para almacenamiento local
 * Maneja localStorage de forma segura
 */

export class StorageHelper {
  static saveToLocalStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  static getFromLocalStorage(key, defaultValue = null) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  static saveBusinessForUser(userId, businessId) {
    const key = `userBusinesses_${userId}`;
    const businesses = this.getFromLocalStorage(key, []);

    if (!businesses.includes(businessId)) {
      businesses.push(businessId);
      this.saveToLocalStorage(key, businesses);
    }
  }

  static getBusinessesForUser(userId) {
    return this.getFromLocalStorage(`userBusinesses_${userId}`, []);
  }
}
