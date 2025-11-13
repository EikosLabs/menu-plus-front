import React, { useState } from "react";
import authService from "../services/authService";
import { useErrorHandler } from "../hooks/useErrorHandler";
import ErrorAlert, { SuccessAlert, FieldError } from "./shared/ErrorAlert";
import { FieldError } from "./shared/ErrorAlert";
import { validateEmail, validateRequired } from "../utils/validation";
import { useTranslation } from "../i18n/utils";
import { ERROR_TYPES } from "../utils/errorTypes";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { t } = useTranslation();

  const { error, fieldErrors, clearError, clearFieldError, handleError } = useErrorHandler();

	// Validación en tiempo real
	const [touched, setTouched] = useState({ email: false, password: false });

	const handleBlur = (field) => {
		setTouched(prev => ({ ...prev, [field]: true }));
	};

	const getFieldError = (field) => {
		if (!touched[field]) return null;

		switch (field) {
			case 'email':
				return validateEmail(email);
			case 'password':
				return validateRequired(password, 'La contraseña');
			default:
				return null;
		}
	};

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

		// Marcar todos como tocados
		setTouched({ email: true, password: true });

		// Validar todos los campos
		const emailError = validateEmail(email);
		const passwordError = validateRequired(password, 'La contraseña');

		if (emailError || passwordError) {
			return; // Los errores se muestran automáticamente por touched
		}

    setLoading(true);

    try {
      const result = await authService.login(email, password);

      if (result && result.token) {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      }
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="neo-space-md" onSubmit={handleSubmit}>
      {/* Error Alert */}
      {error && (
        <ErrorAlert
          error={error}
          onClose={clearError}
          onRetry={!loading ? handleSubmit : undefined}
        />
      )}

      {success && (
        <SuccessAlert message={t("auth.loginSuccess") || "¡Inicio de sesión exitoso! Redirigiendo..."} />
      )}

            {/* Email Field */}
            <div>
                <label
                    htmlFor="email"
                    className="neo-text-bold block mb-2"
                >
                    {t("auth.email")}
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className={`neo-input ${(getFieldError('email') || fieldErrors?.email) ? 'border-red-500' : ''}`}
                  placeholder={t("auth.emailPlaceholder")}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (touched.email) clearFieldError('email');
                  }}
                  onBlur={() => handleBlur('email')}
                />
                <FieldError error={getFieldError('email') || fieldErrors?.email || (error?.type === ERROR_TYPES.UNAUTHORIZED ? t('auth.invalidCredentials') || 'Email o contraseña incorrectos.' : null)} />
            </div>

            {/* Password Field */}
            <div>
                <label
                    htmlFor="password"
                    className="neo-text-bold block mb-2"
                >
                    {t("auth.password")}
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  className={`neo-input ${(getFieldError('password') || fieldErrors?.password) ? 'border-red-500' : ''}`}
                  placeholder={t("auth.passwordPlaceholder")}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (touched.password) clearFieldError('password');
                  }}
                  onBlur={() => handleBlur('password')}
                />
                <FieldError error={getFieldError('password') || fieldErrors?.password || (error?.type === ERROR_TYPES.UNAUTHORIZED ? t('auth.invalidCredentials') || 'Email o contraseña incorrectos.' : null)} />
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
                <a href="#" className="neo-text text-neo-flame hover:underline neo-text-bold text-sm">
                    {t("auth.forgotPassword")}
                </a>
            </div>

            {/* Submit Button */}
            <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="neo-btn neo-btn-primary w-full"
                >
                  {loading ? `${t("common.loading")}` : t("auth.loginButton")}
                </button>
            </div>
        </form>
    );
}
