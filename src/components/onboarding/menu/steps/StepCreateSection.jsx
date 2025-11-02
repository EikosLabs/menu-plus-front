import React, { useEffect } from 'react';
import OnboardingStep from '../../OnboardingStep';
import { FormField, TextAreaField } from '../../FormField';

export default function StepCreateSection({ 
  formData, 
  updateField, 
  errors, 
  setErrors,
  setIsValid,
  isActive,
  menuName 
}) {
  useEffect(() => {
    if (isActive) {
      const newErrors = {};
      
      if (!formData.name || formData.name.trim().length < 2) {
        newErrors.name = 'El nombre de la sección debe tener al menos 2 caracteres';
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
        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
      />
    </svg>
  );

  const suggestions = [
    { emoji: '🥗', name: 'Entradas', desc: 'Aperitivos y entrantes' },
    { emoji: '🍝', name: 'Platos Principales', desc: 'Platos fuertes' },
    { emoji: '🍰', name: 'Postres', desc: 'Dulces y postres' },
    { emoji: '🍹', name: 'Bebidas', desc: 'Refrescos y bebidas' },
    { emoji: '☕', name: 'Cafetería', desc: 'Café y té' },
    { emoji: '🍕', name: 'Pizzas', desc: 'Variedades de pizza' }
  ];

  const handleSuggestionClick = (suggestion) => {
    updateField('name', suggestion.name);
    updateField('description', suggestion.desc);
  };

  return (
    <OnboardingStep
      title="Crea tu Primera Sección"
      description={`Organiza "${menuName}" en secciones`}
      icon={icon}
      isActive={isActive}
    >
      <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">📁</span>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">Organiza tu menú</h3>
            <p className="text-sm text-gray-600">
              Las secciones ayudan a organizar tus platos (Entradas, Principales, Postres, etc.)
            </p>
          </div>
        </div>
      </div>

      <FormField
        label="Nombre de la Sección"
        name="name"
        value={formData.name}
        onChange={updateField}
        error={errors.name}
        required={true}
        placeholder="Ej: Entradas, Platos Principales, Postres"
        maxLength={100}
      />

      <TextAreaField
        label="Descripción"
        name="description"
        value={formData.description}
        onChange={updateField}
        error={errors.description}
        required={false}
        placeholder="Describe esta sección (opcional)"
        maxLength={200}
        rows={2}
        showCharCount={true}
      />

      <div className="mt-6">
        <p className="text-sm font-medium text-gray-700 mb-3">Sugerencias populares:</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="p-3 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left"
            >
              <div className="text-2xl mb-1">{suggestion.emoji}</div>
              <p className="text-sm font-medium text-gray-800">{suggestion.name}</p>
              <p className="text-xs text-gray-500">{suggestion.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </OnboardingStep>
  );
}
