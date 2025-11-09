import React, { useState } from "react";
import authService from "../services/authService";
import { useErrorHandler } from "../hooks/useErrorHandler";
import ErrorAlert from "./shared/ErrorAlert";
import { FieldError } from "./shared/ErrorAlert";
import { validateEmail, validateRequired } from "../utils/validation";

export default function LoginForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

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
				window.location.href = "/dashboard";
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
				/>
			)}

			{/* Email Field */}
			<div>
				<label
					htmlFor="email"
					className="neo-text-bold block mb-2"
				>
					Correo Electrónico
				</label>
				<input
					type="email"
					name="email"
					id="email"
					className={`neo-input ${getFieldError('email') ? 'border-red-500' : ''}`}
					placeholder="tu@correo.com"
					value={email}
					onChange={(e) => {
						setEmail(e.target.value);
						if (touched.email) clearFieldError('email');
					}}
					onBlur={() => handleBlur('email')}
				/>
				<FieldError error={getFieldError('email')} />
			</div>

			{/* Password Field */}
			<div>
				<label
					htmlFor="password"
					className="neo-text-bold block mb-2"
				>
					Contraseña
				</label>
				<input
					type="password"
					name="password"
					id="password"
					className={`neo-input ${getFieldError('password') ? 'border-red-500' : ''}`}
					placeholder="••••••••"
					value={password}
					onChange={(e) => {
						setPassword(e.target.value);
						if (touched.password) clearFieldError('password');
					}}
					onBlur={() => handleBlur('password')}
				/>
				<FieldError error={getFieldError('password')} />
			</div>

			{/* Forgot Password Link */}
			<div className="text-right">
				<a href="#" className="neo-text text-neo-flame hover:underline neo-text-bold text-sm">
					¿Olvidaste tu contraseña?
				</a>
			</div>

			{/* Submit Button */}
			<div>
				<button
					type="submit"
					disabled={loading}
					className="neo-btn neo-btn-primary w-full"
				>
					{loading ? "Procesando..." : "Ingresar"}
				</button>
			</div>
		</form>
	);
}
