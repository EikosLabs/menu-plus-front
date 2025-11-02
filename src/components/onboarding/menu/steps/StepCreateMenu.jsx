import React, { useEffect } from 'react';
import OnboardingStep from '../../OnboardingStep';
import { FormField, TextAreaField } from '../../FormField';

export default function StepCreateMenu({ 
  formData, 
  updateField, 
  errors, 
  setErrors,
  setIsValid,
  isActive,
  businessName 
}) {
  useEffect(() => {
    if (isActive) {
      const newErrors = {};
      
      if (!formData.name || formData.name.trim().length < 2) {
        newErrors.name = 'El nombre del menú debe tener al menos 2 caracteres';
      }
      
      setErrors(newErrors);
      setIsValid(Object.keys(newErrors).length === 0);
    }
  }, [formData.name, formData.description, isActive, setErrors, setIsValid]);

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
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  );

  return (
    <OnboardingStep
      title="Crea tu Menú"
      description={`¡Empecemos con el menú de ${businessName}!`}
      icon={icon}
      isActive={isActive}
    >
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">🎉</span>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">¡Bienvenido a tu menú digital!</h3>
            <p className="text-sm text-gray-600">
              Vamos a crear tu primer menú paso a paso. Es rápido y fácil.
            </p>
          </div>
        </div>
      </div>

      <FormField
        label="Nombre del Menú"
        name="name"
        value={formData.name}
        onChange={updateField}
        error={errors.name}
        required={true}
        placeholder="Ej: Menú Principal, Menú del Día, Carta de Bebidas"
        maxLength={100}
      />

      <TextAreaField
        label="Descripción"
        name="description"
        value={formData.description}
        onChange={updateField}
        error={errors.description}
        required={false}
        placeholder="Describe tu menú (opcional)"
        maxLength={300}
        rows={3}
        showCharCount={true}
      />

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
          <div className="text-3xl mb-2">📋</div>
          <p className="text-sm font-medium text-gray-700">Paso 1</p>
          <p className="text-xs text-gray-500">Crear menú</p>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-3xl mb-2">📁</div>
          <p className="text-sm font-medium text-gray-500">Paso 2</p>
          <p className="text-xs text-gray-400">Crear sección</p>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-3xl mb-2">🍽️</div>
          <p className="text-sm font-medium text-gray-500">Paso 3</p>
          <p className="text-xs text-gray-400">Primer plato</p>
        </div>
      </div>
    </OnboardingStep>
  );
}
