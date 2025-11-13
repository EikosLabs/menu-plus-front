import { sanitizeHtml, sanitizeUrl } from '../utils/security.js';
import { getCurrencySymbol } from '../utils/currencies.js';

export function getEmojiForSection(sectionName, index) {
  const name = (sectionName || '').toLowerCase();
  const emojiMap = {
    appetizers: '🥗', starters: '🥗', entradas: '🥗',
    main: '🍽️', mains: '🍽️', entrees: '🍽️', platos: '🍽️',
    desserts: '🍰', postres: '🍰', sweets: '🍰',
    drinks: '🍹', beverages: '🍹', bebidas: '🍹',
    salads: '🥗', ensaladas: '🥗',
    pasta: '🍝', pastas: '🍝',
    pizza: '🍕', pizzas: '🍕',
    burgers: '🍔', hamburguesas: '🍔',
    seafood: '🦞', mariscos: '🦞',
    meat: '🥩', carnes: '🥩',
    chicken: '🍗', pollo: '🍗',
    vegetarian: '🥬', vegetariano: '🥬',
    vegan: '🌱', vegano: '🌱',
    breakfast: '🍳', desayuno: '🍳',
    lunch: '🍱', almuerzo: '🍱',
    dinner: '🌙', cena: '🌙',
    specials: '⭐', especialidades: '⭐',
    sides: '🍟', 'acompañamientos': '🍟',
    soups: '🍲', sopas: '🍲',
    sushi: '🍣', japanese: '🍣',
    coffee: '☕', 'café': '☕',
    wine: '🍷', vino: '🍷',
    beer: '🍺', cerveza: '🍺',
    cocktails: '🍸', 'cócteles': '🍸'
  };
  for (const key in emojiMap) {
    if (name.includes(key)) return emojiMap[key];
  }
  const defaultEmojis = ['🍽️','🍕','🍔','🍜','🍱','🥘','🍲','🥗','🍛'];
  return defaultEmojis[index % defaultEmojis.length];
}

export function renderSection(section, items, index, business) {
  const emoji = getEmojiForSection(section?.name || '', index);
  let html = `
    <section id="section-${section.id}" class="menu-section">
      <div class="section-header">
        <div class="section-icon">${emoji}</div>
        <div class="section-header-content">
          <h2 class="section-title">${sanitizeHtml(section.name)}</h2>
          ${section.description ? `<p class="section-description">${sanitizeHtml(section.description)}</p>` : ''}
        </div>
      </div>
      <div class="menu-grid">
  `;
  items.forEach((item, idx) => {
    const itemData = {
      id: item.id,
      name: item.name,
      description: item.description || '',
      price: item.price,
      currencyType: item.currencyType !== undefined ? item.currencyType : business.defaultCurrency,
      imageUrl: item.imageUrl || item.imageUri || '',
      allergens: item.allergens || [],
      categoryId: item.menuItemCategoryId || null
    };
    const hasImage = (item.imageUrl || item.imageUri) && (item.imageUrl || item.imageUri).trim() !== '';
    html += `
      <article class="menu-item clickable-item"
               data-item-id="${item.id}"
               data-item='${JSON.stringify(itemData).replace(/'/g, "&#39;").replace(/"/g, "&quot;")}'
               style="animation-delay: ${idx * 0.05}s">
        ${hasImage ? `
          <div class="item-image-wrapper">
            <img src="${sanitizeUrl(item.imageUrl || item.imageUri)}" alt="${sanitizeHtml(item.name)}" class="item-image" loading="lazy" onerror="this.parentElement.style.display='none'; this.parentElement.nextElementSibling.style.display='flex';" />
            <div class="item-image-overlay">
              <span class="item-view-icon">👁️</span>
            </div>
          </div>
          <div class="item-image-placeholder" style="display: none;">
            <span class="placeholder-emoji">🍴</span>
          </div>
        ` : `
          <div class="item-image-placeholder">
            <span class="placeholder-emoji">🍴</span>
          </div>
        `}
        <div class="item-content">
          <div class="item-header">
            <h3 class="item-name">${sanitizeHtml(item.name)}</h3>
            <div class="item-price-wrapper">
              <span class="item-price">${getCurrencySymbol(item.currencyType !== undefined ? item.currencyType : business.defaultCurrency)}${item.price.toFixed(2)}</span>
            </div>
          </div>
          ${item.description ? `<p class="item-description">${sanitizeHtml(item.description)}</p>` : ''}
          ${item.allergens && item.allergens.length > 0 ? `
            <div class="item-allergens">
              ${item.allergens.map(allergen => `<span class="allergen-badge">${sanitizeHtml(allergen)}</span>`).join('')}
            </div>
          ` : ''}
        </div>
        <div class="item-shine"></div>
      </article>
    `;
  });
  html += '</div></section>';
  return html;
}