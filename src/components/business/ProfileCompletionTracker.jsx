import React, { useState, useEffect } from 'react';

const ProfileCompletionTracker = ({ businessData, onSectionClick }) => {
  const [completionData, setCompletionData] = useState(null);
  const [animateProgress, setAnimateProgress] = useState(false);

  useEffect(() => {
    if (businessData) {
      calculateCompletion();
      // Trigger animation after a short delay
      setTimeout(() => setAnimateProgress(true), 300);
    }
  }, [businessData]);

  const calculateCompletion = () => {
    const sections = [
      {
        id: 'basic-info',
        title: 'Información Básica',
        icon: '🏪',
        weight: 25,
        completed: false,
        fields: [
          { key: 'name', label: 'Nombre del Negocio', completed: false },
          { key: 'description', label: 'Descripción', completed: false },
          { key: 'category', label: 'Categoría', completed: false },
          { key: 'address', label: 'Dirección', completed: false }
        ]
      },
      {
        id: 'contact',
        title: 'Contacto',
        icon: '📞',
        weight: 20,
        completed: false,
        fields: [
          { key: 'phone', label: 'Teléfono', completed: false },
          { key: 'email', label: 'Email', completed: false },
          { key: 'whatsapp', label: 'WhatsApp', completed: false }
        ]
      },
      {
        id: 'branding',
        title: 'Branding',
        icon: '🎨',
        weight: 20,
        completed: false,
        fields: [
          { key: 'logo', label: 'Logo', completed: false },
          { key: 'colors', label: 'Colores de Marca', completed: false },
          { key: 'template', label: 'Plantilla', completed: false }
        ]
      },
      {
        id: 'social',
        title: 'Redes Sociales',
        icon: '🌐',
        weight: 15,
        completed: false,
        fields: [
          { key: 'facebook', label: 'Facebook', completed: false },
          { key: 'instagram', label: 'Instagram', completed: false },
          { key: 'twitter', label: 'Twitter', completed: false }
        ]
      },
      {
        id: 'menu',
        title: 'Menú',
        icon: '📋',
        weight: 20,
        completed: false,
        fields: [
          { key: 'hasItems', label: 'Tiene Items en el Menú', completed: false },
          { key: 'hasCategories', label: 'Tiene Categorías', completed: false },
          { key: 'hasImages', label: 'Items con Imágenes', completed: false }
        ]
      }
    ];

    // Calculate completion for each section
    let totalScore = 0;
    let maxScore = 0;

    sections.forEach(section => {
      let sectionScore = 0;
      let sectionMaxScore = section.fields.length;

      section.fields.forEach(field => {
        let fieldCompleted = false;

        switch (field.key) {
          case 'name':
            fieldCompleted = businessData.name && businessData.name.trim().length > 0;
            break;
          case 'description':
            fieldCompleted = businessData.description && businessData.description.trim().length > 20;
            break;
          case 'category':
            fieldCompleted = businessData.categoryId > 0;
            break;
          case 'address':
            fieldCompleted = businessData.address && businessData.address.trim().length > 0;
            break;
          case 'phone':
            fieldCompleted = businessData.phoneNumber && businessData.phoneNumber.trim().length > 0;
            break;
          case 'email':
            fieldCompleted = businessData.email && businessData.email.includes('@');
            break;
          case 'whatsapp':
            fieldCompleted = businessData.whatsAppNumber && businessData.whatsAppNumber.trim().length > 0;
            break;
          case 'logo':
            fieldCompleted = businessData.imageKey || businessData.imageUrl;
            break;
          case 'colors':
            fieldCompleted = businessData.primaryColor && businessData.primaryColor.trim().length > 0;
            break;
          case 'template':
            fieldCompleted = businessData.template && businessData.template !== 'default';
            break;
          case 'facebook':
            fieldCompleted = businessData.facebookUrl && businessData.facebookUrl.trim().length > 0;
            break;
          case 'instagram':
            fieldCompleted = businessData.instagramUrl && businessData.instagramUrl.trim().length > 0;
            break;
          case 'twitter':
            fieldCompleted = businessData.twitterUrl && businessData.twitterUrl.trim().length > 0;
            break;
          case 'hasItems':
            fieldCompleted = businessData.menuItemsCount > 0;
            break;
          case 'hasCategories':
            fieldCompleted = businessData.menuCategoriesCount > 0;
            break;
          case 'hasImages':
            fieldCompleted = businessData.menuItemsWithImagesCount > 0;
            break;
        }

        field.completed = fieldCompleted;
        if (fieldCompleted) {
          sectionScore++;
        }
      });

      section.completed = sectionScore === sectionMaxScore;
      section.completionPercentage = (sectionScore / sectionMaxScore) * 100;

      totalScore += (sectionScore / sectionMaxScore) * section.weight;
      maxScore += section.weight;
    });

    const overallPercentage = Math.round((totalScore / maxScore) * 100);

    setCompletionData({
      overallPercentage,
      sections,
      level: getCompletionLevel(overallPercentage),
      nextMilestone: getNextMilestone(overallPercentage)
    });
  };

  const getCompletionLevel = (percentage) => {
    if (percentage >= 90) return { level: 'Experto', emoji: '🏆', color: 'neo-gold', bg: 'bg-yellow-400' };
    if (percentage >= 70) return { level: 'Avanzado', emoji: '⭐', color: 'neo-purple', bg: 'bg-purple-400' };
    if (percentage >= 50) return { level: 'Intermedio', emoji: '🚀', color: 'neo-blue', bg: 'bg-blue-400' };
    if (percentage >= 30) return { level: 'Principiante', emoji: '🌱', color: 'neo-green', bg: 'bg-green-400' };
    return { level: 'Novato', emoji: '🥚', color: 'neo-gray', bg: 'bg-gray-400' };
  };

  const getNextMilestone = (percentage) => {
    if (percentage < 30) return { target: 30, reward: '🎯 Desbloquea más clientes', points: 50 };
    if (percentage < 50) return { target: 50, reward: '🎉 Certificado de Profesionalismo', points: 100 };
    if (percentage < 70) return { target: 70, reward: '🏅 Badge de Excelencia', points: 150 };
    if (percentage < 90) return { target: 90, reward: '👑 Corona de Maestro', points: 200 };
    return { target: 100, reward: '🎊 Legend Status', points: 500 };
  };

  const getMotivationalMessage = () => {
    if (!completionData) return '';

    const { overallPercentage, level } = completionData;

    if (overallPercentage === 100) return '🎉 ¡Perfecto! Tu perfil está completo y luciendo increíble!';
    if (overallPercentage >= 90) return '🏆 ¡Casi ahí! Solo unos detalles para alcanzar la perfección';
    if (overallPercentage >= 70) return '⭐ ¡Excelente trabajo! Estás a punto de ser un maestro';
    if (overallPercentage >= 50) return '🚀 ¡Gran progreso! Sigue así para llegar a la cima';
    if (overallPercentage >= 30) return '🌱 ¡Buen comienzo! Cada dato cuenta para tu éxito';
    return '💪 ¡Empieza tu viaje! Completa tu perfil para destacar';
  };

  if (!completionData) {
    return (
      <div className="neo-card bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const { overallPercentage, sections, level, nextMilestone } = completionData;
  const remainingPercentage = nextMilestone.target - overallPercentage;

  return (
    <div className="neo-card bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute -top-4 -right-4 w-20 h-20 bg-neo-yellow opacity-20 rounded-full border-4 border-black"></div>
      <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-neo-blue opacity-10 rounded-full border-4 border-black"></div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div>
          <h3 className="neo-heading neo-h3 text-gray-800 mb-2">Perfil de Negocio</h3>
          <p className="text-gray-600 font-medium">Completa tu perfil para destacar</p>
        </div>
        <div className={`text-4xl bg-gradient-to-br from-neo-flame to-neo-sunset w-20 h-20 rounded-full border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
          <span className="filter drop-shadow-sm">{level.emoji}</span>
        </div>
      </div>

      {/* Main Progress Circle */}
      <div className="flex flex-col items-center mb-8 relative z-10">
        <div className="relative w-40 h-40">
          {/* Background circle */}
          <div className="absolute inset-0 rounded-full border-4 border-gray-200 bg-gray-50"></div>

          {/* Progress circle */}
          <div
            className="absolute inset-2 rounded-full border-4 border-transparent bg-gradient-to-br from-neo-flame to-neo-sunset shadow-inner"
            style={{
              background: `conic-gradient(from 0deg, #EF4444 0deg, #F97316 ${overallPercentage * 3.6}deg, #E5E7EB ${overallPercentage * 3.6}deg)`
            }}
          >
            <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
              <div className="text-center">
                <div className={`text-3xl font-black transition-all duration-700 ${animateProgress ? 'scale-110' : 'scale-100'}`}>
                  {overallPercentage}%
                </div>
                <div className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                  {level.level}
                </div>
              </div>
            </div>
          </div>

          {/* Decorative dots */}
          <div className="absolute -top-2 -left-2 w-4 h-4 bg-neo-yellow border-2 border-black rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"></div>
          <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-neo-blue border-2 border-black rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"></div>
        </div>
      </div>

      {/* Motivational Message */}
      <div className={`${level.bg} border-4 border-black p-4 mb-6 text-center relative`}>
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-black rounded-full"></div>
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-black rounded-full"></div>
        <p className="font-black text-white text-sm">
          {getMotivationalMessage()}
        </p>
      </div>

      {/* Next Milestone */}
      {overallPercentage < 100 && (
        <div className="bg-gradient-to-r from-neo-yellow/20 to-neo-orange/20 border-2 border-neo-orange border-dashed p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-800 text-sm">
                🎯 Siguiente meta: {nextMilestone.target}%
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {nextMilestone.reward} (+{nextMilestone.points} pts)
              </p>
            </div>
            <div className="text-right">
              <p className="font-black text-2xl text-neo-flame">
                +{remainingPercentage}%
              </p>
              <p className="text-xs text-gray-500">restante</p>
            </div>
          </div>
        </div>
      )}

      {/* Sections Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {sections.map((section, index) => (
          <div
            key={section.id}
            onClick={() => onSectionClick && onSectionClick(section.id)}
            className={`relative p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer hover:scale-105 ${section.completed
                ? 'bg-green-50 border-green-500 shadow-[2px_2px_0px_0px_rgba(34,197,94,0.5)]'
                : 'bg-gray-50 border-gray-300 hover:border-neo-flame hover:shadow-[4px_4px_0px_0px_rgba(239,68,68,0.3)]'
              }`}
          >
            {/* Section Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{section.icon}</span>
                <span className="font-bold text-sm text-gray-800">{section.title}</span>
              </div>
              {section.completed ? (
                <span className="text-green-500 text-lg">✓</span>
              ) : (
                <span className="text-gray-400 text-lg">○</span>
              )}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 border border-gray-300">
              <div
                className={`h-full rounded-full transition-all duration-500 ${section.completed ? 'bg-green-500' : 'bg-neo-flame'
                  }`}
                style={{ width: `${section.completionPercentage}%` }}
              ></div>
            </div>

            {/* Field Count */}
            <p className="text-xs text-gray-600 mt-2">
              {section.fields.filter(f => f.completed).length}/{section.fields.length} completado
            </p>

            {/* Decorative element */}
            {!section.completed && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-neo-yellow border border-black rounded-full animate-pulse"></div>
            )}
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <button
          onClick={() => onSectionClick && onSectionClick('missing-fields')}
          className="neo-btn bg-neo-flame hover:bg-neo-orange text-white border-2 border-black px-6 py-3 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
        >
          🚀 Completar Perfil Ahora
        </button>
      </div>
    </div>
  );
};

export default ProfileCompletionTracker;