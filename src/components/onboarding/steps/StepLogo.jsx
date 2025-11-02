import React, { useEffect, useState } from 'react';
import OnboardingStep from '../OnboardingStep';
import { FileUploadField } from '../FormField';
import { validateStepLogo } from '../../../utils/onboardingValidation';
import menuService from '../../../services/menuService';

/**
 * Paso 2: Logo del Negocio
 */
export default function StepLogo({ 
  formData, 
  updateFormData,
  updateMultipleFields,
  updateErrors, 
  errors = {},
  isActive 
}) {
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Validar en tiempo real
  useEffect(() => {
    if (isActive) {
      const validationErrors = validateStepLogo(formData);
      updateErrors(validationErrors);
    }
  }, [formData.logoFile, isActive, updateErrors]);

  // Crear preview cuando se selecciona un archivo
  useEffect(() => {
    if (formData.logoFile) {
      const objectUrl = URL.createObjectURL(formData.logoFile);
      setPreview(objectUrl);

      // Limpiar el objeto URL cuando el componente se desmonte
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreview(null);
    }
  }, [formData.logoFile]);

  const handleFileChange = async (name, file) => {
    setUploadError(null);
    
    // Validar el archivo
    const validation = validateStepLogo({ logoFile: file });
    if (Object.keys(validation).length > 0) {
      updateErrors(validation);
      return;
    }

    // Guardar el archivo en el estado
    updateFormData('logoFile', file);
    
    // Subir el archivo inmediatamente
    try {
      setUploading(true);
      const imageKey = await menuService.uploadImage(file);
      
      // Guardar el imageKey
      updateMultipleFields({
        logoFile: file,
        imageKey: imageKey
      });
      
      setUploadError(null);
    } catch (error) {
      console.error('Error al subir imagen:', error);
      setUploadError('Error al subir la imagen. Por favor intenta nuevamente.');
      updateFormData('imageKey', null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    updateMultipleFields({
      logoFile: null,
      imageKey: null
    });
    setPreview(null);
    setUploadError(null);
    updateErrors({});
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
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );

  return (
    <OnboardingStep
      title="Logo del Negocio"
      description="Sube el logo de tu negocio (opcional)"
      icon={icon}
      isActive={isActive}
    >
      <FileUploadField
        label="Logo"
        name="logoFile"
        onChange={handleFileChange}
        error={errors.logoFile || uploadError}
        required={false}
        accept="image/jpeg,image/png,image/gif,image/webp"
        preview={preview}
        onRemove={handleRemove}
      />

      {uploading && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mt-4">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Subiendo imagen...</span>
        </div>
      )}

      {formData.imageKey && !uploading && (
        <div className="flex items-center gap-2 text-sm text-green-600 mt-4">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Imagen subida exitosamente</span>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>• Formatos aceptados: JPEG, PNG, GIF, WebP</p>
        <p>• Tamaño máximo: 1MB</p>
        <p>• Dimensiones recomendadas: 500x500px</p>
      </div>
    </OnboardingStep>
  );
}
