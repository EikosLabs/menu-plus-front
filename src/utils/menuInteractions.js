import { getCurrencySymbol, getCurrencyCode } from './currencies.js';
import { addToCartFromItem } from './cartUI.js';

export function initializeInteractiveElements() {
  setupCategoryNavigation();
  setupScrollAnimations();
  setupActiveCategory();
  setupDishModal();
  setupMobileCarousel();
  setupHeroParallax();
  setupMenuSearch();
  setupStickyNavObserver();
}

// --------------------------------------------------------------------------
// GLASSMORPHISM STICKY NAV
// --------------------------------------------------------------------------
function setupStickyNavObserver() {
  const categoryNav = document.querySelector('.category-nav');
  if (!categoryNav) return;

  // Create a sentinel element to detect when nav becomes sticky
  const sentinel = document.createElement('div');
  sentinel.className = 'sticky-sentinel';
  sentinel.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; height: 1px; pointer-events: none;';
  categoryNav.parentNode.insertBefore(sentinel, categoryNav);

  const observer = new IntersectionObserver(
    ([entry]) => {
      // When sentinel is not visible (scrolled past), nav is stuck
      categoryNav.classList.toggle('is-stuck', !entry.isIntersecting);
    },
    { threshold: 0, rootMargin: '0px 0px 0px 0px' }
  );

  observer.observe(sentinel);
}

// --------------------------------------------------------------------------
// SMOOTH SCROLL NAVIGATION
// --------------------------------------------------------------------------
function setupCategoryNavigation() {
  const categoryNav = document.querySelector('.category-nav');

  document.querySelectorAll('.category-chip').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        const categoryNavHeight = categoryNav?.offsetHeight || 80;
        const offset = categoryNavHeight + 20;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });

        document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
        this.classList.add('active');

        // Center the clicked chip
        this.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    });
  });
}

// --------------------------------------------------------------------------
// STAGGERED ANIMATIONS (VISUAL SPECTACLE)
// --------------------------------------------------------------------------
function setupScrollAnimations() {
  // Use a lower threshold so items start animating as soon as they peek
  const observerOptions = { threshold: 0.15, rootMargin: '0px 0px -50px 0px' };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Add minimal delay based on index if available, or just standard
        const target = entry.target;

        // If it's a menu item, we can try to stagger siblings
        if (target.classList.contains('menu-item')) {
          // Find its index among visible siblings to calculate delay
          const siblings = Array.from(target.parentNode.children);
          const index = siblings.indexOf(target) % 5; // Reset delay every 5 items
          target.style.transitionDelay = `${index * 80}ms`;
        }

        target.classList.add('visible');
        observer.unobserve(target); // Only animate once
      }
    });
  }, observerOptions);

  document.querySelectorAll('.menu-section, .menu-item, .section-title').forEach(el => {
    observer.observe(el);
  });
}

// --------------------------------------------------------------------------
// HERO PARALLAX (HIGH PERFORMANCE)
// --------------------------------------------------------------------------
function setupHeroParallax() {
  const heroElements = {
    glow1: document.querySelector('.hero-glow-1'),
    glow2: document.querySelector('.hero-glow-2'),
    pattern: document.querySelector('.hero-pattern'),
    logo: document.querySelector('.hero-logo-frame'),
    title: document.querySelector('.hero-title'),
    badge: document.querySelector('.hero-badge')
  };

  if (!heroElements.glow1) return; // Exit if no hero

  let ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY || 0;

        // Only animate if near top to save resources
        if (y > 800) {
          ticking = false;
          return;
        }

        const factor = y / 500; // 0 to 1 scaling

        // Deep parallax layers
        if (heroElements.glow1) {
          // Move opposite to scroll
          heroElements.glow1.style.transform = `translate3d(0, ${y * 0.4}px, 0)`;
        }
        if (heroElements.glow2) {
          heroElements.glow2.style.transform = `translate3d(0, ${y * 0.2}px, 0)`;
        }

        if (heroElements.pattern) {
          heroElements.pattern.style.transform = `scale(${1.1 + factor * 0.2}) translate3d(0, ${y * 0.1}px, 0)`;
        }

        if (heroElements.logo) {
          // Logo rises slower than scroll, creates float
          heroElements.logo.style.transform = `translate3d(0, ${y * 0.15}px, 0)`;
        }

        if (heroElements.title) {
          heroElements.title.style.transform = `translate3d(0, ${y * 0.1}px, 0)`;
          heroElements.title.style.opacity = Math.max(0, 1 - factor * 1.5);
        }

        if (heroElements.badge) {
          heroElements.badge.style.transform = `translate3d(0, ${y * 0.25}px, 0)`;
          heroElements.badge.style.opacity = Math.max(0, 1 - factor * 2);
        }

        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
}

// --------------------------------------------------------------------------
// MENU SEARCH
// --------------------------------------------------------------------------
function setupMenuSearch() {
  const input = document.getElementById('menu-search-input');
  const countEl = document.getElementById('menu-search-count');
  if (!input) return;

  const items = Array.from(document.querySelectorAll('.menu-item'));
  const sections = Array.from(document.querySelectorAll('.menu-section'));

  let debounceId = null;

  function normalize(text) {
    return (text || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
  }

  function filter(query) {
    const q = normalize(query);
    let visibleCount = 0;

    // Filter items
    items.forEach(item => {
      const name = normalize(item.querySelector('.item-name')?.textContent || '');
      const desc = normalize(item.querySelector('.item-description')?.textContent || '');
      const match = q.length === 0 || name.includes(q) || desc.includes(q);

      // Animate out/in
      if (match) {
        item.style.display = '';
        setTimeout(() => item.classList.add('visible'), 50);
        visibleCount++;
      } else {
        item.classList.remove('visible');
        setTimeout(() => { if (!item.classList.contains('visible')) item.style.display = 'none'; }, 200);
      }
    });

    // Hide sections without visible items
    sections.forEach(section => {
      const anyVisible = Array.from(section.querySelectorAll('.menu-item')).some(el => el.style.display !== 'none');
      section.style.display = anyVisible ? '' : 'none';
    });

    // Update count
    if (countEl) {
      countEl.textContent = q.length ? `${visibleCount} resultados` : '';
    }
  }

  input.addEventListener('input', () => {
    clearTimeout(debounceId);
    debounceId = setTimeout(() => filter(input.value), 120);
  });

  // Clear with ESC
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      input.value = '';
      filter('');
    }
  });
}

// --------------------------------------------------------------------------
// ACTIVE SECTION TRACKING
// --------------------------------------------------------------------------
function setupActiveCategory() {
  const sections = document.querySelectorAll('.menu-section');
  const navLinks = document.querySelectorAll('.category-chip');
  const categoryNav = document.querySelector('.category-nav');
  const track = document.querySelector('.category-nav-track');
  let lastActiveId = '';

  function centerActiveChip() {
    const activeChip = document.querySelector('.category-chip.active');
    if (!track || !activeChip) return;

    activeChip.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    });
  }

  window.addEventListener('scroll', () => {
    const categoryNavHeight = categoryNav?.offsetHeight || 80;
    const scrollOffset = categoryNavHeight + 50;

    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      if (window.pageYOffset >= sectionTop - scrollOffset) {
        current = section.getAttribute('id');
      }
    });

    if (current && current !== lastActiveId) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
          link.classList.add('active');
        }
      });
      lastActiveId = current;
      centerActiveChip();
    }
  });
}

// --------------------------------------------------------------------------
// DISH DETAILS MODAL
// --------------------------------------------------------------------------
function setupDishModal() {
  const modal = document.getElementById('dish-modal');
  if (!modal) return;

  const modalBackdrop = modal.querySelector('.dish-modal-backdrop');
  const modalClose = modal.querySelector('.dish-modal-close');

  if (!modalBackdrop || !modalClose) return;

  document.querySelectorAll('.menu-item').forEach(item => {
    // Make entire cart clickable for details? Or just info?
    // Let's make entire card active except the add button
    item.addEventListener('click', function (e) {
      // Prevent opening if clicked on add button
      if (e.target.closest('.item-add-btn')) return;

      try {
        const itemData = JSON.parse(this.getAttribute('data-item'));
        if (itemData) openDishModal(itemData);
      } catch (error) {
        console.error('Error parsing menu item data:', error);
      }
    });
  });

  modalClose.addEventListener('click', closeDishModal);

  modalBackdrop.addEventListener('click', closeDishModal);

  const modalAddBtn = document.getElementById('modal-add-to-cart-btn');
  if (modalAddBtn) {
    modalAddBtn.addEventListener('click', () => {
      const itemData = {
        id: modalAddBtn.dataset.itemId,
        name: modalAddBtn.dataset.itemName,
        price: parseFloat(modalAddBtn.dataset.itemPrice),
        currency: modalAddBtn.dataset.itemCurrency
      };
      addToCartFromItem(itemData);
      closeDishModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeDishModal();
    }
  });

  function openDishModal(item) {
    const elements = {
      image: document.getElementById('modal-dish-image'),
      wrapper: document.querySelector('.dish-modal-image-wrapper'),
      name: document.getElementById('modal-dish-name'),
      price: document.getElementById('modal-dish-price'),
      description: document.getElementById('modal-dish-description'),
      allergens: document.getElementById('modal-dish-allergens'),
      addBtn: document.getElementById('modal-add-to-cart-btn'),
      addPrice: document.getElementById('modal-add-price')
    };

    elements.name.textContent = item.name;
    elements.price.innerHTML = `<span class="text-2xl font-bold">${getCurrencySymbol(item.currencyType)}${item.price.toFixed(2)}</span> <span class="text-sm font-medium opacity-60 uppercase ml-1">${getCurrencyCode(item.currencyType)}</span>`;

    // Update Add Button
    if (elements.addBtn && elements.addPrice) {
      elements.addBtn.dataset.itemId = item.id;
      elements.addBtn.dataset.itemName = item.name;
      elements.addBtn.dataset.itemPrice = item.price;
      elements.addBtn.dataset.itemCurrency = getCurrencyCode(item.currencyType);
      elements.addPrice.textContent = `${getCurrencySymbol(item.currencyType)}${item.price.toFixed(2)}`;
    }

    if (elements.description) {
      elements.description.textContent = item.description || '';
      elements.description.style.display = item.description ? 'block' : 'none';
    }

    const hasImage = item.imageUrl?.trim();
    if (hasImage) {
      elements.image.src = item.imageUrl;
      elements.image.alt = item.name;
      elements.image.style.display = 'block';
      // If error loading image, hide it
      elements.image.onerror = () => {
        elements.image.style.display = 'none';
        if (elements.wrapper.querySelector('.dish-modal-image-placeholder')) {
          elements.wrapper.querySelector('.dish-modal-image-placeholder').style.display = 'flex';
        }
      };
      if (elements.wrapper.querySelector('.dish-modal-image-placeholder')) {
        elements.wrapper.querySelector('.dish-modal-image-placeholder').style.display = 'none';
      }
    } else {
      elements.image.style.display = 'none';
      if (elements.wrapper.querySelector('.dish-modal-image-placeholder')) {
        elements.wrapper.querySelector('.dish-modal-image-placeholder').style.display = 'flex';
      }
    }

    // Allergens handling if element exists
    if (elements.allergens) {
      elements.allergens.style.display = item.allergens?.length ? 'block' : 'none';
      if (item.allergens?.length) {
        elements.allergens.innerHTML = `
            <h3 class="allergens-title" style="font-weight:700; margin-bottom:0.5rem; margin-top:1rem;">⚠️ Alérgenos:</h3>
            <div class="allergens-list" style="display:flex; flex-wrap:wrap; gap:0.5rem;">${item.allergens.map(a => `<span class="allergen-badge" style="background:#f8f9fa; padding:4px 8px; border-radius:4px; font-size:0.85rem;">${a}</span>`).join('')}</div>
        `;
      }
    }

    const showModal = () => {
      modal.classList.remove('hidden');
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    };

    // View Transition API if available
    if (document.startViewTransition) {
      document.startViewTransition(showModal);
    } else {
      showModal();
    }

    setTimeout(() => {
      modalBackdrop.classList.add('active');
      modal.querySelector('.dish-modal-content').classList.add('active');
    }, 10);
  }

  function closeDishModal() {
    modalBackdrop.classList.remove('active');
    modal.querySelector('.dish-modal-content').classList.remove('active');

    setTimeout(() => {
      const hideModal = () => {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        document.body.style.overflow = '';
      };

      if (document.startViewTransition) {
        document.startViewTransition(hideModal);
      } else {
        hideModal();
      }
    }, 300);
  }
}

// --------------------------------------------------------------------------
// MOBILE SCROLL HELPERS
// --------------------------------------------------------------------------
function setupMobileCarousel() {
  const track = document.querySelector('.category-nav-track');
  if (!track) return;

  // Simple clean scroll snap setup
  track.style.overflowX = 'auto';
  track.style.scrollSnapType = 'x mandatory';
  track.style.scrollBehavior = 'smooth';

  if (track.children.length > 0) {
    Array.from(track.children).forEach(chip => {
      chip.style.scrollSnapAlign = 'center';
    });
  }
}
