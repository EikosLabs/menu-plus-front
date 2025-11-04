/**
 * Hook personalizado para cargar categorías
 * Centraliza la lógica de carga de categorías del backend
 */

import { useState, useEffect } from 'react';
import menuService from '../services/menuService.js';

export const useBusinessCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setCategories([]);

      try {
        const data = await menuService.getBusinessCategories();
        setCategories(data);

        if (!data || data.length === 0) {
          setError('No hay categorías disponibles');
        }
      } catch (err) {
        setError('Error al cargar categorías');
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};

export const useMenuItemCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);

      try {
        const data = await menuService.getMenuItemCategories();
        setCategories(data);
      } catch (err) {
        setError('Error al cargar categorías de items');
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};
