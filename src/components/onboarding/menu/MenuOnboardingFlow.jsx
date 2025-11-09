import React, { useState, useEffect } from 'react';
import menuService from '../../../services/menuService';
import authService from '../../../services/authService';
import OnboardingProgress from '../OnboardingProgress';
import OnboardingNavigation from '../OnboardingNavigation';
import MenuOnboardingComplete from './MenuOnboardingComplete';
import StepCreateMenu from './steps/StepCreateMenu';
import StepCreateSection from './steps/StepCreateSection';
import StepCreateFirstItem from './steps/StepCreateFirstItem';

/**
 * Flujo de onboarding para crear el primer menú
 * Guía al usuario a crear menú, sección y primer plato
 */
export default function MenuOnboardingFlow({ businessId: propBusinessId, businessName: propBusinessName, onComplete }) {
  const totalSteps = 3;
  const stepLabels = ['Menú', 'Sección', 'Primer Plato'];
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [submitError, setSubmitError] = useState(null);
  const [businessId, setBusinessId] = useState(propBusinessId);
  const [businessName, setBusinessName] = useState(propBusinessName);
  const [loading, setLoading] = useState(!propBusinessId);

  // Obtener businessId y businessName si no se proporcionan
  useEffect(() => {
    if (!propBusinessId) {
      const fetchBusinessData = async () => {
        try {
          const userId = authService.getUserId();
          if (!userId) {
            window.location.href = '/login';
            return;
          }

          const businesses = await menuService.getUserBusinesses(userId);
          if (businesses && businesses.length > 0) {
            setBusinessId(businesses[0].id);
            setBusinessName(businesses[0].name);
          } else {
            window.location.href = '/dashboard';
          }
        } catch (error) {
          console.error('Error al obtener negocio:', error);
          window.location.href = '/dashboard';
        } finally {
          setLoading(false);
        }
      };
      fetchBusinessData();
    }
  }, [propBusinessId]);
  
  // Datos del formulario
  const [menuData, setMenuData] = useState({
    name: '',
    description: ''
  });
  
  const [sectionData, setSectionData] = useState({
    name: '',
    description: ''
  });
  
  const [itemData, setItemData] = useState({
    name: '',
    description: '',
    price: '',
    image: null,
    imageKey: null
  });
  
  // IDs creados
  const [createdMenuId, setCreatedMenuId] = useState(null);
  const [createdSectionId, setCreatedSectionId] = useState(null);

  const updateField = (step, field, value) => {
    if (step === 1) {
      setMenuData(prev => ({ ...prev, [field]: value }));
    } else if (step === 2) {
      setSectionData(prev => ({ ...prev, [field]: value }));
    } else if (step === 3) {
      setItemData(prev => ({ ...prev, [field]: value }));
    }
  };

  const updateMultipleFields = (step, fields) => {
    if (step === 1) {
      setMenuData(prev => ({ ...prev, ...fields }));
    } else if (step === 2) {
      setSectionData(prev => ({ ...prev, ...fields }));
    } else if (step === 3) {
      setItemData(prev => ({ ...prev, ...fields }));
    }
  };

  const nextStep = async () => {
    if (currentStep === 1) {
      // Crear menú
      await handleCreateMenu();
    } else if (currentStep === 2) {
      // Crear sección
      await handleCreateSection();
    } else if (currentStep === 3) {
      // Crear primer item
      await handleCreateItem();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setErrors({});
    }
  };

  const handleCreateMenu = async () => {
    setIsSaving(true);
    setSubmitError(null);

    try {
      const menu = await menuService.createMenu({
        name: menuData.name,
        description: menuData.description,
        foodBusinessId: businessId
      });

      setCreatedMenuId(menu.id);
      
      if (!completedSteps.includes(1)) {
        setCompletedSteps(prev => [...prev, 1]);
      }
      
      setCurrentStep(2);
      setErrors({});
    } catch (error) {
      console.error('Error al crear menú:', error);
      setSubmitError('Error al crear el menú. Por favor intenta nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateSection = async () => {
    if (!createdMenuId) {
      setSubmitError('Error: No se encontró el menú creado.');
      return;
    }

    setIsSaving(true);
    setSubmitError(null);

    try {
      const section = await menuService.createSection(createdMenuId, {
        name: sectionData.name,
        description: sectionData.description
      });

      setCreatedSectionId(section.id);
      
      if (!completedSteps.includes(2)) {
        setCompletedSteps(prev => [...prev, 2]);
      }
      
      setCurrentStep(3);
      setErrors({});
    } catch (error) {
      console.error('Error al crear sección:', error);
      setSubmitError('Error al crear la sección. Por favor intenta nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateItem = async () => {
    if (!createdMenuId) {
      setSubmitError('Error: No se encontró el menú creado.');
      return;
    }

    setIsSaving(true);
    setSubmitError(null);

    try {
      await menuService.createMenuItem({
        name: itemData.name,
        description: itemData.description,
        price: parseFloat(itemData.price),
        menuId: createdMenuId,
        sectionId: createdSectionId,
        image: itemData.image,
        isAvailable: true
      });

      if (!completedSteps.includes(3)) {
        setCompletedSteps(prev => [...prev, 3]);
      }

      setIsComplete(true);
      
      if (onComplete) {
        onComplete({ menuId: createdMenuId });
      }
    } catch (error) {
      console.error('Error al crear item:', error);
      setSubmitError('Error al crear el plato. Por favor intenta nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleContinue = () => {
    localStorage.removeItem('needs_menu_onboarding');
    window.location.href = '/dashboard';
  };

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

  if (isComplete) {
    return (
      <MenuOnboardingComplete
        menuName={menuData.name}
        sectionName={sectionData.name}
        itemName={itemData.name}
        businessName={businessName}
        onContinue={handleContinue}
      />
    );
  }

  return (
    <div className="min-h-screen bg-neo-lavender neo-bg-dots">
      <OnboardingProgress
        currentStep={currentStep}
        totalSteps={totalSteps}
        completedSteps={completedSteps}
        stepLabels={stepLabels}
      />

      {submitError && (
        <div className="max-w-2xl mx-auto mt-2 sm:mt-3 px-2 sm:px-3">
          <div className="neo-alert neo-alert-error flex items-start gap-2 text-xs sm:text-sm">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h3 className="neo-text neo-text-bold mb-0.5 text-xs sm:text-sm">Error al crear menú</h3>
              <p className="neo-text text-xs">{submitError}</p>
            </div>
            <button
              onClick={() => setSubmitError(null)}
              className="text-red-600 hover:text-red-800"
              aria-label="Cerrar alerta"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4 md:py-6">
        <StepCreateMenu
          formData={menuData}
          updateField={(field, value) => updateField(1, field, value)}
          errors={errors}
          setErrors={setErrors}
          setIsValid={setIsValid}
          isActive={currentStep === 1}
          businessName={businessName}
        />

        <StepCreateSection
          formData={sectionData}
          updateField={(field, value) => updateField(2, field, value)}
          errors={errors}
          setErrors={setErrors}
          setIsValid={setIsValid}
          isActive={currentStep === 2}
          menuName={menuData.name}
        />

        <StepCreateFirstItem
          formData={itemData}
          updateField={(field, value) => updateField(3, field, value)}
          updateMultipleFields={(fields) => updateMultipleFields(3, fields)}
          errors={errors}
          setErrors={setErrors}
          setIsValid={setIsValid}
          isActive={currentStep === 3}
          sectionName={sectionData.name}
        />

        <div className="max-w-2xl mx-auto px-2 sm:px-3 md:px-4">
          <OnboardingNavigation
            currentStep={currentStep}
            totalSteps={totalSteps}
            isValid={isValid}
            isSaving={isSaving}
            canSkip={false}
            onNext={nextStep}
            onPrev={prevStep}
          />
        </div>
      </div>
    </div>
  );
}
