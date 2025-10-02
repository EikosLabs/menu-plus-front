const API_URL = "/api";

export const authService = {
	async login(email, password) {
		if (!(email && password)) {
			throw new Error("Email y contraseña son requeridos");
		}

		if (!email.includes("@")) {
			throw new Error("Formato de email inválido");
		}

		const requestBody = { email: email.trim(), password };

		const response = await fetch(`${API_URL}/auth/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(requestBody),
			credentials: "include",
		});

		if (!response.ok) {
			let errorMessage = "Error en la autenticación";
			let responseText = "";

			try {
				responseText = await response.text();

				const errorData = JSON.parse(responseText);
				errorMessage =
					errorData.message ||
					errorData.error ||
					errorData.title ||
					errorMessage;

				if (errorData.errors) {
					const validationErrors = Object.values(errorData.errors).flat();
					errorMessage = validationErrors.join(", ");
				}
			} catch (_parseError) {
				errorMessage = responseText || errorMessage;
			}

			throw new Error(
				`Error de autenticación (${response.status}): ${errorMessage}`,
			);
		}

		const contentType = response.headers.get("content-type");
		let token;

		if (contentType?.includes("application/json")) {
			const data = await response.json();
			token =
				typeof data === "object"
					? data.token || data.accessToken || data.access_token
					: data;
		} else {
			token = await response.text();
		}

		if (!token || token.trim() === "") {
			throw new Error("El servidor no devolvió un token válido");
		}

		token = token.trim();

		localStorage.setItem("token", token);
		document.cookie = `auth_token=${token}; path=/; max-age=7200; SameSite=Strict`;

		return { success: true, token };
	},

	async register(fullName, email, userName, password) {
		if (!(fullName && email && password)) {
			throw new Error("Nombre completo, email y contraseña son requeridos");
		}

		if (!email.includes("@")) {
			throw new Error("Formato de email inválido");
		}

		const requestBody = {
			fullName: fullName.trim(),
			email: email.trim(),
			userName: userName ? userName.trim() : email.split("@")[0],
			password,
		};

		const response = await fetch(`${API_URL}/users/owner`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(requestBody),
			credentials: "include",
		});

		if (!response.ok) {
			let errorMessage = "Error en el registro";
			let responseText = "";

			try {
				responseText = await response.text();

				const errorData = JSON.parse(responseText);
				errorMessage =
					errorData.message ||
					errorData.error ||
					errorData.title ||
					errorMessage;

				if (errorData.errors) {
					const validationErrors = Object.values(errorData.errors).flat();
					errorMessage = validationErrors.join(", ");
				}
			} catch (_parseError) {
				errorMessage = responseText || errorMessage;
			}

			throw new Error(
				`Error de registro (${response.status}): ${errorMessage}`,
			);
		}

		const userData = await response.json();
		return userData;
	},

	logout() {
		localStorage.removeItem("token");
		document.cookie =
			"auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
	},

	getToken() {
		const localToken = localStorage.getItem("token");
		if (localToken) {
			return localToken;
		}

		const cookies = document.cookie.split(";");
		const authCookie = cookies.find((cookie) =>
			cookie.trim().startsWith("auth_token="),
		);
		if (authCookie) {
			const token = authCookie.split("=")[1];
			localStorage.setItem("token", token);
			return token;
		}
		return null;
	},

	isAuthenticated() {
		return !!this.getToken();
	},

	getUserId() {
		try {
			const token = this.getToken();
			if (!token) {
				return null;
			}

			const base64Url = token.split(".")[1];
			if (!base64Url) {
				return null;
			}

			const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
			const payload = JSON.parse(window.atob(base64));

			const userIdFromToken = payload["UserId"] || payload.userId || payload.sub;

			if (userIdFromToken) {
				const numericUserId = Number.parseInt(userIdFromToken, 10);
				if (!Number.isNaN(numericUserId)) {
					return numericUserId;
				}
			}

			return null;
		} catch (_error) {
			return null;
		}
	},
};

export default authService;
