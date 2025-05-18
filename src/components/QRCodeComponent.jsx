import React, { useState, useEffect } from 'react';
import menuService from '../services/menuService';

export default function QRCodeComponent({ businessId, businessName, qrCodeId }) {
  const [qrUrl, setQrUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Variable para verificar si el componente sigue montado
    let isMounted = true;
    
    const fetchQRCode = async () => {
      try {
        setLoading(true);
        // Usamos la función modificada que ahora retorna una URL de objeto
        const url = await menuService.getBusinessQRCode(businessId);
        // Solo actualizamos el estado si el componente sigue montado
        if (isMounted) {
          setQrUrl(url);
          setError(null);
        }
      } catch (err) {
        console.error('Error al obtener código QR:', err);
        if (isMounted) {
          setError('No se pudo cargar el código QR');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (businessId) {
      fetchQRCode();
    }

    // Función de limpieza que se ejecuta al desmontar el componente
    return () => {
      isMounted = false;
      // Revocar objectURL si existe para liberar memoria
      if (qrUrl && qrUrl.startsWith('blob:')) {
        URL.revokeObjectURL(qrUrl);
      }
    };
  }, [businessId]);

  // Función para abrir la ventana de impresión con el QR
  const handlePrintQR = () => {
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Imprimir QR - ${businessName || `Negocio #${businessId}`}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              font-family: Arial, sans-serif;
              margin: 0;
              background: white;
            }
            .qr-container {
              text-align: center;
              padding: 30px;
              border: 1px solid #ddd;
              background: white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              max-width: 500px;
            }
            .logo {
              font-size: 32px;
              font-weight: bold;
              color: #003A57;
              margin-bottom: 15px;
            }
            .business-name {
              font-size: 24px;
              font-weight: bold;
              color: #E05C33;
              margin-bottom: 20px;
            }
            .qr-image {
              max-width: 300px;
              height: auto;
              margin: 20px 0;
            }
            .instructions {
              font-size: 14px;
              color: #666;
              margin-top: 20px;
            }
            .qr-url {
              font-size: 12px;
              color: #888;
              margin-top: 10px;
              word-break: break-all;
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="logo">Menu Plus</div>
            <div class="business-name">${businessName || `Negocio #${businessId}`}</div>
            <img src="${qrUrl}" alt="Código QR del menú" class="qr-image" />
            <div class="instructions">Escanea este código QR para ver nuestro menú digital</div>
            <div class="qr-url">https://menu-plus.com/menu/${qrCodeId}</div>
          </div>
          <script>
            // Imprimir automáticamente cuando se cargue la página
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  // Función para descargar el QR como imagen
  const handleDownloadQR = () => {
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Menu Plus - ${businessName || `Negocio #${businessId}`}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              font-family: Arial, sans-serif;
              margin: 0;
              background: white;
            }
            .qr-container {
              text-align: center;
              padding: 30px;
              border: 1px solid #ddd;
              background: white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #003A57;
              margin-bottom: 15px;
            }
            .business-name {
              font-size: 20px;
              font-weight: bold;
              color: #E05C33;
              margin-bottom: 15px;
            }
            img {
              max-width: 250px;
              height: auto;
              margin: 15px 0;
            }
            .buttons {
              display: flex;
              gap: 10px;
              margin-top: 20px;
            }
            button {
              padding: 10px 20px;
              background: #4A90E2;
              color: white;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-weight: bold;
              transition: all 0.2s;
            }
            button:hover {
              background: #3A80D2;
              transform: translateY(-2px);
            }
            .qr-url {
              font-size: 12px;
              color: #888;
              margin-top: 10px;
              word-break: break-all;
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="logo">Menu Plus</div>
            <div class="business-name">${businessName || `Negocio #${businessId}`}</div>
            <img src="${qrUrl}" alt="Código QR del menú" id="qr-image" />
            <div class="qr-url">https://menu-plus.com/menu/${qrCodeId}</div>
            <div class="buttons">
              <button onclick="window.print()">Imprimir QR</button>
              <button onclick="downloadImage()">Descargar como Imagen</button>
            </div>
          </div>
          <script>
            function downloadImage() {
              const canvas = document.createElement('canvas');
              const container = document.querySelector('.qr-container');
              const buttons = document.querySelector('.buttons');
              
              // Ocultar temporalmente los botones para la captura
              buttons.style.display = 'none';
              
              // Informar al usuario sobre cómo descargar
              alert('Para guardar la imagen, haz clic derecho sobre el código QR y selecciona "Guardar imagen como..."');
              
              // Restaurar los botones después de 500ms
              setTimeout(() => {
                buttons.style.display = 'flex';
              }, 500);
            }
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#E05C33]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center text-sm p-2">
        Error al cargar QR
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Solo mostrar la imagen del QR directamente */}
      {qrUrl && (
        <div className="flex flex-col items-center">
          <img 
            src={qrUrl} 
            alt="QR" 
            className="w-32 h-32 object-contain"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handlePrintQR}
              className="px-3 py-1 text-sm bg-[#003A57] text-white rounded hover:brightness-110 flex items-center"
              title="Imprimir código QR"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimir
            </button>
            <button
              onClick={handleDownloadQR}
              className="px-3 py-1 text-sm bg-[#4A90E2] text-white rounded hover:brightness-110 flex items-center"
              title="Descargar código QR"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Descargar
            </button>
            {qrCodeId && (
              <a
                href={`/menu/${qrCodeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 text-sm bg-[#E05C33] text-white rounded hover:brightness-110 flex items-center"
                title="Ver menú digital"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Ver
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 