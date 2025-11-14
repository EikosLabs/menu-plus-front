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
  // Only run on mobile devices
  if (window.innerWidth > 768) return;

  const track = document.querySelector('.category-nav-track');
  if (!track || track.children.length === 0) return;

  const chips = Array.from(track.children);
  if (chips.length === 0) return;

  let currentIndex = 0;
  let autoScrollInterval;
  let isUserInteracting = false;
  let userInteractionTimeout;
  let isResetting = false;

  // Clone chips for infinite effect
  const clonedChips = chips.map(chip => {
    const clone = chip.cloneNode(true);
    clone.classList.add('cloned-chip');
    return clone;
  });
  clonedChips.forEach(chip => track.appendChild(chip));

  function getScrollDistance() {
    const firstChip = chips[0];
    if (!firstChip) return 0;
    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.gap) || 16;
    return firstChip.offsetWidth + gap;
  }

  function scrollToIndex(index, smooth = true) {
    const scrollDistance = getScrollDistance();
    const scrollPosition = index * scrollDistance;
    track.scrollTo({
      left: scrollPosition,
      behavior: smooth ? 'smooth' : 'auto'
    });
  }

  function autoScroll() {
    if (isUserInteracting || isResetting) return;

    currentIndex++;

    // If we've scrolled past the original items, reset to start
    if (currentIndex >= chips.length) {
      isResetting = true;
      scrollToIndex(currentIndex, true);

      // After smooth animation, snap back instantly
      setTimeout(() => {
        currentIndex = 0;
        scrollToIndex(0, false);
        setTimeout(() => {
          isResetting = false;
        }, 50);
      }, 500);
    } else {
      scrollToIndex(currentIndex, true);
    }
  }

  function startAutoScroll() {
    stopAutoScroll();
    autoScrollInterval = setInterval(autoScroll, 2500);
  }

  function stopAutoScroll() {
    if (autoScrollInterval) {
      clearInterval(autoScrollInterval);
      autoScrollInterval = null;
    }
  }

  function handleUserInteraction() {
    isUserInteracting = true;
    stopAutoScroll();

    clearTimeout(userInteractionTimeout);
    userInteractionTimeout = setTimeout(() => {
      isUserInteracting = false;

      // Calculate current index based on scroll position
      const scrollDistance = getScrollDistance();
      const scrollLeft = track.scrollLeft;
      currentIndex = Math.round(scrollLeft / scrollDistance);

      // If we're in the cloned section, snap to corresponding real chip
      if (currentIndex >= chips.length) {
        currentIndex = currentIndex % chips.length;
        scrollToIndex(currentIndex, false);
      }

      startAutoScroll();
    }, 1500);
  }

  // Event listeners
  track.addEventListener('touchstart', handleUserInteraction, { passive: true });
  track.addEventListener('scroll', handleUserInteraction, { passive: true });

  // Handle chip clicks
  track.querySelectorAll('.category-chip').forEach((chip, index) => {
    chip.addEventListener('click', (e) => {
      e.preventDefault();
      handleUserInteraction();

      // Get the actual index (handle clones)
      const actualIndex = index % chips.length;
      currentIndex = actualIndex;

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

  // Start auto-scroll after a brief delay
  setTimeout(() => {
    startAutoScroll();
  }, 1000);

  // Pause on window blur, resume on focus
  window.addEventListener('blur', stopAutoScroll);
  window.addEventListener('focus', () => {
    if (!isUserInteracting) startAutoScroll();
  });

  // Clean up on resize to desktop
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (window.innerWidth > 768) {
        stopAutoScroll();
        clonedChips.forEach(clone => {
          if (clone.parentNode) clone.remove();
        });
      }
    }, 250);
  });
}
