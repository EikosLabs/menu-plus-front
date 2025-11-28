import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import menuService from '../../services/menuService';

/**
 * Saved Flyers List - Display saved flyers/cartas for a menu
 */
export default function SavedFlyersList({ menu, onClose, onLoadFlyer }) {
  const [flyers, setFlyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    loadFlyers();
  }, [menu.id]);

  const loadFlyers = async () => {
    setLoading(true);
    try {
      const data = await menuService.getFlyersByMenu(menu.id);
      setFlyers(data);
    } catch (error) {
      console.error('Error loading flyers:', error);
      alert('Error al cargar folletos guardados');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (flyerId, flyerName) => {
    if (!confirm(`¿Eliminar "${flyerName}"?`)) return;

    setDeleting(flyerId);
    try {
      await menuService.deleteFlyer(flyerId);
      setFlyers(flyers.filter(f => f.id !== flyerId));
      alert('Folleto eliminado correctamente');
    } catch (error) {
      console.error('Error deleting flyer:', error);
      alert('Error al eliminar folleto');
    } finally {
      setDeleting(null);
    }
  };

  const getFlyerIcon = (type) => {
    return type === 'carta' ? '📋' : '📄';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white neo-border neo-shadow-2xl rounded-lg w-full max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-black">
          <div>
            <h2 className="neo-h3 m-0">Folletos y Cartas Guardadas</h2>
            <p className="neo-text text-sm opacity-70 mt-1">
              {menu.name} - {flyers.length} elementos
            </p>
          </div>
          <button
            onClick={onClose}
            className="neo-btn neo-btn-sm"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[60vh] overflow-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="neo-text opacity-70">Cargando...</div>
            </div>
          ) : flyers.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="neo-h4 mb-2">No hay folletos guardados</h3>
              <p className="neo-text text-sm opacity-70">
                Crea un folleto o carta y guárdalo para verlo aquí
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {flyers.map((flyer) => (
                <div
                  key={flyer.id}
                  className="neo-border rounded-lg p-4 hover:bg-gray-50 transition-all"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-12 h-12 bg-neo-lavender rounded-lg flex items-center justify-center text-2xl">
                      {getFlyerIcon(flyer.type)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="neo-text-bold text-base mb-1">{flyer.name}</h3>
                          <div className="flex flex-wrap gap-2 text-xs neo-text opacity-70">
                            <span className="px-2 py-1 bg-gray-100 rounded">
                              {flyer.type === 'carta' ? 'Carta' : 'Folleto'}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 rounded">
                              {flyer.templateId}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 rounded">
                              {flyer.paperSize}
                            </span>
                          </div>
                          <p className="neo-text text-xs opacity-50 mt-2">
                            Creado: {formatDate(flyer.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => onLoadFlyer(flyer)}
                        className="neo-btn neo-btn-sm neo-btn-primary text-xs"
                      >
                        Abrir
                      </button>
                      <button
                        onClick={() => handleDelete(flyer.id, flyer.name)}
                        disabled={deleting === flyer.id}
                        className="neo-btn neo-btn-sm text-xs text-red-600 hover:bg-red-50"
                      >
                        {deleting === flyer.id ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-4 border-t-2 border-black bg-gray-50">
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

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null;
}
