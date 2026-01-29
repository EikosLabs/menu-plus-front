/**
 * Cart Manager - Shopping cart state management for QR Menu
 * Handles add/remove items, persistence, and WhatsApp order generation
 */

class CartManager {
    constructor() {
        this.items = [];
        this.businessInfo = null;
        this.listeners = [];
        this.loadFromStorage();
    }

    // Initialize with business data
    init(business) {
        this.businessInfo = business;
    }

    // Load cart from localStorage
    loadFromStorage() {
        try {
            const stored = localStorage.getItem('menuplus_cart');
            if (stored) {
                const data = JSON.parse(stored);
                // Only restore if less than 2 hours old
                if (data.timestamp && Date.now() - data.timestamp < 2 * 60 * 60 * 1000) {
                    this.items = data.items || [];
                }
            }
        } catch (e) {
            console.warn('Failed to load cart:', e);
        }
    }

    // Save cart to localStorage
    saveToStorage() {
        try {
            localStorage.setItem('menuplus_cart', JSON.stringify({
                items: this.items,
                timestamp: Date.now()
            }));
        } catch (e) {
            console.warn('Failed to save cart:', e);
        }
    }

    // Subscribe to cart changes
    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    // Notify all listeners
    notify() {
        this.saveToStorage();
        this.listeners.forEach(cb => cb(this.getState()));
    }

    // Get current state
    getState() {
        return {
            items: this.items,
            count: this.getTotalCount(),
            total: this.getTotal()
        };
    }

    // Add item to cart
    addItem(item) {
        const existing = this.items.find(i => i.id === item.id);
        if (existing) {
            existing.quantity += 1;
        } else {
            this.items.push({
                id: item.id,
                name: item.name,
                price: item.price,
                currency: item.currency || 'USD',
                quantity: 1
            });
        }
        this.notify();
    }

    // Remove one quantity of item
    decreaseItem(itemId) {
        const existing = this.items.find(i => i.id === itemId);
        if (existing) {
            existing.quantity -= 1;
            if (existing.quantity <= 0) {
                this.items = this.items.filter(i => i.id !== itemId);
            }
        }
        this.notify();
    }

    // Remove item entirely
    removeItem(itemId) {
        this.items = this.items.filter(i => i.id !== itemId);
        this.notify();
    }

    // Clear entire cart
    clear() {
        this.items = [];
        this.notify();
    }

    // Get total item count
    getTotalCount() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    // Get total price
    getTotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    // Get currency (from first item or default)
    getCurrency() {
        return this.items[0]?.currency || 'USD';
    }

    // Generate WhatsApp message with customer data
    generateWhatsAppMessage(customerData = null) {
        if (this.items.length === 0) return '';

        const businessName = this.businessInfo?.name || 'el restaurante';
        const currency = this.getCurrency();

        let message = `🍽️ *Pedido para ${businessName}*\n\n`;

        // Add customer info if provided
        if (customerData) {
            if (customerData.name) {
                message += `👤 *Cliente:* ${customerData.name}\n\n`;
            }
            if (customerData.address) {
                message += `📍 *Entregar en:*\n${customerData.address}\n`;
                if (customerData.references) {
                    message += `Ref: ${customerData.references}\n`;
                }
                message += `\n`;
            }
        }

        message += `📋 *Detalle del pedido:*\n`;
        message += `─────────────────\n`;

        this.items.forEach(item => {
            const itemTotal = (item.price * item.quantity).toFixed(2);
            message += `• ${item.quantity}x ${item.name}\n`;
            message += `   ${currency} ${itemTotal}\n`;
        });

        message += `─────────────────\n`;
        message += `💰 *Total: ${currency} ${this.getTotal().toFixed(2)}*\n\n`;
        message += `📱 Enviado desde MenuPlus`;

        return message;
    }

    // Get WhatsApp URL with optional customer data
    getWhatsAppUrl(customerData = null) {
        const phone = this.businessInfo?.whatsAppNumber?.replace(/[^0-9]/g, '') || '';
        const message = encodeURIComponent(this.generateWhatsAppMessage(customerData));
        return `https://wa.me/${phone}?text=${message}`;
    }

    // Check if business has WhatsApp
    hasWhatsApp() {
        const number = this.businessInfo?.whatsAppNumber;
        return !!number && number.trim().length > 0;
    }
}

// Global cart instance
const cart = new CartManager();

// Export for use in other modules
export { cart, CartManager };
