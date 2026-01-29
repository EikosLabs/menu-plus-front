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
            <button id="cart-whatsapp-btn" class="cart-action-btn cart-action-whatsapp">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Pedir por WhatsApp
            </button>
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
    
    <!-- WhatsApp Form Modal -->
    <div id="whatsapp-form-modal" class="whatsapp-form-modal">
      <div class="whatsapp-form-backdrop"></div>
      <div class="whatsapp-form-content">
        <button id="whatsapp-form-close" class="whatsapp-form-close" aria-label="Cerrar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"></path>
          </svg>
        </button>
        <h3 class="whatsapp-form-title">📍 Datos para tu pedido</h3>
        
        <div class="whatsapp-form-field">
          <label for="customer-name">Nombre *</label>
          <input type="text" id="customer-name" placeholder="Tu nombre" required>
        </div>
        
        <div class="whatsapp-form-field">
          <label for="customer-address">Dirección *</label>
          <input type="text" id="customer-address" placeholder="Calle, número, colonia..." required>
        </div>
        
        <div class="whatsapp-form-field">
          <label for="customer-references">Referencias (opcional)</label>
          <input type="text" id="customer-references" placeholder="Casa azul, cerca del parque...">
        </div>
        
        <button id="use-location-btn" class="whatsapp-location-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span id="location-btn-text">Usar mi ubicación actual</span>
        </button>
        
        <div id="location-error" class="whatsapp-location-error" style="display: none;"></div>
        
        <div id="form-validation-error" class="whatsapp-validation-error" style="display: none;"></div>
        
        <button id="send-whatsapp-btn" class="whatsapp-send-btn">
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          Enviar por WhatsApp
        </button>
      </div>
    </div>
  `;
}

// Initialize cart UI interactions
export function initCartUI(business) {
  console.log('Initializing Cart UI with business:', business);
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

  // WhatsApp form modal elements
  const whatsappFormModal = document.getElementById('whatsapp-form-modal');
  const whatsappFormClose = document.getElementById('whatsapp-form-close');
  const whatsappFormBackdrop = whatsappFormModal?.querySelector('.whatsapp-form-backdrop');
  const customerNameInput = document.getElementById('customer-name');
  const customerAddressInput = document.getElementById('customer-address');
  const customerReferencesInput = document.getElementById('customer-references');
  const useLocationBtn = document.getElementById('use-location-btn');
  const locationBtnText = document.getElementById('location-btn-text');
  const locationError = document.getElementById('location-error');
  const validationError = document.getElementById('form-validation-error');
  const sendWhatsappBtn = document.getElementById('send-whatsapp-btn');

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

  // Swipe-to-dismiss gesture for mobile
  let touchStartY = 0;
  let touchCurrentY = 0;
  let isDragging = false;
  const drawerContent = drawer?.querySelector('.cart-drawer-content');

  drawerContent?.addEventListener('touchstart', (e) => {
    // Only handle touches near the top (header area)
    const touch = e.touches[0];
    const rect = drawerContent.getBoundingClientRect();
    if (touch.clientY - rect.top < 60) {
      touchStartY = touch.clientY;
      isDragging = true;
      drawerContent.style.transition = 'none';
    }
  }, { passive: true });

  drawerContent?.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    touchCurrentY = e.touches[0].clientY;
    const deltaY = touchCurrentY - touchStartY;

    // Only allow downward swipe
    if (deltaY > 0) {
      drawerContent.style.transform = `translateY(${deltaY}px)`;
    }
  }, { passive: true });

  drawerContent?.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;
    drawerContent.style.transition = '';

    const deltaY = touchCurrentY - touchStartY;

    // Close if swiped down more than 100px
    if (deltaY > 100) {
      closeDrawer();
    }

    drawerContent.style.transform = '';
    touchStartY = 0;
    touchCurrentY = 0;
  }, { passive: true });

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

  // WhatsApp order - open form modal instead of direct link
  whatsappBtn?.addEventListener('click', () => {
    if (cart.hasWhatsApp()) {
      // Reset form
      if (customerNameInput) customerNameInput.value = '';
      if (customerAddressInput) customerAddressInput.value = '';
      if (customerReferencesInput) customerReferencesInput.value = '';
      if (locationError) locationError.style.display = 'none';
      if (validationError) validationError.style.display = 'none';
      if (locationBtnText) locationBtnText.textContent = 'Usar mi ubicación actual';
      if (useLocationBtn) useLocationBtn.classList.remove('loading', 'success');
      
      // Show form modal
      whatsappFormModal?.classList.add('open');
      closeDrawer();
    } else {
      console.log('WhatsApp check failed. Business info:', cart.businessInfo);
      alert('Este negocio no tiene número de WhatsApp configurado (o es inválido). Por favor usa "Pedir en Mostrador".');
    }
  });

  // Close WhatsApp form modal
  function closeWhatsappForm() {
    whatsappFormModal?.classList.remove('open');
  }

  whatsappFormClose?.addEventListener('click', closeWhatsappForm);
  whatsappFormBackdrop?.addEventListener('click', closeWhatsappForm);

  // Geolocation + Nominatim reverse geocoding
  useLocationBtn?.addEventListener('click', async () => {
    if (!navigator.geolocation) {
      showLocationError('Tu navegador no soporta geolocalización');
      return;
    }

    // Show loading state
    useLocationBtn.classList.add('loading');
    locationBtnText.textContent = 'Obteniendo ubicación...';
    locationError.style.display = 'none';

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Reverse geocoding with Nominatim (OpenStreetMap)
      locationBtnText.textContent = 'Buscando dirección...';
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'MenuPlus/1.0 (https://menuplus.app)'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Error al obtener dirección');
      }

      const data = await response.json();
      
      // Build address from components
      const address = data.address || {};
      const addressParts = [];
      
      if (address.road) addressParts.push(address.road);
      if (address.house_number) addressParts[0] = `${address.road} ${address.house_number}`;
      if (address.suburb || address.neighbourhood) addressParts.push(address.suburb || address.neighbourhood);
      if (address.city || address.town || address.village) addressParts.push(address.city || address.town || address.village);
      
      const formattedAddress = addressParts.join(', ') || data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      
      // Fill address input
      if (customerAddressInput) {
        customerAddressInput.value = formattedAddress;
      }

      // Success state
      useLocationBtn.classList.remove('loading');
      useLocationBtn.classList.add('success');
      locationBtnText.textContent = 'Ubicación obtenida';
      
      // Reset button after 2 seconds
      setTimeout(() => {
        useLocationBtn.classList.remove('success');
        locationBtnText.textContent = 'Usar mi ubicación actual';
      }, 2000);

    } catch (error) {
      useLocationBtn.classList.remove('loading');
      locationBtnText.textContent = 'Usar mi ubicación actual';
      
      let errorMessage = 'No se pudo obtener tu ubicación';
      if (error.code === 1) {
        errorMessage = 'Permiso de ubicación denegado. Por favor ingresa tu dirección manualmente.';
      } else if (error.code === 2) {
        errorMessage = 'No se pudo determinar tu ubicación. Intenta de nuevo.';
      } else if (error.code === 3) {
        errorMessage = 'Tiempo de espera agotado. Intenta de nuevo.';
      }
      
      showLocationError(errorMessage);
    }
  });

  function showLocationError(message) {
    if (locationError) {
      locationError.textContent = message;
      locationError.style.display = 'block';
    }
  }

  // Validate and send WhatsApp message
  sendWhatsappBtn?.addEventListener('click', () => {
    const name = customerNameInput?.value.trim() || '';
    const address = customerAddressInput?.value.trim() || '';
    const references = customerReferencesInput?.value.trim() || '';

    // Validation
    if (!name || !address) {
      if (validationError) {
        validationError.textContent = 'Por favor completa tu nombre y dirección';
        validationError.style.display = 'block';
      }
      return;
    }

    // Hide validation error
    if (validationError) validationError.style.display = 'none';

    // Generate WhatsApp URL with customer data
    const whatsappUrl = cart.getWhatsAppUrl({
      name,
      address,
      references
    });

    // Open WhatsApp
    window.open(whatsappUrl, '_blank');

    // Close modal and clear cart
    closeWhatsappForm();
    cart.clear();
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
