import React, { useEffect } from 'react';
import OnboardingStep from '../OnboardingStep';
import { validateHexColor } from '../../../utils/onboardingValidation';
import CircularColorPicker from '../../../components/ui/CircularColorPicker';
import { getPaletteByBusinessType } from '../../../utils/themePalettes';
import { generateColorVariants } from '../../../utils/colorUtils';

/**
 * Paso 5: Personalización de Color Principal
 * Simplificado a un solo color - secondary y accent se generan automáticamente
 */
export default function StepColors({
  formData,
  updateFormData,
  updateMultipleFields,
  updateErrors,
  errors = {},
  isActive
}) {
  // Validar en tiempo real - solo primaryColor
  useEffect(() => {
    if (isActive) {
      const primaryValidation = validateHexColor(formData.primaryColor);
      const validationErrors = {};
      if (!primaryValidation.valid) {
        validationErrors.primaryColor = primaryValidation.error;
      }
      updateErrors(validationErrors);
    }
  }, [formData.primaryColor, isActive, updateErrors]);

  // Auto-aplicar tema si cambia el tipo de negocio y no hay colores definidos
  useEffect(() => {
    if (isActive && formData.businessType && !formData.primaryColor) {
      const palette = getPaletteByBusinessType(formData.businessType);
      if (palette) {
        const variants = generateColorVariants(palette.primary);
        updateMultipleFields({
          primaryColor: palette.primary,
          secondaryColor: variants.secondary,
          accentColor: variants.accent
        });
      }
    }
  }, [isActive, formData.businessType]);

  const handleColorChange = (name, value) => {
    // Auto-generate secondary and accent from primary
    const variants = generateColorVariants(value);
    updateMultipleFields({
      primaryColor: value,
      secondaryColor: variants.secondary,
      accentColor: variants.accent
    });
  };

  const handleUseDefaults = () => {
    const palette = getPaletteByBusinessType(formData.businessType);
    const variants = generateColorVariants(palette.primary);
    updateMultipleFields({
      primaryColor: palette.primary,
      secondaryColor: variants.secondary,
      accentColor: variants.accent
    });
  };

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
        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
      />
    </svg>
  );

  return (
    <OnboardingStep
      title="Elige tu Color Principal"
      description="Este color definirá la identidad visual de tu menú"
      icon={icon}
      isActive={isActive}
    >
      {/* Single Color Picker */}
      <div className="flex flex-col items-center mb-6">
        <label className="form-label mb-4 block text-center">
          Color Principal
          <span className="required">*</span>
        </label>

        <CircularColorPicker
          color={formData.primaryColor}
          onChange={(selectedColor) => handleColorChange('primaryColor', selectedColor)}
          label="Color Principal"
        />

        {errors.primaryColor && (
          <div className="form-error mt-2" role="alert">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              className="w-4 h-4 inline mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{errors.primaryColor}</span>
          </div>
        )}
      </div>

      {/* Vista Previa de la Paleta Generada */}
      <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-4 text-center">Tu Paleta de Colores</h3>
        <div className="flex justify-center items-center gap-3">
          <div className="text-center">
            <div
              className="w-16 h-16 rounded-lg shadow-md mb-2 transition-colors duration-200 border-2 border-black"
              style={{ backgroundColor: formData.primaryColor }}
            />
            <p className="text-xs font-medium text-gray-700">Principal</p>
            <p className="text-xs font-mono text-gray-500">{formData.primaryColor}</p>
          </div>
          <div className="text-center opacity-60">
            <div
              className="w-12 h-12 rounded-lg shadow-md mb-2 transition-colors duration-200"
              style={{ backgroundColor: formData.secondaryColor }}
            />
            <p className="text-xs text-gray-500">Auto</p>
          </div>
          <div className="text-center opacity-60">
            <div
              className="w-12 h-12 rounded-lg shadow-md mb-2 transition-colors duration-200"
              style={{ backgroundColor: formData.accentColor }}
            />
            <p className="text-xs text-gray-500">Auto</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 text-center mt-3">Los colores secundarios se generan automáticamente</p>
      </div>

      {/* Botón para usar colores predeterminados */}
      <div className="mt-6 relative z-10">
        <button
          type="button"
          onClick={handleUseDefaults}
          className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200"
        >
          Usar Color Predeterminado
        </button>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg relative z-10">
        <div className="flex gap-2">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Un solo color, paleta completa</p>
            <p>Elige tu color principal y generaremos automáticamente una paleta armoniosa para tu menú.</p>
          </div>
        </div>
      </div>
    </OnboardingStep>
  );
}

