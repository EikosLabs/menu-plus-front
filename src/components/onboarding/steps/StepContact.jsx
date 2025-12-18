import React, { useEffect } from 'react';
import OnboardingStep from '../OnboardingStep';
import FormField from '../../ui/FormField';
import LocationPicker from '../../shared/LocationPicker';
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
      {/* Ubicación - Dirección + Mapa juntos */}
      <div className="mb-6">
        <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-neo-flame" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Ubicación del Negocio
        </h4>

        <LocationPicker
          address={formData.address}
          latitude={formData.latitude}
          longitude={formData.longitude}
          onLocationChange={({ address, latitude, longitude }) => {
            updateFormData('address', address);
            updateFormData('latitude', latitude);
            updateFormData('longitude', longitude);
          }}
          error={errors.location}
        />
      </div>

      {/* Teléfono y Email en grid */}
      <div className="mb-6">
        <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-neo-flame" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          Datos de Contacto
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Teléfono"
            name="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={handleFieldChange}
            error={errors.phoneNumber}
            required={false}
            placeholder="+1 234 567 8900"
            maxLength={20}
            useNameValue={true}
          />

          <FormField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleFieldChange}
            error={errors.email}
            required={false}
            placeholder="contacto@tunegocio.com"
            maxLength={100}
            useNameValue={true}
          />
        </div>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex gap-2">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">💡 Tip</p>
            <p>Puedes buscar tu ubicación en el mapa o arrastrar el marcador. Todos estos campos son opcionales.</p>
          </div>
        </div>
      </div>
    </OnboardingStep>
  );
}
