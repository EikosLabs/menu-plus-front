import React, { useState } from "react";
import authService from "../services/authService";

export default function RegisterForm() {
	const [formData, setFormData] = useState({
		fullName: "",
		email: "",
		userName: "",
		password: "",
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(false);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(null);
		setLoading(true);

		try {
			const userData = {
				...formData,
				userName: formData.userName || formData.email.split("@")[0],
			};

			// 1. Registrar el usuario
			const registeredUser = await authService.register(
				userData.fullName,
				userData.email,
				userData.userName,
				userData.password,
			);

			// 2. Hacer login automáticamente después del registro
			await authService.login(userData.email, userData.password);

			// 3. Establecer flag de que el usuario necesita onboarding
			localStorage.setItem('needs_onboarding', 'true');
			if (registeredUser && registeredUser.id) {
				localStorage.setItem('user_id', registeredUser.id.toString());
			}

			setSuccess(true);
			setTimeout(() => {
				// Redirigir a onboarding
				window.location.href = "/onboarding";
			}, 2000);
		} catch (_err) {
			setError(
				"Error en el registro. Por favor, verifica tus datos e intenta de nuevo.",
			);
		} finally {
			setLoading(false);
		}
	};

	if (success) {
		return (
			<div className="neo-alert neo-alert-success">
				¡Registro exitoso! Serás redirigido a configurar tu negocio en
				unos momentos...
			</div>
		);
	}

	return (
		<form className="neo-space-md" onSubmit={handleSubmit}>
			{error && (
				<div className="neo-alert neo-alert-error">
					{error}
				</div>
			)}
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
					required={true}
					className="neo-input"
					placeholder="Tu Nombre Completo"
					value={formData.fullName}
					onChange={handleChange}
				/>
			</div>
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
					required={true}
					className="neo-input"
					placeholder="tu@correo.com"
					value={formData.email}
					onChange={handleChange}
				/>
			</div>
			<div>
				<label
					htmlFor="userName"
					className="neo-text-bold block mb-2"
				>
					Nombre de Usuario (opcional)
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
					required={true}
					className="neo-input"
					placeholder="Crea una contraseña segura"
					value={formData.password}
					onChange={handleChange}
				/>
			</div>
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
