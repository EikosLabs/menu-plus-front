import React, { useState, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "../i18n/utils";
import menuService from "../services/menuService";

export default function QRCodeComponent({
	businessName,
	qrCodeId,
	onClose,
}) {
	const { t } = useTranslation();
	const [qrUrl, setQrUrl] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [copied, setCopied] = useState(false);
	const [showShareMenu, setShowShareMenu] = useState(false);
	const [businessQrCodeId, setBusinessQrCodeId] = useState(qrCodeId || null);
	const isLoadingRef = useRef(false);

	const menuUrl = useMemo(() => {
		return businessQrCodeId
			? `${window.location.origin}/menu/${businessQrCodeId}`
			: "";
	}, [businessQrCodeId]);

	// Bloquear scroll cuando el modal está abierto
	useEffect(() => {
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = 'unset';
		};
	}, []);

	useEffect(() => {
		let isMounted = true;
		let timeoutId = null;

		const fetchQrCode = async () => {
			if (isLoadingRef.current) {
				return;
			}

			try {
				isLoadingRef.current = true;
				setLoading(true);
				setError(null);

				// Obtener el código QR del negocio actual (el backend obtiene el businessId del token)
				const url = await menuService.getBusinessQRCode();

				if (isMounted) {
					setQrUrl(url);
					setLoading(false);
				}
			} catch (err) {
				if (isMounted) {
					setError(
						`Error al cargar el código QR: ${err.message || "Error desconocido"}`,
					);
					setLoading(false);
				}
			} finally {
				isLoadingRef.current = false;
			}
		};

		timeoutId = setTimeout(() => {
			if (isMounted) {
				fetchQrCode();
			}
		}, 100);

		const handleEscape = (e) => {
			if (e.key === "Escape" && onClose) {
				onClose();
			}
		};

		document.addEventListener("keydown", handleEscape);

		return () => {
			isMounted = false;
			isLoadingRef.current = false;
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
			document.removeEventListener("keydown", handleEscape);
		};
	}, [onClose]);

	const handleCopyUrl = async () => {
		try {
			await navigator.clipboard.writeText(menuUrl);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {}
	};

	const handleDownloadQr = () => {
		if (!qrUrl) return;

		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		const img = new Image();

		img.onload = () => {
			const padding = 60;
			const qrSize = 400;
			const totalWidth = qrSize + padding * 2;
			const totalHeight = qrSize + padding * 2 + 130; // QR + padding + espacio para textos

			canvas.width = totalWidth;
			canvas.height = totalHeight;

			ctx.fillStyle = "#ffffff";
			ctx.fillRect(0, 0, totalWidth, totalHeight);

			ctx.fillStyle = "#004E71";
			ctx.font = "bold 32px Arial, sans-serif";
			ctx.textAlign = "center";
			ctx.fillText("MenuPlus", totalWidth / 2, 45);

			ctx.fillStyle = "#1a1a1a";
			ctx.font = "bold 24px Arial, sans-serif";
			ctx.fillText(businessName || "Mi Negocio", totalWidth / 2, 80);

			ctx.drawImage(img, padding, padding + 50, qrSize, qrSize);

			ctx.fillStyle = "#666666";
			ctx.font = "16px Arial, sans-serif";
			ctx.fillText(
				"Escanea este código para ver nuestro menú",
				totalWidth / 2,
				qrSize + padding + 80,
			);

			ctx.fillStyle = "#888888";
			ctx.font = "12px Arial, sans-serif";
			ctx.fillText(menuUrl, totalWidth / 2, qrSize + padding + 105);

			const link = document.createElement("a");
			link.download = `QR-${businessName || "MenuPlus"}.png`;
			link.href = canvas.toDataURL("image/png");
			link.click();
		};

		img.crossOrigin = "anonymous";
		img.src = qrUrl;
	};

	const handlePrintQr = () => {
		if (!qrUrl) return;

		const printWindow = window.open("", "_blank");
		printWindow.document.write(`
      <html>
        <head>
          <title>Imprimir QR - ${businessName || "MenuPlus"}</title>
          <style>
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: white;
            }
            .qr-container {
              text-align: center;
              padding: 40px;
              background: white;
              border: 2px solid #ddd;
              border-radius: 16px;
              box-shadow: 0 4px 16px rgba(0,0,0,0.1);
              max-width: 500px;
            }
            .logo {
              font-size: 36px;
              font-weight: bold;
              color: #004E71;
              margin-bottom: 10px;
            }
            .business-name {
              font-size: 28px;
              font-weight: bold;
              color: #1a1a1a;
              margin-bottom: 30px;
            }
            .qr-image {
              width: 300px;
              height: 300px;
              margin: 20px 0;
              border: 1px solid #eee;
              border-radius: 8px;
            }
            .instructions {
              font-size: 16px;
              color: #666;
              margin: 20px 0 10px 0;
            }
            .url {
              font-size: 14px;
              color: #888;
              word-break: break-all;
              background: #f9f9f9;
              padding: 10px;
              border-radius: 8px;
              margin-top: 15px;
            }
            .print-btn {
              background: #4A90E2;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-size: 16px;
              margin-top: 20px;
              cursor: pointer;
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="logo">MenuPlus</div>
            <div class="business-name">${businessName || "Mi Negocio"}</div>
            <img src="${qrUrl}" alt="Código QR del menú" class="qr-image" />
            <div class="instructions">Escanea este código QR para ver nuestro menú digital</div>
            <div class="url">${menuUrl}</div>
            <button onclick="window.print()" class="print-btn no-print">Imprimir QR</button>
          </div>
        </body>
      </html>
    `);
		printWindow.document.close();
	};

	const handleNativeShare = async () => {
		if (navigator.share) {
			try {
				await navigator.share({
					title: `Menú de ${businessName || "nuestro restaurante"}`,
					text: `¡Echa un vistazo a nuestro menú digital!`,
					url: menuUrl,
				});
			} catch (err) {}
		} else {
			handleCopyUrl();
		}
	};

	return (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-4">
			<div className="relative bg-white neo-border neo-shadow-2xl max-w-md w-full max-h-[85vh] overflow-y-auto">
				{/* Header con título y botón cerrar */}
				<div className="relative border-b neo-border px-4 py-3 sm:px-5 sm:py-4 bg-neo-lavender">
					<h3 className="neo-heading neo-h4 text-base sm:text-lg text-center pr-8">
						Código QR del Menú
					</h3>
					<button
						onClick={onClose}
						className="absolute top-2 right-2 sm:top-3 sm:right-3 neo-btn neo-btn-sm bg-white hover:bg-gray-100"
					>
						<svg
							className="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				<div className="p-4 sm:p-5">
					{loading && (
						<div className="flex flex-col items-center justify-center py-12">
							<div className="animate-spin rounded-full h-12 w-12 border-4 border-[#1a1a1a] border-t-transparent mb-4"></div>
							<p className="text-slate-600">{t("common.loading")}</p>
						</div>
					)}

					{error && (
						<div className="text-center py-12">
							<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<svg
									className="w-8 h-8 text-red-500"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
									/>
								</svg>
							</div>
							<p className="text-red-600 font-medium">{error}</p>
							<button
								onClick={() => window.location.reload()}
								className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
							>
								Reintentar
							</button>
						</div>
					)}

					{!loading && !error && qrUrl && (
						<div className="space-y-4 sm:space-y-6">
							<div className="bg-slate-50 rounded-lg p-3 sm:p-4">
								<div className="flex items-center justify-between">
									<div className="flex-1 min-w-0">
										<p className="text-xs text-slate-500 mb-1">URL del menú:</p>
										<p className="text-sm text-slate-700 truncate font-mono">
											{menuUrl}
										</p>
									</div>
									<button
										onClick={handleCopyUrl}
										className={`ml-3 neo-btn neo-btn-sm ${
											copied
												? "bg-green-400 text-neo-black"
												: "neo-btn-secondary"
										}`}
									>
										{copied ? (
											<span className="flex items-center">
												<svg
													className="w-4 h-4 mr-1"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M5 13l4 4L19 7"
													/>
												</svg>
												¡Copiado!
											</span>
										) : (
											<span className="flex items-center">
												<svg
													className="w-4 h-4 mr-1"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
													/>
												</svg>
												Copiar
											</span>
										)}
									</button>
								</div>
							</div>

							<div className="text-center">
								<div className="bg-white p-4 sm:p-6 rounded-xl border-2 border-slate-200 inline-block">
									<img
										src={qrUrl}
										alt="Código QR del menú"
										className="w-40 h-40 sm:w-48 sm:h-48 mx-auto"
									/>
								</div>
								<p className="text-slate-600 text-xs sm:text-sm mt-3 sm:mt-4 px-2">
									Escanea este código QR para acceder al menú digital
								</p>
							</div>

							<div className="grid grid-cols-2 gap-2 sm:gap-3">
								<button
									onClick={() => window.open(menuUrl, "_blank")}
									className="neo-btn neo-btn-primary flex items-center justify-center text-sm sm:text-base"
								>
									<svg
										className="w-5 h-5 mr-2"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M7 7l10 10M17 7v10"
										/>
									</svg>
									Ver Página
								</button>

								<button
									onClick={handleDownloadQr}
									className="neo-btn neo-btn-secondary flex items-center justify-center text-sm sm:text-base"
								>
									<svg
										className="w-5 h-5 mr-2"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
										/>
									</svg>
									Descargar
								</button>
							</div>

							<div className="grid grid-cols-2 gap-2 sm:gap-3">
								<button
									onClick={handlePrintQr}
									className="neo-btn bg-green-400 neo-border neo-shadow-md text-neo-black hover:bg-green-500 flex items-center justify-center text-sm sm:text-base"
								>
									<svg
										className="w-5 h-5 mr-2"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
										/>
									</svg>
									Imprimir
								</button>

								<button
									onClick={() => setShowShareMenu(!showShareMenu)}
									className="neo-btn neo-btn-outline flex items-center justify-center text-sm sm:text-base"
								>
									<svg
										className="w-5 h-5 mr-2"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
										/>
									</svg>
									Compartir
								</button>
							</div>

							<div className="relative">
								{showShareMenu && (
									<div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-slate-200 rounded-lg shadow-lg p-2 z-10">
										<button
											onClick={handleNativeShare}
											className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded text-sm"
										>
											Compartir enlace
										</button>
										<button
											onClick={handleCopyUrl}
											className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded text-sm"
										>
											Copiar URL
										</button>
									</div>
								)}
							</div>
						</div>
					)}
				</div>

				<div className="bg-neo-lavender px-4 py-3 sm:px-6 sm:py-4 flex justify-end neo-border-t">
					<button
						onClick={onClose}
						className="neo-btn neo-btn-white"
					>
						Cerrar
					</button>
				</div>
			</div>
		</div>
	);
}
