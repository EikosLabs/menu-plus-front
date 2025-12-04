/**
 * Sistema de tipos de error para mejor manejo y feedback al usuario
 */

export const ERROR_TYPES = {
	// Errores de autenticación
	INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
	UNAUTHORIZED: "UNAUTHORIZED",
	TOKEN_EXPIRED: "TOKEN_EXPIRED",
	SESSION_EXPIRED: "SESSION_EXPIRED",
	ACCOUNT_LOCKED: "ACCOUNT_LOCKED",

	// Errores de validación
	VALIDATION_ERROR: "VALIDATION_ERROR",
	REQUIRED_FIELD: "REQUIRED_FIELD",
	INVALID_EMAIL: "INVALID_EMAIL",
	INVALID_PASSWORD: "INVALID_PASSWORD",
	PASSWORD_TOO_WEAK: "PASSWORD_TOO_WEAK",
	DUPLICATE_EMAIL: "DUPLICATE_EMAIL",
	INVALID_FORMAT: "INVALID_FORMAT",

	// Errores de red
	NETWORK_ERROR: "NETWORK_ERROR",
	TIMEOUT_ERROR: "TIMEOUT_ERROR",
	CONNECTION_REFUSED: "CONNECTION_REFUSED",
	NO_INTERNET: "NO_INTERNET",

	// Errores del servidor
	SERVER_ERROR: "SERVER_ERROR",
	NOT_FOUND: "NOT_FOUND",
	FORBIDDEN: "FORBIDDEN",
	CONFLICT: "CONFLICT",
	RATE_LIMITED: "RATE_LIMITED",

	// Errores de negocio
	BUSINESS_NOT_FOUND: "BUSINESS_NOT_FOUND",
	MENU_NOT_FOUND: "MENU_NOT_FOUND",
	ITEM_NOT_FOUND: "ITEM_NOT_FOUND",
	CATEGORY_NOT_FOUND: "CATEGORY_NOT_FOUND",

	// Errores de archivos
	FILE_TOO_LARGE: "FILE_TOO_LARGE",
	PAYLOAD_TOO_LARGE: "PAYLOAD_TOO_LARGE",
	INVALID_FILE_TYPE: "INVALID_FILE_TYPE",
	UPLOAD_FAILED: "UPLOAD_FAILED",
	DIMENSION_TOO_SMALL: "DIMENSION_TOO_SMALL",
	DIMENSION_TOO_LARGE: "DIMENSION_TOO_LARGE",

	// Errores HTTP
	CLIENT_ERROR: "CLIENT_ERROR",

	// Otros
	UNKNOWN_ERROR: "UNKNOWN_ERROR",
	PERMISSION_DENIED: "PERMISSION_DENIED",
};

/**
 * Mensajes de error amigables para el usuario
 */
export const ERROR_MESSAGES = {
	[ERROR_TYPES.INVALID_CREDENTIALS]:
		"Email o contraseña incorrectos. Por favor verifica tus datos.",
	[ERROR_TYPES.UNAUTHORIZED]: "No tienes permiso para realizar esta acción.",
	[ERROR_TYPES.TOKEN_EXPIRED]:
		"Tu sesión ha expirado. Por favor inicia sesión nuevamente.",
	[ERROR_TYPES.SESSION_EXPIRED]:
		"Tu sesión ha expirado. Por favor inicia sesión nuevamente.",
	[ERROR_TYPES.ACCOUNT_LOCKED]:
		"Tu cuenta ha sido bloqueada. Contacta a soporte.",

	[ERROR_TYPES.VALIDATION_ERROR]:
		"Por favor corrige los errores en el formulario.",
	[ERROR_TYPES.REQUIRED_FIELD]: "Este campo es obligatorio.",
	[ERROR_TYPES.INVALID_EMAIL]: "Por favor ingresa un email válido.",
	[ERROR_TYPES.INVALID_PASSWORD]: "La contraseña no cumple con los requisitos.",
	[ERROR_TYPES.PASSWORD_TOO_WEAK]:
		"La contraseña debe tener al menos 8 caracteres.",
	[ERROR_TYPES.DUPLICATE_EMAIL]:
		"Este email ya está registrado. ¿Olvidaste tu contraseña?",
	[ERROR_TYPES.INVALID_FORMAT]: "El formato de este campo no es válido.",

	[ERROR_TYPES.NETWORK_ERROR]:
		"Error de conexión. Verifica tu internet e intenta nuevamente.",
	[ERROR_TYPES.TIMEOUT_ERROR]:
		"La solicitud tardó demasiado. Por favor intenta nuevamente.",
	[ERROR_TYPES.CONNECTION_REFUSED]:
		"No se pudo conectar al servidor. Intenta más tarde.",
	[ERROR_TYPES.NO_INTERNET]: "No hay conexión a internet. Verifica tu red.",

	[ERROR_TYPES.SERVER_ERROR]:
		"Error en el servidor. Estamos trabajando para solucionarlo.",
	[ERROR_TYPES.NOT_FOUND]: "El recurso solicitado no fue encontrado.",
	[ERROR_TYPES.FORBIDDEN]: "No tienes permiso para acceder a este recurso.",
	[ERROR_TYPES.CONFLICT]: "Ya existe un recurso con estos datos.",
	[ERROR_TYPES.RATE_LIMITED]:
		"Demasiadas solicitudes. Por favor espera un momento.",

	[ERROR_TYPES.BUSINESS_NOT_FOUND]: "Negocio no encontrado.",
	[ERROR_TYPES.MENU_NOT_FOUND]: "Menú no encontrado.",
	[ERROR_TYPES.ITEM_NOT_FOUND]: "Artículo no encontrado.",
	[ERROR_TYPES.CATEGORY_NOT_FOUND]: "Categoría no encontrada.",

	[ERROR_TYPES.FILE_TOO_LARGE]: "El archivo es demasiado grande. Máximo 5MB.",
	[ERROR_TYPES.PAYLOAD_TOO_LARGE]:
		"La imagen es demasiado grande para el servidor. Intenta con una imagen más pequeña o comprímela antes de subirla.",
	[ERROR_TYPES.INVALID_FILE_TYPE]:
		"Tipo de archivo no válido. Solo se permiten imágenes.",
	[ERROR_TYPES.UPLOAD_FAILED]: "Error al subir el archivo. Intenta nuevamente.",
	[ERROR_TYPES.DIMENSION_TOO_SMALL]:
		"La imagen es muy pequeña. Mínimo 100x100 píxeles para buen análisis.",
	[ERROR_TYPES.DIMENSION_TOO_LARGE]:
		"La imagen es muy grande. Máximo 4096x4096 píxeles para análisis.",

	[ERROR_TYPES.UNKNOWN_ERROR]:
		"Ocurrió un error inesperado. Por favor intenta nuevamente.",
	[ERROR_TYPES.PERMISSION_DENIED]: "No tienes los permisos necesarios.",
};

/**
 * Determina si un error es recuperable (puede reintentar)
 */
export const isRetryableError = (errorType) => {
	return [
		ERROR_TYPES.NETWORK_ERROR,
		ERROR_TYPES.TIMEOUT_ERROR,
		ERROR_TYPES.SERVER_ERROR,
		ERROR_TYPES.CONNECTION_REFUSED,
	].includes(errorType);
};

/**
 * Determina si un error requiere re-autenticación
 */
export const requiresReAuth = (errorType) => {
	return [
		ERROR_TYPES.UNAUTHORIZED,
		ERROR_TYPES.TOKEN_EXPIRED,
		ERROR_TYPES.SESSION_EXPIRED,
	].includes(errorType);
};

/**
 * Mapea códigos HTTP a tipos de error
 */
export const mapHttpStatusToErrorType = (status) => {
	const statusMap = {
		400: ERROR_TYPES.VALIDATION_ERROR,
		401: ERROR_TYPES.UNAUTHORIZED,
		403: ERROR_TYPES.FORBIDDEN,
		404: ERROR_TYPES.NOT_FOUND,
		409: ERROR_TYPES.CONFLICT,
		413: ERROR_TYPES.PAYLOAD_TOO_LARGE,
		429: ERROR_TYPES.RATE_LIMITED,
		500: ERROR_TYPES.SERVER_ERROR,
		502: ERROR_TYPES.SERVER_ERROR,
		503: ERROR_TYPES.SERVER_ERROR,
		504: ERROR_TYPES.TIMEOUT_ERROR,
	};

	return statusMap[status] || ERROR_TYPES.UNKNOWN_ERROR;
};
