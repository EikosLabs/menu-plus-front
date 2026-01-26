import React, { useState } from "react";
import authService from "../services/authService";
import { useErrorHandler } from "../hooks/useErrorHandler";
import ErrorAlert from "./shared/ErrorAlert";
import PasswordInput from "./shared/PasswordInput";
import { validatePassword, validateRequired } from "../utils/validation";
import { useTranslation } from "../i18n/utils";

export default function ResetPasswordForm({ token }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { t } = useTranslation();

  const { error, clearError, handleError } = useErrorHandler();

  const [touched, setTouched] = useState({ 
    newPassword: false, 
    confirmPassword: false 
  });

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const getFieldError = (field) => {
    if (!touched[field]) return null;

    switch (field) {
      case 'newPassword':
        return validatePassword(newPassword, { minLength: 8 });
      case 'confirmPassword':
        if (!confirmPassword) {
          return 'Por favor confirma tu contraseña';
        }
        if (confirmPassword !== newPassword) {
          return 'Las contraseñas no coinciden';
        }
        return null;
      default:
        return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    setTouched({ newPassword: true, confirmPassword: true });

    const passwordError = validatePassword(newPassword, { minLength: 8 });
    const confirmError = getFieldError('confirmPassword');

    if (passwordError || confirmError) {
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(token, newPassword);
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        window.location.href = '/login?message=password-reset-success';
      }, 3000);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="neo-card neo-card-primary p-8 text-center">
        <div className="mb-4">
          <svg
            className="w-16 h-16 mx-auto text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-label="Success"
          >
            <title>Contraseña actualizada</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="neo-heading neo-h4 mb-4">
          ¡Contraseña actualizada!
        </h2>
        <p className="text-gray-700 mb-6">
          Tu contraseña ha sido actualizada exitosamente. Serás redirigido al inicio de sesión en unos segundos...
        </p>
        <a href="/login" className="neo-btn neo-btn-primary">
          Ir al inicio de sesión
        </a>
      </div>
    );
  }

  return (
    <form className="neo-space-md" onSubmit={handleSubmit} data-testid="reset-password-form">
      {error && (
        <ErrorAlert
          error={error}
          onClose={clearError}
          onRetry={!loading ? handleSubmit : undefined}
        />
      )}

      <div className="mb-6">
        <h2 className="neo-heading neo-h4 mb-2">
          {t('auth.resetPassword') || 'Restablecer contraseña'}
        </h2>
        <p className="text-gray-600 text-sm">
          Ingresa tu nueva contraseña
        </p>
      </div>

      <PasswordInput
        label={t('auth.newPassword') || 'Nueva contraseña'}
        id="newPassword"
        name="newPassword"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        onBlur={() => handleBlur('newPassword')}
        error={getFieldError('newPassword')}
        disabled={loading}
        autoComplete="new-password"
        required
        showStrengthIndicator={true}
        data-testid="new-password-input"
      />

      <PasswordInput
        label={t('auth.confirmPassword') || 'Confirmar contraseña'}
        id="confirmPassword"
        name="confirmPassword"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        onBlur={() => handleBlur('confirmPassword')}
        error={getFieldError('confirmPassword')}
        disabled={loading}
        autoComplete="new-password"
        required
        data-testid="confirm-password-input"
      />

      <button
        type="submit"
        className="neo-btn neo-btn-primary w-full"
        disabled={loading}
        data-testid="submit-button"
      >
        {loading ? (
          <>
            <span className="neo-spinner mr-2" />
            {t('common.updating') || 'Actualizando...'}
          </>
        ) : (
          t('auth.resetPassword') || 'Restablecer contraseña'
        )}
      </button>
    </form>
  );
}
