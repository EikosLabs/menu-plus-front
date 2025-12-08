import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { exportToImage } from './utils/pdfExport';
import { FOLLETO_TEMPLATES, FOLLETO_FORMATS, COLOR_PALETTES } from './utils/flyerTemplates';
import PromotionalFlyerPreview from './PromotionalFlyerPreview';
import menuService from '../../services/menuService';

/**
 * Promotional Flyer Generator - Small promotional prints
 * Allows selection of specific items to feature
 */
export default function PromotionalFlyerGenerator({
  business,
  menu,
  menuItems = [],
  onClose,
  savedFlyer = null
}) {
  const [selectedTemplate, setSelectedTemplate] = useState(savedFlyer?.templateId || 'especiales');
  const [selectedItems, setSelectedItems] = useState(() => {
    if (savedFlyer?.selectedItemIds && savedFlyer.selectedItemIds.length > 0) {
      // Get selected items based on saved IDs
      const selectedIds = savedFlyer.selectedItemIds;
      return menuItems.filter(item => selectedIds.includes(item.id));
    }
    return [];
  });
  const [isExporting, setIsExporting] = useState(false);
  const [folletoName, setFolletoName] = useState(savedFlyer?.name || `Folleto ${business?.name || 'Menu'} - ${new Date().toLocaleDateString()}`);
  const [isSaving, setIsSaving] = useState(false);
  const [savedId, setSavedId] = useState(savedFlyer?.id || null);
  const [selectedPalette, setSelectedPalette] = useState(savedFlyer?.colorPalette || null);
  const [showCurrency, setShowCurrency] = useState(true);

  const previewRef = useRef(null);

  const template = FOLLETO_TEMPLATES[selectedTemplate];
  const maxItems = template.maxItems;

  // Block body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

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
   * Save folleto configuration to backend
   */
  const handleSave = async () => {
    if (!folletoName.trim()) {
      alert('Por favor ingresa un nombre para el folleto');
      return;
    }

    if (selectedItems.length === 0) {
      alert('Debes seleccionar al menos un plato');
      return;
    }

    setIsSaving(true);
    try {
      const flyerData = {
        name: folletoName,
        type: 'folleto',
        templateId: selectedTemplate,
        selectedItemIds: JSON.stringify(selectedItems.map(item => item.id)),
        itemsOrder: JSON.stringify(selectedItems.map(item => item.id)),
        paperSize: 'A4',
        colorPalette: selectedPalette,
      };

      if (savedId) {
        // Update existing
        await menuService.updateFlyer(savedId, flyerData);
        alert('Folleto actualizado correctamente');
      } else {
        // Create new
        const result = await menuService.createFlyer(menu.id, flyerData);
        setSavedId(result.id);
        alert('Folleto guardado correctamente');
      }
    } catch (error) {
      alert(`Error al guardar: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Export to PNG
   */
  const handleExport = async () => {
    if (selectedItems.length === 0) {
      alert('Debes seleccionar al menos un plato');
      return;
    }

    if (!previewRef.current) return;

    setIsExporting(true);
    try {
      const paperSize = template.format === 'story-vertical' ? 'STORY' : template.format === 'instagram-portrait' ? 'IG_PORTRAIT' : 'A4';
      await exportToImage(previewRef.current, {
        fileName: `${folletoName || business?.name || 'menu'}-${template.format === 'story-vertical' ? 'story' : template.format === 'instagram-portrait' ? 'post' : 'folleto'}.png`,
        format: 'png',
        paperSize,
        quality: 2,
      });
    } catch (error) {
      alert(`Error al exportar: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJpg = async () => {
    if (selectedItems.length === 0) return;
    if (!previewRef.current) return;
    setIsExporting(true);
    try {
      const paperSize = template.format === 'story-vertical' ? 'STORY' : template.format === 'instagram-portrait' ? 'IG_PORTRAIT' : 'A4';
      await exportToImage(previewRef.current, {
        fileName: `${folletoName || business?.name || 'menu'}-${template.format === 'story-vertical' ? 'story' : template.format === 'instagram-portrait' ? 'post' : 'folleto'}.jpg`,
        format: 'jpeg',
        paperSize,
        quality: 2,
      });
    } catch (error) {
      alert(`Error al exportar: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = async () => {
    if (selectedItems.length === 0) return;
    if (!previewRef.current) return;
    setIsExporting(true);
    try {
      const paperSize = template.format === 'story-vertical' ? 'STORY' : template.format === 'instagram-portrait' ? 'IG_PORTRAIT' : 'A4';
      const { exportToPDF } = await import('./utils/pdfExport');
      await exportToPDF(previewRef.current, {
        fileName: `${folletoName || business?.name || 'menu'}-${template.format === 'story-vertical' ? 'story' : template.format === 'instagram-portrait' ? 'post' : 'folleto'}.pdf`,
        paperSize,
        orientation: 'portrait',
        quality: 2,
      });
    } catch (error) {
      alert(`Error al exportar: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4 overflow-auto"
      onClick={(e) => {
        // Close on backdrop click
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white neo-border neo-shadow-2xl rounded-lg w-full h-auto max-w-7xl my-2 sm:my-4 flex flex-col overflow-hidden"
        style={{ maxHeight: 'calc(100vh - 1rem)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b-2 border-black">
          <div className="flex-1 min-w-0 pr-2">
            <h2 className="neo-h3 m-0 text-base sm:text-lg md:text-xl">Crear Folleto Promocional</h2>
            <p className="neo-text text-xs sm:text-sm opacity-70 mt-1 hidden sm:block">
              Selecciona los platos que quieres destacar
            </p>
          </div>
          <button
            onClick={onClose}
            className="neo-btn neo-btn-sm flex-shrink-0"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Sidebar - Configuration */}
          <div className="w-full md:w-80 lg:w-96 border-b-2 md:border-b-0 md:border-r-2 border-black overflow-auto p-2.5 sm:p-3 md:p-4 space-y-2 sm:space-y-3">
            {/* Folleto Name */}
            <div>
              <h3 className="neo-h5 mb-1.5 sm:mb-2 text-xs sm:text-sm md:text-base">Nombre del Folleto</h3>
              <input
                type="text"
                value={folletoName}
                onChange={(e) => setFolletoName(e.target.value)}
                className="w-full neo-border rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 neo-text text-xs sm:text-sm"
                placeholder="Ej: Especiales de la Semana"
              />
              {savedId && (
                <p className="neo-text text-xs text-neo-flame mt-1">
                  ✓ Guardado
                </p>
              )}
            </div>

            {/* Template Selection */}
            <div>
              <h3 className="neo-h5 mb-1.5 sm:mb-2 text-xs sm:text-sm md:text-base">Tipo de Folleto Promocional</h3>
              <p className="neo-text text-xs opacity-70 mb-2">Todos los formatos son compatibles con Instagram</p>
              <div className="space-y-1.5 sm:space-y-2">
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
                    className={`w-full text-left p-2 sm:p-3 neo-border rounded-lg transition-all ${
                      selectedTemplate === tmpl.id
                        ? 'neo-border-thick border-neo-flame bg-neo-lavender'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-xl sm:text-2xl flex-shrink-0">{tmpl.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="neo-text-bold text-xs sm:text-sm">{tmpl.name}</div>
                        <div className="neo-text text-xs opacity-70 hidden sm:block">{tmpl.description}</div>
                        <div className="neo-text text-xs mt-1 text-neo-flame">
                          Máx. {tmpl.maxItems} platos • {FOLLETO_FORMATS[tmpl.format]?.name || tmpl.format}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Opciones de Visualización */}
            <div>
              <h3 className="neo-h5 mb-1.5 sm:mb-2 text-xs sm:text-sm md:text-base">Opciones</h3>
              <label className="flex items-center gap-2 cursor-pointer p-2 neo-border rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={showCurrency}
                  onChange={(e) => setShowCurrency(e.target.checked)}
                  className="w-4 h-4 text-neo-flame rounded border-gray-300 focus:ring-neo-flame"
                />
                <span className="neo-text text-xs sm:text-sm">Mostrar símbolo de moneda ($)</span>
              </label>
            </div>

            {/* Color Palette Selection */}
            <div>
              <h3 className="neo-h5 mb-1.5 sm:mb-2 text-xs sm:text-sm md:text-base">Paleta de Colores</h3>
              <p className="neo-text text-xs opacity-70 mb-2">
                Elige una paleta predeterminada o usa los colores de tu negocio
              </p>
              <div className="space-y-1.5 max-h-[200px] overflow-auto">
                <button
                  onClick={() => setSelectedPalette(null)}
                  className={`w-full text-left p-2 neo-border rounded-lg transition-all ${
                    selectedPalette === null
                      ? 'neo-border-thick border-neo-flame bg-neo-lavender'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">🎨</span>
                    <div className="flex-1 min-w-0">
                      <div className="neo-text-bold text-xs">Colores del Negocio</div>
                      <div className="flex gap-1 mt-1">
                        <span className="w-3 h-3 rounded-full border border-black" style={{ background: business?.primaryColor || '#ff6b35' }}></span>
                        <span className="w-3 h-3 rounded-full border border-black" style={{ background: business?.secondaryColor || '#f7931e' }}></span>
                        <span className="w-3 h-3 rounded-full border border-black" style={{ background: business?.accentColor || '#004e89' }}></span>
                      </div>
                    </div>
                  </div>
                </button>
                {Object.values(COLOR_PALETTES).map((palette) => (
                  <button
                    key={palette.id}
                    onClick={() => setSelectedPalette(palette.id)}
                    className={`w-full text-left p-2 neo-border rounded-lg transition-all ${
                      selectedPalette === palette.id
                        ? 'neo-border-thick border-neo-flame bg-neo-lavender'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{palette.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="neo-text-bold text-xs">{palette.name}</div>
                        <div className="flex gap-1 mt-1">
                          <span className="w-3 h-3 rounded-full border border-black" style={{ background: palette.primary }}></span>
                          <span className="w-3 h-3 rounded-full border border-black" style={{ background: palette.secondary }}></span>
                          <span className="w-3 h-3 rounded-full border border-black" style={{ background: palette.accent }}></span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Items */}
            <div>
              <h3 className="neo-h5 mb-1.5 sm:mb-2 text-xs sm:text-sm md:text-base">
                Platos Seleccionados ({selectedItems.length}/{maxItems})
              </h3>

              {selectedItems.length === 0 ? (
                <div className="neo-alert bg-neo-lavender p-2 sm:p-3 text-xs">
                  Selecciona platos de la lista de abajo
                </div>
              ) : (
                <div className="space-y-1">
                  {selectedItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="neo-border bg-white p-2 rounded flex items-center gap-1.5 sm:gap-2"
                    >
                      <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-neo-flame text-white flex items-center justify-center">
                        <span className="text-xs neo-text-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="neo-text-bold text-xs sm:text-sm truncate">{item.name}</div>
                        <div className="neo-text text-xs opacity-70">${item.price.toFixed(2)}</div>
                      </div>
                      <div className="flex gap-0.5 flex-shrink-0">
                        <button
                          onClick={() => moveItemUp(index)}
                          disabled={index === 0}
                          className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                          aria-label="Subir"
                        >
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => moveItemDown(index)}
                          disabled={index === selectedItems.length - 1}
                          className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                          aria-label="Bajar"
                        >
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => toggleItemSelection(item)}
                          className="p-1 hover:bg-red-100 text-red-500 rounded"
                          aria-label="Eliminar"
                        >
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <h3 className="neo-h5 mb-1.5 sm:mb-2 text-xs sm:text-sm md:text-base">Todos los Platos ({menuItems.length})</h3>
              <p className="neo-text text-xs opacity-70 mb-1.5 sm:mb-2">
                Haz clic para agregar
              </p>

              <div className="space-y-1 max-h-[200px] sm:max-h-[250px] md:max-h-[300px] overflow-auto">
                {menuItems.map((item) => {
                  const isSelected = selectedItems.find(i => i.id === item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleItemSelection(item)}
                      className={`w-full text-left neo-border p-2 rounded flex items-center gap-1.5 sm:gap-2 transition-all ${
                        isSelected
                          ? 'bg-neo-flame text-white border-neo-flame'
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="neo-text-bold text-xs sm:text-sm truncate">{item.name}</div>
                        <div className={`neo-text text-xs ${isSelected ? 'opacity-90' : 'opacity-70'}`}>
                          ${item.price.toFixed(2)}
                        </div>
                      </div>
                      {isSelected && (
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
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
          <div className="flex-1 overflow-auto bg-gray-100 p-3 sm:p-4 md:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
              {selectedItems.length > 0 ? (
                <PromotionalFlyerPreview
                  ref={previewRef}
                  business={business}
                  menu={menu}
                  items={selectedItems}
                  template={template}
                  colorPalette={selectedPalette}
                  showCurrency={showCurrency}
                />
              ) : (
                <div className="bg-white neo-border rounded-lg p-6 sm:p-8 md:p-12 text-center">
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="neo-h4 mb-2 text-sm sm:text-base">Selecciona platos para ver la vista previa</h3>
                  <p className="neo-text text-xs sm:text-sm opacity-70">
                    Elige hasta {maxItems} platos de la lista
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-2.5 sm:p-3 md:p-4 border-t-2 border-black bg-gray-50 gap-2 sm:gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-1 text-center sm:text-left">
            <span className="neo-text-bold text-xs">
              {business?.name} - {menu?.name}
            </span>
            <span className="text-gray-500 text-xs">
              • {selectedItems.length} de {maxItems} platos
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={onClose}
              className="neo-btn neo-btn-white flex-1 sm:flex-initial text-xs px-2 sm:px-3 py-1.5 sm:py-2"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !folletoName.trim() || selectedItems.length === 0}
              className="neo-btn neo-btn-secondary flex-1 sm:flex-initial text-xs px-2 sm:px-3 py-1.5 sm:py-2"
            >
              {isSaving ? '⏳' : savedId ? '💾' : '💾'}
              <span className="hidden sm:inline ml-1">{isSaving ? 'Guardando...' : savedId ? 'Actualizar' : 'Guardar'}</span>
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting || selectedItems.length === 0}
              className="neo-btn neo-btn-primary flex-1 sm:flex-initial text-xs px-2 sm:px-3 py-1.5 sm:py-2"
            >
              {isExporting ? '⏳' : '🖼️'}
              <span className="hidden sm:inline ml-1">{isExporting ? 'Generando...' : 'Descargar PNG'}</span>
            </button>
            <button
              onClick={handleExportJpg}
              disabled={isExporting || selectedItems.length === 0}
              className="neo-btn neo-btn-secondary flex-1 sm:flex-initial text-xs px-2 sm:px-3 py-1.5 sm:py-2"
            >
              {isExporting ? '⏳' : '🖼️'}
              <span className="hidden sm:inline ml-1">{isExporting ? 'Generando...' : 'Descargar JPG'}</span>
            </button>
            <button
              onClick={handleExportPdf}
              disabled={isExporting || selectedItems.length === 0}
              className="neo-btn neo-btn-secondary flex-1 sm:flex-initial text-xs px-2 sm:px-3 py-1.5 sm:py-2"
            >
              {isExporting ? '⏳' : '📄'}
              <span className="hidden sm:inline ml-1">{isExporting ? 'Generando...' : 'Descargar PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null;
}
