import React, { useState } from "react";
import authService from "../services/authService";

export default function LoginForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(null);
		setLoading(true);

		try {
			const result = await authService.login(email, password);

			if (result && result.token) {
				window.location.href = "/dashboard";
			} else {
				setError("El servidor no devolvió un token. Intenta de nuevo.");
			}
		} catch (err) {
			setError(
				err.message || "Credenciales incorrectas. Por favor, intenta de nuevo.",
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<form className="space-y-6" onSubmit={handleSubmit}>
			{error && (
				<div className="rounded border border-red-400 bg-red-100 p-3 text-red-700">
					{error}
				</div>
			)}
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
					value={email}
					onChange={(e) => setEmail(e.target.value)}
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
					placeholder="••••••••"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
			</div>
			<div className="text-right">
				<a href="#" className="text-[#1a1a1a] text-sm hover:underline">
					¿Olvidaste tu contraseña?
				</a>
			</div>
			<div>
		<button
			type="submit"
			disabled={loading}
			className="w-full rounded-lg bg-[#004E71] px-4 py-3 font-semibold text-white shadow-md transition-colors duration-300 hover:bg-[#003A57] focus:outline-none focus:ring-2 focus:ring-[#004E71] focus:ring-opacity-50 disabled:cursor-not-allowed disabled:opacity-70"
		>
			{loading ? "Procesando..." : "Ingresar"}
		</button>
			</div>
		</form>
	);
}
