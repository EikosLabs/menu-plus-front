import { useState } from 'react';
import aiService from '../../services/aiService';

export default function TextImprovementButton({
  originalText,
  onTextImproved,
  placeholder = "Describe tu plato...",
  label = "Descripción",
  entityType = "MenuItem",
  entityId = null,
  disabled = false
}) {
  const [isImproving, setIsImproving] = useState(false);
  const [error, setError] = useState(null);

  const handleImproveText = async () => {
    if (!originalText || originalText.trim().length < 10) {
      setError("Por favor escribe al menos 10 caracteres para poder mejorar el texto");
      return;
    }

    setIsImproving(true);
    setError(null);

    try {
      const response = await aiService.improveContent(originalText, entityType, entityId);

      if (response.success && response.suggestions && response.suggestions.length > 0) {
        // Tomar la sugerencia con mayor confianza y aplicarla directamente
        const bestSuggestion = response.suggestions.reduce((best, current) =>
          current.confidenceScore > best.confidenceScore ? current : best
        );

        // Extraer solo el contenido sugerido (limpiar formato)
        const cleanContent = bestSuggestion.suggestedContent
          // Eliminar títulos y secciones
          .replace(/^#{1,6}\s.*$/gm, '')
          // Eliminar markdown
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/\*(.*?)\*/g, '$1')
          .replace(/`(.*?)`/g, '$1')
          // Eliminar bullets y numbering
          .replace(/^\s*[-*+]\s+/gm, '')
          .replace(/^\s*\d+\.\s+/gm, '')
          // Eliminar referencias y líneas problemáticas
          .replace(/^>\s*/gm, '')
          .replace(/→\s*(.*?)\n/g, '\n')
          // Eliminar líneas de análisis
          .replace(/^\s*\*\s+.*problema.*$/mi, '')
          .replace(/^\s*\*\s+falta.*$/mi, '')
          .replace(/^\s*\*\s+.*por.*$/mi, '')
          // Limpiar espacios múltiples y líneas vacías
          .split('\n')
          .filter(line => {
            const trimmed = line.trim();
            return trimmed.length > 0 &&
                   !trimmed.startsWith('Por qué funciona:') &&
                   !trimmed.includes('*   Específico:') &&
                   !trimmed.includes('*   Sensorial:');
          })
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        if (cleanContent) {
          onTextImproved(cleanContent);
        }
      } else {
        // Mostrar el error específico del backend si está disponible
        const errorMessage = response.error || "No se pudieron generar alternativas. Intenta con un texto más descriptivo.";
        setError(errorMessage);
      }
    } catch (err) {
      console.error('Error improving text:', err);
      setError(err.message || "Error al mejorar el texto. Inténtalo nuevamente.");
    } finally {
      setIsImproving(false);
    }
  };

  return (
    <div className="w-full space-y-3">
      {label && (
        <label className="block font-medium text-gray-700 text-sm">
          {label}
        </label>
      )}
      <div className="flex gap-2 items-start">
        <textarea
          value={originalText}
          onChange={(e) => onTextImproved(e.target.value)}
          placeholder={placeholder}
          disabled={disabled || isImproving}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-24 disabled:bg-gray-100"
        />

        <button
          type="button"
          onClick={handleImproveText}
          disabled={disabled || isImproving || !originalText || originalText.trim().length < 10}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2 h-24 flex-shrink-0"
          title="Mejorar texto con IA"
        >
          {isImproving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="hidden sm:inline">Mejorando...</span>
            </>
          ) : (
            <>
              <span className="text-lg">✨</span>
              <span className="hidden sm:inline">Mejorar</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <span className="text-red-500">⚠️</span>
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
}