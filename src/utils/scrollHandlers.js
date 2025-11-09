/**
 * Initialize smooth scroll for category navigation
 */
export function initializeSmoothScroll() {
	document.querySelectorAll('.category-chip').forEach(link => {
		link.addEventListener('click', function(e) {
			e.preventDefault();
			const targetId = this.getAttribute('href').substring(1);
			const targetEl = document.getElementById(targetId);
			if (targetEl) {
				const offset = 100;
				const elementPosition = targetEl.getBoundingClientRect().top;
				const offsetPosition = elementPosition + window.pageYOffset - offset;

				window.scrollTo({
					top: offsetPosition,
					behavior: 'smooth'
				});

				// Highlight active category
				document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
				this.classList.add('active');
			}
		});
	});
}

/**
 * Initialize scroll animations
 */
export function initializeScrollAnimations() {
	const observerOptions = {
		threshold: 0.1,
		rootMargin: '0px 0px -50px 0px'
	};

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

/**
 * Update active category on scroll
 */
export function initializeActiveCategory() {
	const sections = document.querySelectorAll('.menu-section');
	const navLinks = document.querySelectorAll('.category-chip');

	window.addEventListener('scroll', () => {
		let current = '';
		sections.forEach(section => {
			const sectionTop = section.offsetTop;
			if (window.pageYOffset >= sectionTop - 200) {
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

/**
 * Initialize all scroll-related handlers
 */
export function initializeScrollHandlers() {
	initializeSmoothScroll();
	initializeScrollAnimations();
	initializeActiveCategory();
}
