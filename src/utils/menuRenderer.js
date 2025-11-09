import { getCurrencySymbol } from './currencies.js';

/**
 * Get emoji for section based on name
 */
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

/**
 * Render menu item HTML
 */
export function renderMenuItem(item, idx, businessCurrency) {
	const itemData = {
		id: item.id,
		name: item.name,
		description: item.description || '',
		price: item.price,
		currencyType: item.currencyType !== undefined ? item.currencyType : businessCurrency,
		imageUrl: item.imageUrl || '',
		allergens: item.allergens || [],
		categoryId: item.menuItemCategoryId || null
	};

	const hasImage = item.imageUrl && item.imageUrl.trim() !== '';
	const currencySymbol = getCurrencySymbol(itemData.currencyType);

	return `
		<article class="menu-item clickable-item"
				 data-item-id="${item.id}"
				 data-item='${JSON.stringify(itemData).replace(/'/g, "&#39;").replace(/"/g, "&quot;")}'
				 style="animation-delay: ${idx * 0.05}s">
			${hasImage ? `
				<div class="item-image-wrapper">
					<img src="${item.imageUrl}" alt="${item.name}" class="item-image" loading="lazy" onerror="this.parentElement.style.display='none'; this.parentElement.nextElementSibling.style.display='flex';" />
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
					<h3 class="item-name">${item.name}</h3>
					<div class="item-price-wrapper">
						<span class="item-price">${currencySymbol}${item.price.toFixed(2)}</span>
					</div>
				</div>
				${item.description ? `<p class="item-description">${item.description}</p>` : ''}
				${item.allergens && item.allergens.length > 0 ? `
					<div class="item-allergens">
						${item.allergens.map(allergen => `<span class="allergen-badge">${allergen}</span>`).join('')}
					</div>
				` : ''}
			</div>
			<div class="item-shine"></div>
		</article>
	`;
}

/**
 * Render section HTML
 */
export function renderSection(section, items, index, businessCurrency) {
	const emoji = getEmojiForSection(section.name, index);

	let html = `
		<section id="section-${section.id}" class="menu-section">
			<div class="section-header">
				<div class="section-icon">${emoji}</div>
				<div class="section-header-content">
					<h2 class="section-title">${section.name}</h2>
					${section.description ? `<p class="section-description">${section.description}</p>` : ''}
				</div>
			</div>
			<div class="menu-grid">
	`;

	items.forEach((item, idx) => {
		html += renderMenuItem(item, idx, businessCurrency);
	});

	html += '</div></section>';
	return html;
}

/**
 * Render category navigation
 */
export function renderCategoryNav(sections, itemsBySection) {
	let html = '<nav class="category-nav"><div class="category-nav-track">';

	sections.forEach((section, index) => {
		const emoji = getEmojiForSection(section.name, index);
		html += `
			<a href="#section-${section.id}" class="category-chip">
				<span class="category-emoji">${emoji}</span>
				<span class="category-name">${section.name}</span>
			</a>
		`;
	});

	if (itemsBySection['no-section']) {
		html += `
			<a href="#section-no-section" class="category-chip">
				<span class="category-emoji">✨</span>
				<span class="category-name">Other Items</span>
			</a>
		`;
	}

	html += '</div></nav>';
	return html;
}

/**
 * Render hero section
 */
export function renderHero(business) {
	if (!business) return '';

	return `
		<div class="menu-hero">
			<div class="hero-bg">
				<div class="hero-pattern"></div>
				<div class="hero-gradient"></div>
			</div>
			<div class="hero-content">
				${business.logoUrl ? `
					<div class="hero-logo-wrapper">
						<div class="hero-logo-ring"></div>
						<img src="${business.logoUrl}" alt="${business.name}" class="hero-logo" />
					</div>
				` : `
					<div class="hero-icon">🍽️</div>
				`}
				<h1 class="hero-title">
					<span class="hero-title-main">${business.name}</span>
					${business.description ? `<span class="hero-subtitle">${business.description}</span>` : ''}
				</h1>
			</div>
			<div class="hero-wave">
				<svg viewBox="0 0 1200 120" preserveAspectRatio="none">
					<path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
					<path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
					<path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
				</svg>
			</div>
		</div>
	`;
}

/**
 * Render footer
 */
export function renderFooter() {
	return `
		<footer class="menu-footer">
			<div class="footer-content">
				<div class="footer-logo">Menu<span>Plus</span></div>
				<p class="footer-text">
					Powered by <a href="https://menu-plus.app" target="_blank" rel="noopener noreferrer" class="footer-link">MenuPlus</a>
				</p>
				<p class="footer-tagline">Digital menus made beautiful ✨</p>
			</div>
		</footer>
	`;
}

/**
 * Render empty state
 */
export function renderEmptyState() {
	return `
		<div class="empty-state">
			<div class="empty-icon">🍽️</div>
			<h2 class="empty-title">Menu Coming Soon</h2>
			<p class="empty-text">We're preparing something delicious for you!</p>
		</div>
	`;
}
