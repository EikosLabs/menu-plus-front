import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../../hooks/useOnboarding';
import { validateStep } from '../../utils/onboardingValidation';
import menuService from '../../services/menuService';
import authService from '../../services/authService';
import OnboardingProgress from './OnboardingProgress';
import OnboardingNavigation from './OnboardingNavigation';
import OnboardingComplete from './OnboardingComplete';
import StepBasicInfo from './steps/StepBasicInfo';
import StepLogo from './steps/StepLogo';
import StepContact from './steps/StepContact';
import StepSocial from './steps/StepSocial';
import StepColors from './steps/StepColors';

/**
 * Componente principal del flujo de onboarding
 * Orquesta todos los pasos y maneja la lógica de navegación
 */
export default function OnboardingFlow({ userId: propUserId, onComplete }) {
  const totalSteps = 5;
  const stepLabels = ['Básico', 'Logo', 'Contacto', 'Social', 'Colores'];
  const [userId, setUserId] = useState(propUserId);
  const [loading, setLoading] = useState(!propUserId);

  // Obtener userId si no se proporciona
  useEffect(() => {
    if (!propUserId) {
      try {
        const userIdFromToken = authService.getUserId();
        if (userIdFromToken) {
          setUserId(userIdFromToken);
        } else {
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('Error al obtener usuario:', error);
        window.location.href = '/login';
      } finally {
        setLoading(false);
      }
    }
  }, [propUserId]);
  
  const {
    currentStep,
    formData,
    errors,
    isValid,
    isSaving,
    completedSteps,
    setIsValid,
    setIsSaving,
    updateFormData,
    updateMultipleFields,
    updateErrors,
    nextStep,
    prevStep,
    skipStep,
    clearProgress
  } = useOnboarding(userId, totalSteps);

  const [isComplete, setIsComplete] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Validar el paso actual cuando cambia
  useEffect(() => {
    const validationErrors = validateStep(currentStep, formData);
    updateErrors(validationErrors);
  }, [currentStep]);

  // Determinar si el paso actual puede ser omitido
  const canSkipCurrentStep = () => {
    // Los pasos 2, 3 y 4 son completamente opcionales
    return currentStep === 2 || currentStep === 3 || currentStep === 4;
  };

  // Manejar el avance al siguiente paso
  const handleNext = async () => {
    if (currentStep === totalSteps) {
      // Último paso: enviar datos
      await handleSubmit();
    } else {
      // Avanzar al siguiente paso
      nextStep();
    }
  };

  // Enviar los datos del onboarding
  const handleSubmit = async () => {
    setIsSaving(true);
    setSubmitError(null);

    try {
      // Preparar los datos del negocio
      const businessData = {
        name: formData.name,
        description: formData.description || '',
        slogan: formData.slogan || '',
        businessCategoryId: formData.businessCategoryId,
        imageKey: formData.imageKey || null,
        address: formData.address || '',
        phoneNumber: formData.phoneNumber || '',
        email: formData.email || '',
        facebookUrl: formData.facebookUrl || '',
        instagramUrl: formData.instagramUrl || '',
        twitterUrl: formData.twitterUrl || '',
        whatsAppNumber: formData.whatsAppNumber || '',
        primaryColor: formData.primaryColor,
        secondaryColor: formData.secondaryColor,
        accentColor: formData.accentColor,
        defaultCurrency: formData.defaultCurrency ?? 0,
        userId: userId
      };

      // Crear el negocio
      const result = await menuService.createFoodBusiness(businessData);
      
      // Limpiar el progreso guardado
      clearProgress();
      localStorage.removeItem('needs_onboarding');
      
      // Mostrar pantalla de éxito
      setIsComplete(true);
      
      // Notificar al componente padre si existe callback
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

  // Manejar la finalización del onboarding
  const handleContinue = () => {
    // Guardar el businessId para el onboarding del menú
    localStorage.setItem('needs_menu_onboarding', 'true');
    window.location.href = '/menu-onboarding';
  };

  // Mostrar loading mientras se obtiene el userId
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neo-lavender neo-bg-dots">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-neo-flame mx-auto mb-4"></div>
          <p className="neo-text text-neo-black">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si el onboarding está completo, mostrar pantalla de éxito
  if (isComplete) {
    return (
      <OnboardingComplete 
        businessName={formData.name}
        onContinue={handleContinue}
      />
    );
  }

  return (
    <div className="min-h-screen bg-neo-lavender neo-bg-dots">
      {/* Progress Indicator */}
      <OnboardingProgress
        currentStep={currentStep}
        totalSteps={totalSteps}
        completedSteps={completedSteps}
        stepLabels={stepLabels}
      />

      {/* Error Alert */}
      {submitError && (
        <div className="max-w-2xl mx-auto mt-3 px-3">
          <div className="neo-alert neo-alert-error flex items-start gap-2 sm:gap-3 text-sm sm:text-base">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h3 className="neo-text neo-text-bold mb-1">Error al crear negocio</h3>
              <p className="neo-text">{submitError}</p>
            </div>
            <button
              onClick={() => setSubmitError(null)}
              className="text-red-600 hover:text-red-800"
              aria-label="Cerrar alerta"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="container mx-auto px-3 py-4 sm:py-6">
        <StepBasicInfo
          formData={formData}
          updateFormData={updateFormData}
          updateErrors={updateErrors}
          errors={errors}
          isActive={currentStep === 1}
        />

        <StepLogo
          formData={formData}
          updateFormData={updateFormData}
          updateMultipleFields={updateMultipleFields}
          updateErrors={updateErrors}
          errors={errors}
          isActive={currentStep === 2}
        />

        <StepContact
          formData={formData}
          updateFormData={updateFormData}
          updateErrors={updateErrors}
          errors={errors}
          isActive={currentStep === 3}
        />

        <StepSocial
          formData={formData}
          updateFormData={updateFormData}
          updateErrors={updateErrors}
          errors={errors}
          isActive={currentStep === 4}
        />

        <StepColors
          formData={formData}
          updateFormData={updateFormData}
          updateMultipleFields={updateMultipleFields}
          updateErrors={updateErrors}
          errors={errors}
          isActive={currentStep === 5}
        />

        {/* Navigation */}
        <div className="max-w-2xl mx-auto px-3">
          <OnboardingNavigation
            currentStep={currentStep}
            totalSteps={totalSteps}
            isValid={isValid}
            isSaving={isSaving}
            canSkip={canSkipCurrentStep()}
            onNext={handleNext}
            onPrev={prevStep}
            onSkip={skipStep}
          />
        </div>
      </div>
    </div>
  );
}
