import React, { useState } from "react";
import authService from "../services/authService";
import { useErrorHandler } from "../hooks/useErrorHandler";
import ErrorAlert, { SuccessAlert, FieldError } from "./shared/ErrorAlert";
import { validateEmail, validateRequired, validatePassword } from "../utils/validation";

export default function RegisterForm() {
	const [formData, setFormData] = useState({
		fullName: "",
		email: "",
		userName: "",
		password: "",
	});
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [touched, setTouched] = useState({
		fullName: false,
		email: false,
		password: false,
	});

	const { error, clearError, handleError } = useErrorHandler();

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
	};

	const handleBlur = (field) => {
		setTouched(prev => ({ ...prev, [field]: true }));
	};

	const getFieldError = (field) => {
		if (!touched[field]) return null;

		const value = formData[field];

		switch (field) {
			case 'fullName':
				return validateRequired(value, 'El nombre completo');
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
			fullName: true,
			email: true,
			password: true,
		});

		// Validar todos los campos
		const fullNameError = validateRequired(formData.fullName, 'El nombre completo');
		const emailError = validateEmail(formData.email);
		const passwordError = validatePassword(formData.password, { minLength: 8 });

		if (fullNameError || emailError || passwordError) {
			return; // Los errores se muestran automáticamente
		}

		setLoading(true);

		try {
			const userData = {
				...formData,
				userName: formData.userName || formData.email.split("@")[0],
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
				/>
			)}

			{/* Full Name Field */}
			<div>
				<label
					htmlFor="fullName"
					className="neo-text-bold block mb-2"
				>
					Nombre Completo
				</label>
				<input
					type="text"
					name="fullName"
					id="fullName"
					className={`neo-input ${getFieldError('fullName') ? 'border-red-500' : ''}`}
					placeholder="Tu Nombre Completo"
					value={formData.fullName}
					onChange={handleChange}
					onBlur={() => handleBlur('fullName')}
				/>
				<FieldError error={getFieldError('fullName')} />
			</div>

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
					value={formData.email}
					onChange={handleChange}
					onBlur={() => handleBlur('email')}
				/>
				<FieldError error={getFieldError('email')} />
			</div>

			{/* Username Field (Optional) */}
			<div>
				<label
					htmlFor="userName"
					className="neo-text-bold block mb-2"
				>
					Nombre de Usuario <span className="neo-text text-neo-gray text-sm">(opcional)</span>
				</label>
				<input
					type="text"
					name="userName"
					id="userName"
					className="neo-input"
					placeholder="Si no lo ingresas, usaremos tu email"
					value={formData.userName}
					onChange={handleChange}
				/>
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
					placeholder="Crea una contraseña segura (mínimo 8 caracteres)"
					value={formData.password}
					onChange={handleChange}
					onBlur={() => handleBlur('password')}
				/>
				<FieldError error={getFieldError('password')} />
			</div>

			{/* Submit Button */}
			<div>
				<button
					type="submit"
					disabled={loading}
					className="neo-btn neo-btn-primary w-full"
				>
					{loading ? "Procesando..." : "Registrarme"}
				</button>
			</div>
		</form>
	);
}
