import React, { useState } from "react";
import authService from "../services/authService";
import { useErrorHandler } from "../hooks/useErrorHandler";
import ErrorAlert from "./shared/ErrorAlert";
import FormField from "./ui/FormField";
import { validateEmail, validateRequired } from "../utils/validation";
import { useTranslation } from "../i18n/utils";

export default function MagicLinkForm({ showNameField = false }) {
	const [email, setEmail] = useState("");
	const [fullName, setFullName] = useState("");
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [touched, setTouched] = useState({ email: false, fullName: false });
	const { t } = useTranslation();
	const { error, clearError, handleError } = useErrorHandler();

	const handleBlur = (field) => {
		setTouched(prev => ({ ...prev, [field]: true }));
	};

	const getFieldError = (field) => {
		if (!touched[field]) return null;
		switch (field) {
			case 'email':
				return validateEmail(email);
			case 'fullName':
				return showNameField ? validateRequired(fullName, 'Tu nombre') : null;
			default:
				return null;
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		clearError();
		setTouched({ email: true, fullName: true });

		const emailError = validateEmail(email);
		const fullNameError = showNameField ? validateRequired(fullName, 'Tu nombre') : null;

		if (emailError || fullNameError) return;

		setLoading(true);
		try {
			await authService.requestMagicLink(email, showNameField ? fullName : null);
			setSuccess(true);
		} catch (err) {
			handleError(err);
		} finally {
			setLoading(false);
		}
	};

	if (success) {
		return (
			<div className="neo-card neo-space-md text-center">
				<div className="mb-6"><span className="text-6xl">✉️</span></div>
				<h2 className="text-2xl font-black text-neo-black mb-4">¡Revisa tu email!</h2>
				<p className="neo-text text-lg mb-4">
					Te hemos enviado un <strong>enlace mágico</strong> a <strong>{email}</strong>
				</p>
				<div className="bg-neo-lavender border-neo border-neo-black p-4 neo-shadow-sm">
					<p className="neo-text font-bold text-sm">🔮 Haz clic en el enlace del email para acceder automáticamente</p>
				</div>
				<p className="neo-text text-sm mt-4 opacity-70">
					¿No lo ves? Revisa tu carpeta de spam o{" "}
					<button type="button" onClick={() => setSuccess(false)} className="text-neo-flame hover:underline font-bold">intenta de nuevo</button>
				</p>
			</div>
		);
	}

	return (
		<form className="neo-space-md" onSubmit={handleSubmit}>
			{error && <ErrorAlert error={error} onClose={clearError} onRetry={!loading ? handleSubmit : undefined} />}

			<div className="bg-neo-sunset/20 border-neo border-neo-black p-4 neo-shadow-sm mb-6">
				<p className="neo-text font-bold text-sm">✨ <strong>Sin contraseñas</strong> — Te enviaremos un enlace mágico a tu email para acceder.</p>
			</div>

			{showNameField && (
				<FormField
					label={t("auth.fullName") || "Tu nombre"}
					name="fullName"
					value={fullName}
					onChange={(e) => setFullName(e.target.value)}
					onBlur={() => handleBlur('fullName')}
					error={getFieldError('fullName')}
					placeholder="¿Cómo te llamamos?"
				/>
			)}

			<FormField
				label={t("auth.email") || "Email"}
				name="email"
				type="email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				onBlur={() => handleBlur('email')}
				error={getFieldError('email')}
				placeholder="tu@email.com"
			/>

			<div>
				<button type="submit" disabled={loading} className={`neo-btn neo-btn-primary w-full flex justify-center items-center gap-2 ${loading ? 'opacity-80 cursor-not-allowed' : ''}`}>
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
			</div>

			<div className="text-center mt-6">
				<p className="neo-text text-sm">
					¿Prefieres contraseña?{" "}
					<a href="/register?mode=password" className="text-neo-flame hover:underline font-bold">Registro tradicional</a>
				</p>
			</div>
		</form>
	);
}
