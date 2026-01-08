import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "../i18n/utils";
import menuService from "../services/menuService";

export default function QRCodeComponent({
    businessName,
    businessLogoUrl,
    qrCodeId,
    menuId,
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

    // Actualizar businessQrCodeId cuando cambie el prop qrCodeId
    useEffect(() => {
        if (qrCodeId) {
            setBusinessQrCodeId(qrCodeId);
        }
    }, [qrCodeId]);

    const menuUrl = useMemo(() => {
        const origin = (typeof window !== 'undefined' && window.location?.origin)
            ? window.location.origin
            : (import.meta.env.PUBLIC_FRONTEND_URL || 'http://localhost:4321');
        return businessQrCodeId ? `${origin}/menu/${businessQrCodeId}` : "";
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

                // Si no tenemos qrCodeId pero tenemos menuId, obtener el menú completo
                if (!qrCodeId && menuId && isMounted) {
                    try {
                        const menu = await menuService.getMenu(menuId);
                        if (menu && menu.qrCodeId) {
                            setBusinessQrCodeId(menu.qrCodeId);
                        }
                    } catch (err) {
                        console.error('Error fetching menu for qrCodeId:', err);
                    }
                } else if (qrCodeId && isMounted) {
                    setBusinessQrCodeId(qrCodeId);
                }

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
    }, [onClose, qrCodeId, menuId]);

    const handleCopyUrl = async () => {
        try {
            await navigator.clipboard.writeText(menuUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) { }
    };

    const handleDownloadQr = () => {
        if (!qrUrl) return;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        const logoImg = businessLogoUrl ? new Image() : null;

        const renderCanvas = () => {
            const totalWidth = 420;
            const totalHeight = 580;
            const headerHeight = 140;
            const qrSize = 240;

            canvas.width = totalWidth;
            canvas.height = totalHeight;

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Fondo blanco
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, totalWidth, totalHeight);

            // Header con gradiente naranja
            const headerGradient = ctx.createLinearGradient(0, 0, totalWidth, headerHeight);
            headerGradient.addColorStop(0, '#cf5c36');
            headerGradient.addColorStop(1, '#e07c5a');
            ctx.fillStyle = headerGradient;
            ctx.beginPath();
            ctx.roundRect(0, 0, totalWidth, headerHeight, [0, 0, 0, 0]);
            ctx.fill();

            // Logo centrado en el header
            const logoSize = 70;
            const logoX = (totalWidth - logoSize) / 2;
            const logoY = 20;

            // Círculo blanco de fondo para el logo
            ctx.save();
            ctx.beginPath();
            ctx.arc(totalWidth / 2, logoY + logoSize / 2, logoSize / 2 + 6, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = 'rgba(0,0,0,0.15)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetY = 4;
            ctx.fill();
            ctx.restore();

            // Dibujar logo o placeholder
            if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(totalWidth / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
                ctx.restore();
            } else {
                // Placeholder con emoji
                ctx.save();
                ctx.beginPath();
                ctx.arc(totalWidth / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
                ctx.fillStyle = '#f1f5f9';
                ctx.fill();
                ctx.restore();
                ctx.font = "32px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("🍽️", totalWidth / 2, logoY + logoSize / 2);
            }

            // Nombre del negocio en el header
            ctx.fillStyle = '#ffffff';
            ctx.font = "bold 20px 'Segoe UI', Arial, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            let displayName = businessName || "Menú Digital";
            if (displayName.length > 28) {
                displayName = displayName.substring(0, 25) + '...';
            }
            ctx.fillText(displayName, totalWidth / 2, logoY + logoSize + 12);

            // Subtítulo
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            ctx.font = "500 11px 'Segoe UI', Arial, sans-serif";
            ctx.letterSpacing = "2px";
            ctx.fillText("MENÚ DIGITAL", totalWidth / 2, logoY + logoSize + 38);

            // Sección del QR (fondo blanco)
            const qrSectionY = headerHeight;
            const qrSectionHeight = totalHeight - headerHeight - 70;

            // Contenedor del QR con borde
            const qrContainerPadding = 12;
            const qrContainerX = (totalWidth - qrSize - qrContainerPadding * 2) / 2;
            const qrContainerY = qrSectionY + 35;

            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(qrContainerX, qrContainerY, qrSize + qrContainerPadding * 2, qrSize + qrContainerPadding * 2, 12);
            ctx.stroke();

            // Dibujar el QR
            ctx.drawImage(img, qrContainerX + qrContainerPadding, qrContainerY + qrContainerPadding, qrSize, qrSize);

            // Texto "Escanea para ver el menú"
            ctx.fillStyle = '#0f172a';
            ctx.font = "600 14px 'Segoe UI', Arial, sans-serif";
            ctx.fillText("📱 Escanea para ver el menú", totalWidth / 2, qrContainerY + qrSize + qrContainerPadding * 2 + 25);

            // Footer
            const footerY = totalHeight - 60;

            // Línea separadora
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(30, footerY);
            ctx.lineTo(totalWidth - 30, footerY);
            ctx.stroke();

            // URL
            ctx.fillStyle = '#64748b';
            ctx.font = "11px 'SF Mono', Monaco, 'Courier New', monospace";
            const shortUrl = menuUrl.replace(/^https?:\/\//, '');
            ctx.fillText(shortUrl.substring(0, 45), totalWidth / 2, footerY + 20);

            // Línea decorativa
            ctx.fillStyle = '#cf5c36';
            ctx.beginPath();
            ctx.roundRect(totalWidth / 2 - 25, footerY + 40, 50, 3, 2);
            ctx.fill();

            // Descargar
            const link = document.createElement("a");
            link.download = `qr-menu-${(businessName || "digital").toLowerCase().replace(/\s+/g, '-')}.png`;
            link.href = canvas.toDataURL("image/png", 1.0);
            link.click();
        };

        img.crossOrigin = "anonymous";
        img.onload = () => {
            if (logoImg) {
                logoImg.crossOrigin = "anonymous";
                logoImg.onload = renderCanvas;
                logoImg.onerror = renderCanvas;
                logoImg.src = businessLogoUrl;
            } else {
                renderCanvas();
            }
        };
        img.src = qrUrl;
    };

    const handlePrintQr = () => {
        if (!qrUrl) return;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Código QR - ${businessName}</title>
                    <meta charset="UTF-8">
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        
                        @page { 
                            size: A4 portrait;
                            margin: 0; 
                        }
                        
                        html, body {
                            width: 210mm;
                            height: 297mm;
                            margin: 0;
                            padding: 0;
                        }
                        
                        body { 
                            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Arial, sans-serif;
                            background: #f8fafc;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            min-height: 100vh;
                            padding: 20mm;
                        }
                        
                        .card {
                            background: white;
                            width: 100%;
                            max-width: 90mm;
                            border-radius: 16px;
                            overflow: hidden;
                            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                            border: 1px solid #e2e8f0;
                        }
                        
                        .card-header {
                            background: linear-gradient(135deg, #cf5c36 0%, #e07c5a 100%);
                            padding: 16px 12px 20px;
                            text-align: center;
                            border-radius: 16px 16px 0 0;
                        }
                        
                        .logo-wrapper {
                            width: 52px;
                            height: 52px;
                            margin: 0 auto 10px;
                            background: white;
                            border-radius: 10px;
                            padding: 3px;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                        }
                        
                        .logo {
                            width: 100%;
                            height: 100%;
                            object-fit: cover;
                            border-radius: 8px;
                        }
                        
                        .logo-placeholder {
                            width: 100%;
                            height: 100%;
                            border-radius: 8px;
                            background: #f1f5f9;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 24px;
                        }
                        
                        .business-name {
                            color: white;
                            font-size: 18px;
                            font-weight: 700;
                            margin-bottom: 2px;
                            line-height: 1.2;
                        }
                        
                        .subtitle {
                            color: rgba(255,255,255,0.9);
                            font-size: 10px;
                            font-weight: 600;
                            letter-spacing: 2px;
                            text-transform: uppercase;
                        }
                        
                        .qr-section {
                            padding: 20px 16px;
                            text-align: center;
                            background: white;
                        }
                        
                        .qr-container {
                            display: inline-block;
                            padding: 12px;
                            background: white;
                            border: 2px solid #f1f5f9;
                            border-radius: 12px;
                        }
                        
                        .qr-image {
                            width: 140px;
                            height: 140px;
                            display: block;
                        }
                        
                        .scan-text {
                            margin-top: 14px;
                            color: #0f172a;
                            font-size: 12px;
                            font-weight: 600;
                        }
                        
                        .scan-icon {
                            display: inline-block;
                            margin-right: 4px;
                        }
                        
                        .card-footer {
                            background: #f8fafc;
                            padding: 12px 16px;
                            text-align: center;
                            border-top: 1px solid #e2e8f0;
                        }
                        
                        .url-text {
                            color: #64748b;
                            font-size: 8px;
                            word-break: break-all;
                            font-family: 'SF Mono', Monaco, 'Courier New', monospace;
                            line-height: 1.4;
                        }
                        
                        .decorative-line {
                            width: 40px;
                            height: 3px;
                            background: #cf5c36;
                            margin: 10px auto 0;
                            border-radius: 2px;
                        }
                        
                        @media print {
                            html, body {
                                width: 210mm;
                                height: 297mm;
                                background: white !important;
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                            }
                            
                            body {
                                padding: 0;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                            }
                            
                            .card { 
                                box-shadow: none;
                                border: 1px solid #e2e8f0;
                                max-width: 85mm;
                            }
                            
                            .card-header {
                                background: linear-gradient(135deg, #cf5c36 0%, #e07c5a 100%) !important;
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <div class="card-header">
                            <div class="logo-wrapper">
                                ${businessLogoUrl
                ? `<img src="${businessLogoUrl}" class="logo" alt="Logo" onerror="this.parentElement.innerHTML='<div class=\\'logo-placeholder\\'>🍽️</div>'" />`
                : `<div class="logo-placeholder">🍽️</div>`
            }
                            </div>
                            <h1 class="business-name">${businessName || 'Menú Digital'}</h1>
                            <p class="subtitle">Menú Digital</p>
                        </div>
                        
                        <div class="qr-section">
                            <div class="qr-container">
                                <img src="${qrUrl}" class="qr-image" alt="Código QR" />
                            </div>
                            <p class="scan-text">
                                <span class="scan-icon">📱</span>
                                Escanea para ver el menú
                            </p>
                        </div>
                        
                        <div class="card-footer">
                            <p class="url-text">${menuUrl}</p>
                            <div class="decorative-line"></div>
                        </div>
                    </div>
                    
                    <script>
                        window.onload = function() {
                            setTimeout(function() {
                                window.print();
                            }, 500);
                        }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Menú de ${businessName}`,
                    text: `Mira nuestro menú digital: ${menuUrl}`,
                    url: menuUrl,
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            handleCopyUrl();
        }
        setShowShareMenu(false);
    };

    // Usar Portal para renderizar el modal fuera de la jerarquía del DOM actual
    // Esto evita problemas con z-index y contextos de apilamiento
    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-0">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            <div
                className="relative w-full max-w-md bg-white neo-card-3d transform transition-all overflow-hidden flex flex-col max-h-[90vh] p-0 border-4 border-neo-black rounded-xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-neo-black p-4 sm:p-6 text-white border-b-4 border-neo-black">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight mb-1 font-display">Código QR</h2>
                            <p className="text-white/80 text-sm font-medium">Comparte tu menú digital con tus clientes</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-neo-flame transition-colors p-1 rounded-full hover:bg-white/10"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 overflow-y-auto bg-white">
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-16 h-16 border-4 border-neo-lavender border-t-neo-flame rounded-full animate-spin mb-4"></div>
                            <p className="text-neo-black font-bold">Generando tu código QR único...</p>
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-red-100 border-4 border-neo-black rounded-full flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-red-600 font-bold mb-4">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="neo-btn bg-red-500 text-white hover:bg-red-600"
                            >
                                Reintentar
                            </button>
                        </div>
                    )}

                    {!loading && !error && qrUrl && (
                        <div className="space-y-4 sm:space-y-6">
                            <div className="bg-neo-lavender border-2 border-neo-black rounded-lg p-3 sm:p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold uppercase text-neo-gray mb-1">URL del menú:</p>
                                        <p className="text-sm text-neo-black truncate font-mono font-bold">
                                            {menuUrl}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleCopyUrl}
                                        className={`neo-btn neo-btn-sm flex-shrink-0 ${copied
                                                ? "bg-green-400 text-neo-black"
                                                : "bg-white text-neo-black"
                                            }`}
                                    >
                                        {copied ? (
                                            <span className="flex items-center font-bold">
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                ¡Copiado!
                                            </span>
                                        ) : (
                                            <span className="flex items-center font-bold">
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                </svg>
                                                Copiar
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="text-center">
                                <div className="bg-white p-4 sm:p-6 rounded-xl border-4 border-neo-black inline-block shadow-[8px_8px_0px_0px_rgba(207,92,54,1)] transform rotate-1 hover:rotate-0 transition-transform duration-300">
                                    <img
                                        src={qrUrl}
                                        alt="Código QR del menú"
                                        className="w-40 h-40 sm:w-48 sm:h-48 mx-auto"
                                    />
                                </div>
                                <p className="text-neo-black font-bold text-xs sm:text-sm mt-4 px-2 uppercase tracking-wide">
                                    Escanea este código QR para acceder al menú
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                <button
                                    onClick={() => window.open(menuUrl, "_blank")}
                                    className="neo-btn bg-neo-flame text-white flex items-center justify-center text-sm sm:text-base w-full"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M7 7l10 10M17 7v10" />
                                    </svg>
                                    Ver Página
                                </button>

                                <button
                                    onClick={handleDownloadQr}
                                    className="neo-btn bg-neo-sunset text-neo-black flex items-center justify-center text-sm sm:text-base w-full"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Descargar
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                <button
                                    onClick={handlePrintQr}
                                    className="neo-btn bg-white text-neo-black flex items-center justify-center text-sm sm:text-base w-full"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2z" />
                                    </svg>
                                    Imprimir
                                </button>

                                <button
                                    onClick={() => setShowShareMenu(!showShareMenu)}
                                    className="neo-btn bg-neo-lavender text-neo-black flex items-center justify-center text-sm sm:text-base w-full"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                                    </svg>
                                    Compartir
                                </button>
                            </div>

                            <div className="relative">
                                {showShareMenu && (
                                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border-4 border-neo-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-2 z-10 animate-fade-up">
                                        <button
                                            onClick={handleNativeShare}
                                            className="w-full text-left px-3 py-2 hover:bg-neo-lavender rounded font-bold border-b-2 border-transparent hover:border-neo-black transition-all"
                                        >
                                            Compartir enlace
                                        </button>
                                        <button
                                            onClick={handleCopyUrl}
                                            className="w-full text-left px-3 py-2 hover:bg-neo-lavender rounded font-bold border-b-2 border-transparent hover:border-neo-black transition-all"
                                        >
                                            Copiar URL
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-neo-lavender px-4 py-3 sm:px-6 sm:py-4 flex justify-end border-t-4 border-neo-black">
                    <button
                        onClick={onClose}
                        className="neo-btn bg-white text-neo-black hover:bg-gray-100"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
