import { useState, useRef } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { exportToPDF } from './utils/pdfExport';
import { CARTA_TEMPLATES } from './utils/flyerTemplates';
import MenuCardPreview from './MenuCardPreview';

/**
 * Menu Card Generator - Full menu for printing
 * Shows all items with business branding
 */
export default function MenuCardGenerator({
  business,
  menu,
  menuItems = [],
  onClose
}) {
  const [selectedTemplate, setSelectedTemplate] = useState('elegante');
  const [orderedItems, setOrderedItems] = useState([...menuItems]);
  const [isExporting, setIsExporting] = useState(false);
  const [paperSize, setPaperSize] = useState('A4');

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
   * Export to PDF
   */
  const handleExport = async () => {
    if (!previewRef.current) return;

    setIsExporting(true);
    try {
      await exportToPDF(previewRef.current, {
        fileName: `${business?.name || 'menu'}-carta.pdf`,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white neo-border neo-shadow-2xl rounded-lg w-full h-full max-w-7xl max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-black">
          <div>
            <h2 className="neo-h3 m-0">Crear Carta para Imprimir</h2>
            <p className="neo-text text-sm opacity-70 mt-1">
              Carta completa con todos tus platos
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
              <h3 className="neo-h5 mb-3">Diseño de la Carta</h3>
              <div className="space-y-2">
                {Object.values(CARTA_TEMPLATES).map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => setSelectedTemplate(tmpl.id)}
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
                          {tmpl.showImages ? '📷 Con imágenes' : '📝 Solo texto'} •
                          {tmpl.itemsPerRow === 1 ? ' 1 columna' : ' 2 columnas'}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Paper size */}
            <div>
              <h3 className="neo-h5 mb-3">Tamaño de Papel</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setPaperSize('A4')}
                  className={`neo-btn neo-btn-sm flex-1 ${
                    paperSize === 'A4' ? 'neo-btn-primary' : ''
                  }`}
                >
                  A4
                </button>
                <button
                  onClick={() => setPaperSize('LETTER')}
                  className={`neo-btn neo-btn-sm flex-1 ${
                    paperSize === 'LETTER' ? 'neo-btn-primary' : ''
                  }`}
                >
                  Letter
                </button>
              </div>
            </div>

            {/* Item Ordering */}
            <div>
              <h3 className="neo-h5 mb-3">Orden de Platos ({orderedItems.length})</h3>
              <p className="neo-text text-xs opacity-70 mb-3">
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
                  <div className="space-y-1 max-h-[400px] overflow-auto">
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
          <div className="flex-1 overflow-auto bg-gray-100 p-8">
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
        <div className="flex items-center justify-between p-4 border-t-2 border-black bg-gray-50">
          <div className="flex items-center gap-2">
            <span className="neo-text-bold text-sm">
              {business?.name} - {menu?.name}
            </span>
            <span className="text-gray-500 text-sm">
              • {orderedItems.length} platos
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
              disabled={isExporting}
              className="neo-btn neo-btn-primary"
            >
              {isExporting ? '⏳ Generando...' : '📄 Descargar Carta PDF'}
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
      className="neo-border bg-white p-2 rounded cursor-move hover:bg-gray-50 flex items-center gap-2"
    >
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
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
      <div className="flex-shrink-0 text-gray-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>
    </div>
  );
}
