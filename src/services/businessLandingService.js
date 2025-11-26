const API_URL = import.meta.env.PUBLIC_API_URL || "/api";

/**
 * Service for fetching business landing page data
 */
class BusinessLandingService {
	/**
	 * Get business landing page data by slug (public endpoint)
	 * @param {string} slug - Business slug
	 * @returns {Promise<Object>} Business landing page data
	 */
	async getBusinessBySlug(slug) {
		try {
			const response = await fetch(`${API_URL}/business-landing/${slug}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (!response.ok) {
				if (response.status === 404) {
					throw new Error('Business not found');
				}
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			return data;
		} catch (error) {
			console.error('Error fetching business landing page:', error);
			throw error;
		}
	}
}

const businessLandingService = new BusinessLandingService();
export default businessLandingService;
