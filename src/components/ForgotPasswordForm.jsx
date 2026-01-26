import React, { useState } from "react";
import authService from "../services/authService";
import { useErrorHandler } from "../hooks/useErrorHandler";
import ErrorAlert from "./shared/ErrorAlert";
import FormField from "./ui/FormField";
import { validateEmail } from "../utils/validation";
import { useTranslation } from "../i18n/utils";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { t } = useTranslation();

  const { error, clearError, handleError } = useErrorHandler();

  const [touched, setTouched] = useState(false);

  const handleBlur = () => {
    setTouched(true);
  };

  const getEmailError = () => {
    if (!touched) return null;
    return validateEmail(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    setTouched(true);

    const emailError = validateEmail(email);

    if (emailError) {
      return;
    }

    setLoading(true);

    try {
      await authService.requestPasswordReset(email);
      setSuccess(true);
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
            aria-label="Email sent"
          >
            <title>Email enviado</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="neo-heading neo-h4 mb-4">
          {t('auth.checkEmail') || 'Revisa tu correo'}
        </h2>
        <p className="text-gray-700 mb-6">
          Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.
        </p>
        <p className="text-sm text-gray-600 mb-6">
          El enlace expirará en 1 hora.
        </p>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              setSuccess(false);
              setEmail("");
              setTouched(false);
            }}
            className="neo-btn neo-btn-secondary"
          >
            Enviar otro enlace
          </button>
          <a href="/login" className="neo-btn neo-btn-ghost">
            Volver al inicio de sesión
          </a>
        </div>
      </div>
    );
  }

  return (
    <form className="neo-space-md" onSubmit={handleSubmit} data-testid="forgot-password-form">
      {error && (
        <ErrorAlert
          error={error}
          onClose={clearError}
          onRetry={!loading ? handleSubmit : undefined}
        />
      )}

      <div className="mb-6">
        <h2 className="neo-heading neo-h4 mb-2">
          {t('auth.forgotPassword') || '¿Olvidaste tu contraseña?'}
        </h2>
        <p className="text-gray-600 text-sm">
          Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
        </p>
      </div>

      <FormField
        label={t('auth.email') || 'Email'}
        type="email"
        id="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={handleBlur}
        error={getEmailError()}
        disabled={loading}
        autoComplete="email"
        required
        data-testid="email-input"
      />

      <div className="flex flex-col gap-3">
        <button
          type="submit"
          className="neo-btn neo-btn-primary w-full"
          disabled={loading}
          data-testid="submit-button"
        >
          {loading ? (
            <>
              <span className="neo-spinner mr-2" />
              {t('common.sending') || 'Enviando...'}
            </>
          ) : (
            t('auth.sendResetLink') || 'Enviar enlace'
          )}
        </button>

        <a
          href="/login"
          className="neo-btn neo-btn-ghost w-full"
          data-testid="back-to-login"
        >
          {t('auth.backToLogin') || 'Volver al inicio de sesión'}
        </a>
      </div>
    </form>
  );
}
