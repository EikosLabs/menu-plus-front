import { sanitizeHtml, sanitizeUrl } from './security.js';
import { renderBusinessInfo } from './renderBusinessInfo.js';
import { renderSection, getEmojiForSection } from './menuHelpers.js';

export function renderMenu(menu, business, itemsBySection) {
  const menuContent = document.getElementById('menu-content');
  let html = '';

  // Hero Section
  if (business) {
    const hasLogo = business.logoUrl || business.logoUri;
    html += `
      <div class="menu-hero ${hasLogo ? 'has-logo' : 'no-logo'}">
        <div class="hero-bg">
          <div class="hero-pattern"></div>
          <div class="hero-gradient"></div>
          <div class="hero-glow hero-glow-1"></div>
          <div class="hero-glow hero-glow-2"></div>
        </div>
        <div class="hero-container">
          <div class="hero-content">
            ${hasLogo ? `
              <div class="hero-logo-container">
                <div class="hero-logo-wrapper">
                  <div class="hero-logo-ring hero-logo-ring-1"></div>
                  <div class="hero-logo-ring hero-logo-ring-2"></div>
                  <div class="hero-logo-frame">
                    <img src="${sanitizeUrl(business.logoUrl || business.logoUri)}"
                         alt="${sanitizeHtml(business.name)}"
                         class="hero-logo"
                         width="200"
                         height="200"
                         decoding="async"
                         fetchpriority="high"
                         onerror="this.closest('.hero-logo-container').style.display='none';document.querySelector('.hero-fallback-icon')?.classList.remove('hidden');" />
                  </div>
                </div>
              </div>
            ` : ''}
            <div class="hero-fallback-icon ${hasLogo ? 'hidden' : ''}">
              <div class="fallback-icon-wrapper">
                <span class="fallback-icon">🍽️</span>
              </div>
            </div>
            <div class="hero-text">
              <div class="hero-badge">
                <svg class="hero-badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span>Menú Digital</span>
              </div>
              <h1 class="hero-title">
                <span class="hero-title-main">${sanitizeHtml(business.name)}</span>
              </h1>
              ${business.description ? `
                <p class="hero-description">
                  <span class="hero-description-icon">✨</span>
                  ${sanitizeHtml(business.description)}
                </p>
              ` : ''}
              <div class="hero-divider">
                <div class="hero-divider-line"></div>
                <div class="hero-divider-dot"></div>
                <div class="hero-divider-line"></div>
              </div>
            </div>
          </div>
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

  // Category Nav
  if (menu.sections && menu.sections.length > 0) {
  let navHtml = '<div class="category-nav-track">';
  menu.sections.forEach((section, index) => {
    const emoji = getEmojiForSection(section.name, index);
    navHtml += `
      <a href="#section-${section.id}" class="category-chip">
        <span class="category-emoji">${emoji}</span>
        <span class="category-name">${sanitizeHtml(section.name)}</span>
      </a>
    `;
  });
  if (itemsBySection['no-section']) {
    navHtml += `
      <a href="#section-no-section" class="category-chip">
        <span class="category-emoji">✨</span>
        <span class="category-name">Other Items</span>
      </a>
    `;
  }
  navHtml += '</div>';
  const categoryNav = document.createElement('nav');
  categoryNav.className = 'category-nav';
  categoryNav.innerHTML = navHtml;
  // Remover cualquier nav existente para evitar duplicados
  const existingNav = document.querySelector('.category-nav');
  if (existingNav) existingNav.remove();
  document.body.appendChild(categoryNav);
}

  // Menu Sections
  html += '<div class="menu-sections">';
  menu.sections.forEach((section, index) => {
    const items = itemsBySection[String(section.id).toLowerCase()] || [];
    html += renderSection(section, items, index, business);
  });

  if (itemsBySection['no-section']) {
    html += renderSection(
      { id: 'no-section', name: 'Other Items', description: 'Additional delicious options' },
      itemsBySection['no-section'],
      menu.sections.length,
      business
    );
  }

  if (Object.keys(itemsBySection).length === 0) {
    html += `
      <div class="empty-state">
        <div class="empty-icon">🍽️</div>
        <h2 class="empty-title">Menu Coming Soon</h2>
        <p class="empty-text">We're preparing something delicious for you!</p>
      </div>
    `;
  }

  html += '</div>';

  // Business Information
  html += renderBusinessInfo(business);

  // Footer
  html += `
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

  menuContent.innerHTML = html;
}
