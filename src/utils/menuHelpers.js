import { sanitizeHtml, sanitizeUrl } from './security.js';
import { getCurrencySymbol, getCurrencyCode } from './currencies.js';
import { getEmojiForSection } from './emojiDetector.js';

// Re-export for backwards compatibility
export { getEmojiForSection } from './emojiDetector.js';

function getImageUrl(item) {
  return item.imageUrl || item.imageUri || '';
}

function getCurrencyType(item, business) {
  // Si el item tiene una moneda específica distinta de USD (0), la respetamos
  if (item.currencyType !== undefined && item.currencyType !== null && item.currencyType !== 0) {
    return item.currencyType;
  }

  // Si el item es USD (0) o no tiene moneda, usamos la del negocio
  if (business && business.defaultCurrency !== undefined && business.defaultCurrency !== null) {
    return business.defaultCurrency;
  }

  // Si no hay moneda de negocio, usamos la del item (que será 0/USD) o 0 por defecto
  return item.currencyType || 0;
}

export function renderSection(section, items, index, business) {
  const emoji = getEmojiForSection(section.name, index);
  const itemsHtml = items.map((item, idx) => {
    const imageUrl = getImageUrl(item);
    const currencyType = getCurrencyType(item, business);
    const currencySymbol = getCurrencySymbol(currencyType);
    const currencyCode = getCurrencyCode(currencyType);

    const itemData = {
      id: item.id,
      name: item.name,
      description: item.description || '',
      price: item.price,
      currencyType,
      imageUrl,
      allergens: item.allergens || []
    };

    return `
      <article class="menu-item" data-item='${JSON.stringify(itemData).replace(/'/g, "&#39;").replace(/"/g, "&quot;")}' data-item-id="${item.id}" data-item-name="${sanitizeHtml(item.name)}" data-item-price="${item.price}" data-item-currency="${currencyCode}" style="animation-delay:${idx * 0.05}s">
        <div class="item-image-container"${!imageUrl ? ' style="display:none"' : ''}>
          <img src="${sanitizeUrl(imageUrl)}" alt="${sanitizeHtml(item.name)}" class="item-image" loading="${idx < 6 ? 'eager' : 'lazy'}" decoding="async" onerror="this.parentElement.style.display='none';this.parentElement.nextElementSibling.style.display='flex';">
          ${item.popular ? '<div class="item-tag-badge"><span>🔥 Popular</span></div>' : ''}
        </div>

        <div class="item-content">
          <div class="item-header">
            <h3 class="item-name">${sanitizeHtml(item.name)}</h3>
            <div class="item-price-wrapper">
              <span class="item-price">${currencySymbol}${item.price.toFixed(2)}</span>
              <span class="item-currency-code">${currencyCode}</span>
            </div>
          </div>
          ${item.description ? `<p class="item-description">${sanitizeHtml(item.description)}</p>` : ''}
          ${item.allergens?.length ? `<div class="item-allergens">${item.allergens.map(a => `<span class="allergen-badge">${sanitizeHtml(a)}</span>`).join('')}</div>` : ''}
        </div>
        <button class="item-add-btn" aria-label="Agregar al carrito" data-add-id="${item.id}">+</button>
      </article>`;
  }).join('');

  return `
    <section id="section-${section.id}" class="menu-section">
      <div class="section-header">
        <div class="section-header-content">
          <h2 class="section-title"><span class="section-emoji">${emoji}</span> ${sanitizeHtml(section.name)}</h2>
          ${section.description ? `<p class="section-description">${sanitizeHtml(section.description)}</p>` : ''}
        </div>
      </div>
      <div class="menu-items-grid">${itemsHtml}</div>
    </section>`;
}
