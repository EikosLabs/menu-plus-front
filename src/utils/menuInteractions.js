import { getCurrencySymbol, getCurrencyCode } from './currencies.js';

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

function setupCategoryNavigation() {
  const categoryNav = document.querySelector('.category-nav');

  document.querySelectorAll('.category-chip').forEach(link => {
    link.addEventListener('click', function(e) {
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
      }
    });
  });
}

function setupScrollAnimations() {
  const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.menu-section, .menu-item').forEach(el => {
    observer.observe(el);
  });
}

function setupHeroParallax() {
  const glow1 = document.querySelector('.hero-glow-1');
  const glow2 = document.querySelector('.hero-glow-2');
  const pattern = document.querySelector('.hero-pattern');
  let ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        const factor = Math.min(1, y / 400);
        if (glow1) {
          glow1.style.transform = `translate3d(${factor * -20}px, ${factor * -30}px, 0)`;
          glow1.style.opacity = String(0.08 - factor * 0.04);
        }
        if (glow2) {
          glow2.style.transform = `translate3d(${factor * 25}px, ${factor * 35}px, 0)`;
          glow2.style.opacity = String(0.08 - factor * 0.04);
        }
        if (pattern) {
          pattern.style.transform = `translate3d(0, ${factor * -15}px, 0)`;
          pattern.style.opacity = String(0.03 - factor * 0.015);
        }
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
}

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
      item.style.display = match ? '' : 'none';
      if (match) visibleCount++;
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

function setupActiveCategory() {
  const sections = document.querySelectorAll('.menu-section');
  const navLinks = document.querySelectorAll('.category-chip');
  const categoryNav = document.querySelector('.category-nav');
  const track = document.querySelector('.category-nav-track');
  let lastActiveId = '';

  function centerActiveChip() {
    const activeChip = document.querySelector('.category-chip.active');
    if (!track || !activeChip) return;
    const isMobile = window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) return;

    const paddingLeft = parseFloat(getComputedStyle(track).paddingLeft) || 0;
    const targetLeft = activeChip.offsetLeft - paddingLeft + (activeChip.offsetWidth / 2) - (track.clientWidth / 2);
    const clamped = Math.max(0, targetLeft);
    track.scrollTo({ left: clamped, behavior: 'smooth' });
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


function setupDishModal() {
  const modal = document.getElementById('dish-modal');
  if (!modal) {
    console.warn('Dish modal not found');
    return;
  }
  
  const modalBackdrop = modal.querySelector('.dish-modal-backdrop');
  const modalClose = modal.querySelector('.dish-modal-close');

  if (!modalBackdrop || !modalClose) {
    console.warn('Modal elements not found');
    return;
  }

  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function() {
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
      allergens: document.getElementById('modal-dish-allergens')
    };

    elements.name.textContent = item.name;
    elements.price.innerHTML = `<span class="text-2xl font-bold">${getCurrencySymbol(item.currencyType)}${item.price.toFixed(2)}</span> <span class="text-sm font-medium opacity-60 uppercase ml-1">${getCurrencyCode(item.currencyType)}</span>`;
    elements.description.textContent = item.description || '';
    elements.description.style.display = item.description ? 'block' : 'none';

    const hasImage = item.imageUrl?.trim();
    if (hasImage) {
      elements.image.src = item.imageUrl;
      elements.image.alt = item.name;
      elements.image.style.display = 'block';
      elements.image.onerror = () => {
        elements.image.style.display = 'none';
        elements.wrapper.querySelector('.dish-modal-image-placeholder').style.display = 'flex';
      };
      elements.wrapper.querySelector('.dish-modal-image-placeholder').style.display = 'none';
    } else {
      elements.image.style.display = 'none';
      elements.wrapper.querySelector('.dish-modal-image-placeholder').style.display = 'flex';
    }

    elements.allergens.style.display = item.allergens?.length ? 'block' : 'none';
    if (item.allergens?.length) {
      elements.allergens.innerHTML = `
        <h3 class="allergens-title">⚠️ Alérgenos:</h3>
        <div class="allergens-list">${item.allergens.map(a => `<span class="allergen-badge">${a}</span>`).join('')}</div>
      `;
    }

    const showModal = () => {
      modal.classList.remove('hidden');
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    };

    document.startViewTransition ? document.startViewTransition(showModal) : showModal();
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
      document.startViewTransition ? document.startViewTransition(hideModal) : hideModal();
    }, 300);
  }
}

class DynamicCarouselManager {
  constructor(track, originalChips) {
    this.track = track;
    this.originalChips = originalChips;
    this.cloneCount = this.calculateOptimalCloneCount();
    this.activeClones = new Set();
    this.originalWidth = 0;
    this.animationFrameId = null;
    this.isUserInteracting = false;
    this.userInteractionTimeout = null;
    this.isMouseOver = false;
    this.isMobile = this.detectMobile();
    this.scrollSpeed = this.isMobile ? 0.8 : 0.5;
    this.gap = 16;
  }

  detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
  }

  calculateOptimalCloneCount() {
    if (this.originalChips.length === 0) return 0;

    const firstChip = this.originalChips[0];
    const chipWidth = firstChip?.offsetWidth || 120;
    const gap = 16;
    const trackWidth = this.track?.offsetWidth || window.innerWidth;

    const chipsPerView = Math.ceil(trackWidth / (chipWidth + gap));
    const minForInfinite = Math.ceil(chipsPerView * 1.5);

    return Math.max(3, Math.min(6, minForInfinite));
  }

  initialize() {
    // Clear existing clones
    this.clearExistingClones();

    // Create optimal number of clones
    this.createClones();

    // Calculate original width
    this.calculateOriginalWidth();

    // Setup optimized scrolling
    this.setupOptimizedScrolling();

    // Setup event handling
    this.setupEventHandling();

    // Start auto-scroll
    this.startAutoScroll();
  }

  clearExistingClones() {
    this.track.querySelectorAll('.cloned-chip').forEach(chip => chip.remove());
    this.activeClones.clear();
  }

  createClones() {
    // DESACTIVADO - No crear clones para evitar duplicación de secciones
    console.log('Clonación desactivada - usando solo secciones originales');
    console.log('Secciones únicas a mostrar:', this.originalChips.length);
    return;
  }

  createOptimizedClone(original, cloneIndex, originalIndex) {
    const clone = original.cloneNode(true);

    clone.classList.add('cloned-chip', `clone-${cloneIndex}`);
    clone.setAttribute('aria-hidden', 'true');
    clone.style.transform = 'translateZ(0)'; // Hardware acceleration
    clone.style.willChange = 'transform';

    return clone;
  }

  calculateOriginalWidth() {
    let totalWidth = 0;
    const gap = 16;

    this.originalChips.forEach(chip => {
      totalWidth += chip.offsetWidth + gap;
    });

    this.originalWidth = totalWidth;
    return totalWidth;
  }

  setupOptimizedScrolling() {
    let ticking = false;

    const optimizedScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.handleInfiniteScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    this.track.addEventListener('scroll', optimizedScroll, { passive: true });
  }

  handleInfiniteScroll() {
    const currentScroll = this.track.scrollLeft;

    if (currentScroll >= this.originalWidth) {
      this.track.scrollLeft = currentScroll - this.originalWidth;
    }
  }

  setupEventHandling() {
    // Mouse events
    this.track.addEventListener('mouseenter', () => this.handleMouseEnter(), { passive: true });
    this.track.addEventListener('mouseleave', () => this.handleMouseLeave(), { passive: true });

    // Touch events
    this.track.addEventListener('touchstart', () => this.handleTouch(), { passive: true });
    this.track.addEventListener('touchmove', () => this.handleTouch(), { passive: true });
    this.track.addEventListener('touchend', () => this.handleTouchEnd(), { passive: true });

    // Scroll and wheel events
    this.track.addEventListener('scroll', () => this.handleUserScroll(), { passive: true });
    this.track.addEventListener('wheel', () => this.handleUserScroll(), { passive: true });

    // Handle chip clicks with event delegation
    this.track.addEventListener('click', (e) => this.handleChipClick(e));
  }

  handleMouseEnter() {
    if (!this.isMobile) {
      this.isMouseOver = true;
    }
  }

  handleMouseLeave() {
    if (!this.isMobile) {
      this.isMouseOver = false;
    }
  }

  handleTouch() {
    this.isUserInteracting = true;
    clearTimeout(this.userInteractionTimeout);
    this.userInteractionTimeout = setTimeout(() => {
      this.isUserInteracting = false;
    }, 1000);
  }

  handleTouchEnd() {
    setTimeout(() => {
      if (!this.isUserInteracting) {
        this.isMouseOver = false;
      }
    }, 300);
  }

  handleUserScroll() {
    this.isUserInteracting = true;
    clearTimeout(this.userInteractionTimeout);
    this.userInteractionTimeout = setTimeout(() => {
      this.isUserInteracting = false;
    }, this.isMobile ? 1000 : 800);
  }

  handleChipClick(e) {
    const chip = e.target.closest('.category-chip');
    if (!chip) return;

    e.preventDefault();
    this.handleTouch();

    // Temporarily enable smooth scroll
    this.track.style.scrollBehavior = 'smooth';
    setTimeout(() => {
      this.track.style.scrollBehavior = 'auto';
    }, 1000);

    // Scroll to section
    const targetId = chip.getAttribute('href')?.substring(1);
    const targetEl = document.getElementById(targetId);
    if (targetEl) {
      const categoryNavHeight = document.querySelector('.category-nav')?.offsetHeight || 80;
      const offset = categoryNavHeight + 20;
      const elementPosition = targetEl.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }

    // Center the clicked chip
    const track = document.querySelector('.category-nav-track');
    if (track && chip) {
      const paddingLeft = parseFloat(getComputedStyle(track).paddingLeft) || 0;
      const targetLeft = chip.offsetLeft - paddingLeft + (chip.offsetWidth / 2) - (track.clientWidth / 2);
      const clamped = Math.max(0, targetLeft);
      track.scrollTo({ left: clamped, behavior: 'smooth' });
    }
  }

  startAutoScroll() {
    if (this.animationFrameId) return;

    if (this.isMobile) {
      console.log('Starting optimized carousel animation on mobile');
    }

    this.continuousScroll();
  }

  stopAutoScroll() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  continuousScroll() {
    if (this.isUserInteracting || this.isMouseOver) {
      this.animationFrameId = requestAnimationFrame(() => this.continuousScroll());
      return;
    }

    this.track.scrollLeft += this.scrollSpeed;

    this.animationFrameId = requestAnimationFrame(() => this.continuousScroll());
  }

  restartAutoScroll() {
    this.stopAutoScroll();
    setTimeout(() => {
      this.startAutoScroll();
    }, 100);
  }

  handleVisibilityChange() {
    if (!document.hidden && !this.isUserInteracting && !this.isMouseOver) {
      this.restartAutoScroll();
    }
  }

  handleOrientationChange() {
    setTimeout(() => {
      this.restartAutoScroll();
    }, 400);
  }

  cleanup() {
    this.stopAutoScroll();
    clearTimeout(this.userInteractionTimeout);
    this.clearExistingClones();
  }
}

function setupMobileCarousel() {
  const track = document.querySelector('.category-nav-track');
  if (!track || track.children.length === 0) return;

  // Extract original chips (filter out any existing clones)
  const originalChips = Array.from(track.children).filter(chip =>
    !chip.classList.contains('cloned-chip')
  );

  if (originalChips.length === 0) return;

  // Eliminar cualquier clone existente primero
  const existingClones = track.querySelectorAll('.cloned-chip');
  existingClones.forEach(clone => clone.remove());

  console.log('Configurando carrusel sin clones:', originalChips.length, 'secciones únicas');

  // Configurar scroll horizontal nativo sin clones
  track.style.overflowX = 'auto';
  track.style.scrollSnapType = 'x mandatory';
  track.style.scrollBehavior = 'smooth';

  // Aplicar scroll snap a los chips originales
  originalChips.forEach((chip, index) => {
    chip.style.scrollSnapAlign = 'center';
    chip.style.flexShrink = '0'; // Evitar que los chips se encojan
  });

  // Ya no creamos DynamicCarouselManager para evitar clonación
  console.log('Carrusel configurado con scroll nativo - sin duplicación');

  // Event handlers básicos para scroll (sin auto-scroll infinito)
  window.addEventListener('blur', () => {
    // Scroll behavior sin auto-scroll
  });

  window.addEventListener('focus', () => {
    // Scroll behavior sin auto-scroll
  });

  // Orientation change para scroll nativo
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      if (track) {
        // Reajustar scroll después del cambio de orientación
        track.scrollLeft = 0;
      }
    }, 300);
  });

  console.log('SetupMobileCarousel completado - scroll nativo sin clonación');
  return null; // Ya no retornamos carouselManager
}
