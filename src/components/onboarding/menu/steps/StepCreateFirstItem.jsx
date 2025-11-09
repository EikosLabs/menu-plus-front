import React, { useEffect, useState } from 'react';
import OnboardingStep from '../../OnboardingStep';
import { FormField, TextAreaField, FileUploadField } from '../../FormField';
import { validateImageFile } from '../../../../utils/onboardingValidation';
import menuService from '../../../../services/menuService';

export default function StepCreateFirstItem({ 
  formData, 
  updateField,
  updateMultipleFields,
  errors, 
  setErrors,
  setIsValid,
  isActive,
  sectionName 
}) {
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isActive) {
      const newErrors = {};
      
      if (!formData.name || formData.name.trim().length < 2) {
        newErrors.name = 'El nombre del plato debe tener al menos 2 caracteres';
      }
      
      if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
        newErrors.price = 'El precio debe ser un número mayor que 0';
      }
      
      setErrors(newErrors);
      setIsValid(Object.keys(newErrors).length === 0);
    }
  }, [formData.name, formData.description, formData.price, isActive, setErrors, setIsValid]);

  useEffect(() => {
    if (formData.image) {
      const objectUrl = URL.createObjectURL(formData.image);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreview(null);
    }
  }, [formData.image]);

  const handleFileChange = async (name, file) => {
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setErrors({ ...errors, image: validation.error });
      return;
    }

    updateField('image', file);
    
    try {
      setUploading(true);
      const imageKey = await menuService.uploadImage(file);
      updateMultipleFields({
        image: file,
        imageKey: imageKey
      });
    } catch (error) {
      console.error('Error al subir imagen:', error);
      setErrors({ ...errors, image: 'Error al subir la imagen' });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    updateMultipleFields({
      image: null,
      imageKey: null
    });
    setPreview(null);
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
        d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
      />
    </svg>
  );

  return (
    <OnboardingStep
      title="Crea tu Primer Plato"
      description={`Agrega un plato a "${sectionName}"`}
      icon={icon}
      isActive={isActive}
    >
      <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 md:p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
        <div className="flex gap-2 sm:gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-base sm:text-lg md:text-xl">🍽️</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 mb-0.5 sm:mb-1 text-xs sm:text-sm md:text-base">¡Último paso!</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Agrega tu primer plato con foto para que tus clientes lo vean delicioso
            </p>
          </div>
        </div>
      </div>

      <FormField
        label="Nombre del Plato"
        name="name"
        value={formData.name}
        onChange={updateField}
        error={errors.name}
        required={true}
        placeholder="Ej: Hamburguesa Clásica, Ensalada César"
        maxLength={100}
      />

      <TextAreaField
        label="Descripción"
        name="description"
        value={formData.description}
        onChange={updateField}
        error={errors.description}
        required={false}
        placeholder="Describe los ingredientes y preparación"
        maxLength={300}
        rows={3}
        showCharCount={true}
      />

      <FormField
        label="Precio"
        name="price"
        type="number"
        value={formData.price}
        onChange={updateField}
        error={errors.price}
        required={true}
        placeholder="0.00"
      />

      <FileUploadField
        label="Foto del Plato (opcional pero recomendado)"
        name="image"
        onChange={handleFileChange}
        error={errors.image}
        required={false}
        accept="image/jpeg,image/png,image/gif,image/webp"
        preview={preview}
        onRemove={handleRemove}
      />

      {uploading && (
        <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-600 mt-2 sm:mt-3">
          <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          <span>Subiendo imagen...</span>
        </div>
      )}

      <div className="mt-3 sm:mt-4 md:mt-6 p-2.5 sm:p-3 md:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex gap-2">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-xs sm:text-sm text-yellow-800">
            <p className="font-medium mb-0.5 sm:mb-1">💡 Consejo profesional</p>
            <p>Las fotos aumentan las ventas hasta un 30%. ¡Usa buena iluminación natural!</p>
          </div>
        </div>
      </div>
    </OnboardingStep>
  );
}
