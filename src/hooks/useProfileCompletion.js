import { useState, useEffect } from 'react';
import businessCompletionService from '../services/businessCompletionService';

export const useProfileCompletion = (businessData) => {
  const [completionData, setCompletionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (businessData) {
      loadCompletionData();
    }
  }, [businessData]);

  const loadCompletionData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await businessCompletionService.getBusinessCompletionWithFallback(businessData);
      setCompletionData(data);

      // Track view event for analytics
      await businessCompletionService.trackCompletionActivity(
        businessData.id,
        'profile-overview',
        'view'
      );

    } catch (err) {
      console.error('Error loading completion data:', err);
      setError(err.message);

      // Fallback to client-side calculation
      const fallbackData = businessCompletionService.calculateCompletionClientSide(businessData);
      setCompletionData(fallbackData);

    } finally {
      setLoading(false);
    }
  };

  const handleSectionClick = async (sectionId) => {
    if (!completionData) return;

    // Track click event for analytics
    await businessCompletionService.trackCompletionActivity(
      businessData.id,
      sectionId,
      'click'
    );

    // Return section data for further handling
    const section = completionData.completionSections?.find(s => s.id === sectionId);
    return section;
  };

  const refreshCompletionData = async () => {
    await loadCompletionData();
  };

  const getCompletionLevel = () => {
    if (!completionData) return null;
    return businessCompletionService.getCompletionLevel(completionData.completionPercentage);
  };

  const getNextMilestone = () => {
    if (!completionData) return null;

    const percentage = completionData.completionPercentage;

    if (percentage >= 90) return { target: 100, reward: '🎊 Legend Status', points: 500, remaining: 100 - percentage };
    if (percentage >= 70) return { target: 90, reward: '👑 Corona de Maestro', points: 200, remaining: 90 - percentage };
    if (percentage >= 50) return { target: 70, reward: '🏅 Badge de Excelencia', points: 150, remaining: 70 - percentage };
    if (percentage >= 30) return { target: 50, reward: '🎉 Certificado de Profesionalismo', points: 100, remaining: 50 - percentage };
    return { target: 30, reward: '🎯 Desbloquea más clientes', points: 50, remaining: 30 - percentage };
  };

  const getIncompleteSections = () => {
    if (!completionData?.completionSections) return [];
    return completionData.completionSections.filter(section => !section.isCompleted);
  };

  const getMotivationalMessage = () => {
    if (!completionData) return '';

    const { completionPercentage } = completionData;
    const incompleteSections = getIncompleteSections();

    if (completionPercentage === 100) return '🎉 ¡Perfecto! Tu perfil está completo y luciendo increíble!';
    if (completionPercentage >= 90) return '🏆 ¡Casi ahí! Solo unos detalles para alcanzar la perfección';
    if (completionPercentage >= 70) return '⭐ ¡Excelente trabajo! Estás a punto de ser un maestro';
    if (completionPercentage >= 50) return '🚀 ¡Gran progreso! Sigue así para llegar a la cima';

    // For lower percentages, be more specific about what to improve
    if (incompleteSections.length <= 2) {
      return `🌱 ¡Buen comienzo! Solo te falta completar ${incompleteSections.map(s => s.title).join(' y ')}`;
    }

    return '💪 ¡Empieza tu viaje! Cada dato cuenta para tu éxito';
  };

  const celebrateMilestone = async () => {
    const currentLevel = getCompletionLevel();
    if (!currentLevel) return;

    // Track milestone achievement
    await businessCompletionService.trackCompletionActivity(
      businessData.id,
      `milestone-${currentLevel.level.toLowerCase()}`,
      'achieved'
    );

    // Return celebration data
    return {
      level: currentLevel,
      message: `¡Felicidades! Has alcanzado el nivel ${currentLevel.level}`,
      points: currentLevel.points,
      timestamp: new Date().toISOString()
    };
  };

  return {
    completionData,
    loading,
    error,
    handleSectionClick,
    refreshCompletionData,
    getCompletionLevel,
    getNextMilestone,
    getIncompleteSections,
    getMotivationalMessage,
    celebrateMilestone
  };
};

export default useProfileCompletion;