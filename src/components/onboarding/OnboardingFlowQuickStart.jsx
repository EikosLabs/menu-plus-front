import React, { useState, useEffect } from 'react';
import { validateStepQuickStart } from '../../utils/onboardingValidation';
import menuService from '../../services/menuService';
import authService from '../../services/authService';
import { localizeUrl } from '../../i18n/utils';
import OnboardingComplete from './OnboardingComplete';
import StepQuickStart from './steps/StepQuickStart';

/**
 * Quick Start Onboarding Flow - Solo 1 paso para máxima conversión
 * El usuario solo necesita nombre y categoría para empezar
 */
export default function OnboardingFlowQuickStart({ userId: propUserId = null, onComplete }) {
    const [userId, setUserId] = useState(propUserId);
    const [loading, setLoading] = useState(!propUserId);
    const [isComplete, setIsComplete] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [isValid, setIsValid] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        businessCategoryId: null,
        primaryColor: '#1a1a1a',
        secondaryColor: '#FFFFFF',
        accentColor: '#cf5c36',
        defaultCurrency: 0
    });

    // Obtener userId si no se proporciona
    useEffect(() => {
        if (!propUserId) {
            try {
                const userIdFromToken = authService.getUserId();
                if (userIdFromToken) {
                    setUserId(userIdFromToken);
                } else {
                    window.location.href = localizeUrl('/login');
                }
            } catch (error) {
                console.error('Error al obtener usuario:', error);
                window.location.href = localizeUrl('/login');
            } finally {
                setLoading(false);
            }
        }
    }, [propUserId]);

    // Validar formulario cuando cambian los datos
    useEffect(() => {
        const errors = validateStepQuickStart(formData);
        setIsValid(Object.keys(errors).length === 0);
    }, [formData]);

    const updateFormData = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const updateMultipleFields = (fields) => {
        setFormData(prev => ({ ...prev, ...fields }));
    };

    const handleSubmit = async () => {
        if (!isValid) return;

        setIsSaving(true);
        setSubmitError(null);

        try {
            const businessData = {
                name: formData.name,
                description: formData.description || '',
                slogan: '',
                businessCategoryId: Number.parseInt(formData.businessCategoryId, 10) || 0,
                imageKey: null,
                address: '',
                latitude: 0,
                longitude: 0,
                phoneNumber: '',
                email: '',
                facebookUrl: '',
                instagramUrl: '',
                twitterUrl: '',
                whatsAppNumber: '',
                primaryColor: formData.primaryColor || '#000000',
                secondaryColor: formData.secondaryColor || '#FFFFFF',
                accentColor: formData.accentColor || '#cf5c36',
                defaultCurrency: Number.parseInt(formData.defaultCurrency, 10) ?? 0,
                template: 0,
                fontFamily: 'poppins'
            };

            const result = await menuService.createFoodBusiness(businessData);

            // Refrescar token para obtener FoodBusinessId
            try {
                await authService.refreshToken({ clearAuthOnFailure: false });
            } catch (refreshError) {
                console.error('Error al refrescar token:', refreshError);
            }

            localStorage.removeItem('needs_onboarding');
            setIsComplete(true);

            if (onComplete) {
                onComplete(result);
            }
        } catch (error) {
            console.error('Error al crear negocio:', error);
            setSubmitError(error.message || 'Error al crear el negocio. Por favor intenta nuevamente.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleContinue = () => {
        window.location.href = '/dashboard';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neo-lavender neo-bg-dots">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-neo-flame mx-auto mb-4" />
                    <p className="neo-text text-neo-black">Cargando...</p>
                </div>
            </div>
        );
    }

    if (isComplete) {
        return (
            <OnboardingComplete
                businessName={formData.name}
                onContinue={handleContinue}
            />
        );
    }

    const errors = validateStepQuickStart(formData);

    return (
        <div className="min-h-screen bg-neo-lavender neo-bg-dots">
            {/* Simple Header */}
            <div className="bg-white border-b-4 border-neo-black py-4 px-4">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Logo" className="w-10 h-10" />
                        <span className="neo-heading text-xl text-neo-black">MenusesQR</span>
                    </div>
                    <div className="neo-sticker text-sm">
                        ⚡ Quick Start
                    </div>
                </div>
            </div>

            {/* Error Alert */}
            {submitError && (
                <div className="max-w-2xl mx-auto mt-4 px-4">
                    <div className="neo-alert neo-alert-error flex items-start gap-3">
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <title>Alerta</title>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex-1">
                            <p className="neo-text">{submitError}</p>
                        </div>
                        <button type="button" onClick={() => setSubmitError(null)} className="text-red-600 hover:text-red-800" aria-label="Cerrar alerta">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <title>Cerrar</title>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Step Content */}
            <div className="container mx-auto px-4 py-8">
                <StepQuickStart
                    formData={formData}
                    updateFormData={updateFormData}
                    updateMultipleFields={updateMultipleFields}
                    updateErrors={() => { }}
                    errors={errors}
                    isActive={true}
                />

                {/* Submit Button */}
                <div className="max-w-2xl mx-auto mt-8 px-4">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!isValid || isSaving}
                        className={`neo-btn neo-btn-primary w-full py-4 text-lg flex items-center justify-center gap-3 ${(!isValid || isSaving) ? 'opacity-60 cursor-not-allowed' : ''
                            }`}
                    >
                        {isSaving ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <title>Cargando</title>
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Creando tu negocio...
                            </>
                        ) : (
                            <>
                                🚀 Crear mi Menú Digital
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
