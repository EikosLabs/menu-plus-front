import { useState, useRef } from 'react';
import { exportToPDF } from './utils/pdfExport';
import { FOLLETO_TEMPLATES, FOLLETO_FORMATS } from './utils/flyerTemplates';
import PromotionalFlyerPreview from './PromotionalFlyerPreview';

/**
 * Promotional Flyer Generator - Small promotional prints
 * Allows selection of specific items to feature
 */
export default function PromotionalFlyerGenerator({
  business,
  menu,
  menuItems = [],
  onClose
}) {
  const [selectedTemplate, setSelectedTemplate] = useState('especiales');
  const [selectedItems, setSelectedItems] = useState([]);
  const [isExporting, setIsExporting] = useState(false);

  const previewRef = useRef(null);

  const template = FOLLETO_TEMPLATES[selectedTemplate];
  const maxItems = template.maxItems;

  /**
   * Toggle item selection
   */
  const toggleItemSelection = (item) => {
    setSelectedItems(prev => {
      const isSelected = prev.find(i => i.id === item.id);
      if (isSelected) {
        return prev.filter(i => i.id !== item.id);
      } else {
        if (prev.length >= maxItems) {
          alert(`Solo puedes seleccionar ${maxItems} platos para este diseño`);
          return prev;
        }
        return [...prev, item];
      }
    });
  };

  /**
   * Move item up in selection
   */
  const moveItemUp = (index) => {
    if (index === 0) return;
    setSelectedItems(prev => {
      const newItems = [...prev];
      [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
      return newItems;
    });
  };

  /**
   * Move item down in selection
   */
  const moveItemDown = (index) => {
    if (index === selectedItems.length - 1) return;
    setSelectedItems(prev => {
      const newItems = [...prev];
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
      return newItems;
    });
  };

  /**
   * Export to PDF
   */
  const handleExport = async () => {
    if (selectedItems.length === 0) {
      alert('Debes seleccionar al menos un plato');
      return;
    }

    if (!previewRef.current) return;

    setIsExporting(true);
    try {
      await exportToPDF(previewRef.current, {
        fileName: `${business?.name || 'menu'}-folleto.pdf`,
        paperSize: 'A4',
        orientation: 'portrait',
        quality: 2,
      });
    } catch (error) {
      alert(`Error al exportar: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white neo-border neo-shadow-2xl rounded-lg w-full h-full max-w-7xl max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-black">
          <div>
            <h2 className="neo-h3 m-0">Crear Folleto Promocional</h2>
            <p className="neo-text text-sm opacity-70 mt-1">
              Selecciona los platos que quieres destacar
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
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar - Configuration */}
          <div className="w-80 border-r-2 border-black overflow-auto p-4 space-y-4">
            {/* Template Selection */}
            <div>
              <h3 className="neo-h5 mb-3">Tipo de Folleto</h3>
              <div className="space-y-2">
                {Object.values(FOLLETO_TEMPLATES).map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => {
                      setSelectedTemplate(tmpl.id);
                      // Reset selection if exceeds new max
                      if (selectedItems.length > tmpl.maxItems) {
                        setSelectedItems(selectedItems.slice(0, tmpl.maxItems));
                      }
                    }}
                    className={`w-full text-left p-3 neo-border rounded-lg transition-all ${
                      selectedTemplate === tmpl.id
                        ? 'neo-border-thick border-neo-flame bg-neo-lavender'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{tmpl.icon}</span>
                      <div className="flex-1">
                        <div className="neo-text-bold text-sm">{tmpl.name}</div>
                        <div className="neo-text text-xs opacity-70">{tmpl.description}</div>
                        <div className="neo-text text-xs mt-1 text-neo-flame">
                          Máx. {tmpl.maxItems} platos • {FOLLETO_FORMATS[tmpl.format].name}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Items */}
            <div>
              <h3 className="neo-h5 mb-3">
                Platos Seleccionados ({selectedItems.length}/{maxItems})
              </h3>

              {selectedItems.length === 0 ? (
                <div className="neo-alert bg-neo-lavender p-3 text-xs">
                  Selecciona platos de la lista de abajo
                </div>
              ) : (
                <div className="space-y-1">
                  {selectedItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="neo-border bg-white p-2 rounded flex items-center gap-2"
                    >
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-neo-flame text-white flex items-center justify-center">
                        <span className="text-xs neo-text-bold">{index + 1}</span>
                      </div>
                      {item.imageUri && (
                        <img
                          src={item.imageUri}
                          alt={item.name}
                          className="w-8 h-8 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="neo-text-bold text-sm truncate">{item.name}</div>
                        <div className="neo-text text-xs opacity-70">${item.price.toFixed(2)}</div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => moveItemUp(index)}
                          disabled={index === 0}
                          className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => moveItemDown(index)}
                          disabled={index === selectedItems.length - 1}
                          className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => toggleItemSelection(item)}
                          className="p-1 hover:bg-red-100 text-red-500 rounded"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Available Items */}
            <div>
              <h3 className="neo-h5 mb-3">Todos los Platos ({menuItems.length})</h3>
              <p className="neo-text text-xs opacity-70 mb-3">
                Haz clic para agregar
              </p>

              <div className="space-y-1 max-h-[300px] overflow-auto">
                {menuItems.map((item) => {
                  const isSelected = selectedItems.find(i => i.id === item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleItemSelection(item)}
                      className={`w-full text-left neo-border p-2 rounded flex items-center gap-2 transition-all ${
                        isSelected
                          ? 'bg-neo-flame text-white border-neo-flame'
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      {item.imageUri && (
                        <img
                          src={item.imageUri}
                          alt={item.name}
                          className="w-8 h-8 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="neo-text-bold text-sm truncate">{item.name}</div>
                        <div className={`neo-text text-xs ${isSelected ? 'opacity-90' : 'opacity-70'}`}>
                          ${item.price.toFixed(2)}
                        </div>
                      </div>
                      {isSelected && (
                        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 overflow-auto bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
              {selectedItems.length > 0 ? (
                <PromotionalFlyerPreview
                  ref={previewRef}
                  business={business}
                  menu={menu}
                  items={selectedItems}
                  template={template}
                />
              ) : (
                <div className="bg-white neo-border rounded-lg p-12 text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="neo-h4 mb-2">Selecciona platos para ver la vista previa</h3>
                  <p className="neo-text text-sm opacity-70">
                    Elige hasta {maxItems} platos de la lista
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t-2 border-black bg-gray-50">
          <div className="flex items-center gap-2">
            <span className="neo-text-bold text-sm">
              {business?.name} - {menu?.name}
            </span>
            <span className="text-gray-500 text-sm">
              • {selectedItems.length} de {maxItems} platos seleccionados
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="neo-btn neo-btn-white"
            >
              Cancelar
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting || selectedItems.length === 0}
              className="neo-btn neo-btn-primary"
            >
              {isExporting ? '⏳ Generando...' : '📄 Descargar Folleto PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
