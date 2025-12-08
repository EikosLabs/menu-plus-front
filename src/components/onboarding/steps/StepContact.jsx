import React, { useEffect } from 'react';
import OnboardingStep from '../OnboardingStep';
import FormField from '../../ui/FormField';
import { validateStepContact } from '../../../utils/onboardingValidation';

/**
 * Paso 3: Información de Contacto
 */
export default function StepContact({ 
  formData, 
  updateFormData, 
  updateErrors, 
  errors = {},
  isActive 
}) {
  // Validar en tiempo real
  useEffect(() => {
    if (isActive) {
      const validationErrors = validateStepContact(formData);
      updateErrors(validationErrors);
    }
  }, [formData.address, formData.phoneNumber, formData.email, isActive, updateErrors]);

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
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );

  const handleFieldChange = (name, value) => {
    updateFormData(name, value);
  };

  return (
    <OnboardingStep
      title="Información de Contacto"
      description="¿Cómo pueden contactarte? (todos los campos son opcionales)"
      icon={icon}
      isActive={isActive}
    >
      <FormField
        label="Dirección"
        name="address"
        value={formData.address}
        onChange={handleFieldChange}
        error={errors.address}
        required={false}
        placeholder="Ej: Calle Principal 123, Ciudad"
        maxLength={200}
      />

      <FormField
        label="Teléfono"
        name="phoneNumber"
        type="tel"
        value={formData.phoneNumber}
        onChange={handleFieldChange}
        error={errors.phoneNumber}
        required={false}
        placeholder="Ej: +1 234 567 8900"
        maxLength={20}
      />

      <FormField
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleFieldChange}
        error={errors.email}
        required={false}
        placeholder="Ej: contacto@tunegocio.com"
        maxLength={100}
      />

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex gap-2">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Información opcional</p>
            <p>Puedes omitir estos campos y agregarlos más tarde desde tu dashboard.</p>
          </div>
        </div>
      </div>
    </OnboardingStep>
  );
}
