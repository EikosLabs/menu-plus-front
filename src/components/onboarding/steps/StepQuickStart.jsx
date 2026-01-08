import React, { useEffect, useState } from 'react';
import OnboardingStep from '../OnboardingStep';
import FormField, { SelectField } from '../../ui/FormField';
import { validateStepQuickStart } from '../../../utils/onboardingValidation';
import menuService from '../../../services/menuService';

/**
 * Quick Start: Solo nombre y categoría para máxima conversión
 * El resto se configura después desde el dashboard
 */
export default function StepQuickStart({
    formData,
    updateFormData,
    updateMultipleFields,
    updateErrors,
    errors = {},
    isActive
}) {
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await menuService.getBusinessCategories();
                setCategories(data);
            } catch (error) {
                console.error('Error al cargar categorías:', error);
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
            const validationErrors = validateStepQuickStart(formData);
            updateErrors(validationErrors);
        }
    }, [formData.name, formData.businessCategoryId, isActive, updateErrors]);

    // Auto-aplicar colores por defecto atractivos
    useEffect(() => {
        if (isActive && !formData.accentColor) {
            updateMultipleFields({
                primaryColor: '#1a1a1a',
                secondaryColor: '#FFFFFF',
                accentColor: '#cf5c36' // Neo flame color
            });
        }
    }, [isActive]);

    const icon = (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
    );

    const handleFieldChange = (name, value) => {
        updateFormData(name, value);
    };

    return (
        <OnboardingStep
            title="¡Empecemos!"
            description="Solo necesitamos 2 datos para crear tu menú digital"
            icon={icon}
            isActive={isActive}
        >
            <div className="space-y-6">
                {/* Nombre del negocio - Campo principal */}
                <div className="relative">
                    <FormField
                        label="¿Cómo se llama tu negocio?"
                        name="name"
                        value={formData.name}
                        onChange={handleFieldChange}
                        error={errors.name}
                        required={true}
                        placeholder="Ej: Tacos El Güero, Café Central..."
                        maxLength={100}
                        useNameValue={true}
                    />
                </div>

                {/* Categoría - Selector visual */}
                <SelectField
                    label="¿Qué tipo de negocio es?"
                    name="businessCategoryId"
                    value={formData.businessCategoryId}
                    onChange={handleFieldChange}
                    options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
                    error={errors.businessCategoryId}
                    required={true}
                    placeholder={loadingCategories ? 'Cargando...' : 'Selecciona una opción'}
                    disabled={loadingCategories}
                    useNameValue={true}
                />

                {/* Mensaje motivacional */}
                <div className="bg-neo-sunset/20 border-neo border-neo-black p-4 neo-shadow-sm rounded-lg">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">✨</span>
                        <div>
                            <p className="neo-text font-bold text-neo-black">¡Listo para empezar!</p>
                            <p className="neo-text text-sm text-neo-gray">
                                Podrás personalizar colores, logo, contacto y más desde tu panel de control.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </OnboardingStep>
    );
}
