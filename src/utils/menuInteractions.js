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

function setupMobileCarousel() {
  const track = document.querySelector('.category-nav-track');
  if (!track || track.children.length === 0) return;

  const chips = Array.from(track.children);
  if (chips.length === 0) return;

  let animationFrameId = null;
  let isUserInteracting = false;
  let userInteractionTimeout = null;
  let scrollSpeed = 0.5; // pixels per frame
  let lastUserScrollTime = 0;
  let isMouseOver = false;

  // Clone chips many times for truly infinite scroll
  const clonedChips = [];
  for (let i = 0; i < 10; i++) {
    chips.forEach(chip => {
      const clone = chip.cloneNode(true);
      clone.classList.add('cloned-chip');
      clonedChips.push(clone);
      track.appendChild(clone);
    });
  }

  // Calculate total width of original chips
  function getOriginalChipsWidth() {
    let totalWidth = 0;
    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.gap) || 16;

    chips.forEach(chip => {
      totalWidth += chip.offsetWidth + gap;
    });

    return totalWidth;
  }

  // Continuous auto-scroll animation
  function continuousScroll() {
    if (isUserInteracting || isMouseOver) {
      animationFrameId = requestAnimationFrame(continuousScroll);
      return;
    }

    const originalWidth = getOriginalChipsWidth();
    track.scrollLeft += scrollSpeed;

    // When we've scrolled past one complete set, reset seamlessly
    if (track.scrollLeft >= originalWidth) {
      track.scrollLeft = track.scrollLeft - originalWidth;
    }

    animationFrameId = requestAnimationFrame(continuousScroll);
  }

  function startAutoScroll() {
    if (animationFrameId) return; // Ya está corriendo
    continuousScroll();
  }

  function stopAutoScroll() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  function handleUserScroll() {
    lastUserScrollTime = Date.now();
    isUserInteracting = true;

    clearTimeout(userInteractionTimeout);
    userInteractionTimeout = setTimeout(() => {
      isUserInteracting = false;
    }, 800);
  }

  function handleMouseEnter() {
    isMouseOver = true;
  }

  function handleMouseLeave() {
    isMouseOver = false;
  }

  function handleTouch() {
    isUserInteracting = true;
    clearTimeout(userInteractionTimeout);
    userInteractionTimeout = setTimeout(() => {
      isUserInteracting = false;
    }, 800);
  }

  // Event listeners
  track.addEventListener('mouseenter', handleMouseEnter, { passive: true });
  track.addEventListener('mouseleave', handleMouseLeave, { passive: true });
  track.addEventListener('touchstart', handleTouch, { passive: true });
  track.addEventListener('touchmove', handleTouch, { passive: true });
  track.addEventListener('touchend', () => {
    setTimeout(() => {
      if (!isUserInteracting) {
        isMouseOver = false;
      }
    }, 300);
  }, { passive: true });
  track.addEventListener('scroll', handleUserScroll, { passive: true });
  track.addEventListener('wheel', handleUserScroll, { passive: true });

  // Handle chip clicks
  track.querySelectorAll('.category-chip').forEach((chip) => {
    chip.addEventListener('click', (e) => {
      e.preventDefault();
      handleTouch();

      // Scroll to section
      const targetId = chip.getAttribute('href').substring(1);
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
    });
  });

  // Start auto-scroll immediately
  setTimeout(() => {
    startAutoScroll();
  }, 500);

  // Pause on window blur, resume on focus
  window.addEventListener('blur', () => {
    stopAutoScroll();
  });

  window.addEventListener('focus', () => {
    if (!isUserInteracting && !isMouseOver) {
      startAutoScroll();
    }
  });

  // Reintentar el inicio si no hay animación después de un tiempo
  setTimeout(() => {
    if (!animationFrameId) {
      console.log('Restarting carousel animation');
      startAutoScroll();
    }
  }, 2000);
}
