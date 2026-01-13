import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../../hooks/useOnboarding';
import { validateStep } from '../../utils/onboardingValidation';
import menuService from '../../services/menuService';
import authService from '../../services/authService';
import { localizeUrl } from '../../i18n/utils';
import OnboardingProgress from './OnboardingProgress';
import OnboardingNavigation from './OnboardingNavigation';
import OnboardingComplete from './OnboardingComplete';
import StepBasicInfo from './steps/StepBasicInfo';
import StepLogo from './steps/StepLogo';
import StepContact from './steps/StepContact';
import StepSocial from './steps/StepSocial';
import StepColors from './steps/StepColors';
import StepScanMenu from './steps/StepScanMenu';
import MultiImageMenuScanner from '../MultiImageMenuScanner';

/**
 * Componente principal del flujo de onboarding
 * Orquesta todos los pasos y maneja la lógica de navegación
 */
export default function OnboardingFlow({ userId: propUserId = null, onComplete }) {
  const totalSteps = 6;
  const stepLabels = ['Escaneo', 'Básico', 'Logo', 'Contacto', 'Social', 'Colores'];
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
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleAnalysisStart = () => {
    updateMultipleFields({ isScanning: true, scanProgress: 0 });
    setIsScannerOpen(false); // Close modal but keep process (will handle this in scanner)
  };

  const handleAnalysisProgress = (progress) => {
    updateFormData('scanProgress', progress);
  };

  const handleAnalysisComplete = (data) => {
    updateMultipleFields({
      scannedSections: data.sections,
      isScanning: false,
      scanProgress: 100
    });
  };

  // Validar el paso actual cuando cambia
  useEffect(() => {
    const validationErrors = validateStep(currentStep, formData);
    updateErrors(validationErrors);
  }, [currentStep]);

  // Determinar si el paso actual puede ser omitido
  const canSkipCurrentStep = () => {
    // Paso 1 (Escaneo), 3 (Logo), 4 (Contacto), 5 (Social) son opcionales
    // Paso 2 (Básico) y 6 (Colores) son requeridos usualmente, pero Colores es el final
    return currentStep === 1 || currentStep === 3 || currentStep === 4 || currentStep === 5;
  };

  // Manejar el avance al siguiente paso
  const handleNext = async () => {
    if (currentStep === totalSteps) {
      // Último paso: verificar si el escaneo ha terminado si se inició
      if (formData.isScanning) {
        // Podríamos mostrar un mensaje o simplemente esperar aquí
        return;
      }
      // enviar datos
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
      // Preparar los datos del negocio - el backend obtiene el userId del token
      const businessData = {
        name: formData.name,
        description: formData.description || '',
        slogan: formData.slogan || '',
        businessCategoryId: parseInt(formData.businessCategoryId) || 0,
        imageKey: formData.imageKey || null,
        address: formData.address || '',
        latitude: formData.latitude || 0,
        longitude: formData.longitude || 0,
        phoneNumber: formData.phoneNumber || '',
        email: formData.email || '',
        facebookUrl: formData.facebookUrl || '',
        instagramUrl: formData.instagramUrl || '',
        twitterUrl: formData.twitterUrl || '',
        whatsAppNumber: formData.whatsAppNumber || '',
        primaryColor: formData.primaryColor || '#000000',
        secondaryColor: formData.secondaryColor || '#FFFFFF',
        accentColor: formData.accentColor || '#FF5733',
        defaultCurrency: parseInt(formData.defaultCurrency) ?? 0,
        template: 0, // Modern template by default
        fontFamily: 'poppins'
      };

      // 1. Crear el negocio
      const result = await menuService.createFoodBusiness(businessData);

      // 2. Refrescar el token para obtener uno nuevo con el FoodBusinessId actualizado
      // Esto es CRÍTICO para que las siguientes llamadas al API funcionen correctamente
      try {
        await authService.refreshToken();
      } catch (refreshError) {
        console.error('Error al refrescar token:', refreshError);
      }

      // 3. Si hay secciones escaneadas, crearlas
      if (formData.scannedSections && formData.scannedSections.length > 0) {
        try {
          // 4. Crear el menú principal
          const menu = await menuService.createMenu({
            name: 'Menú Principal',
            description: 'Menú extraído mediante escaneo'
          });

          // 5. Crear cada sección e item
          for (const section of formData.scannedSections) {
            const newSection = await menuService.createSection(menu.id, {
              name: section.name,
              description: section.description || ''
            });

            if (section.items && section.items.length > 0) {
              for (const item of section.items) {
                await menuService.createMenuItem({
                  menuId: menu.id,
                  sectionId: newSection.id,
                  name: item.name,
                  description: item.description || '',
                  price: item.price !== undefined ? item.price : 0,
                  isAvailable: true
                });
              }
            }
          }
        } catch (menuError) {
          console.error('Error al crear el menú desde el escaneo:', menuError);
        }
      }

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
    window.location.href = '/dashboard';
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
        <StepScanMenu
          formData={formData}
          updateFormData={updateFormData}
          updateMultipleFields={updateMultipleFields}
          onOpenScanner={() => setIsScannerOpen(true)}
          isActive={currentStep === 1}
        />

        <StepBasicInfo
          formData={formData}
          updateFormData={updateFormData}
          updateErrors={updateErrors}
          errors={errors}
          isActive={currentStep === 2}
        />

        <StepLogo
          formData={formData}
          updateFormData={updateFormData}
          updateMultipleFields={updateMultipleFields}
          updateErrors={updateErrors}
          errors={errors}
          isActive={currentStep === 3}
        />

        <StepContact
          formData={formData}
          updateFormData={updateFormData}
          updateErrors={updateErrors}
          errors={errors}
          isActive={currentStep === 4}
        />

        <StepSocial
          formData={formData}
          updateFormData={updateFormData}
          updateErrors={updateErrors}
          errors={errors}
          isActive={currentStep === 5}
        />

        <StepColors
          formData={formData}
          updateFormData={updateFormData}
          updateMultipleFields={updateMultipleFields}
          updateErrors={updateErrors}
          errors={errors}
          isActive={currentStep === 6}
        />

        {/* Global Scanning Indicator */}
        {formData.isScanning && (
          <div className="max-w-2xl mx-auto px-3 mb-4">
            <div className="bg-neo-lavender-dark border-2 border-black p-3 rounded-xl flex items-center justify-between shadow-neo-sm animate-pulse">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-neo-flame"></div>
                <span className="text-sm font-bold text-neo-black">Digitalizando menú en segundo plano...</span>
              </div>
              <span className="text-xs font-black text-neo-flame">{Math.round(formData.scanProgress || 0)}%</span>
            </div>
          </div>
        )}

        {/* Final step waiting message */}
        {currentStep === totalSteps && formData.isScanning && (
          <div className="max-w-2xl mx-auto px-3 mb-6 text-center">
            <p className="text-neo-flame font-bold animate-bounce">
              Estamos terminando de procesar tu menú... Por favor espera un momento para finalizar.
            </p>
          </div>
        )}

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

        {/* Global Scanner Component (Always mounted if scanning or open) */}
        {(isScannerOpen || formData.isScanning) && (
          <div className={`${isScannerOpen ? 'fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4' : 'hidden'}`}>
            <MultiImageMenuScanner
              onAnalysisComplete={handleAnalysisComplete}
              onProgress={handleAnalysisProgress}
              onStart={handleAnalysisStart}
              onCancel={() => setIsScannerOpen(false)}
              isBackground={!isScannerOpen && formData.isScanning}
            />
          </div>
        )}
      </div>
    </div>
  );
}
