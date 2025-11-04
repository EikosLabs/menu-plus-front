/**
 * Hook para cargar secciones de menú
 */

import { useState, useEffect } from 'react';
import menuService from '../services/menuService.js';

export const useSections = (menuId) => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!menuId) return;

    const fetchSections = async () => {
      setLoading(true);
      try {
        const data = await menuService.getSections(menuId);
        setSections(data || []);
      } catch (err) {
        setError('Error al cargar secciones');
      } finally {
        setLoading(false);
      }
    };

    fetchSections();
  }, [menuId]);

  return { sections, loading, error };
};
