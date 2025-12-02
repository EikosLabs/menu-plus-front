import React, { useState, useEffect } from 'react';
import aiService from '../../services/aiService';

const AIRecommendationCard = ({
  foodBusinessId,
  sessionId,
  maxRecommendations = 5,
  onItemSelect,
  className = ''
}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userPreferences, setUserPreferences] = useState('');

  useEffect(() => {
    if (foodBusinessId && sessionId) {
      loadRecommendations();
    }
  }, [foodBusinessId, sessionId, maxRecommendations]);

  const loadRecommendations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await aiService.getPersonalizedRecommendations(
        foodBusinessId,
        sessionId,
        userPreferences || null,
        maxRecommendations
      );

      setRecommendations(response.recommendations || []);
    } catch (err) {
      setError(err.message || 'Error loading recommendations');
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const trackInteraction = async (interactionType, menuItemId) => {
    try {
      await aiService.trackUserInteraction(
        foodBusinessId,
        sessionId,
        menuItemId,
        interactionType
      );
    } catch (err) {
      console.error('Error tracking interaction:', err);
    }
  };

  const handleItemClick = (recommendation) => {
    trackInteraction('view', recommendation.id);
    if (onItemSelect) {
      onItemSelect(recommendation);
    }
  };

  const handleLike = (recommendation, e) => {
    e.stopPropagation();
    trackInteraction('like', recommendation.id);

    // Update UI to reflect the like
    setRecommendations(prev =>
      prev.map(r =>
        r.id === recommendation.id
          ? { ...r, liked: true, disliked: false }
          : r
      )
    );
  };

  const handleDislike = (recommendation, e) => {
    e.stopPropagation();
    trackInteraction('dislike', recommendation.id);

    // Update UI to reflect the dislike
    setRecommendations(prev =>
      prev.map(r =>
        r.id === recommendation.id
          ? { ...r, liked: false, disliked: true }
          : r
      )
    );
  };

  const handleRefresh = () => {
    loadRecommendations();
  };

  const getScoreColor = (score) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const formatPrice = (price, currency) => {
    const symbol = currency === 'USD' ? '$' :
                   currency === 'EUR' ? '€' :
                   currency === 'GBP' ? '£' :
                   currency || '$';
    return `${symbol}${price.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className={`ai-recommendation-card bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`ai-recommendation-card bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center">
          <div className="text-red-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className={`ai-recommendation-card bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-2">No recommendations available yet</p>
          <p className="text-sm text-gray-500">
            Start browsing the menu to get personalized recommendations
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`ai-recommendation-card bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Recommended For You
          </h3>
          <p className="text-sm text-gray-600">
            Personalized suggestions based on your preferences
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
          title="Refresh recommendations"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* User Preferences Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Preferences (Optional)
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={userPreferences}
            onChange={(e) => setUserPreferences(e.target.value)}
            placeholder="e.g., spicy food, vegetarian, budget-friendly"
            className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          <button
            onClick={loadRecommendations}
            className="px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
          >
            Update
          </button>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations.map((recommendation, index) => (
          <div
            key={recommendation.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
            onClick={() => handleItemClick(recommendation)}
          >
            <div className="flex items-start space-x-4">
              {/* Item Image */}
              {recommendation.imageUri && (
                <div className="flex-shrink-0">
                  <img
                    src={recommendation.imageUri}
                    alt={recommendation.name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                </div>
              )}

              {/* Item Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-medium text-gray-900 truncate">
                    {recommendation.name}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${getScoreColor(recommendation.recommendationScore)}`}>
                      {Math.round(recommendation.recommendationScore * 100)}%
                    </span>
                    <span className="text-lg font-semibold text-gray-900">
                      {formatPrice(recommendation.price, recommendation.currency)}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {recommendation.description}
                </p>

                {/* Recommendation Reasons */}
                {recommendation.recommendationReasons.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {recommendation.recommendationReasons.map((reason, reasonIndex) => (
                      <span
                        key={reasonIndex}
                        className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                )}

                {/* Tags */}
                {recommendation.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {recommendation.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-2">
                <button
                  onClick={(e) => handleLike(recommendation, e)}
                  className={`p-2 rounded-full transition-colors ${
                    recommendation.liked
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                  title="Like this item"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => handleDislike(recommendation, e)}
                  className={`p-2 rounded-full transition-colors ${
                    recommendation.disliked
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                  title="Not interested"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 6a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 14a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Recommendations improve as you interact with the menu
        </p>
      </div>
    </div>
  );
};

export default AIRecommendationCard;