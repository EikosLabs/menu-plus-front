/**
 * Cart UI - Renders cart button, drawer, and handles interactions
 */

import { cart } from './cartManager.js';

// Render floating cart button
export function renderCartButton() {
    return `
    <button id="cart-fab" class="cart-fab" aria-label="Ver carrito" style="display: none;">
      <svg class="cart-fab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </svg>
      <span id="cart-fab-count" class="cart-fab-count">0</span>
    </button>
  `;
}

// Render cart drawer
export function renderCartDrawer(business) {
    const hasWhatsApp = business?.whatsAppNumber;

    return `
    <div id="cart-drawer" class="cart-drawer">
      <div class="cart-drawer-backdrop"></div>
      <div class="cart-drawer-content">
        <div class="cart-drawer-header">
          <h2 class="cart-drawer-title">🛒 Tu Pedido</h2>
          <button id="cart-drawer-close" class="cart-drawer-close" aria-label="Cerrar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div id="cart-items-container" class="cart-items-container">
          <div id="cart-empty" class="cart-empty">
            <span class="cart-empty-icon">🛒</span>
            <p>Tu carrito está vacío</p>
            <span class="cart-empty-hint">Agrega items del menú para comenzar</span>
          </div>
          <div id="cart-items-list" class="cart-items-list"></div>
        </div>
        
        <div id="cart-footer" class="cart-footer" style="display: none;">
          <div class="cart-total-row">
            <span class="cart-total-label">Total:</span>
            <span id="cart-total" class="cart-total-amount">$0.00</span>
          </div>
          
          <div class="cart-actions">
            ${hasWhatsApp ? `
              <button id="cart-whatsapp-btn" class="cart-action-btn cart-action-whatsapp">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Pedir por WhatsApp
              </button>
            ` : ''}
            <button id="cart-counter-btn" class="cart-action-btn cart-action-counter">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              Pedir en Mostrador
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Order Confirmation Modal -->
    <div id="order-confirmation" class="order-confirmation">
      <div class="order-confirmation-content">
        <div class="order-confirmation-icon">✅</div>
        <h3 class="order-confirmation-title">¡Pedido Listo!</h3>
        <p class="order-confirmation-text">Muestra este pedido al mesero:</p>
        <div id="order-summary" class="order-summary"></div>
        <button id="order-confirmation-close" class="order-confirmation-btn">Entendido</button>
      </div>
    </div>
  `;
}

// Initialize cart UI interactions
export function initCartUI(business) {
    cart.init(business);

    const fab = document.getElementById('cart-fab');
    const fabCount = document.getElementById('cart-fab-count');
    const drawer = document.getElementById('cart-drawer');
    const drawerClose = document.getElementById('cart-drawer-close');
    const backdrop = drawer?.querySelector('.cart-drawer-backdrop');
    const itemsList = document.getElementById('cart-items-list');
    const emptyState = document.getElementById('cart-empty');
    const footer = document.getElementById('cart-footer');
    const totalEl = document.getElementById('cart-total');
    const whatsappBtn = document.getElementById('cart-whatsapp-btn');
    const counterBtn = document.getElementById('cart-counter-btn');
    const confirmation = document.getElementById('order-confirmation');
    const confirmationClose = document.getElementById('order-confirmation-close');
    const orderSummary = document.getElementById('order-summary');

    // Update cart UI
    function updateCartUI(state) {
        if (!fab) return;

        // FAB visibility and count
        fab.style.display = state.count > 0 ? 'flex' : 'none';
        fabCount.textContent = state.count;

        // Cart items list
        if (state.items.length === 0) {
            emptyState.style.display = 'flex';
            itemsList.style.display = 'none';
            footer.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            itemsList.style.display = 'block';
            footer.style.display = 'block';

            itemsList.innerHTML = state.items.map(item => `
        <div class="cart-item" data-id="${item.id}">
          <div class="cart-item-info">
            <span class="cart-item-name">${item.name}</span>
            <span class="cart-item-price">${item.currency} ${(item.price * item.quantity).toFixed(2)}</span>
          </div>
          <div class="cart-item-controls">
            <button class="cart-item-btn cart-item-decrease" data-id="${item.id}">−</button>
            <span class="cart-item-qty">${item.quantity}</span>
            <button class="cart-item-btn cart-item-increase" data-id="${item.id}">+</button>
          </div>
        </div>
      `).join('');

            // Total
            const currency = state.items[0]?.currency || 'USD';
            totalEl.textContent = `${currency} ${state.total.toFixed(2)}`;
        }
    }

    // Subscribe to cart changes
    cart.subscribe(updateCartUI);
    updateCartUI(cart.getState());

    // Open drawer
    fab?.addEventListener('click', () => {
        drawer.classList.add('open');
        document.body.style.overflow = 'hidden';
    });

    // Close drawer
    function closeDrawer() {
        drawer.classList.remove('open');
        document.body.style.overflow = '';
    }

    drawerClose?.addEventListener('click', closeDrawer);
    backdrop?.addEventListener('click', closeDrawer);

    // Item quantity controls
    itemsList?.addEventListener('click', (e) => {
        const btn = e.target.closest('.cart-item-btn');
        if (!btn) return;

        const id = btn.dataset.id;
        if (btn.classList.contains('cart-item-increase')) {
            const item = cart.items.find(i => i.id === id);
            if (item) cart.addItem(item);
        } else if (btn.classList.contains('cart-item-decrease')) {
            cart.decreaseItem(id);
        }
    });

    // WhatsApp order
    whatsappBtn?.addEventListener('click', () => {
        if (cart.hasWhatsApp()) {
            window.open(cart.getWhatsAppUrl(), '_blank');
        }
    });

    // Counter order
    counterBtn?.addEventListener('click', () => {
        const state = cart.getState();
        const currency = state.items[0]?.currency || 'USD';

        orderSummary.innerHTML = state.items.map(item =>
            `<div class="order-item">${item.quantity}x ${item.name}</div>`
        ).join('') + `<div class="order-total"><strong>Total: ${currency} ${state.total.toFixed(2)}</strong></div>`;

        confirmation.classList.add('open');
        closeDrawer();
    });

    // Close confirmation
    confirmationClose?.addEventListener('click', () => {
        confirmation.classList.remove('open');
        cart.clear();
    });
}

// Add to cart from menu item
export function addToCartFromItem(itemData) {
    cart.addItem(itemData);

    // Visual feedback
    const fab = document.getElementById('cart-fab');
    if (fab) {
        fab.classList.add('cart-fab-bounce');
        setTimeout(() => fab.classList.remove('cart-fab-bounce'), 300);
    }
}
