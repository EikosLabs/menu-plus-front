import { useState, useRef, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { exportToPDF } from './utils/pdfExport';
import { CARTA_TEMPLATES } from './utils/flyerTemplates';
import MenuCardPreview from './MenuCardPreview';
import menuService from '../../services/menuService';

/**
 * Menu Card Generator - Full menu for printing
 * Shows all items with business branding
 */
export default function MenuCardGenerator({
  business,
  menu,
  menuItems = [],
  onClose,
  savedFlyer = null
}) {
  const [selectedTemplate, setSelectedTemplate] = useState(savedFlyer?.templateId || 'elegante');
  const [orderedItems, setOrderedItems] = useState(() => {
    if (savedFlyer?.itemsOrder && savedFlyer.itemsOrder.length > 0) {
      // Reorder items based on saved order
      const orderedIds = savedFlyer.itemsOrder;
      const itemsMap = new Map(menuItems.map(item => [item.id, item]));
      return orderedIds.map(id => itemsMap.get(id)).filter(Boolean);
    }
    return [...menuItems];
  });
  const [isExporting, setIsExporting] = useState(false);
  const [paperSize, setPaperSize] = useState(savedFlyer?.paperSize || 'A4');
  const [cartaName, setCartaName] = useState(savedFlyer?.name || `Carta ${business?.name || 'Menu'} - ${new Date().toLocaleDateString()}`);
  const [isSaving, setIsSaving] = useState(false);
  const [savedId, setSavedId] = useState(savedFlyer?.id || null);

  const previewRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  /**
   * Handle drag end for reordering items
   */
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setOrderedItems((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  /**
   * Save carta configuration to backend
   */
  const handleSave = async () => {
    if (!cartaName.trim()) {
      alert('Por favor ingresa un nombre para la carta');
      return;
    }

    setIsSaving(true);
    try {
      const flyerData = {
        name: cartaName,
        type: 'carta',
        templateId: selectedTemplate,
        selectedItemIds: JSON.stringify([]), // Carta shows all items
        itemsOrder: JSON.stringify(orderedItems.map(item => item.id)),
        paperSize: paperSize,
      };

      if (savedId) {
        // Update existing
        await menuService.updateFlyer(savedId, flyerData);
        alert('Carta actualizada correctamente');
      } else {
        // Create new
        const result = await menuService.createFlyer(menu.id, flyerData);
        setSavedId(result.id);
        alert('Carta guardada correctamente');
      }
    } catch (error) {
      alert(`Error al guardar: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Export to PDF
   */
  const handleExport = async () => {
    if (!previewRef.current) return;

    setIsExporting(true);
    try {
      await exportToPDF(previewRef.current, {
        fileName: `${cartaName || business?.name || 'menu'}-carta.pdf`,
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

  const template = CARTA_TEMPLATES[selectedTemplate];

  // Debug log
  useEffect(() => {
    console.log('MenuCardGenerator - menuItems:', menuItems);
    console.log('MenuCardGenerator - business:', business);
    console.log('MenuCardGenerator - menu:', menu);
  }, [menuItems, business, menu]);

  // Block body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4 overflow-auto"
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
            <h2 className="neo-h3 m-0 text-base sm:text-lg md:text-xl">Crear Carta para Imprimir</h2>
            <p className="neo-text text-xs sm:text-sm opacity-70 mt-1 hidden sm:block">
              Carta completa con todos tus platos
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
          <div className="w-full md:w-80 lg:w-96 border-b-2 md:border-b-0 md:border-r-2 border-black overflow-auto p-3 sm:p-4 space-y-3">
            {/* Carta Name */}
            <div>
              <h3 className="neo-h5 mb-2 text-sm sm:text-base">Nombre de la Carta</h3>
              <input
                type="text"
                value={cartaName}
                onChange={(e) => setCartaName(e.target.value)}
                className="w-full neo-border rounded-lg px-2 sm:px-3 py-2 neo-text text-xs sm:text-sm"
                placeholder="Ej: Carta Elegante 2024"
              />
              {savedId && (
                <p className="neo-text text-xs text-neo-flame mt-1">
                  ✓ Guardada
                </p>
              )}
            </div>

            {/* Template Selection */}
            <div>
              <h3 className="neo-h5 mb-2 text-sm sm:text-base">Diseño de la Carta</h3>
              <div className="space-y-2">
                {Object.values(CARTA_TEMPLATES).map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => setSelectedTemplate(tmpl.id)}
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
                          {tmpl.showImages ? '📷' : '📝'} •
                          {tmpl.itemsPerRow === 1 ? ' 1 col' : ' 2 col'}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Paper size */}
            <div>
              <h3 className="neo-h5 mb-2 text-sm sm:text-base">Tamaño de Papel</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setPaperSize('A4')}
                  className={`neo-btn neo-btn-sm flex-1 text-xs ${
                    paperSize === 'A4' ? 'neo-btn-primary' : ''
                  }`}
                >
                  A4
                </button>
                <button
                  onClick={() => setPaperSize('LETTER')}
                  className={`neo-btn neo-btn-sm flex-1 text-xs ${
                    paperSize === 'LETTER' ? 'neo-btn-primary' : ''
                  }`}
                >
                  Letter
                </button>
              </div>
            </div>

            {/* Item Ordering */}
            <div>
              <h3 className="neo-h5 mb-2 text-sm sm:text-base">Orden de Platos ({orderedItems.length})</h3>
              <p className="neo-text text-xs opacity-70 mb-2">
                Arrastra para reordenar
              </p>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={orderedItems.map(item => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-1 max-h-[300px] sm:max-h-[400px] overflow-auto">
                    {orderedItems.map((item, index) => (
                      <SortableItem
                        key={item.id}
                        item={item}
                        index={index}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 overflow-auto bg-gray-100 p-3 sm:p-4 md:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
              <MenuCardPreview
                ref={previewRef}
                business={business}
                menu={menu}
                items={orderedItems}
                template={template}
                paperSize={paperSize}
              />
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
              • {orderedItems.length} platos
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
              disabled={isSaving || !cartaName.trim()}
              className="neo-btn neo-btn-secondary flex-1 sm:flex-initial text-xs px-2 sm:px-3 py-1.5 sm:py-2"
            >
              {isSaving ? '⏳' : savedId ? '💾' : '💾'}
              <span className="hidden sm:inline ml-1">{isSaving ? 'Guardando...' : savedId ? 'Actualizar' : 'Guardar'}</span>
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="neo-btn neo-btn-primary flex-1 sm:flex-initial text-xs px-2 sm:px-3 py-1.5 sm:py-2"
            >
              {isExporting ? '⏳' : '📄'}
              <span className="hidden sm:inline ml-1">{isExporting ? 'Generando...' : 'Descargar PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Sortable Item Component
 */
function SortableItem({ item, index }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="neo-border bg-white p-2 rounded cursor-move hover:bg-gray-50 flex items-center gap-1.5 sm:gap-2"
    >
      <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-200 flex items-center justify-center">
        <span className="text-xs neo-text-bold">{index + 1}</span>
      </div>
      {item.imageUri && (
        <img
          src={item.imageUri}
          alt={item.name}
          className="w-7 h-7 sm:w-8 sm:h-8 object-cover rounded flex-shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="neo-text-bold text-xs sm:text-sm truncate">{item.name}</div>
        <div className="neo-text text-xs opacity-70">${item.price.toFixed(2)}</div>
      </div>
      <div className="flex-shrink-0 text-gray-400">
        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>
    </div>
  );
}
