import { sanitizeHtml, sanitizeUrl } from './security.js';
import { renderBusinessInfo } from './renderBusinessInfo.js';
import { renderSection, getEmojiForSection } from './menuHelpers.js';
import { renderCartButton, renderCartDrawer } from './cartUI.js';

export function renderMenu(menu, business, itemsBySection) {
  const menuContent = document.getElementById('menu-content');
  let html = '';

  // --------------------------------------------------------------------------
  // HERO SECTION (VISUAL SPECTACLE)
  // --------------------------------------------------------------------------
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
              <div class="hero-badge" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 16px; background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); border-radius: 20px; margin-bottom: 24px; font-size: 0.85rem; font-weight: 600; border: 1px solid rgba(255,255,255,0.2);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span>Experiencia Digital</span>
              </div>
              <h1 class="hero-title">
                <span class="hero-title-main">${sanitizeHtml(business.name)}</span>
              </h1>
              ${business.description ? `
                <p class="hero-description">
                  ${sanitizeHtml(business.description)}
                </p>
              ` : ''}
            </div>
            <div class="hero-scroll-indicator" style="position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); opacity: 0.7; animation: float 2s infinite;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M7 13l5 5 5-5M7 6l5 5 5-5"/>
                </svg>
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

  // Business Info
  html += renderBusinessInfo(business);

  // --------------------------------------------------------------------------
  // SEARCH BAR
  // --------------------------------------------------------------------------
  html += `
    <div class="menu-search-container">
      <div class="menu-search-wrapper">
        <svg class="menu-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input type="text" id="menu-search-input" class="menu-search-input" placeholder="Buscar platos, bebidas..." aria-label="Buscar en el menú">
        <span id="menu-search-count" class="menu-search-count"></span>
      </div>
    </div>
  `;

  // --------------------------------------------------------------------------
  // STICKY NAVIGATION (GLASSMORPHISM)
  // --------------------------------------------------------------------------
  if (menu.sections && menu.sections.length > 0) {
    html += `
      <nav class="category-nav">
        <div class="category-nav-track">
    `;

    menu.sections.forEach((section, index) => {
      const emoji = getEmojiForSection(section.name, index);
      html += `
        <a href="#section-${section.id}" class="category-chip" data-section-id="${section.id}">
          <span class="category-emoji">${emoji}</span>
          <span class="category-name">${sanitizeHtml(section.name)}</span>
        </a>
      `;
    });

    if (itemsBySection['no-section']) {
      html += `
        <a href="#section-no-section" class="category-chip">
          <span class="category-emoji">✨</span>
          <span class="category-name">Otros</span>
        </a>
      `;
    }

    html += '</div></nav>';
  }

  // --------------------------------------------------------------------------
  // MENU CONTENT
  // --------------------------------------------------------------------------
  html += '<div class="menu-sections">';

  menu.sections.forEach((section, index) => {
    const items = itemsBySection[String(section.id).toLowerCase()] || [];
    html += renderSection(section, items, index, business);
  });

  if (itemsBySection['no-section']) {
    html += renderSection(
      { id: 'no-section', name: 'Otros Items', description: 'Opciones adicionales' },
      itemsBySection['no-section'],
      menu.sections.length,
      business
    );
  }

  if (Object.keys(itemsBySection).length === 0) {
    html += `
      <div class="empty-state">
        <div class="empty-icon" style="font-size: 4rem; margin-bottom: 1rem;">🍽️</div>
        <h2 class="empty-title">Pronto Disponible</h2>
        <p class="empty-text">Estamos preparando un menú delicioso.</p>
      </div>
    `;
  }

  html += '</div>';

  // --------------------------------------------------------------------------
  // FOOTER
  // --------------------------------------------------------------------------
  html += `
    <footer class="menu-footer">
      <div class="footer-content">
        ${business ? `
          <div class="footer-business">
            <h3 class="footer-business-name">${sanitizeHtml(business.name)}</h3>
            ${business.address ? `
              <div class="footer-contact-item">
                <span class="footer-icon">📍</span>
                <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}" target="_blank" class="footer-link">${sanitizeHtml(business.address)}</a>
              </div>
            ` : ''}
            <div class="footer-social-links" style="display:flex; justify-content:center; gap: 1rem; margin-top: 1.5rem;">
               ${business.instagramUrl ? `<a href="${sanitizeUrl(business.instagramUrl)}" class="social-link">Instagram</a>` : ''}
               ${business.facebookUrl ? `<a href="${sanitizeUrl(business.facebookUrl)}" class="social-link">Facebook</a>` : ''}
            </div>
          </div>
        ` : ''}
        <div style="margin-top: 3rem; opacity: 0.5; font-size: 0.8rem;">
            Powered by <strong>MenuPlus</strong>
        </div>
      </div>
    </footer>
  `;

  // Add Cart UI
  html += renderCartButton();
  html += renderCartDrawer(business);

  menuContent.innerHTML = html;
}
