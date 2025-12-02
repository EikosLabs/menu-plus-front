/**
 * Utilidad central para normalización consistente de IDs
 * Resuelve el problema de inconsistencia de tipos (strings vs numbers)
 * entre backend .NET (envía strings) y frontend React
 */

/**
 * Normaliza cualquier ID a string consistente
 * @param {*} id - El ID a normalizar (puede ser string, number, null, undefined)
 * @returns {string|null} - ID normalizado como string o null si es null/undefined
 */
export const normalizeId = (id) => {
    if (id === null || id === undefined) return null;
    return String(id);
};

/**
 * Compara dos IDs de forma segura independientemente de su tipo
 * @param {*} id1 - Primer ID a comparar
 * @param {*} id2 - Segundo ID a comparar
 * @returns {boolean} - True si los IDs son iguales después de normalización
 */
export const compareIds = (id1, id2) => {
    return normalizeId(id1) === normalizeId(id2);
};

/**
 * Normaliza todos los IDs relevantes en un objeto menuItem
 * @param {Object} item - Objeto menuItem con IDs a normalizar
 * @returns {Object} - Objeto con todos los IDs normalizados a strings
 */
export const normalizeMenuItemIds = (item) => {
    if (!item) return item;

    return {
        ...item,
        id: normalizeId(item.id),
        sectionId: normalizeId(item.sectionId),
        menuId: normalizeId(item.menuId),
        menuItemCategoryId: normalizeId(item.menuItemCategoryId),
        businessId: normalizeId(item.businessId),
    };
};

/**
 * Normaliza todos los IDs relevantes en un objeto section
 * @param {Object} section - Objeto section con IDs a normalizar
 * @returns {Object} - Objeto con todos los IDs normalizados a strings
 */
export const normalizeSectionIds = (section) => {
    if (!section) return section;

    return {
        ...section,
        id: normalizeId(section.id),
        menuId: normalizeId(section.menuId),
        businessId: normalizeId(section.businessId),
    };
};

/**
 * Normaliza IDs en un array de menuItems
 * @param {Array} items - Array de menuItems
 * @returns {Array} - Array con IDs normalizados
 */
export const normalizeMenuItemIdsArray = (items) => {
    if (!Array.isArray(items)) return items;
    return items.map(normalizeMenuItemIds);
};

/**
 * Normaliza IDs en un array de sections
 * @param {Array} sections - Array de sections
 * @returns {Array} - Array con IDs normalizados
 */
export const normalizeSectionIdsArray = (sections) => {
    if (!Array.isArray(sections)) return sections;
    return sections.map(normalizeSectionIds);
};

/**
 * Verifica si un ID es válido (no null, undefined, o vacío)
 * @param {*} id - ID a validar
 * @returns {boolean} - True si el ID es válido
 */
export const isValidId = (id) => {
    const normalized = normalizeId(id);
    return normalized !== null && normalized !== undefined && normalized !== '';
};

// Exportaciones por defecto para uso común
export default {
    normalizeId,
    compareIds,
    normalizeMenuItemIds,
    normalizeSectionIds,
    normalizeMenuItemIdsArray,
    normalizeSectionIdsArray,
    isValidId,
};