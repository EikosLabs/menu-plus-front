import React, { useState, useEffect, useMemo, useRef } from 'react';
import menuService from '../services/menuService';
import { useTranslation } from '../i18n/utils';

export default function QRCodeComponent({ businessId, businessName, qrCodeId, onClose }) {
  const { t } = useTranslation();
  const [qrUrl, setQrUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const isLoadingRef = useRef(false);

  const menuUrl = useMemo(() => {
    return qrCodeId ? `${window.location.origin}/menu/${qrCodeId}` : '';
  }, [qrCodeId]);

  useEffect(() => {
    let isMounted = true;
    let timeoutId = null;
    
    const fetchQRCode = async () => {
      // Solo ejecutar si tenemos businessId válido
      if (!businessId || typeof businessId !== 'number') {
        console.warn('QRCodeComponent: businessId inválido:', businessId);
        setError('ID de negocio no válido');
        setLoading(false);
        return;
      }

      // Prevenir múltiples llamadas simultáneas
      if (isLoadingRef.current) {
        console.log('QRCodeComponent: Ya hay una carga en progreso, saltando...');
        return;
      }

      try {
        isLoadingRef.current = true;
        setLoading(true);
        setError(null);
        console.log('QRCodeComponent: Cargando QR para businessId:', businessId);
        
        const url = await menuService.getBusinessQRCode(businessId);
        console.log('QRCodeComponent: QR cargado exitosamente');
        
        if (isMounted) {
          setQrUrl(url);
          setLoading(false);
        }
      } catch (err) {
        console.error('QRCodeComponent: Error al cargar QR:', err);
        if (isMounted) {
          setError(`Error al cargar el código QR: ${err.message || 'Error desconocido'}`);
          setLoading(false);
        }
      } finally {
        isLoadingRef.current = false;
      }
    };

    // Ejecutar después de un pequeño delay para evitar múltiples llamadas
    timeoutId = setTimeout(() => {
      if (isMounted) {
        fetchQRCode();
      }
    }, 100);

    // Función para cerrar con escape
    const handleEscape = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      isMounted = false;
      isLoadingRef.current = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      document.removeEventListener('keydown', handleEscape);
    };
  }, [businessId]); // Solo businessId como dependencia

  // Función para copiar URL al portapapeles
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(menuUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar URL:', err);
    }
  };

  // Función para descargar QR como imagen
  const handleDownloadQR = () => {
    if (!qrUrl) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Configurar canvas con padding y diseño profesional
      const padding = 60;
      const qrSize = 400;
      const totalWidth = qrSize + (padding * 2);
      const totalHeight = qrSize + (padding * 3) + 100; // Espacio extra para texto
      
      canvas.width = totalWidth;
      canvas.height = totalHeight;
      
      // Fondo blanco
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, totalWidth, totalHeight);
      
      // Título MenuPlus
      ctx.fillStyle = '#004E71';
      ctx.font = 'bold 32px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('MenuPlus', totalWidth / 2, 45);
      
      // Nombre del negocio
      ctx.fillStyle = '#E05C33';
      ctx.font = 'bold 24px Arial, sans-serif';
      ctx.fillText(businessName || 'Mi Negocio', totalWidth / 2, 80);
      
      // QR Code
      ctx.drawImage(img, padding, padding + 50, qrSize, qrSize);
      
      // Instrucciones
      ctx.fillStyle = '#666666';
      ctx.font = '16px Arial, sans-serif';
      ctx.fillText('Escanea este código para ver nuestro menú', totalWidth / 2, qrSize + padding + 80);
      
      // URL
      ctx.fillStyle = '#888888';
      ctx.font = '12px Arial, sans-serif';
      ctx.fillText(menuUrl, totalWidth / 2, qrSize + padding + 105);
      
      // Descargar
      const link = document.createElement('a');
      link.download = `QR-${businessName || 'MenuPlus'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    
    img.crossOrigin = 'anonymous';
    img.src = qrUrl;
  };

  // Función para imprimir QR
  const handlePrintQR = () => {
    if (!qrUrl) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Imprimir QR - ${businessName || 'MenuPlus'}</title>
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
              color: #E05C33;
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
            <div class="business-name">${businessName || 'Mi Negocio'}</div>
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

  // Función para compartir nativo
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Menú de ${businessName || 'nuestro restaurante'}`,
          text: `¡Echa un vistazo a nuestro menú digital!`,
          url: menuUrl,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback a copiar URL
      handleCopyUrl();
    }
  };

  return (
    <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg mx-auto overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#004E71] to-[#0A3342] px-6 py-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          aria-label="Cerrar modal"
        >
          ×
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-1">{t('qr.title')}</h2>
          <p className="text-white/80 text-sm">{businessName || 'Mi Negocio'}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#E05C33] border-t-transparent mb-4"></div>
            <p className="text-slate-600">{t('common.loading')}</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
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
          <div className="space-y-6">
            {/* QR Code Display */}
            <div className="text-center">
              <div className="bg-white p-6 rounded-xl border-2 border-slate-200 inline-block shadow-inner">
                <img 
                  src={qrUrl} 
                  alt="Código QR del menú" 
                  className="w-48 h-48 object-contain mx-auto"
                />
              </div>
              <p className="text-slate-600 text-sm mt-3 max-w-xs mx-auto">
                {t('qr.qrDescription')}
              </p>
            </div>

            {/* URL Display */}
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 mb-1">URL del menú:</p>
                  <p className="text-sm text-slate-700 truncate font-mono">{menuUrl}</p>
                </div>
                <button
                  onClick={handleCopyUrl}
                  className={`ml-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    copied 
                      ? 'bg-green-100 text-green-700 scale-95' 
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {copied ? (
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      ¡Copiado!
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      Copiar
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDownloadQR}
                className="flex items-center justify-center px-4 py-3 bg-[#E05C33] hover:bg-[#FF7E45] text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-md"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {t('qr.downloadQR')}
              </button>

              <button
                onClick={handlePrintQR}
                className="flex items-center justify-center px-4 py-3 bg-[#004E71] hover:bg-[#003A57] text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-md"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimir
              </button>

              <button
                onClick={handleNativeShare}
                className="flex items-center justify-center px-4 py-3 bg-[#4A90E2] hover:bg-[#3A80D2] text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-md"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                {t('qr.shareQR')}
              </button>

              {qrCodeId && (
                <a
                  href={`/menu/${qrCodeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-md"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Ver Menú
                </a>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
} 