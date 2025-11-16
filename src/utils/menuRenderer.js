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

  // Business Information
  html += renderBusinessInfo(business);

  // Category Nav
  if (menu.sections && menu.sections.length > 0) {
    html += '<nav class="category-nav"><div class="category-nav-track">';
    menu.sections.forEach((section, index) => {
      const emoji = getEmojiForSection(section.name, index);
      html += `
        <a href="#section-${section.id}" class="category-chip">
          <span class="category-emoji">${emoji}</span>
          <span class="category-name">${sanitizeHtml(section.name)}</span>
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


  // Footer
  html += `
    <footer class="menu-footer">
      <div class="footer-content">
        ${business ? `
          <div class="footer-business">
            <h3 class="footer-business-name">${sanitizeHtml(business.name)}</h3>
            ${business.address ? `
              <div class="footer-contact-item">
                <span class="footer-icon">📍</span>
                <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}"
                   target="_blank"
                   rel="noopener"
                   class="footer-link">${sanitizeHtml(business.address)}</a>
              </div>
            ` : ''}
            ${business.phoneNumber ? `
              <div class="footer-contact-item">
                <span class="footer-icon">📞</span>
                <a href="tel:${business.phoneNumber}" class="footer-link">${business.phoneNumber}</a>
              </div>
            ` : ''}
            ${business.email ? `
              <div class="footer-contact-item">
                <span class="footer-icon">✉️</span>
                <a href="mailto:${business.email}" class="footer-link">${business.email}</a>
              </div>
            ` : ''}
            ${(business.facebookUrl || business.instagramUrl || business.twitterUrl || business.whatsAppNumber) ? `
              <div class="footer-social">
                ${business.facebookUrl ? `
                  <a href="${sanitizeUrl(business.facebookUrl)}" target="_blank" rel="noopener noreferrer" class="footer-social-btn footer-social-btn--facebook" title="Facebook">
                    <svg viewBox="0 0 24 24" class="footer-social-icon">
                      <path fill="currentColor" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                ` : ''}
                ${business.instagramUrl ? `
                  <a href="${sanitizeUrl(business.instagramUrl)}" target="_blank" rel="noopener noreferrer" class="footer-social-btn footer-social-btn--instagram" title="Instagram">
                    <svg viewBox="0 0 24 24" class="footer-social-icon">
                      <path fill="currentColor" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                ` : ''}
                ${business.twitterUrl ? `
                  <a href="${sanitizeUrl(business.twitterUrl)}" target="_blank" rel="noopener noreferrer" class="footer-social-btn footer-social-btn--twitter" title="Twitter">
                    <svg viewBox="0 0 24 24" class="footer-social-icon">
                      <path fill="currentColor" d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>
                ` : ''}
                ${business.whatsAppNumber ? `
                  <a href="https://wa.me/${business.whatsAppNumber.replace(/[^0-9]/g, '')}" target="_blank" rel="noopener noreferrer" class="footer-social-btn footer-social-btn--whatsapp" title="WhatsApp">
                    <svg viewBox="0 0 24 24" class="footer-social-icon">
                      <path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </a>
                ` : ''}
              </div>
            ` : ''}
          </div>
        ` : ''}
        <div class="footer-divider"></div>
        <div class="footer-branding">
          <div class="footer-logo">Menu<span>Plus</span></div>
          <p class="footer-text">
            Powered by <a href="https://menusesqr.com" target="_blank" rel="noopener noreferrer" class="footer-link">MenuPlus</a>
          </p>
          <p class="footer-tagline">Digital menus made beautiful ✨</p>
        </div>
      </div>
    </footer>
  `;

  menuContent.innerHTML = html;
}
