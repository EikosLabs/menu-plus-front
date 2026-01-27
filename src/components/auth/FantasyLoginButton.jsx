import React, { useState } from "react";
import authService from "../../services/authService";
import { useErrorHandler } from "../../hooks/useErrorHandler";
import ErrorAlert from "../shared/ErrorAlert";

export default function FantasyLoginButton() {
  const [loading, setLoading] = useState(false);
  const { error, clearError, handleError } = useErrorHandler();

  const handleFantasyLogin = async () => {
    clearError();
    setLoading(true);

    try {
      // Create anonymous user with all null fields
      const userData = await authService.registerFantasy();
      
      // Since backend doesn't return password, use fantasy-token endpoint
      // This allows login without password for fantasy users
      if (userData?.email?.endsWith('.fantasy')) {
        // Auto-login with fantasy token
        await authService.fantasyTokenLogin(userData.email);
        
        // Store that this is a new fantasy user for onboarding
        localStorage.setItem('needs_onboarding', 'true');
        localStorage.setItem('is_fantasy_user', 'true');
        localStorage.setItem('fantasy_user_email', userData.email);
        
        // Redirect to onboarding
        window.location.href = '/onboarding';
      } else {
        throw new Error('Failed to create fantasy user');
      }
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="neo-space-sm">
      {error && (
        <ErrorAlert
          error={error}
          onClose={clearError}
          onRetry={!loading ? handleFantasyLogin : undefined}
        />
      )}
      
      <button
        type="button"
        onClick={handleFantasyLogin}
        disabled={loading}
        className="neo-btn w-full"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: '3px solid #000',
          boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.currentTarget.style.transform = 'translate(2px, 2px)';
            e.currentTarget.style.boxShadow = '4px 4px 0px 0px rgba(0,0,0,1)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translate(0, 0)';
          e.currentTarget.style.boxShadow = '6px 6px 0px 0px rgba(0,0,0,1)';
        }}
        data-testid="fantasy-login-button"
      >
        {loading ? (
          <>
            <span className="neo-spinner mr-2" />
            Generando usuario...
          </>
        ) : (
          <>
            🎲 Probar sin registrarse
          </>
        )}
      </button>
      
      <p className="text-xs text-gray-600 text-center mt-2">
        Se creará un usuario temporal
      </p>
    </div>
  );
}
