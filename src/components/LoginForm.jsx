import React, { useState } from "react";
import authService from "../services/authService";
import { useErrorHandler } from "../hooks/useErrorHandler";
import ErrorAlert from "./shared/ErrorAlert";
import PasswordInput from "./shared/PasswordInput";
import FormField from "./ui/FormField";
import { validateEmail, validateRequired } from "../utils/validation";
import { useTranslation } from "../i18n/utils";
import { ERROR_TYPES } from "../utils/errorTypes";
import LoginSuccessNotification from "./ui/LoginSuccessNotification";
import GoogleLoginButton from "./auth/GoogleLoginButton";

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
        // La notificación se encargará de la redirección
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
        <LoginSuccessNotification
          visible={success}
          onComplete={() => {
            window.location.href = "/dashboard";
          }}
        />
      )}

            {/* Email Field */}
            <FormField
                label={t("auth.email")}
                name="email"
                type="email"
                value={email}
                onChange={(e) => {
                    setEmail(e.target.value);
                    if (touched.email) clearFieldError('email');
                }}
                onBlur={() => handleBlur('email')}
                error={getFieldError('email') || fieldErrors?.email || (error?.type === ERROR_TYPES.UNAUTHORIZED ? t('auth.invalidCredentials') || 'Email o contraseña incorrectos.' : null)}
                placeholder={t("auth.emailPlaceholder")}
            />

            {/* Password Field */}
            <PasswordInput
              label={t("auth.password")}
              name="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (touched.password) clearFieldError('password');
              }}
              onBlur={() => handleBlur('password')}
              placeholder={t("auth.passwordPlaceholder")}
              error={getFieldError('password') || fieldErrors?.password || (error?.type === ERROR_TYPES.UNAUTHORIZED ? t('auth.invalidCredentials') || 'Email o contraseña incorrectos.' : null)}
            />

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
                  className={`neo-btn neo-btn-primary w-full flex justify-center items-center gap-2 ${loading ? 'opacity-80 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t("common.loading")}
                    </>
                  ) : t("auth.loginButton")}
                </button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <div className="px-4 bg-white font-bold text-gray-500 neo-text">
                        O
                    </div>
                </div>
            </div>

            {/* Google Login Button */}
            <div className="mt-4">
                <GoogleLoginButton
                    onLoginStart={() => console.log('Google login started')}
                    onLoginSuccess={(data) => console.log('Google login success:', data)}
                    onLoginError={(error) => {
                        console.error('Google login error:', error);
                        handleError({
                            message: 'Error al iniciar sesión con Google',
                            type: ERROR_TYPES.NETWORK_ERROR
                        });
                    }}
                    disabled={loading}
                />
            </div>
        </form>
    );
}
