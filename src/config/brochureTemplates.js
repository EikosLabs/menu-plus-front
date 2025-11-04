/**
 * Brochure Templates Configuration
 * Hardcoded templates for different brochure styles
 */

export const BROCHURE_TEMPLATES = {
  classic: {
    id: 'classic',
    name: 'Clásico',
    description: 'Diseño tradicional de menú de restaurante con bordes elegantes',
    colors: {
      primary: '#2c1810',
      secondary: '#8b4513',
      accent: '#d4af37',
      background: '#fffef7',
      text: '#2c1810',
      textLight: '#6b5d54'
    },
    fonts: {
      heading: 'Georgia, serif',
      body: 'Garamond, serif',
      price: 'Georgia, serif'
    },
    layout: {
      columns: 2,
      spacing: 'normal',
      showImages: true,
      showPrices: true,
      showDescriptions: true,
      borderStyle: 'classic',
      headerStyle: 'centered'
    },
    styles: {
      page: {
        padding: '40px',
        fontFamily: 'Garamond, serif',
        backgroundColor: '#fffef7',
        border: '3px double #8b4513'
      },
      header: {
        textAlign: 'center',
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '2px solid #d4af37'
      },
      title: {
        fontSize: '36px',
        fontFamily: 'Georgia, serif',
        color: '#2c1810',
        marginBottom: '10px',
        fontWeight: 'bold'
      },
      subtitle: {
        fontSize: '18px',
        color: '#8b4513',
        fontStyle: 'italic'
      },
      section: {
        marginBottom: '30px'
      },
      sectionTitle: {
        fontSize: '24px',
        fontFamily: 'Georgia, serif',
        color: '#2c1810',
        borderBottom: '1px solid #d4af37',
        paddingBottom: '8px',
        marginBottom: '15px'
      },
      item: {
        marginBottom: '20px',
        display: 'flex',
        gap: '15px'
      },
      itemImage: {
        width: '80px',
        height: '80px',
        objectFit: 'cover',
        borderRadius: '4px',
        border: '2px solid #d4af37'
      },
      itemName: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#2c1810',
        marginBottom: '5px'
      },
      itemDescription: {
        fontSize: '13px',
        color: '#6b5d54',
        lineHeight: '1.4',
        marginBottom: '5px'
      },
      itemPrice: {
        fontSize: '16px',
        fontFamily: 'Georgia, serif',
        color: '#8b4513',
        fontWeight: 'bold'
      }
    }
  },

  modern: {
    id: 'modern',
    name: 'Moderno',
    description: 'Diseño contemporáneo con tipografía bold y colores vibrantes',
    colors: {
      primary: '#000000',
      secondary: '#cf5c36',
      accent: '#efc88b',
      background: '#ffffff',
      text: '#000000',
      textLight: '#666666'
    },
    fonts: {
      heading: 'system-ui, -apple-system, sans-serif',
      body: 'system-ui, -apple-system, sans-serif',
      price: 'system-ui, -apple-system, sans-serif'
    },
    layout: {
      columns: 1,
      spacing: 'spacious',
      showImages: true,
      showPrices: true,
      showDescriptions: true,
      borderStyle: 'bold',
      headerStyle: 'left-aligned'
    },
    styles: {
      page: {
        padding: '50px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: '#ffffff',
        border: '6px solid #000000'
      },
      header: {
        marginBottom: '40px',
        paddingBottom: '20px',
        borderBottom: '4px solid #cf5c36'
      },
      title: {
        fontSize: '48px',
        fontWeight: '900',
        color: '#000000',
        marginBottom: '10px',
        letterSpacing: '-2px'
      },
      subtitle: {
        fontSize: '20px',
        color: '#cf5c36',
        fontWeight: '600'
      },
      section: {
        marginBottom: '40px'
      },
      sectionTitle: {
        fontSize: '32px',
        fontWeight: '800',
        color: '#000000',
        marginBottom: '20px',
        textTransform: 'uppercase',
        letterSpacing: '-1px'
      },
      item: {
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: '#f8f8f8',
        border: '4px solid #000000',
        boxShadow: '8px 8px 0 #efc88b'
      },
      itemImage: {
        width: '100%',
        height: '200px',
        objectFit: 'cover',
        marginBottom: '15px',
        border: '3px solid #000000'
      },
      itemName: {
        fontSize: '22px',
        fontWeight: '800',
        color: '#000000',
        marginBottom: '8px'
      },
      itemDescription: {
        fontSize: '14px',
        color: '#666666',
        lineHeight: '1.6',
        marginBottom: '10px'
      },
      itemPrice: {
        fontSize: '24px',
        fontWeight: '900',
        color: '#cf5c36'
      }
    }
  },

  minimal: {
    id: 'minimal',
    name: 'Minimalista',
    description: 'Diseño limpio y minimalista con mucho espacio en blanco',
    colors: {
      primary: '#1a1a1a',
      secondary: '#666666',
      accent: '#e0e0e0',
      background: '#ffffff',
      text: '#1a1a1a',
      textLight: '#999999'
    },
    fonts: {
      heading: 'Helvetica, Arial, sans-serif',
      body: 'Helvetica, Arial, sans-serif',
      price: 'Helvetica, Arial, sans-serif'
    },
    layout: {
      columns: 1,
      spacing: 'spacious',
      showImages: false,
      showPrices: true,
      showDescriptions: true,
      borderStyle: 'none',
      headerStyle: 'centered'
    },
    styles: {
      page: {
        padding: '60px',
        fontFamily: 'Helvetica, Arial, sans-serif',
        backgroundColor: '#ffffff'
      },
      header: {
        textAlign: 'center',
        marginBottom: '50px'
      },
      title: {
        fontSize: '40px',
        fontWeight: '300',
        color: '#1a1a1a',
        marginBottom: '15px',
        letterSpacing: '2px'
      },
      subtitle: {
        fontSize: '16px',
        color: '#666666',
        fontWeight: '300',
        letterSpacing: '1px'
      },
      section: {
        marginBottom: '50px'
      },
      sectionTitle: {
        fontSize: '24px',
        fontWeight: '400',
        color: '#1a1a1a',
        marginBottom: '30px',
        letterSpacing: '1px',
        borderBottom: '1px solid #e0e0e0',
        paddingBottom: '10px'
      },
      item: {
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      },
      itemName: {
        fontSize: '18px',
        fontWeight: '400',
        color: '#1a1a1a',
        marginBottom: '8px'
      },
      itemDescription: {
        fontSize: '13px',
        color: '#999999',
        lineHeight: '1.6',
        marginBottom: '0',
        maxWidth: '70%'
      },
      itemPrice: {
        fontSize: '18px',
        fontWeight: '300',
        color: '#1a1a1a'
      }
    }
  },

  elegant: {
    id: 'elegant',
    name: 'Elegante',
    description: 'Diseño sofisticado con tipografía serif y detalles ornamentales',
    colors: {
      primary: '#1b1464',
      secondary: '#7c5295',
      accent: '#c9a0dc',
      background: '#faf8f3',
      text: '#1b1464',
      textLight: '#7c5295'
    },
    fonts: {
      heading: 'Playfair Display, Georgia, serif',
      body: 'Lora, Georgia, serif',
      price: 'Playfair Display, Georgia, serif'
    },
    layout: {
      columns: 2,
      spacing: 'normal',
      showImages: true,
      showPrices: true,
      showDescriptions: true,
      borderStyle: 'elegant',
      headerStyle: 'centered'
    },
    styles: {
      page: {
        padding: '45px',
        fontFamily: 'Lora, Georgia, serif',
        backgroundColor: '#faf8f3',
        border: '2px solid #c9a0dc',
        borderRadius: '8px'
      },
      header: {
        textAlign: 'center',
        marginBottom: '35px',
        paddingBottom: '25px',
        borderBottom: '2px solid #c9a0dc',
        position: 'relative'
      },
      title: {
        fontSize: '42px',
        fontFamily: 'Playfair Display, Georgia, serif',
        color: '#1b1464',
        marginBottom: '12px',
        fontWeight: '700',
        fontStyle: 'italic'
      },
      subtitle: {
        fontSize: '18px',
        color: '#7c5295',
        fontStyle: 'italic',
        letterSpacing: '1px'
      },
      section: {
        marginBottom: '35px'
      },
      sectionTitle: {
        fontSize: '28px',
        fontFamily: 'Playfair Display, Georgia, serif',
        color: '#1b1464',
        marginBottom: '20px',
        fontStyle: 'italic',
        textAlign: 'center',
        fontWeight: '600'
      },
      item: {
        marginBottom: '25px',
        padding: '15px',
        backgroundColor: '#ffffff',
        borderRadius: '6px',
        border: '1px solid #e8dff5'
      },
      itemImage: {
        width: '100%',
        height: '150px',
        objectFit: 'cover',
        borderRadius: '4px',
        marginBottom: '12px',
        border: '1px solid #c9a0dc'
      },
      itemName: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#1b1464',
        marginBottom: '6px',
        fontFamily: 'Playfair Display, Georgia, serif',
        fontStyle: 'italic'
      },
      itemDescription: {
        fontSize: '13px',
        color: '#7c5295',
        lineHeight: '1.5',
        marginBottom: '8px'
      },
      itemPrice: {
        fontSize: '17px',
        fontFamily: 'Playfair Display, Georgia, serif',
        color: '#1b1464',
        fontWeight: '600'
      }
    }
  }
};

/**
 * Get template by ID
 * @param {string} templateId - Template ID
 * @returns {Object} Template configuration
 */
export function getTemplate(templateId) {
  return BROCHURE_TEMPLATES[templateId] || BROCHURE_TEMPLATES.classic;
}

/**
 * Get all template IDs
 * @returns {Array<string>}
 */
export function getTemplateIds() {
  return Object.keys(BROCHURE_TEMPLATES);
}

/**
 * Get all templates as array
 * @returns {Array<Object>}
 */
export function getAllTemplates() {
  return Object.values(BROCHURE_TEMPLATES);
}

export default BROCHURE_TEMPLATES;
