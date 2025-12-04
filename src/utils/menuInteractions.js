import { getCurrencySymbol } from './currencies.js';

export function initializeInteractiveElements() {
  setupCategoryNavigation();
  setupScrollAnimations();
  setupActiveCategory();
  setupDishModal();
  setupMobileCarousel();
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

function setupActiveCategory() {
  const sections = document.querySelectorAll('.menu-section');
  const navLinks = document.querySelectorAll('.category-chip');
  const categoryNav = document.querySelector('.category-nav');

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

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  });
}


function setupDishModal() {
  const modal = document.getElementById('dish-modal');
  const modalBackdrop = modal.querySelector('.dish-modal-backdrop');
  const modalClose = modal.querySelector('.dish-modal-close');

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
    if (e.key === 'Escape' && modal.style.display !== 'none') {
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
    elements.price.textContent = `${getCurrencySymbol(item.currencyType)}${item.price.toFixed(2)}`;
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
    chip.style.scrollSnapAlign = 'start';
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
