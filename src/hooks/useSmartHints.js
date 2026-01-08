import { useState, useCallback, useMemo } from "react";

const STORAGE_KEY = "dismissed_hints";

/**
 * Smart Hints Hook - Provides contextual hints based on business/menu state
 * 
 * @param {Object} businessData - Current business data
 * @returns {Object} Hints state and actions
 */
export function useSmartHints(businessData) {
    const [dismissedHints, setDismissedHints] = useState(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    // Dismiss a hint permanently
    const dismissHint = useCallback((hintId) => {
        setDismissedHints((prev) => {
            const updated = [...prev, hintId];
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            } catch { }
            return updated;
        });
    }, []);

    // Reset all dismissed hints
    const resetHints = useCallback(() => {
        setDismissedHints([]);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    // Calculate active hints based on business state
    const hints = useMemo(() => {
        if (!businessData) return [];

        const allHints = [];
        const menu = businessData.menus?.[0];
        const sections = menu?.sections || [];
        const totalItems = sections.reduce((acc, s) => acc + (s.menuItems?.length || 0), 0);
        const scanCount = menu?.scanCount || menu?.ScanCount || 0;

        // Priority 1: No sections in menu
        if (menu && sections.length === 0) {
            allHints.push({
                id: "create_section",
                icon: "📂",
                title: "Crea tu primera sección",
                description: "Organiza tu menú en categorías como Entradas, Platos Principales, etc.",
                actionLabel: "+ Crear Sección",
                priority: 1,
            });
        }

        // Priority 2: Has sections but no items
        if (sections.length > 0 && totalItems === 0) {
            allHints.push({
                id: "add_item",
                icon: "🍽️",
                title: "Añade tu primer plato",
                description: "Agrega los productos de tu menú con precios y descripciones.",
                actionLabel: "+ Añadir Plato",
                priority: 2,
            });
        }

        // Priority 3: No logo
        if (!businessData.logo && !businessData.logoUrl) {
            allHints.push({
                id: "add_logo",
                icon: "📸",
                title: "Sube tu logo",
                description: "Tu logo aparecerá en el menú digital y código QR.",
                actionLabel: "Subir Logo",
                priority: 3,
            });
        }

        // Priority 4: No description
        if (!businessData.description || businessData.description.length < 10) {
            allHints.push({
                id: "add_description",
                icon: "✏️",
                title: "Añade una descripción",
                description: "Cuéntale a tus clientes sobre tu negocio.",
                actionLabel: "Editar Negocio",
                priority: 4,
            });
        }

        // Priority 5: Zero scans, menu ready
        if (totalItems > 0 && scanCount === 0) {
            allHints.push({
                id: "share_qr",
                icon: "📱",
                title: "¡Comparte tu QR!",
                description: "Tu menú está listo. Imprime el QR y colócalo en tu local.",
                actionLabel: "Ver Código QR",
                priority: 5,
            });
        }

        // Success: Menu complete with scans
        if (totalItems >= 3 && scanCount > 0 && businessData.logo) {
            allHints.push({
                id: "menu_complete",
                icon: "🎉",
                title: "¡Tu menú está funcionando!",
                description: `${scanCount} personas han visto tu menú.`,
                variant: "success",
                priority: 10,
            });
        }

        // Filter out dismissed hints and sort by priority
        return allHints
            .filter((h) => !dismissedHints.includes(h.id))
            .sort((a, b) => a.priority - b.priority);
    }, [businessData, dismissedHints]);

    // Get the top priority hint (or null)
    const activeHint = hints[0] || null;

    return {
        hints,
        activeHint,
        dismissHint,
        resetHints,
        hasDismissed: (id) => dismissedHints.includes(id),
    };
}

export default useSmartHints;
