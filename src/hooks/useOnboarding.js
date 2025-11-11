import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook para gestionar el flujo de onboarding
 * Maneja navegación, validación, persistencia y estado del formulario
 */
export const useOnboarding = (userId = null, totalSteps = 5) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slogan: '',
    businessCategoryId: null,
    logoFile: null,
    imageKey: null,
    address: '',
    phoneNumber: '',
    email: '',
    facebookUrl: '',
    instagramUrl: '',
    twitterUrl: '',
    whatsAppNumber: '',
    primaryColor: '#1a1a1a',
    secondaryColor: '#004E71',
    accentColor: '#0A3342'
  });
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);

  // Cargar progreso guardado al montar el componente
  useEffect(() => {
    if (userId) {
      loadProgress();
    }
  }, [userId]);

  // Auto-guardar cada 30 segundos
  useEffect(() => {
    if (userId && currentStep > 0) {
      const autoSaveInterval = setInterval(() => {
        saveProgress();
      }, 30000);

      return () => clearInterval(autoSaveInterval);
    }
  }, [userId, currentStep, formData]);

  /**
   * Carga el progreso guardado desde localStorage
   */
  const loadProgress = useCallback(() => {
    try {
      const key = `onboarding_progress_${userId}`;
      const saved = localStorage.getItem(key);
      
      if (saved) {
        const progressData = JSON.parse(saved);
        const timestamp = progressData.timestamp || 0;
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        
        // Verificar si los datos no han expirado (7 días)
        if (timestamp > sevenDaysAgo) {
          setCurrentStep(progressData.currentStep || 1);
          setFormData(prev => ({ ...prev, ...progressData.formData }));
          setCompletedSteps(progressData.completedSteps || []);
        } else {
          // Limpiar datos expirados
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('Error al cargar progreso:', error);
    }
  }, [userId]);

  /**
   * Guarda el progreso actual en localStorage
   */
  const saveProgress = useCallback(() => {
    try {
      const key = `onboarding_progress_${userId}`;
      const progressData = {
        userId,
        currentStep,
        completedSteps,
        formData: {
          ...formData,
          logoFile: null // No guardar el archivo en localStorage
        },
        timestamp: Date.now()
      };
      
      localStorage.setItem(key, JSON.stringify(progressData));
    } catch (error) {
      console.error('Error al guardar progreso:', error);
    }
  }, [userId, currentStep, completedSteps, formData]);

  /**
   * Limpia el progreso guardado de localStorage
   */
  const clearProgress = useCallback(() => {
    try {
      const key = `onboarding_progress_${userId}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error al limpiar progreso:', error);
    }
  }, [userId]);

  /**
   * Actualiza los datos del formulario
   */
  const updateFormData = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  /**
   * Actualiza múltiples campos del formulario
   */
  const updateMultipleFields = useCallback((fields) => {
    setFormData(prev => ({
      ...prev,
      ...fields
    }));
  }, []);

  /**
   * Actualiza los errores de validación
   */
  const updateErrors = useCallback((newErrors) => {
    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0);
  }, []);

  /**
   * Avanza al siguiente paso
   */
  const nextStep = useCallback(() => {
    if (currentStep < totalSteps && isValid) {
      // Marcar el paso actual como completado
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep]);
      }
      
      setCurrentStep(prev => prev + 1);
      saveProgress();
      setErrors({});
    }
  }, [currentStep, totalSteps, isValid, completedSteps, saveProgress]);

  /**
   * Retrocede al paso anterior
   */
  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setErrors({});
    }
  }, [currentStep]);

  /**
   * Omite el paso actual (solo para pasos opcionales)
   */
  const skipStep = useCallback(() => {
    if (currentStep < totalSteps) {
      // Marcar como completado aunque se omita
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep]);
      }
      
      setCurrentStep(prev => prev + 1);
      saveProgress();
      setErrors({});
    }
  }, [currentStep, totalSteps, completedSteps, saveProgress]);

  /**
   * Reinicia el onboarding
   */
  const reset = useCallback(() => {
    setCurrentStep(1);
    setFormData({
      name: '',
      description: '',
      slogan: '',
      businessCategoryId: null,
      logoFile: null,
      imageKey: null,
      address: '',
      phoneNumber: '',
      email: '',
      facebookUrl: '',
      instagramUrl: '',
      twitterUrl: '',
      whatsAppNumber: '',
      primaryColor: '#1a1a1a',
      secondaryColor: '#004E71',
      accentColor: '#0A3342'
    });
    setErrors({});
    setIsValid(false);
    setCompletedSteps([]);
    clearProgress();
  }, [userId, clearProgress]);

  return {
    // Estado
    currentStep,
    totalSteps,
    formData,
    errors,
    isValid,
    isSaving,
    completedSteps,
    
    // Setters
    setIsValid,
    setIsSaving,
    
    // Métodos
    updateFormData,
    updateMultipleFields,
    updateErrors,
    nextStep,
    prevStep,
    skipStep,
    saveProgress,
    clearProgress,
    reset
  };
};
