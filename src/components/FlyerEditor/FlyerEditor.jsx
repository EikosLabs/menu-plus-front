import { useState, useRef, useEffect } from 'react';
import { exportToPDF, exportToImage, previewPDF, validateForExport } from './utils/pdfExport';
import { getAllTemplates, getTemplate, PAPER_SIZES } from './utils/templateDefaults';
import FlyerCanvas from './FlyerCanvas';
import FlyerToolbar from './FlyerToolbar';
import TemplateSelector from './templates/TemplateSelector';

/**
 * Main Flyer Editor Component
 * Advanced WYSIWYG editor for creating printable menu flyers
 */
export default function FlyerEditor({
  business,
  menu,
  menuItems = [],
  onClose
}) {
  // Editor state
  const [selectedTemplate, setSelectedTemplate] = useState('CLASSIC');
  const [paperSize, setPaperSize] = useState('A4');
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [viewMode, setViewMode] = useState('edit'); // 'edit' | 'preview'
  const [zoom, setZoom] = useState(100);
  const [isExporting, setIsExporting] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(true);

  const canvasRef = useRef(null);

  // Initialize template when selected
  useEffect(() => {
    if (selectedTemplate) {
      const template = getTemplate(selectedTemplate);
      initializeTemplate(template);
    }
  }, [selectedTemplate]);

  /**
   * Initialize template with business and menu data
   */
  const initializeTemplate = (template) => {
    const businessData = {
      businessName: business?.name || 'Mi Negocio',
      menuName: menu?.name || 'Menú',
      businessLogo: business?.logoKey ? `${import.meta.env.PUBLIC_API_URL}/images/${business.logoKey}` : null,
      brandPrimary: business?.primaryColor || '#ff6b35',
      brandSecondary: business?.secondaryColor || '#f7931e',
      brandAccent: business?.accentColor || '#004e89',
      phone: business?.contactInfo?.phone || '',
      email: business?.contactInfo?.email || '',
      address: business?.contactInfo?.address || '',
      website: business?.website || '',
    };

    // Clone template elements and replace placeholders
    const initializedElements = template.elements.map(element => ({
      ...element,
      content: replacePlaceholders(element.content, businessData),
      fill: replacePlaceholders(element.fill, businessData),
      src: replacePlaceholders(element.src, businessData),
    }));

    // Add menu items to the items container
    const itemsContainer = initializedElements.find(el => el.id === 'items-container');
    if (itemsContainer && menuItems.length > 0) {
      itemsContainer.children = generateMenuItemElements(menuItems, template.styles);
    }

    setElements(initializedElements);
    setShowTemplateSelector(false);
  };

  /**
   * Generate menu item elements based on template style
   */
  const generateMenuItemElements = (items, styles) => {
    return items.map((item, index) => ({
      id: `item-${item.id}`,
      type: 'menu-item',
      data: item,
      order: index,
      styles: {
        showImage: styles.showImages && item.imageUri,
        imageSize: styles.imageSize,
        fontSize: styles.itemNameFontSize,
        descFontSize: styles.itemDescFontSize,
        priceFontSize: styles.priceFontSize,
        borderRadius: styles.borderRadius,
      },
    }));
  };

  /**
   * Replace template placeholders with actual data
   */
  const replacePlaceholders = (text, data) => {
    if (!text || typeof text !== 'string') return text;

    return text
      .replace(/{businessName}/g, data.businessName)
      .replace(/{menuName}/g, data.menuName)
      .replace(/{businessLogo}/g, data.businessLogo || '')
      .replace(/{brandPrimary}/g, data.brandPrimary)
      .replace(/{brandSecondary}/g, data.brandSecondary)
      .replace(/{brandAccent}/g, data.brandAccent)
      .replace(/{phone}/g, data.phone)
      .replace(/{email}/g, data.email)
      .replace(/{address}/g, data.address)
      .replace(/{website}/g, data.website)
      .replace(/{contact}/g, [data.phone, data.email, data.address].filter(Boolean).join(' • '));
  };

  /**
   * Handle template change
   */
  const handleTemplateChange = (templateId) => {
    setSelectedTemplate(templateId);
    setSelectedElement(null);
  };

  /**
   * Handle element selection
   */
  const handleElementSelect = (elementId) => {
    setSelectedElement(elementId);
  };

  /**
   * Handle element update
   */
  const handleElementUpdate = (elementId, updates) => {
    setElements(prev => prev.map(el =>
      el.id === elementId ? { ...el, ...updates } : el
    ));
  };

  /**
   * Handle element deletion
   */
  const handleElementDelete = (elementId) => {
    const element = elements.find(el => el.id === elementId);
    if (element?.locked) {
      alert('Este elemento está bloqueado y no se puede eliminar');
      return;
    }
    setElements(prev => prev.filter(el => el.id !== elementId));
    setSelectedElement(null);
  };

  /**
   * Handle element duplication
   */
  const handleElementDuplicate = (elementId) => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    const newElement = {
      ...element,
      id: `${element.id}-copy-${Date.now()}`,
      x: element.x + 2,
      y: element.y + 2,
    };

    setElements(prev => [...prev, newElement]);
    setSelectedElement(newElement.id);
  };

  /**
   * Export to PDF
   */
  const handleExportPDF = async () => {
    if (!canvasRef.current) return;

    // Validate before export
    const validation = validateForExport(canvasRef.current);
    if (!validation.valid) {
      alert(`No se puede exportar:\n${validation.errors.join('\n')}`);
      return;
    }

    if (validation.warnings.length > 0) {
      const proceed = window.confirm(
        `Advertencias:\n${validation.warnings.join('\n')}\n\n¿Desea continuar?`
      );
      if (!proceed) return;
    }

    setIsExporting(true);
    try {
      await exportToPDF(canvasRef.current, {
        fileName: `${business?.name || 'menu'}-${menu?.name || 'folleto'}.pdf`,
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

  /**
   * Export to image
   */
  const handleExportImage = async (format = 'png') => {
    if (!canvasRef.current) return;

    setIsExporting(true);
    try {
      await exportToImage(canvasRef.current, {
        fileName: `${business?.name || 'menu'}-${menu?.name || 'folleto'}.${format}`,
        format,
        paperSize,
        quality: 2,
      });
    } catch (error) {
      alert(`Error al exportar: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Preview PDF
   */
  const handlePreview = async () => {
    if (!canvasRef.current) return;

    setIsExporting(true);
    try {
      await previewPDF(canvasRef.current, {
        paperSize,
        orientation: 'portrait',
        quality: 2,
      });
    } catch (error) {
      alert(`Error al previsualizar: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Handle keyboard shortcuts
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      // ESC to close or deselect
      if (e.key === 'Escape') {
        if (selectedElement) {
          setSelectedElement(null);
        } else if (showTemplateSelector) {
          onClose?.();
        } else {
          setShowTemplateSelector(true);
        }
      }

      // Delete selected element
      if (e.key === 'Delete' && selectedElement) {
        handleElementDelete(selectedElement);
      }

      // Duplicate selected element (Ctrl/Cmd + D)
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedElement) {
        e.preventDefault();
        handleElementDuplicate(selectedElement);
      }

      // Save/Export (Ctrl/Cmd + S)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleExportPDF();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, showTemplateSelector]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4">
      <div className="bg-white neo-border neo-shadow-2xl rounded-lg w-full h-full max-w-7xl max-h-[98vh] sm:max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-2 sm:p-4 border-b-2 border-black">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <h2 className="neo-h3 m-0 text-base sm:text-lg md:text-xl truncate">Editor de Folletos</h2>
            {!showTemplateSelector && (
              <button
                onClick={() => setShowTemplateSelector(true)}
                className="neo-btn neo-btn-sm text-xs hidden sm:inline-flex"
              >
                Cambiar Template
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="neo-btn neo-btn-sm flex-shrink-0 ml-2"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {showTemplateSelector ? (
            /* Template Selector */
            <div className="flex-1 overflow-auto p-3 sm:p-6">
              <TemplateSelector
                selectedTemplate={selectedTemplate}
                onSelectTemplate={handleTemplateChange}
                onClose={() => setShowTemplateSelector(false)}
              />
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div className="w-full md:w-64 lg:w-80 border-b-2 md:border-b-0 md:border-r-2 border-black overflow-auto max-h-[40vh] md:max-h-none">
                <FlyerToolbar
                  elements={elements}
                  selectedElement={selectedElement}
                  onElementSelect={handleElementSelect}
                  onElementUpdate={handleElementUpdate}
                  onElementDelete={handleElementDelete}
                  onElementDuplicate={handleElementDuplicate}
                  paperSize={paperSize}
                  onPaperSizeChange={setPaperSize}
                  zoom={zoom}
                  onZoomChange={setZoom}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                />
              </div>

              {/* Canvas */}
              <div className="flex-1 overflow-auto bg-gray-100 p-2 sm:p-4 md:p-8">
                <FlyerCanvas
                  ref={canvasRef}
                  elements={elements}
                  selectedElement={selectedElement}
                  onElementSelect={handleElementSelect}
                  onElementUpdate={handleElementUpdate}
                  paperSize={paperSize}
                  zoom={zoom}
                  viewMode={viewMode}
                  template={getTemplate(selectedTemplate)}
                />
              </div>
            </>
          )}
        </div>

        {/* Footer with Export Options */}
        {!showTemplateSelector && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-2 sm:p-3 md:p-4 border-t-2 border-black bg-gray-50 gap-2">
            <div className="flex flex-col sm:flex-row items-center gap-1 text-center sm:text-left">
              <span className="neo-text-bold text-xs sm:text-sm truncate">
                {business?.name} - {menu?.name}
              </span>
              <span className="text-gray-500 text-xs sm:text-sm">
                • {menuItems.length} items
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
              <button
                onClick={handlePreview}
                disabled={isExporting}
                className="neo-btn neo-btn-white flex-1 sm:flex-initial text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
              >
                <span className="sm:hidden">👁️</span>
                <span className="hidden sm:inline">👁️ Previsualizar</span>
              </button>

              <button
                onClick={() => handleExportImage('png')}
                disabled={isExporting}
                className="neo-btn neo-btn-white flex-1 sm:flex-initial text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
              >
                📷 <span className="hidden sm:inline ml-1">PNG</span>
              </button>

              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="neo-btn neo-btn-primary flex-1 sm:flex-initial text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
              >
                {isExporting ? '⏳' : '📄'}
                <span className="hidden sm:inline ml-1">{isExporting ? 'Generando...' : 'Descargar PDF'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
