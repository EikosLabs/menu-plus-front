/**
 * Utility to map business category IDs or names to AI contexts
 */

export const AI_CONTEXTS = {
    FOOD: 'food',
    CLOTHING: 'clothing',
    OBJECTS: 'objects',
    GENERAL: 'general'
};

/**
 * Maps a business category ID or name to an AI context
 * @param {number|string} categoryIdOrName
 * @returns {string}
 */
export const getBusinessAIContext = (categoryIdOrName) => {
    if (!categoryIdOrName) return AI_CONTEXTS.FOOD; // Default to food for now

    // If it's a number (ID from backend)
    const id = Number(categoryIdOrName);
    if (!isNaN(id)) {
        // IDs 1-13 are food-related in SeedDatabase.cs
        if (id >= 1 && id <= 13) return AI_CONTEXTS.FOOD;
        // IDs for clothing or objects would go here
    }

    // If it's a string (name or slug)
    const name = String(categoryIdOrName).toLowerCase();

    if (name.includes('ropa') || name.includes('moda') || name.includes('clothing') || name.includes('textil') || name.includes('zapato')) {
        return AI_CONTEXTS.CLOTHING;
    }

    if (name.includes('objeto') || name.includes('herramienta') || name.includes('electrónica') || name.includes('gadget') || name.includes('hardware')) {
        return AI_CONTEXTS.OBJECTS;
    }

    if (name.includes('comida') || name.includes('restaurante') || name.includes('café') || name.includes('food') || name.includes('bebida') || name.includes('postre')) {
        return AI_CONTEXTS.FOOD;
    }

    return AI_CONTEXTS.FOOD; // Default to food
};
