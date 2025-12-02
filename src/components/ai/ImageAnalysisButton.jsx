import React, { useState, useRef, useEffect } from "react";
import aiService from "../../services/aiService";
import menuService from "../../services/menuService";
import { AppError } from "../../utils/AppError";
import errorLogger from "../../utils/errorLogger";
import {
	ERROR_MESSAGES,
	ERROR_TYPES,
	isRetryableError,
} from "../../utils/errorTypes";

/**
 * Componente mejorado para mostrar errores con opciones de reintento
 */
const ErrorDisplay = ({ error, onRetry, file }) => {
	const [showDetails, setShowDetails] = useState(false);

	if (!error) return null;

	// Determinar si el error es recuperable
	const isRetryable =
		isRetryableError(error.type) || error.type === ERROR_TYPES.UPLOAD_FAILED;

	// Parsear el mensaje de error para mostrarlo
	const getErrorMessage = () => {
		// Si es string, retornar directamente
		if (typeof error === "string") return error;

		// Si es AppError, usar el mensaje específico
		if (error instanceof AppError) {
			return error.message || ERROR_MESSAGES[error.type] || "Error desconocido";
		}

		// Si tiene propiedad message, usarla
		if (error.message) return error.message;

		// Si tiene propiedad error (del servidor)
		if (error.error) return error.error;

		// Si tiene propiedad serverData?.error
		if (error.serverData?.error) return error.serverData.error;

		// Último recurso: convertir a string, pero manejar el caso "[object Object]"
		const errorString = error.toString();
		if (errorString === "[object Object]") {
			return "Error al procesar la imagen. Por favor intenta nuevamente.";
		}

		return errorString || "Error desconocido";
	};

	// Obtener sugerencias del error
	const getSuggestions = () => {
		if (
			error.details?.suggestions &&
			Array.isArray(error.details.suggestions)
		) {
			return error.details.suggestions;
		}

		// Sugerencias por defecto según tipo de error
		switch (error.type) {
			case ERROR_TYPES.NETWORK_ERROR:
				return [
					"Verifica tu conexión a internet",
					"Intenta nuevamente en unos segundos",
				];
			case ERROR_TYPES.TIMEOUT_ERROR:
				return [
					"La solicitud tardó demasiado",
					"Intenta con una imagen más pequeña",
				];
			case ERROR_TYPES.SERVER_ERROR:
				return [
					"El servidor está experimentando problemas",
					"Por favor intenta más tarde",
				];
			case ERROR_TYPES.FILE_TOO_LARGE:
				return [
					"Comprime la imagen antes de subirla",
					"Usa una imagen de menor resolución",
				];
			case ERROR_TYPES.INVALID_FILE_TYPE:
				return [
					"Usa formatos JPEG, PNG o WebP",
					"Convierte la imagen a un formato compatible",
				];
			case ERROR_TYPES.DIMENSION_TOO_SMALL:
				return [
					"Usa una imagen de mayor resolución",
					"Asegúrate que la imagen mida al menos 100x100 píxeles",
				];
			case ERROR_TYPES.DIMENSION_TOO_LARGE:
				return [
					"Reduce la resolución de la imagen",
					"Usa una imagen de máximo 4096x4096 píxeles",
				];
			default:
				return [
					"Intenta nuevamente",
					"Si el problema persiste, contacta soporte",
				];
		}
	};

	return (
		<div className="space-y-3">
			<div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
				<div className="flex-shrink-0">
					<span className="text-red-500 text-lg">⚠️</span>
				</div>
				<div className="flex-1 min-w-0">
					<p className="text-sm font-medium text-red-900">
						{getErrorMessage()}
					</p>

					{/* Mostrar sugerencias si existen */}
					{getSuggestions().length > 0 && (
						<div className="mt-2">
							<p className="text-xs text-red-700 font-medium">Sugerencias:</p>
							<ul className="mt-1 text-xs text-red-600 list-disc list-inside space-y-1">
								{getSuggestions().map((suggestion, index) => (
									<li key={index}>{suggestion}</li>
								))}
							</ul>
						</div>
					)}

					{/* Mostrar información del archivo */}
					{file && (
						<div className="mt-2 text-xs text-red-600">
							<p>Archivo: {file.name}</p>
							<p>Tamaño: {(file.size / 1024 / 1024).toFixed(1)}MB</p>
							{error.details?.dimensions && (
								<p>
									Dimensiones: {error.details.dimensions.width}x
									{error.details.dimensions.height}px
								</p>
							)}
						</div>
					)}

					{/* Botón para mostrar/ocultar detalles técnicos */}
					{import.meta.env.DEV && (
						<button
							type="button"
							onClick={() => setShowDetails(!showDetails)}
							className="mt-2 text-xs text-red-500 hover:text-red-700 underline"
						>
							{showDetails ? "Ocultar" : "Mostrar"} detalles técnicos
						</button>
					)}

					{/* Detalles técnicos en modo desarrollo */}
					{showDetails && import.meta.env.DEV && (
						<div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-800">
							<p>
								<strong>Tipo:</strong> {error.type || "Desconocido"}
							</p>
							<p>
								<strong>Error completo:</strong>
							</p>
							<pre className="whitespace-pre-wrap break-words">
								{JSON.stringify(error, null, 2)}
							</pre>
						</div>
					)}
				</div>
			</div>

			{/* Botón de reintento si el error es recuperable */}
			{isRetryable && onRetry && (
				<button
					type="button"
					onClick={onRetry}
					className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
				>
					<span>🔄</span>
					<span>Reintentar análisis</span>
				</button>
			)}
		</div>
	);
};

const ImageAnalysisButton = ({
	onAnalysisComplete,
	entityType = "MenuItem",
	disabled = false,
	// NUEVAS PROPS
	imageFile = null,        // File object from useImageUpload
	imagePreview = null,     // preview URL from useImageUpload
	allowManualUpload = false, // Solo usar imagen compartida (sin fallback)
}) => {
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [analysis, setAnalysis] = useState(null);
	const [error, setError] = useState(null);
	const [isValidating, setIsValidating] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [analysisProgress, setAnalysisProgress] = useState(0);

	// Determinar fuente de imagen
	const hasSharedImage = imageFile && imagePreview;
	const currentFile = imageFile || null;
	const previewUrl = imagePreview || null;

	/**
	 * Limpia todos los estados
	 */
	const resetStates = () => {
		setError(null);
		setAnalysis(null);
		setUploadProgress(0);
		setAnalysisProgress(0);
		setIsValidating(false);
	};

	/**
	 * Función robusta para parsear errores
	 */
	const parseErrorMessage = (error) => {
		if (!error) return "Error desconocido";

		// Si es AppError con tipo conocido
		if (error instanceof AppError) {
			let message =
				ERROR_MESSAGES[error.type] || error.message || "Error desconocido";

			// Agregar detalles específicos si existen
			if (error.details?.fileName) {
				message += ` (Archivo: ${error.details.fileName})`;
			}
			if (
				error.details?.suggestions &&
				Array.isArray(error.details.suggestions)
			) {
				message += `\nSugerencias: ${error.details.suggestions.join(", ")}`;
			}
			return message;
		}

		// Si es string
		if (typeof error === "string") {
			return error;
		}

		// Si tiene message property
		if (error.message) {
			return error.message;
		}

		// Si es objeto con error del servidor
		if (error.serverData?.error) {
			return error.serverData.error;
		}

		// Último recurso - mostrar información útil sin cortar abruptamente
		const errorString = error.toString();
		if (errorString === "[object Object]") {
			return "Error al procesar la solicitud. Por favor intenta nuevamente.";
		}

		return errorString;
	};

	/**
	 * Función de logging estructurado para errores de análisis
	 */
	const logAnalysisError = (error, context = {}) => {
		const errorInfo = {
			component: "ImageAnalysisButton",
			operation: context.operation || "imageAnalysis",
			timestamp: new Date().toISOString(),
			error:
				error instanceof AppError
					? error.toJSON()
					: {
							name: error.name,
							message: error.message,
							stack: error.stack,
							string: error.toString(),
						},
			context,
		};

		errorLogger.error(
			error instanceof AppError
				? error
				: new AppError(
						ERROR_TYPES.UNKNOWN_ERROR,
						error.message || "Error desconocido",
						{
							originalError: error,
							...context,
						},
					),
		);

		console.error("[ImageAnalysisButton] Error detallado:", {
			errorMessage: error.message || error.toString(),
			errorType: error.type || "UNKNOWN",
			errorDetails: error.details || {},
			context,
			timestamp: new Date().toISOString(),
			stack: error.stack,
		});
	};

	/**
	 * Validación previa de archivos de imagen
	 */
	const validateImageFile = (file) => {
		const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
		const maxSize = 5 * 1024 * 1024; // 5MB para análisis (más restrictivo que upload)

		// Validar tipo
		if (!allowedTypes.includes(file.type)) {
			throw new AppError(
				ERROR_TYPES.INVALID_FILE_TYPE,
				"Solo se permiten imágenes JPEG, PNG y WebP para análisis con IA",
				{
					suggestions: [
						"Convierte la imagen a JPEG o PNG",
						"Usa otro formato de imagen válido",
					],
					fileName: file.name,
					fileType: file.type,
				},
			);
		}

		// Validar tamaño
		if (file.size > maxSize) {
			const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
			throw new AppError(
				ERROR_TYPES.FILE_TOO_LARGE,
				`La imagen es demasiado grande (${sizeMB}MB). Máximo 5MB permitido para análisis.`,
				{
					suggestions: [
						"Comprime la imagen antes de subirla",
						"Usa una imagen de menor resolución",
						"Recorta la imagen para reducir el tamaño",
					],
					fileName: file.name,
					fileSize: file.size,
				},
			);
		}

		// Validación de dimensiones (asíncrona)
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => {
				URL.revokeObjectURL(img.src); // Liberar memoria

				const dimensionErrors = [];

				if (img.width < 100 || img.height < 100) {
					dimensionErrors.push({
						type: ERROR_TYPES.DIMENSION_TOO_SMALL,
						message: `La imagen es muy pequeña (${img.width}x${img.height}px). Mínimo 100x100 píxeles para buen análisis.`,
						suggestions: [
							"Usa una imagen de mayor resolución",
							"Recorta la imagen para que sea más pequeña",
						],
						dimensions: { width: img.width, height: img.height },
					});
				}

				if (img.width > 4096 || img.height > 4096) {
					dimensionErrors.push({
						type: ERROR_TYPES.DIMENSION_TOO_LARGE,
						message: `La imagen es muy grande (${img.width}x${img.height}px). Máximo 4096x4096 píxeles para análisis.`,
						suggestions: [
							"Reduce la resolución de la imagen",
							"Usa una imagen de menor tamaño",
						],
						dimensions: { width: img.width, height: img.height },
					});
				}

				if (dimensionErrors.length > 0) {
					const error = dimensionErrors[0];
					reject(
						new AppError(error.type, error.message, {
							...error,
							fileName: file.name,
							dimensions: error.dimensions,
						}),
					);
				} else {
					resolve({
						isValid: true,
						dimensions: { width: img.width, height: img.height },
					});
				}
			};

			img.onerror = () => {
				URL.revokeObjectURL(img.src);
				reject(
					new AppError(
						ERROR_TYPES.INVALID_FILE_TYPE,
						"No se pudo leer la imagen. El archivo podría estar corrupto.",
						{
							suggestions: [
								"Intenta con otra imagen",
								"Verifica que el archivo no esté dañado",
							],
							fileName: file.name,
						},
					),
				);
			};

			img.src = URL.createObjectURL(file);
		});
	};

	/**
	 * Función de reintento para errores recuperables
	 */
	const handleRetry = async () => {
		if (!currentFile) return;

		// Limpiar error anterior
		setError(null);

		try {
			// Log del reintento
			errorLogger.info("Retrying image analysis", {
				fileName: currentFile.name,
				fileSize: currentFile.size,
				entityType,
			});

			await analyzeImage(currentFile);
		} catch (retryError) {
			logAnalysisError(retryError, {
				operation: "retryAnalysis",
				fileName: currentFile.name,
				entityType,
			});

			setError(parseErrorMessage(retryError));
		}
	};

	
	const analyzeImage = async (fileToAnalyze = null) => {
		const file = fileToAnalyze || currentFile;

		if (!file) {
			setError('No hay imagen disponible para analizar');
			return;
		}

		setIsAnalyzing(true);
		setError(null);
		setAnalysis(null);
		setUploadProgress(0);
		setAnalysisProgress(0);

		try {
			// Log inicio del proceso de análisis
			errorLogger.info("Starting image analysis", {
				fileName: file.name,
				fileSize: file.size,
				fileType: file.type,
				entityType,
				source: fileToAnalyze ? 'shared' : 'current'
			});

			// Fase 1: Subida de imagen (30% del progreso)
			setUploadProgress(10);
			const imageKey = await menuService.uploadImage(file);
			setUploadProgress(30);

			if (!imageKey) {
				throw new AppError(
					ERROR_TYPES.UPLOAD_FAILED,
					"No se pudo subir la imagen al servidor",
					{
						fileName: file.name,
						suggestions: [
							"Verifica tu conexión a internet",
							"Intenta con otra imagen",
						],
					},
				);
			}

			// Fase 2: Análisis con IA (70% restante)
			setAnalysisProgress(40);
			const imageIdentifier = `minio://${imageKey}`;

			const response = await aiService.analyzeImage(
				imageIdentifier,
				entityType,
			);
			setAnalysisProgress(80);

			if (response.success) {
				setAnalysisProgress(100);
				setAnalysis(response.data);

				// Log exitoso
				errorLogger.info("Image analysis completed successfully", {
					fileName: file.name,
					entityType,
					confidenceScore: response.data.confidenceScore,
					hasSuggestions: !!response.data.suggestions,
				});
			} else {
				// Crear AppError para respuesta fallida
				const error = new AppError(
					ERROR_TYPES.SERVER_ERROR,
					response.error || "No se pudo analizar la imagen",
					{
						fileName: file.name,
						entityType,
						serverResponse: response,
					},
				);

				logAnalysisError(error, {
					operation: "aiAnalysis",
					fileName: file.name,
					entityType,
				});

				setError(parseErrorMessage(error));
			}
		} catch (err) {
			// Logging detallado del error
			logAnalysisError(err, {
				operation: "imageAnalysis",
				fileName: file.name,
				entityType,
				dimensions,
			});

			// Convertir errores a AppError si no lo son ya
			let normalizedError = err;
			if (!(err instanceof AppError)) {
				if (err.response) {
					// Error HTTP (fetch/fetch API)
					normalizedError = await AppError.fromResponse(err.response);
				} else {
					// Error genérico
					normalizedError = AppError.fromError(err, {
						fileName: file.name,
						entityType,
						dimensions,
					});
				}
			}

			setError(parseErrorMessage(normalizedError));
		} finally {
			setIsAnalyzing(false);
			setUploadProgress(0);
			setAnalysisProgress(0);
		}
	};

	const fileToBase64 = (file) => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => {
				// Eliminar el prefijo data:image/...;base64,
				const base64 = reader.result.split(",")[1];
				resolve(base64);
			};
			reader.onerror = reject;
		});
	};

	const handleAcceptAnalysis = () => {
		if (analysis) {
			onAnalysisComplete(analysis.suggestions);
			resetStates(); // Limpiar todo el estado
		}
	};

	const handleRejectAnalysis = () => {
		resetStates(); // Limpiar todo el estado
	};

	// Determinar si mostrar el botón de análisis
	const showAnalyzeButton = hasSharedImage;
	const buttonDisabled = disabled || isAnalyzing || isValidating;

	// Si no hay imagen compartida, no mostrar el componente
	if (!showAnalyzeButton) return null;

	return (
		<div className="w-full space-y-3">
			{/* Preview de imagen (solo si hay imagen compartida) */}
			{hasSharedImage && (
				<div className="relative rounded-lg overflow-hidden border-2 border-green-200 bg-green-50">
					<img
						src={imagePreview}
						alt="Imagen para analizar"
						className="w-full h-32 object-cover"
					/>
					<div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
						Imagen lista para análisis
					</div>
				</div>
			)}

			<button
				type="button"
				onClick={() => {
					if (hasSharedImage) {
						analyzeImage(currentFile);
					}
				}}
				disabled={buttonDisabled}
				className="w-full px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 border-2 bg-green-600 text-white hover:bg-green-700 border-green-400 hover:border-green-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
			>
				{isAnalyzing ? (
					<>
						<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
						<span>Analizando imagen...</span>
					</>
				) : (
					<>
						<span className="text-lg">🤖</span>
						<span>Analizar esta imagen con IA</span>
					</>
				)}
			</button>

			{/* Indicadores de progreso */}
			{isAnalyzing && (
				<div className="space-y-2">
					{uploadProgress > 0 && (
						<div>
							<div className="flex justify-between text-sm text-gray-600 mb-1">
								<span>Subiendo imagen...</span>
								<span>{uploadProgress}%</span>
							</div>
							<div className="w-full bg-gray-200 rounded-full h-2">
								<div
									className="bg-blue-600 h-2 rounded-full transition-all duration-300"
									style={{ width: `${uploadProgress}%` }}
								/>
							</div>
						</div>
					)}

					{analysisProgress > 0 && (
						<div>
							<div className="flex justify-between text-sm text-gray-600 mb-1">
								<span>Analizando con IA...</span>
								<span>{analysisProgress}%</span>
							</div>
							<div className="w-full bg-gray-200 rounded-full h-2">
								<div
									className="bg-green-600 h-2 rounded-full transition-all duration-300"
									style={{ width: `${analysisProgress}%` }}
								/>
							</div>
						</div>
					)}
				</div>
			)}

			{error && (
				<ErrorDisplay error={error} onRetry={handleRetry} file={currentFile} />
			)}

			{analysis && (
				<div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-4">
					<div className="flex items-center gap-2 mb-3">
						<span className="text-green-600 text-lg">📸</span>
						<h3 className="font-semibold text-green-900">
							Análisis de imagen con IA
						</h3>
						<span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
							{Math.round(analysis.confidenceScore * 100)}% confianza
						</span>
					</div>

					<div className="space-y-3">
						{analysis.suggestions.title && (
							<div className="bg-white p-3 rounded border border-green-100">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									📝 Título sugerido:
								</label>
								<p className="text-sm text-gray-900 font-medium">
									{analysis.suggestions.title}
								</p>
							</div>
						)}

						{analysis.suggestions.description && (
							<div className="bg-white p-3 rounded border border-green-100">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									✨ Descripción sugerida:
								</label>
								<p className="text-sm text-gray-900">
									{analysis.suggestions.description}
								</p>
							</div>
						)}
					</div>

					<div className="flex gap-2 justify-end">
						<button
							onClick={handleRejectAnalysis}
							className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors flex items-center gap-1"
						>
							<span className="text-gray-600">✗</span>
							Rechazar
						</button>
						<button
							onClick={handleAcceptAnalysis}
							className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-1"
						>
							<span className="text-white">✓</span>
							Usar sugerencias
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default ImageAnalysisButton;
