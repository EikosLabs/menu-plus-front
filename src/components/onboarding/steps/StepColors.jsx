import React, { useEffect } from 'react';
import OnboardingStep from '../OnboardingStep';
import { validateStepColors } from '../../../utils/onboardingValidation';
import CircularColorPicker from '../../../components/ui/CircularColorPicker';
import { getPaletteByBusinessType } from '../../../utils/themePalettes';

/**
 * Paso 5: Personalización de Colores
 */
export default function StepColors({ 
  formData, 
  updateFormData,
  updateMultipleFields,
  updateErrors, 
  errors = {},
  isActive 
}) {
  // Validar en tiempo real
  useEffect(() => {
    if (isActive) {
      const validationErrors = validateStepColors(formData);
      updateErrors(validationErrors);
    }
  }, [
    formData.primaryColor, 
    formData.secondaryColor, 
    formData.accentColor, 
    isActive, 
    updateErrors
  ]);

  // Auto-aplicar tema si cambia el tipo de negocio y no hay colores definidos
  useEffect(() => {
    if (isActive && formData.businessType && !formData.primaryColor) {
      const palette = getPaletteByBusinessType(formData.businessType);
      if (palette) {
        updateMultipleFields({
          primaryColor: palette.primary,
          secondaryColor: palette.secondary,
          accentColor: palette.accent
        });
      }
    }
  }, [isActive, formData.businessType]);

  const handleColorChange = (name, value) => {
    updateFormData(name, value);
  };

  const handleUseDefaults = () => {
    const palette = getPaletteByBusinessType(formData.businessType);
    updateMultipleFields({
      primaryColor: palette.primary,
      secondaryColor: palette.secondary,
      accentColor: palette.accent
    });
  };

  const ColorPickerField = ({ label, name, value, error }) => (
    <div className="form-field mb-6">
      <label className="form-label mb-4 block">
        {label}
        <span className="required">*</span>
      </label>

      <CircularColorPicker
        color={value}
        onChange={(selectedColor) => handleColorChange(name, selectedColor)}
        label={label}
      />

      {error && (
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
          <span>{error}</span>
        </div>
      )}
    </div>
  );

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
      title="Personaliza los Colores"
      description="Elige la paleta de colores de tu menú"
      icon={icon}
      isActive={isActive}
    >
      <ColorPickerField
        label="Color Primario"
        name="primaryColor"
        value={formData.primaryColor}
        error={errors.primaryColor}
      />

      <ColorPickerField
        label="Color Secundario"
        name="secondaryColor"
        value={formData.secondaryColor}
        error={errors.secondaryColor}
      />

      <ColorPickerField
        label="Color de Acento"
        name="accentColor"
        value={formData.accentColor}
        error={errors.accentColor}
      />

      {/* Vista Previa de la Paleta */}
      <div className="mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Vista Previa de tu Paleta</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div 
              className="w-full h-20 rounded-lg shadow-md mb-2 transition-colors duration-200"
              style={{ backgroundColor: formData.primaryColor }}
            />
            <p className="text-xs text-gray-600">Primario</p>
            <p className="text-xs font-mono text-gray-500">{formData.primaryColor}</p>
          </div>
          <div className="text-center">
            <div 
              className="w-full h-20 rounded-lg shadow-md mb-2 transition-colors duration-200"
              style={{ backgroundColor: formData.secondaryColor }}
            />
            <p className="text-xs text-gray-600">Secundario</p>
            <p className="text-xs font-mono text-gray-500">{formData.secondaryColor}</p>
          </div>
          <div className="text-center">
            <div 
              className="w-full h-20 rounded-lg shadow-md mb-2 transition-colors duration-200"
              style={{ backgroundColor: formData.accentColor }}
            />
            <p className="text-xs text-gray-600">Acento</p>
            <p className="text-xs font-mono text-gray-500">{formData.accentColor}</p>
          </div>
        </div>
      </div>

      {/* Botón para usar colores predeterminados */}
      <div className="mt-6 relative z-10">
        <button
          type="button"
          onClick={handleUseDefaults}
          className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200"
        >
          Usar Colores Predeterminados
        </button>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg relative z-10">
        <div className="flex gap-2">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Personaliza tu marca</p>
            <p>Estos colores se aplicarán a tu menú digital. Puedes cambiarlos más tarde desde tu dashboard.</p>
          </div>
        </div>
      </div>
    </OnboardingStep>
  );
}
