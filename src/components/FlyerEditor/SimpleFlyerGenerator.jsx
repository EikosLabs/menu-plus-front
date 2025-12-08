import { useState, useRef, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { exportToImage } from './utils/pdfExport';
import { FOLLETO_TEMPLATES } from './utils/flyerTemplates';
import FlyerPreview from './FlyerPreview';

/**
 * Simple Flyer Generator
 * Auto-generates flyers with business branding - no manual editing needed
 */
export default function SimpleFlyerGenerator({
  business,
  menu,
  menuItems = [],
  onClose
}) {
  const [selectedTemplate, setSelectedTemplate] = useState('promocion');
  const [itemsPerPage, setItemsPerPage] = useState(12);
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
   * Export to PNG
   */
  const handleExport = async () => {
    if (!previewRef.current) return;

    setIsExporting(true);
    try {
      await exportToImage(previewRef.current, {
        fileName: `${business?.name || 'menu'}-folleto.png`,
        paperSize,
        format: 'png',
        quality: 2,
      });
    } catch (error) {
      alert(`Error al exportar: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const template = FOLLETO_TEMPLATES[selectedTemplate];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white neo-border neo-shadow-2xl rounded-lg w-full h-full max-w-7xl max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-black">
          <div>
            <h2 className="neo-h3 m-0">Generar Folleto</h2>
            <p className="neo-text text-sm opacity-70 mt-1">
              Selecciona el diseño y ordena tus platos
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
              <h3 className="neo-h5 mb-3">Diseño del Folleto</h3>
              <div className="space-y-2">
                {Object.values(FOLLETO_TEMPLATES).map((tmpl) => (
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
                      <div>
                        <div className="neo-text-bold text-sm">{tmpl.name}</div>
                        <div className="neo-text text-xs opacity-70">{tmpl.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Items per page */}
            <div>
              <h3 className="neo-h5 mb-3">Items por Página</h3>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="neo-select w-full"
              >
                <option value={6}>6 items (más espacio)</option>
                <option value={9}>9 items (balanceado)</option>
                <option value={12}>12 items (compacto)</option>
                <option value={15}>15 items (muy compacto)</option>
              </select>
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
                  <div className="space-y-1 max-h-96 overflow-auto">
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
              <FlyerPreview
                ref={previewRef}
                business={business}
                menu={menu}
                items={orderedItems.slice(0, itemsPerPage)}
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
              • {orderedItems.length} platos • Mostrando {Math.min(itemsPerPage, orderedItems.length)}
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
              {isExporting ? '⏳ Generando...' : '🖼️ Descargar PNG'}
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
