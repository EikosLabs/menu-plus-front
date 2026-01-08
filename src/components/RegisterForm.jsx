import React, { useState } from "react";
import authService from "../services/authService";
import { useErrorHandler } from "../hooks/useErrorHandler";
import ErrorAlert, { SuccessAlert } from "./shared/ErrorAlert";
import PasswordInput from "./shared/PasswordInput";
import FormField from "./ui/FormField";
import { validateEmail, validateRequired, validatePassword } from "../utils/validation";
import { useTranslation } from "../i18n/utils";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    email: "",
    userName: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });
  const { t } = useTranslation();

  const { error, clearError, handleError } = useErrorHandler();
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error del campo al cambiar
    if (touched[name]) {
      clearError();
    }

    if (name === 'password') {
      const v = value || '';
      let s = 0;
      if (v.length >= 8) s++;
      if (/[A-Z]/.test(v)) s++;
      if (/[a-z]/.test(v)) s++;
      if (/[0-9]/.test(v)) s++;
      if (/[^A-Za-z0-9]/.test(v)) s++;
      setPasswordStrength(Math.min(s, 5));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const getFieldError = (field) => {
    if (!touched[field]) return null;

    const value = formData[field];

    switch (field) {
      case 'email':
        return validateEmail(value);
      case 'password':
        return validatePassword(value, { minLength: 8 });
      default:
        return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    // Marcar todos como tocados
    setTouched({
      email: true,
      password: true,
    });

    // Validar todos los campos
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password, { minLength: 8 });

    if (emailError || passwordError) {
      return; // Los errores se muestran automáticamente
    }

    setLoading(true);

    try {
      const userData = {
        ...formData,
        userName: formData.userName || formData.email.split("@")[0],
        fullName: formData.email.split("@")[0], // Use email prefix as default name
      };

      // 1. Registrar el usuario
      await authService.register(
        userData.fullName,
        userData.email,
        userData.userName,
        userData.password,
      );

      // 2. Hacer login automáticamente después del registro
      await authService.login(userData.email, userData.password);

      // 3. Establecer flag de que el usuario necesita onboarding
      // Nota: user_id se obtiene del token JWT, no se almacena en localStorage por seguridad
      localStorage.setItem('needs_onboarding', 'true');

      setSuccess(true);
      setTimeout(() => {
        // Redirigir a onboarding
        window.location.href = "/onboarding";
      }, 2000);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <SuccessAlert
        message="¡Registro exitoso! Serás redirigido a configurar tu negocio en unos momentos..."
      />
    );
  }

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

      {/* Email Field */}
      <FormField
        label={t("auth.email")}
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        onBlur={() => handleBlur('email')}
        error={getFieldError('email')}
        placeholder={t("auth.emailPlaceholder")}
      />

      {/* Username Field (Optional) */}
      <FormField
        label={t("auth.userName") + " (opcional)"}
        name="userName"
        value={formData.userName}
        onChange={handleChange}
        placeholder={t("auth.userNamePlaceholder")}
      />

      {/* Password Field */}
      <PasswordInput
        label={t("auth.password")}
        name="password"
        value={formData.password}
        onChange={handleChange}
        onBlur={() => handleBlur('password')}
        error={getFieldError('password')}
        placeholder={t("auth.passwordPlaceholder")}
        showStrength={true}
        strength={passwordStrength}
      />

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
          ) : t("auth.registerButton")}
        </button>
      </div>
    </form>
  );
}
