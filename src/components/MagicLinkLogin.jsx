import React, { useState } from "react";
import authService from "../services/authService";
import { useErrorHandler } from "../hooks/useErrorHandler";
import ErrorAlert from "./shared/ErrorAlert";
import FormField from "./ui/FormField";
import { validateEmail } from "../utils/validation";

/**
 * Magic Link Login - Login without password, just email
 * Works for both new and existing users
 */
export default function MagicLinkLogin({ onSwitchToPassword }) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [touched, setTouched] = useState(false);
    const { error, clearError, handleError } = useErrorHandler();

    const handleBlur = () => setTouched(true);
    const getEmailError = () => touched ? validateEmail(email) : null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        clearError();
        setTouched(true);

        const emailError = validateEmail(email);
        if (emailError) return;

        setLoading(true);
        try {
            await authService.requestMagicLink(email, null);
            setSuccess(true);
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="neo-card neo-space-md text-center p-6">
                <div className="mb-4"><span className="text-5xl">✉️</span></div>
                <h2 className="text-xl font-black text-neo-black mb-3">¡Revisa tu email!</h2>
                <p className="neo-text mb-3">
                    Enviamos un <strong>enlace mágico</strong> a <strong>{email}</strong>
                </p>
                <div className="bg-neo-lavender border-neo border-neo-black p-3 neo-shadow-sm">
                    <p className="neo-text font-bold text-sm">🔮 Haz clic en el enlace para acceder</p>
                </div>
                <p className="neo-text text-sm mt-3 opacity-70">
                    ¿No lo ves?{" "}
                    <button type="button" onClick={() => setSuccess(false)} className="text-neo-flame hover:underline font-bold">
                        Reenviar
                    </button>
                </p>
            </div>
        );
    }

    return (
        <form className="neo-space-md" onSubmit={handleSubmit}>
            {error && <ErrorAlert error={error} onClose={clearError} />}

            <div className="bg-neo-sunset/20 border-neo border-neo-black p-3 neo-shadow-sm mb-4 rounded-lg">
                <p className="neo-text font-bold text-sm">🔮 Sin contraseña — te enviaremos un enlace mágico</p>
            </div>

            <FormField
                label="Email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={handleBlur}
                error={getEmailError()}
                placeholder="tu@email.com"
            />

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
                        Enviando...
                    </>
                ) : "🔮 Enviar enlace mágico"}
            </button>

            {onSwitchToPassword && (
                <div className="text-center mt-4">
                    <p className="neo-text text-sm">
                        ¿Prefieres contraseña?{" "}
                        <button type="button" onClick={onSwitchToPassword} className="text-neo-flame hover:underline font-bold">
                            Usar contraseña
                        </button>
                    </p>
                </div>
            )}
        </form>
    );
}
