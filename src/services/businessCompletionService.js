import { getAuthToken } from './authService';

const API_BASE_URL = import.meta.env.PUBLIC_API_URL || '/api';

export const businessCompletionService = {
  /**
   * Get business profile completion data
   * @param {string} businessId - Business ID
   * @returns {Promise<Object>} Business completion data
   */
  async getBusinessCompletion(businessId) {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/businesses/${businessId}/completion`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching business completion data:', error);
      throw error;
    }
  },

  /**
   * Get business completion data with fallback to client-side calculation
   * @param {Object} businessData - Basic business data
   * @returns {Promise<Object>} Enhanced business completion data
   */
  async getBusinessCompletionWithFallback(businessData) {
    try {
      // Try to get completion data from backend
      if (businessData.id) {
        const backendData = await this.getBusinessCompletion(businessData.id);
        return {
          ...businessData,
          ...backendData
        };
      }
    } catch (error) {
      console.warn('Backend completion data not available, using client-side calculation:', error);
    }

    // Fallback to client-side calculation
    return this.calculateCompletionClientSide(businessData);
  },

  /**
   * Calculate completion percentage client-side (fallback)
   * @param {Object} businessData - Business data
   * @returns {Object} Completion data
   */
  calculateCompletionClientSide(businessData) {
    const sections = [
      {
        id: 'basic-info',
        title: 'Información Básica',
        icon: '🏪',
        weight: 25,
        fields: [
          { key: 'name', label: 'Nombre del Negocio', completed: false },
          { key: 'description', label: 'Descripción', completed: false },
          { key: 'categoryId', label: 'Categoría', completed: false },
          { key: 'address', label: 'Dirección', completed: false }
        ]
      },
      {
        id: 'contact',
        title: 'Contacto',
        icon: '📞',
        weight: 20,
        fields: [
          { key: 'phoneNumber', label: 'Teléfono', completed: false },
          { key: 'email', label: 'Email', completed: false },
          { key: 'whatsAppNumber', label: 'WhatsApp', completed: false }
        ]
      },
      {
        id: 'branding',
        title: 'Branding',
        icon: '🎨',
        weight: 20,
        fields: [
          { key: 'imageKey', label: 'Logo', completed: false },
          { key: 'primaryColor', label: 'Color Primario', completed: false },
          { key: 'template', label: 'Plantilla', completed: false }
        ]
      },
      {
        id: 'social',
        title: 'Redes Sociales',
        icon: '🌐',
        weight: 15,
        fields: [
          { key: 'facebookUrl', label: 'Facebook', completed: false },
          { key: 'instagramUrl', label: 'Instagram', completed: false },
          { key: 'twitterUrl', label: 'Twitter', completed: false }
        ]
      },
      {
        id: 'menu',
        title: 'Menú',
        icon: '📋',
        weight: 20,
        fields: [
          { key: 'hasItems', label: 'Tiene Items en el Menú', completed: false },
          { key: 'hasCategories', label: 'Tiene Categorías', completed: false }
        ]
      }
    ];

    // Calculate completion for each section
    let totalScore = 0;
    let maxScore = 0;

    sections.forEach(section => {
      let sectionScore = 0;
      let sectionMaxScore = section.fields.length;

      section.fields.forEach(field => {
        let fieldCompleted = false;

        switch (field.key) {
          case 'name':
            fieldCompleted = businessData.name && businessData.name.trim().length > 0;
            break;
          case 'description':
            fieldCompleted = businessData.description && businessData.description.trim().length > 20;
            break;
          case 'categoryId':
            fieldCompleted = businessData.categoryId && businessData.categoryId > 0;
            break;
          case 'address':
            fieldCompleted = businessData.address && businessData.address.trim().length > 0;
            break;
          case 'phoneNumber':
            fieldCompleted = businessData.phoneNumber && businessData.phoneNumber.trim().length > 0;
            break;
          case 'email':
            fieldCompleted = businessData.email && businessData.email.includes('@');
            break;
          case 'whatsAppNumber':
            fieldCompleted = businessData.whatsAppNumber && businessData.whatsAppNumber.trim().length > 0;
            break;
          case 'imageKey':
          case 'imageUrl':
            fieldCompleted = businessData.imageKey || businessData.imageUrl;
            break;
          case 'primaryColor':
            fieldCompleted = businessData.primaryColor && businessData.primaryColor.trim().length > 0;
            break;
          case 'template':
            fieldCompleted = businessData.template && businessData.template !== 'default';
            break;
          case 'facebookUrl':
            fieldCompleted = businessData.facebookUrl && businessData.facebookUrl.trim().length > 0;
            break;
          case 'instagramUrl':
            fieldCompleted = businessData.instagramUrl && businessData.instagramUrl.trim().length > 0;
            break;
          case 'twitterUrl':
            fieldCompleted = businessData.twitterUrl && businessData.twitterUrl.trim().length > 0;
            break;
          case 'hasItems':
            fieldCompleted = businessData.menuItemsCount > 0;
            break;
          case 'hasCategories':
            fieldCompleted = businessData.menuCategoriesCount > 0;
            break;
        }

        field.completed = fieldCompleted;
        if (fieldCompleted) {
          sectionScore++;
        }
      });

      section.completed = sectionScore === sectionMaxScore;
      section.completionPercentage = (sectionScore / sectionMaxScore) * 100;

      totalScore += (sectionScore / sectionMaxScore) * section.weight;
      maxScore += section.weight;
    });

    const overallPercentage = Math.round((totalScore / maxScore) * 100);

    return {
      ...businessData,
      completionPercentage: overallPercentage,
      completionSections: sections,
      completionLevel: this.getCompletionLevel(overallPercentage),
      lastUpdated: new Date().toISOString()
    };
  },

  /**
   * Get completion level based on percentage
   * @param {number} percentage - Completion percentage
   * @returns {Object} Completion level data
   */
  getCompletionLevel(percentage) {
    if (percentage >= 90) return { level: 'Experto', emoji: '🏆', color: 'gold', points: 500 };
    if (percentage >= 70) return { level: 'Avanzado', emoji: '⭐', color: 'purple', points: 300 };
    if (percentage >= 50) return { level: 'Intermedio', emoji: '🚀', color: 'blue', points: 200 };
    if (percentage >= 30) return { level: 'Principiante', emoji: '🌱', color: 'green', points: 100 };
    return { level: 'Novato', emoji: '🥚', color: 'gray', points: 50 };
  },

  /**
   * Track completion activity for analytics
   * @param {string} businessId - Business ID
   * @param {string} section - Section completed
   * @param {string} action - Action type
   */
  async trackCompletionActivity(businessId, section, action = 'view') {
    try {
      const token = getAuthToken();
      if (!token) return;

      await fetch(`${API_BASE_URL}/analytics/track-completion`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          businessId,
          section,
          action,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.warn('Failed to track completion activity:', error);
    }
  }
};

export default businessCompletionService;