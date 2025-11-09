import { getCurrencySymbol } from './currencies.js';

/**
 * Initialize modal event handlers
 */
export function initializeModal() {
	const modal = document.getElementById('dish-modal');
	const modalBackdrop = modal?.querySelector('.dish-modal-backdrop');
	const modalClose = modal?.querySelector('.dish-modal-close');

	if (!modal || !modalBackdrop || !modalClose) return;

	// Open modal when clicking on a menu item
	document.querySelectorAll('.clickable-item').forEach(item => {
		item.addEventListener('click', function() {
			const itemData = JSON.parse(this.getAttribute('data-item'));
			openDishModal(itemData);
		});
	});

	// Close modal handlers
	modalClose.addEventListener('click', closeDishModal);
	modalBackdrop.addEventListener('click', closeDishModal);

	// Close on ESC key
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && modal.style.display !== 'none') {
			closeDishModal();
		}
	});
}

/**
 * Open dish detail modal
 */
function openDishModal(item) {
	const modal = document.getElementById('dish-modal');
	const modalBackdrop = modal.querySelector('.dish-modal-backdrop');
	const modalContent = modal.querySelector('.dish-modal-content');
	const modalImage = document.getElementById('modal-dish-image');
	const modalImageWrapper = document.querySelector('.dish-modal-image-wrapper');
	const modalName = document.getElementById('modal-dish-name');
	const modalPrice = document.getElementById('modal-dish-price');
	const modalDescription = document.getElementById('modal-dish-description');
	const modalAllergens = document.getElementById('modal-dish-allergens');

	modalName.textContent = item.name;
	const currencySymbol = getCurrencySymbol(item.currencyType);
	modalPrice.textContent = `${currencySymbol}${item.price.toFixed(2)}`;

	if (item.description) {
		modalDescription.textContent = item.description;
		modalDescription.style.display = 'block';
	} else {
		modalDescription.style.display = 'none';
	}

	if (item.imageUrl && item.imageUrl.trim() !== '') {
		modalImage.src = item.imageUrl;
		modalImage.alt = item.name;
		modalImage.style.display = 'block';
		modalImage.onerror = function() {
			this.style.display = 'none';
			modalImageWrapper.querySelector('.dish-modal-image-placeholder').style.display = 'flex';
		};
		modalImageWrapper.querySelector('.dish-modal-image-placeholder').style.display = 'none';
	} else {
		modalImage.style.display = 'none';
		modalImageWrapper.querySelector('.dish-modal-image-placeholder').style.display = 'flex';
	}

	if (item.allergens && item.allergens.length > 0) {
		modalAllergens.innerHTML = `
			<h3 class="allergens-title">⚠️ Alérgenos:</h3>
			<div class="allergens-list">
				${item.allergens.map(allergen => `<span class="allergen-badge">${allergen}</span>`).join('')}
			</div>
		`;
		modalAllergens.style.display = 'block';
	} else {
		modalAllergens.style.display = 'none';
	}

	// Use View Transitions API if supported
	if (document.startViewTransition) {
		document.startViewTransition(() => {
			modal.style.display = 'flex';
			document.body.style.overflow = 'hidden';
		});
	} else {
		modal.style.display = 'flex';
		document.body.style.overflow = 'hidden';
	}

	// Trigger animations
	setTimeout(() => {
		modalBackdrop.classList.add('active');
		modalContent.classList.add('active');
	}, 10);
}

/**
 * Close dish detail modal
 */
function closeDishModal() {
	const modal = document.getElementById('dish-modal');
	const modalBackdrop = modal.querySelector('.dish-modal-backdrop');
	const modalContent = modal.querySelector('.dish-modal-content');

	modalBackdrop.classList.remove('active');
	modalContent.classList.remove('active');

	setTimeout(() => {
		if (document.startViewTransition) {
			document.startViewTransition(() => {
				modal.style.display = 'none';
				document.body.style.overflow = '';
			});
		} else {
			modal.style.display = 'none';
			document.body.style.overflow = '';
		}
	}, 300);
}
