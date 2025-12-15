import { AppError } from "../utils/AppError";
import errorLogger from "../utils/errorLogger";
import { ERROR_TYPES, isRetryableError } from "../utils/errorTypes";
import authService from "./authService";

class AIService {
	constructor() {
		const apiUrl = import.meta.env.PUBLIC_API_URL || "import.meta.env.PUBLIC_API_URL || '/api'";
		this.baseUrl = `${apiUrl}/ai`;

		// Cache simple para análisis de imágenes (evita análisis duplicados)
		this.analysisCache = new Map();
		this.cacheTimeout = 5 * 60 * 1000; // 5 minutos

		// Configuración de timeouts
		this.timeouts = {
			default: 30000, // 30 segundos para operaciones normales
			imageAnalysis: 60000, // 60 segundos para análisis de imágenes
			textGeneration: 45000, // 45 segundos para generación de texto
		};
	}

	/**
	 * Genera una clave de cache única para el análisis de imagen
	 */
	generateCacheKey(imageIdentifier, entityType) {
		// Crear hash simple basado en el identificador y tipo
		const hash = this.simpleHash(`${imageIdentifier}:${entityType}`);
		return `analysis_${hash}`;
	}

	/**
	 * Función hash simple para generar claves de cache
	 */
	simpleHash(str) {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			const char = str.charCodeAt(i);
			hash = (hash << 5) - hash + char;
			hash = hash & hash; // Convertir a 32-bit integer
		}
		return hash.toString(36);
	}

	/**
	 * Obtiene resultado del cache si no ha expirado
	 */
	getFromCache(cacheKey) {
		const cached = this.analysisCache.get(cacheKey);
		if (!cached) return null;

		const now = Date.now();
		if (now - cached.timestamp > this.cacheTimeout) {
			this.analysisCache.delete(cacheKey);
			return null;
		}

		return cached.data;
	}

	/**
	 * Almacena resultado en cache
	 */
	setCache(cacheKey, data) {
		this.analysisCache.set(cacheKey, {
			data,
			timestamp: Date.now(),
		});

		// Limpiar cache antiguo periódicamente (cada 20 entradas)
		if (this.analysisCache.size > 20) {
			this.cleanupCache();
		}
	}

	/**
	 * Limpia entradas expiradas del cache
	 */
	cleanupCache() {
		const now = Date.now();
		for (const [key, value] of this.analysisCache.entries()) {
			if (now - value.timestamp > this.cacheTimeout) {
				this.analysisCache.delete(key);
			}
		}
	}

	/**
	 * Crea un fetch con timeout personalizado
	 */
	async fetchWithTimeout(url, options = {}, timeout = this.timeouts.default) {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeout);

		try {
			const response = await fetch(url, {
				...options,
				signal: controller.signal,
			});
			clearTimeout(timeoutId);
			return response;
		} catch (error) {
			clearTimeout(timeoutId);

			if (error.name === "AbortError") {
				throw new AppError(
					ERROR_TYPES.TIMEOUT_ERROR,
					`La solicitud excedió el tiempo límite de ${timeout / 1000} segundos`,
					{ timeout, url },
				);
			}
			throw error;
		}
	}

	// Text Improvement Methods - Genera sugerencias de contenido mejorado
	async improveContent(content, entityType = null, entityId = null) {
		try {
			const token = authService.getToken();

			const response = await fetch(`${this.baseUrl}/content/improve`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...(token && { Authorization: `Bearer ${token}` }),
				},
				body: JSON.stringify({
					content,
					entityType,
					entityId,
				}),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = await response.json();

			// Transformar la respuesta al formato esperado por el frontend
			if (result.success) {
				return {
					success: true,
					suggestions: result.suggestions.map((suggestion) => ({
						suggestedContent: suggestion.suggestedContent,
						confidenceScore: suggestion.confidenceScore,
						style: suggestion.style,
						reasoning: suggestion.reasoning,
					})),
				};
			} else {
				return {
					success: false,
					error: result.error,
				};
			}
		} catch (error) {
			console.error("Error improving content:", error);
			throw error;
		}
	}

	// Image Analysis Methods - Analiza imágenes y extrae información
	async analyzeImage(imageBase64, entityType = "MenuItem") {
		const operation = "analyzeImage";

		// Verificar cache primero
		const cacheKey = this.generateCacheKey(imageBase64, entityType);
		const cachedResult = this.getFromCache(cacheKey);

		if (cachedResult) {
			errorLogger.info("Using cached analysis result", {
				operation,
				entityType,
				cacheKey,
			});
			return cachedResult;
		}

		return this.executeWithRetry(
			async () => {
				try {
					const token = authService.getToken();

					// Validaciones de entrada
					if (!imageBase64) {
						throw new AppError(
							ERROR_TYPES.VALIDATION_ERROR,
							"No se proporcionó ninguna imagen para analizar",
							{ entityType },
						);
					}

					if (!entityType) {
						throw new AppError(
							ERROR_TYPES.VALIDATION_ERROR,
							"No se especificó el tipo de entidad para el análisis",
							{},
						);
					}

					// Usar fetch con timeout específico para análisis de imágenes
					const response = await this.fetchWithTimeout(
						`${this.baseUrl}/vision/analyze`,
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
								...(token && { Authorization: `Bearer ${token}` }),
							},
							body: JSON.stringify({
								image: imageBase64,
								entityType: entityType,
							}),
						},
						this.timeouts.imageAnalysis,
					);

					if (!response.ok) {
						// Usar AppError.fromResponse para mejor manejo
						const error = await AppError.fromResponse(
							response,
							`Error al analizar imagen (${response.status}): ${response.statusText}`,
						);

						errorLogger.error(error, {
							operation,
							entityType,
							status: response.status,
							statusText: response.statusText,
							imageLength: imageBase64?.length || 0,
						});

						throw error;
					}

					const result = await response.json();

					// Validar estructura de respuesta
					if (!result.success) {
						const errorMessage =
							result.error ||
							result.message ||
							"Error en el análisis de imagen";
						const error = new AppError(ERROR_TYPES.SERVER_ERROR, errorMessage, {
							serverResponse: result,
							entityType,
							imageLength: imageBase64?.length || 0,
						});

						errorLogger.error(error, { operation, entityType });
						throw error;
					}

					if (!result.data) {
						const error = new AppError(
							ERROR_TYPES.SERVER_ERROR,
							"El servidor devolvió una respuesta exitosa pero sin datos de análisis",
							{
								serverResponse: result,
								entityType,
								imageLength: imageBase64?.length || 0,
							},
						);

						errorLogger.error(error, { operation, entityType });
						throw error;
					}

					// Log exitoso
					errorLogger.info("Image analysis completed successfully", {
						operation,
						entityType,
						confidenceScore: result.data.confidenceScore,
						hasSuggestions: !!result.data.suggestions,
						imageLength: imageBase64?.length || 0,
					});

					const analysisResult = {
						success: true,
						data: {
							suggestions: result.data.suggestions,
							confidenceScore: result.data.confidenceScore,
						},
					};

					// Almacenar en cache
					this.setCache(cacheKey, analysisResult);

					return analysisResult;
				} catch (error) {
					// Si ya es AppError, solo loggear y lanzar
					if (error instanceof AppError) {
						errorLogger.error(error, {
							operation,
							entityType,
							imageLength: imageBase64?.length || 0,
						});
						throw error;
					}

					// Transformar otros errores a AppError
					const appError = new AppError(
						ERROR_TYPES.NETWORK_ERROR,
						"No se pudo conectar con el servicio de análisis de imágenes",
						{
							originalError: error.message,
							entityType,
							imageLength: imageBase64?.length || 0,
							operation,
						},
					);

					errorLogger.error(appError, {
						operation,
						entityType,
						originalError: error.name,
					});

					throw appError;
				}
			},
			{
				operation,
				entityType,
				imageLength: imageBase64?.length || 0,
			},
		);
	}

	// Generate menu item description
	async generateMenuItemDescription(menuItemId, customPrompt = null) {
		try {
			const token = authService.getToken();

			const response = await fetch(
				`${this.baseUrl}/menu-items/${menuItemId}/generate-description`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						...(token && { Authorization: `Bearer ${token}` }),
					},
					body: JSON.stringify({
						customPrompt,
					}),
				},
			);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			return await response.json();
		} catch (error) {
			console.error("Error generating menu item description:", error);
			throw error;
		}
	}

	// Get pending suggestions
	async getPendingSuggestions(entityType = null, page = 1, pageSize = 10) {
		try {
			const params = new URLSearchParams({
				page: page.toString(),
				pageSize: pageSize.toString(),
			});

			if (entityType) {
				params.append("entityType", entityType);
			}

			const token = authService.getToken();

			const response = await fetch(`${this.baseUrl}/suggestions?${params}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					...(token && { Authorization: `Bearer ${token}` }),
				},
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			return await response.json();
		} catch (error) {
			console.error("Error getting pending suggestions:", error);
			throw error;
		}
	}

	// Approve suggestion
	async approveSuggestion(suggestionId) {
		try {
			const token = authService.getToken();

			const response = await fetch(
				`${this.baseUrl}/suggestions/${suggestionId}/approve`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						...(token && { Authorization: `Bearer ${token}` }),
					},
				},
			);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			return await response.json();
		} catch (error) {
			console.error("Error approving suggestion:", error);
			throw error;
		}
	}

	// Reject suggestion
	async rejectSuggestion(suggestionId, reviewNotes = null) {
		try {
			const token = authService.getToken();

			const response = await fetch(
				`${this.baseUrl}/suggestions/${suggestionId}/reject`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						...(token && { Authorization: `Bearer ${token}` }),
					},
					body: JSON.stringify({
						reviewNotes,
					}),
				},
			);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			return await response.json();
		} catch (error) {
			console.error("Error rejecting suggestion:", error);
			throw error;
		}
	}

	// Optimize business description (for AIContentEditor)
	async optimizeBusinessDescription(customPrompt = null) {
		try {
			const response = await fetch(
				`${this.baseUrl}/business/optimize-description`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						customPrompt,
					}),
				},
			);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = await response.json();
			return {
				aiOptimizedDescription: result.suggestedContent,
			};
		} catch (error) {
			console.error("Error optimizing business description:", error);
			throw error;
		}
	}

	// Menu Analyzer Methods
	async analyzeMenuImage(
		imageBase64,
		menuId,
		foodBusinessId,
		defaultCurrency = "USD",
	) {
		try {
			const response = await fetch(`${this.baseUrl}/menu/analyze`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${this.getAuthToken()}`,
				},
				body: JSON.stringify({
					image: imageBase64,
					menuId,
					foodBusinessId,
					defaultCurrency,
				}),
			});

			if (!response.ok) {
				const error = await AppError.fromResponse(response);
				throw error;
			}

			return await response.json();
		} catch (error) {
			console.error("Error analyzing menu:", error);
			throw error;
		}
	}

	async analyzeMultipleMenuImages(
		imageBase64Array,
		menuId,
		foodBusinessId,
		defaultCurrency = "USD",
		enableAutoMerge = true,
	) {
		try {
			const response = await fetch(`${this.baseUrl}/menu/analyze-multiple`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${this.getAuthToken()}`,
				},
				body: JSON.stringify({
					images: imageBase64Array,
					menuId,
					foodBusinessId,
					defaultCurrency,
					enableAutoMerge,
				}),
			});

			if (!response.ok) {
				const error = await AppError.fromResponse(response);
				throw error;
			}

			return await response.json();
		} catch (error) {
			console.error("Error analyzing multiple menu images:", error);
			throw error;
		}
	}

	async createFromAnalysis(menuId, sections) {
		try {
			const response = await fetch(
				`/api/menus/${menuId}/create-from-analysis`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${this.getAuthToken()}`,
					},
					body: JSON.stringify({
						menuId,
						sections,
					}),
				},
			);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			return await response.json();
		} catch (error) {
			console.error("Error creating from analysis:", error);
			throw error;
		}
	}

	getAuthToken() {
		return authService.getToken();
	}

	/**
	 * Función de reintento con exponential backoff
	 */
	async executeWithRetry(operation, context = {}, maxRetries = 2) {
		let lastError;

		for (let attempt = 0; attempt <= maxRetries; attempt++) {
			try {
				const result = await operation();

				// Log exitoso si hubo reintentos
				if (attempt > 0) {
					errorLogger.info(`Operation succeeded after ${attempt} retries`, {
						operation: context.operation,
						attempt: attempt + 1,
						...context,
					});
				}

				return result;
			} catch (error) {
				lastError = error;

				// Determinar si el error es recuperable
				const isRetryable =
					isRetryableError(error.type) ||
					(error.name === "TypeError" && error.message?.includes("fetch")) ||
					error.message?.includes("Failed to fetch") ||
					error.message?.includes("NetworkError");

				if (!isRetryable || attempt === maxRetries) {
					break;
				}

				// Calcular delay con exponential backoff (máximo 5 segundos)
				const delay = Math.min(1000 * Math.pow(2, attempt), 5000);

				errorLogger.warn(`Retrying operation after ${delay}ms`, {
					operation: context.operation,
					attempt: attempt + 1,
					maxRetries: maxRetries + 1,
					errorType: error.type,
					errorMessage: error.message,
					...context,
				});

				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}

		throw lastError;
	}
}

export default new AIService();
