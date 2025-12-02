import React, { useState, useEffect } from 'react';
import aiService from '../../services/aiService';

const AIContentEditor = ({
  entityType, // 'MenuItem' or 'FoodBusiness'
  entityId,
  originalContent,
  onSave,
  onCancel
}) => {
  const [aiContent, setAiContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadPendingSuggestions();
  }, [entityType, entityId]);

  const loadPendingSuggestions = async () => {
    try {
      const response = await aiService.getPendingSuggestions(entityType, 1, 10);
      setSuggestions(response.suggestions.filter(s => s.entityId === entityId));
    } catch (err) {
      console.error('Error loading suggestions:', err);
    }
  };

  const generateAIContent = async () => {
    setIsGenerating(true);
    setError(null);
    setSuccess(false);

    try {
      let response;
      if (entityType === 'MenuItem') {
        response = await aiService.generateMenuItemDescription(entityId, customPrompt || null);
      } else {
        response = await aiService.optimizeBusinessDescription(customPrompt || null);
      }

      setAiContent(response.suggestedContent || response.aiOptimizedDescription);
      setSuccess(true);

      // Reload suggestions after generation
      await loadPendingSuggestions();
    } catch (err) {
      setError(err.message || 'Error generating AI content');
    } finally {
      setIsGenerating(false);
    }
  };

  const selectSuggestion = (suggestion) => {
    setSelectedSuggestion(suggestion);
    setAiContent(suggestion.suggestedContent);
  };

  const approveSelectedSuggestion = async () => {
    if (!selectedSuggestion) return;

    setIsSaving(true);
    setError(null);

    try {
      await aiService.approveSuggestion(selectedSuggestion.id);

      if (onSave) {
        onSave(aiContent, selectedSuggestion);
      }

      setSuccess(true);
      setSelectedSuggestion(null);

      // Reload suggestions
      await loadPendingSuggestions();
    } catch (err) {
      setError(err.message || 'Error approving suggestion');
    } finally {
      setIsSaving(false);
    }
  };

  const rejectSelectedSuggestion = async (reviewNotes = '') => {
    if (!selectedSuggestion) return;

    setIsSaving(true);
    setError(null);

    try {
      await aiService.rejectSuggestion(selectedSuggestion.id, reviewNotes);

      setSuccess(true);
      setSelectedSuggestion(null);

      // Reload suggestions
      await loadPendingSuggestions();
    } catch (err) {
      setError(err.message || 'Error rejecting suggestion');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="ai-content-editor bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          AI Content Assistant
        </h3>
        <p className="text-sm text-gray-600">
          Generate and manage AI-powered content improvements
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-600">Operation completed successfully!</p>
        </div>
      )}

      {/* Original Content */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Original Content
        </label>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {originalContent || 'No content available'}
          </p>
        </div>
      </div>

      {/* AI Generation Controls */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-medium text-gray-900">
            AI-Powered Improvements
          </h4>
          <button
            onClick={() => setShowCustomPrompt(!showCustomPrompt)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {showCustomPrompt ? 'Hide' : 'Show'} Custom Prompt
          </button>
        </div>

        {showCustomPrompt && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Prompt (Optional)
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Provide specific instructions for AI content generation..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>
        )}

        <button
          onClick={generateAIContent}
          disabled={isGenerating}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Generating...' : 'Generate AI Content'}
        </button>
      </div>

      {/* Pending Suggestions */}
      {suggestions.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">
            Pending AI Suggestions
          </h4>
          <div className="space-y-3">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className={`p-4 border rounded-md cursor-pointer transition-colors ${
                  selectedSuggestion?.id === suggestion.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => selectSuggestion(suggestion)}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    {suggestion.suggestionType}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {Math.round(suggestion.confidenceScore * 100)}% confidence
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  {suggestion.suggestedContent}
                </p>
                <p className="text-xs text-gray-500 italic">
                  {suggestion.reasoning}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Generated Content */}
      {aiContent && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            AI Generated Content
          </label>
          <textarea
            value={aiContent}
            onChange={(e) => setAiContent(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            rows={6}
            placeholder="AI-generated content will appear here..."
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
        )}

        {selectedSuggestion && (
          <>
            <button
              onClick={() => rejectSelectedSuggestion('Rejected by user')}
              disabled={isSaving}
              className="px-4 py-2 text-red-700 bg-red-100 rounded-md hover:bg-red-200 focus:ring-2 focus:ring-red-500 disabled:opacity-50"
            >
              {isSaving ? 'Rejecting...' : 'Reject'}
            </button>

            <button
              onClick={approveSelectedSuggestion}
              disabled={isSaving}
              className="px-4 py-2 text-green-700 bg-green-100 rounded-md hover:bg-green-200 focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isSaving ? 'Approving...' : 'Approve & Apply'}
            </button>
          </>
        )}

        {aiContent && !selectedSuggestion && (
          <button
            onClick={() => onSave(aiContent)}
            disabled={isSaving}
            className="px-4 py-2 text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Content'}
          </button>
        )}
      </div>

      {/* Info Banner */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-700">
          <strong>Important:</strong> All AI-generated content requires manual approval before being published.
          This ensures quality control and brand consistency.
        </p>
      </div>
    </div>
  );
};

export default AIContentEditor;