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
		<form className="space-y-4" onSubmit={handleSubmit}>
			{error && (
				<div className="neo-alert neo-alert-error">
					{error}
				</div>
			)}
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
					value={email}
					onChange={(e) => setEmail(e.target.value)}
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
					placeholder="••••••••"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
			</div>
			<div className="text-right">
				<a href="#" className="neo-text text-neo-flame hover:underline neo-text-bold">
					¿Olvidaste tu contraseña?
				</a>
			</div>
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
