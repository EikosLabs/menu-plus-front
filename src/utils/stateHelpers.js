/**
 * State Helper Utilities
 * Simplify complex nested state updates for business/menu management
 */

/**
 * Update a menu item in the business state
 * @param {Array} businesses - Current businesses array
 * @param {number} menuId - Menu ID containing the item
 * @param {Object} newItem - New item to add
 * @returns {Array} Updated businesses array
 */
export const addItemToMenu = (businesses, menuId, newItem) => {
  return businesses.map(business => ({
    ...business,
    menus: business.menus?.map(menu =>
      menu.id === menuId
        ? {
            ...menu,
            menuItems: [...(menu.menuItems || []), newItem],
            sections: menu.sections?.map(section =>
              section.id === newItem.sectionId
                ? { ...section, menuItems: [...(section.menuItems || []), newItem] }
                : section
            ),
          }
        : menu
    ),
  }));
};

/**
 * Update an existing menu item in the business state
 * @param {Array} businesses - Current businesses array
 * @param {Object} updatedItem - Updated item data
 * @returns {Array} Updated businesses array
 */
export const updateItemInMenu = (businesses, updatedItem) => {
  return businesses.map(business => ({
    ...business,
    menus: business.menus?.map(menu => ({
      ...menu,
      menuItems: menu.menuItems?.map(item =>
        item.id === updatedItem.id ? { ...item, ...updatedItem } : item
      ),
      sections: menu.sections?.map(section => ({
        ...section,
        menuItems: section.menuItems?.map(item =>
          item.id === updatedItem.id ? { ...item, ...updatedItem } : item
        ),
      })),
    })),
  }));
};

/**
 * Remove a menu item from the business state
 * @param {Array} businesses - Current businesses array
 * @param {number} itemId - Item ID to remove
 * @returns {Array} Updated businesses array
 */
export const removeItemFromMenu = (businesses, itemId) => {
  return businesses.map(business => ({
    ...business,
    menus: business.menus?.map(menu => ({
      ...menu,
      menuItems: menu.menuItems?.filter(item => item.id !== itemId),
      sections: menu.sections?.map(section => ({
        ...section,
        menuItems: section.menuItems?.filter(item => item.id !== itemId),
      })),
    })),
  }));
};

/**
 * Add a section to a menu
 * @param {Array} businesses - Current businesses array
 * @param {Object} newSection - New section to add
 * @returns {Array} Updated businesses array
 */
export const addSectionToMenu = (businesses, newSection) => {
  return businesses.map(business => ({
    ...business,
    menus: business.menus?.map(menu =>
      menu.id === newSection.menuId
        ? {
            ...menu,
            sections: [...(menu.sections || []), { ...newSection, menuItems: [] }],
          }
        : menu
    ),
  }));
};

/**
 * Update a section in a menu
 * @param {Array} businesses - Current businesses array
 * @param {Object} updatedSection - Updated section data
 * @returns {Array} Updated businesses array
 */
export const updateSectionInMenu = (businesses, updatedSection) => {
  return businesses.map(business => ({
    ...business,
    menus: business.menus?.map(menu => ({
      ...menu,
      sections: menu.sections?.map(section =>
        section.id === updatedSection.id ? { ...section, ...updatedSection } : section
      ),
    })),
  }));
};

/**
 * Remove a section from a menu
 * @param {Array} businesses - Current businesses array
 * @param {number} sectionId - Section ID to remove
 * @returns {Array} Updated businesses array
 */
export const removeSectionFromMenu = (businesses, sectionId) => {
  return businesses.map(business => ({
    ...business,
    menus: business.menus?.map(menu => ({
      ...menu,
      sections: menu.sections?.filter(section => section.id !== sectionId),
    })),
  }));
};

/**
 * Move an item between sections
 * @param {Array} businesses - Current businesses array
 * @param {Object} item - Item to move
 * @param {number} oldSectionId - Source section ID
 * @param {number} newSectionId - Destination section ID
 * @returns {Array} Updated businesses array
 */
export const moveItemBetweenSections = (businesses, item, oldSectionId, newSectionId) => {
  return businesses.map(business => ({
    ...business,
    menus: business.menus?.map(menu => ({
      ...menu,
      sections: menu.sections?.map(section => {
        const sectionId = Number(section.id);
        // Remove from old section
        if (sectionId === Number(oldSectionId)) {
          return {
            ...section,
            menuItems: section.menuItems?.filter(i => i.id !== item.id) || [],
          };
        }
        // Add to new section
        if (sectionId === Number(newSectionId)) {
          return {
            ...section,
            menuItems: [...(section.menuItems || []), item],
          };
        }
        return section;
      }),
    })),
  }));
};
