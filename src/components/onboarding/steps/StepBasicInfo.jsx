import React, { useEffect, useState } from 'react';
import OnboardingStep from '../OnboardingStep';
import FormField, { TextAreaField, SelectField } from '../../ui/FormField';
import { validateStepBasicInfo } from '../../../utils/onboardingValidation';
import menuService from '../../../services/menuService';
import { getAllCurrencies } from '../../../utils/currencies';
import { BUSINESS_TYPES, THEME_PALETTES, getPaletteByBusinessType } from '../../../utils/themePalettes';

/**
 * Paso 1: Información Básica del Negocio
 */
export default function StepBasicInfo({ 
  formData, 
  updateFormData, 
  updateErrors, 
  errors = {},
  isActive 
}) {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Cargar categorías de negocio
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await menuService.getBusinessCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
        // Categorías por defecto en caso de error
        setCategories([
          { id: 1, name: 'Restaurante' },
          { id: 2, name: 'Cafetería' },
          { id: 3, name: 'Bar' },
          { id: 4, name: 'Food Truck' },
          { id: 5, name: 'Panadería' },
          { id: 6, name: 'Otro' }
        ]);
      } finally {
        setLoadingCategories(false);
      }
    };

    if (isActive) {
      fetchCategories();
    }
  }, [isActive]);

  // Validar en tiempo real
  useEffect(() => {
    if (isActive) {
      const validationErrors = validateStepBasicInfo(formData);
      updateErrors(validationErrors);
    }
  }, [formData.name, formData.description, formData.businessCategoryId, isActive, updateErrors]);

  const icon = (
    <svg 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
      className="w-full h-full"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    </svg>
  );

  const handleFieldChange = (name, value) => {
    updateFormData(name, value);
  };

  // Opciones de tipos de negocio para el tema visual
  const businessTypeOptions = [
    { id: BUSINESS_TYPES.RESTAURANT, name: 'Restaurante / Fine Dining' },
    { id: BUSINESS_TYPES.CAFE, name: 'Cafetería / Coffee Shop' },
    { id: BUSINESS_TYPES.BAR, name: 'Bar / Club / Nightlife' },
    { id: BUSINESS_TYPES.FAST_FOOD, name: 'Comida Rápida / Fast Food' },
    { id: BUSINESS_TYPES.BAKERY, name: 'Pastelería / Panadería' },
    { id: BUSINESS_TYPES.PIZZERIA, name: 'Pizzería / Italiano' },
    { id: BUSINESS_TYPES.SUSHI, name: 'Sushi / Asiático' },
    { id: BUSINESS_TYPES.BURGER, name: 'Hamburguesería / Grill' },
    { id: BUSINESS_TYPES.VEGAN, name: 'Vegano / Saludable' },
    { id: BUSINESS_TYPES.ICE_CREAM, name: 'Heladería / Postres' },
  ];

  const handleBusinessTypeChange = (name, value) => {
    updateFormData(name, value);
  };

  return (
    <OnboardingStep
      title="Información Básica"
      description="Cuéntanos sobre tu negocio"
      icon={icon}
      isActive={isActive}
    >
      <FormField
        label="Nombre del Negocio"
        name="name"
        value={formData.name}
        onChange={handleFieldChange}
        error={errors.name}
        required={true}
        placeholder="Ej: Restaurante El Buen Sabor"
        maxLength={100}
      />

      <TextAreaField
        label="Descripción"
        name="description"
        value={formData.description}
        onChange={handleFieldChange}
        error={errors.description}
        required={false}
        placeholder="Describe brevemente tu negocio (opcional)"
        maxLength={500}
        rows={4}
        showCharCount={true}
      />

      <FormField
        label="Slogan"
        name="slogan"
        value={formData.slogan}
        onChange={handleFieldChange}
        error={errors.slogan}
        required={false}
        placeholder="Ej: La mejor comida de la ciudad (opcional)"
        maxLength={100}
      />

      <SelectField
        label="Categoría del Negocio"
        name="businessCategoryId"
        value={formData.businessCategoryId}
        onChange={handleFieldChange}
        options={categories.map(cat => ({ id: cat.id, name: cat.name }))}
        error={errors.businessCategoryId}
        required={true}
        placeholder={loadingCategories ? 'Cargando categorías...' : 'Selecciona una categoría'}
        disabled={loadingCategories}
      />

      <SelectField
        label="Estilo del Negocio (Para el diseño)"
        name="businessType"
        value={formData.businessType || ''}
        onChange={handleBusinessTypeChange}
        options={businessTypeOptions}
        required={false}
        placeholder="Selecciona el estilo que mejor te represente"
      />

      <SelectField
        label="Moneda Predeterminada"
        name="defaultCurrency"
        value={formData.defaultCurrency ?? 0}
        onChange={handleFieldChange}
        options={getAllCurrencies().map(curr => ({
          id: curr.value,
          name: `${curr.symbol} ${curr.name} (${curr.code})`
        }))}
        error={errors.defaultCurrency}
        required={false}
        placeholder="Selecciona la moneda de tu negocio"
      />
    </OnboardingStep>
  );
}
