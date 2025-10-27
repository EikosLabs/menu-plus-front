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
			<div className="rounded border border-green-400 bg-green-100 p-4 text-green-700">
				¡Registro exitoso! Serás redirigido a configurar tu negocio en
				unos momentos...
			</div>
		);
	}

	return (
		<form className="space-y-6" onSubmit={handleSubmit}>
			{error && (
				<div className="rounded border border-red-400 bg-red-100 p-3 text-red-700">
					{error}
				</div>
			)}
			<div>
				<label
					htmlFor="fullName"
					className="mb-1 block font-medium text-[#0A3342] text-sm"
				>
					Nombre Completo
				</label>
				<input
					type="text"
					name="fullName"
					id="fullName"
					required={true}
					className="w-full rounded-lg border border-slate-300 px-4 py-2.5 placeholder-slate-400 focus:border-[#1a1a1a] focus:ring-[#1a1a1a]"
					placeholder="Tu Nombre Completo"
					value={formData.fullName}
					onChange={handleChange}
				/>
			</div>
			<div>
				<label
					htmlFor="email"
					className="mb-1 block font-medium text-[#0A3342] text-sm"
				>
					Correo Electrónico
				</label>
				<input
					type="email"
					name="email"
					id="email"
					required={true}
					className="w-full rounded-lg border border-slate-300 px-4 py-2.5 placeholder-slate-400 focus:border-[#1a1a1a] focus:ring-[#1a1a1a]"
					placeholder="tu@correo.com"
					value={formData.email}
					onChange={handleChange}
				/>
			</div>
			<div>
				<label
					htmlFor="userName"
					className="mb-1 block font-medium text-[#0A3342] text-sm"
				>
					Nombre de Usuario (opcional)
				</label>
				<input
					type="text"
					name="userName"
					id="userName"
					className="w-full rounded-lg border border-slate-300 px-4 py-2.5 placeholder-slate-400 focus:border-[#1a1a1a] focus:ring-[#1a1a1a]"
					placeholder="Si no lo ingresas, usaremos tu email"
					value={formData.userName}
					onChange={handleChange}
				/>
			</div>
			<div>
				<label
					htmlFor="password"
					className="mb-1 block font-medium text-[#0A3342] text-sm"
				>
					Contraseña
				</label>
				<input
					type="password"
					name="password"
					id="password"
					required={true}
					className="w-full rounded-lg border border-slate-300 px-4 py-2.5 placeholder-slate-400 focus:border-[#1a1a1a] focus:ring-[#1a1a1a]"
					placeholder="Crea una contraseña segura"
					value={formData.password}
					onChange={handleChange}
				/>
			</div>
			<div>
				<button
					type="submit"
					disabled={loading}
					className="w-full rounded-lg bg-[#004E71] px-4 py-3 font-semibold text-white shadow-md transition-colors duration-300 hover:bg-[#003A57] focus:outline-none focus:ring-2 focus:ring-[#004E71] focus:ring-opacity-50 disabled:cursor-not-allowed disabled:opacity-70"
				>
					{loading ? "Procesando..." : "Registrarme"}
				</button>
			</div>
		</form>
	);
}
