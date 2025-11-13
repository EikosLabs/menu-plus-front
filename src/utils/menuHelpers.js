import { sanitizeHtml, sanitizeUrl } from './security.js';
import { getCurrencySymbol } from './currencies.js';

export function getEmojiForSection(sectionName, index) {
  const name = sectionName.toLowerCase();
  const emojiMap = {
    'appetizers': '🥗', 'starters': '🥗', 'entradas': '🥗',
    'main': '🍽️', 'mains': '🍽️', 'entrees': '🍽️', 'platos': '🍽️',
    'desserts': '🍰', 'postres': '🍰', 'sweets': '🍰',
    'drinks': '🍹', 'beverages': '🍹', 'bebidas': '🍹',
    'salads': '🥗', 'ensaladas': '🥗',
    'pasta': '🍝', 'pastas': '🍝',
    'pizza': '🍕', 'pizzas': '🍕',
    'burgers': '🍔', 'hamburguesas': '🍔',
    'seafood': '🦞', 'mariscos': '🦞',
    'meat': '🥩', 'carnes': '🥩',
    'chicken': '🍗', 'pollo': '🍗',
    'vegetarian': '🥬', 'vegetariano': '🥬',
    'vegan': '🌱', 'vegano': '🌱',
    'breakfast': '🍳', 'desayuno': '🍳',
    'lunch': '🍱', 'almuerzo': '🍱',
    'dinner': '🌙', 'cena': '🌙',
    'specials': '⭐', 'especialidades': '⭐',
    'sides': '🍟', 'acompañamientos': '🍟',
    'soups': '🍲', 'sopas': '🍲',
    'sushi': '🍣', 'japanese': '🍣',
    'coffee': '☕', 'café': '☕',
    'wine': '🍷', 'vino': '🍷',
    'beer': '🍺', 'cerveza': '🍺',
    'cocktails': '🍸', 'cócteles': '🍸'
  };

  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (name.includes(key)) return emoji;
  }

  const defaultEmojis = ['🍽️', '🍕', '🍔', '🍜', '🍱', '🥘', '🍲', '🥗', '🍛'];
  return defaultEmojis[index % defaultEmojis.length];
}

function getImageUrl(item) {
  return item.imageUrl || item.imageUri || '';
}

function getCurrencyType(item, business) {
  return item.currencyType !== undefined ? item.currencyType : business.defaultCurrency;
}

export function renderSection(section, items, index, business) {
  const emoji = getEmojiForSection(section.name, index);
  const itemsHtml = items.map((item, idx) => {
    const imageUrl = getImageUrl(item);
    const currencyType = getCurrencyType(item, business);
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
      <article class="menu-item" data-item='${JSON.stringify(itemData).replace(/'/g, "&#39;").replace(/"/g, "&quot;")}' style="animation-delay:${idx * 0.05}s">
        <div class="item-image-wrapper"${!imageUrl ? ' style="display:none"' : ''}>
          <img src="${sanitizeUrl(imageUrl)}" alt="${sanitizeHtml(item.name)}" class="item-image" loading="lazy" onerror="this.parentElement.style.display='none';this.parentElement.nextElementSibling.style.display='flex';">
          <div class="item-image-overlay"><span>👁️</span></div>
        </div>
        <div class="item-image-placeholder"${imageUrl ? ' style="display:none"' : ''}><span class="placeholder-emoji">🍴</span></div>
        <div class="item-content">
          <div class="item-header">
            <h3 class="item-name">${sanitizeHtml(item.name)}</h3>
            <div class="item-price-wrapper"><span class="item-price">${getCurrencySymbol(currencyType)}${item.price.toFixed(2)}</span></div>
          </div>
          ${item.description ? `<p class="item-description">${sanitizeHtml(item.description)}</p>` : ''}
          ${item.allergens?.length ? `<div class="item-allergens">${item.allergens.map(a => `<span class="allergen-badge">${sanitizeHtml(a)}</span>`).join('')}</div>` : ''}
        </div>
      </article>`;
  }).join('');

  return `
    <section id="section-${section.id}" class="menu-section">
      <div class="section-header">
        <div class="section-icon">${emoji}</div>
        <div class="section-header-content">
          <h2 class="section-title">${sanitizeHtml(section.name)}</h2>
          ${section.description ? `<p class="section-description">${sanitizeHtml(section.description)}</p>` : ''}
        </div>
      </div>
      <div class="menu-grid">${itemsHtml}</div>
    </section>`;
}
