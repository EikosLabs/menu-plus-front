/**
 * Brochure Editor Component
 * WYSIWYG editor with drag & drop for creating printable menu brochures
 */

import { useState, useEffect, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { getAllTemplates } from '../config/brochureTemplates';
import { generateBrochurePDF, formatPrice, getImageUrl } from '../services/pdfService';
import BrochurePreview from './BrochurePreview';

// Sortable item component
function SortableItem({ id, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

export default function BrochureEditor({ business, menus }) {
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [selectedFormat, setSelectedFormat] = useState('A4');
  const [selectedMenuIds, setSelectedMenuIds] = useState([]);
  const [brochureTitle, setBrochureTitle] = useState(business?.name || 'Nuestro Menú');
  const [brochureSubtitle, setBrochureSubtitle] = useState(business?.description || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const previewRef = useRef(null);

  const templates = getAllTemplates();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Get selected menus data
  const selectedMenus = menus?.filter(menu => selectedMenuIds.includes(menu.id)) || [];

  // Handle drag end
  function handleDragEnd(event) {
    const { active, over } = event;

    if (active.id !== over.id) {
      setSelectedMenuIds((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  // Toggle menu selection
  function toggleMenuSelection(menuId) {
    setSelectedMenuIds(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  }

  // Generate PDF
  async function handleGeneratePDF() {
    if (!previewRef.current) {
      setError('No se pudo encontrar el preview para generar el PDF');
      return;
    }

    if (selectedMenus.length === 0) {
      setError('Selecciona al menos un menú para generar el folleto');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const config = {
        business,
        menus: selectedMenus,
        template: selectedTemplate,
        pageFormat: selectedFormat,
        title: brochureTitle,
        subtitle: brochureSubtitle,
      };

      await generateBrochurePDF(config, previewRef.current);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError(err.message || 'Error al generar el PDF');
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="brochure-editor min-h-screen bg-neo-lavender p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neo-black mb-2">Editor de Folletos</h1>
          <p className="text-neo-gray">Crea folletos imprimibles de tus menús con diferentes estilos</p>
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border-4 border-red-500 text-red-700 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Brochure Info */}
            <div className="bg-white border-neo p-6 shadow-neo-md">
              <h2 className="text-2xl font-bold mb-4 text-neo-black">Información</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Título del Folleto</label>
                  <input
                    type="text"
                    value={brochureTitle}
                    onChange={(e) => setBrochureTitle(e.target.value)}
                    className="w-full px-3 py-2 border-neo rounded focus:outline-none focus:ring-2 focus:ring-neo-flame"
                    placeholder="Nombre del menú"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Subtítulo (opcional)</label>
                  <input
                    type="text"
                    value={brochureSubtitle}
                    onChange={(e) => setBrochureSubtitle(e.target.value)}
                    className="w-full px-3 py-2 border-neo rounded focus:outline-none focus:ring-2 focus:ring-neo-flame"
                    placeholder="Descripción breve"
                  />
                </div>
              </div>
            </div>

            {/* Template Selection */}
            <div className="bg-white border-neo p-6 shadow-neo-md">
              <h2 className="text-2xl font-bold mb-4 text-neo-black">Estilo</h2>
              <div className="space-y-3">
                {templates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`w-full p-4 border-neo rounded text-left transition-all ${
                      selectedTemplate === template.id
                        ? 'bg-neo-flame text-white shadow-neo-md'
                        : 'bg-white hover:bg-neo-lavender'
                    }`}
                  >
                    <div className="font-bold text-lg">{template.name}</div>
                    <div className={`text-sm ${selectedTemplate === template.id ? 'text-white' : 'text-neo-gray'}`}>
                      {template.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Page Format Selection */}
            <div className="bg-white border-neo p-6 shadow-neo-md">
              <h2 className="text-2xl font-bold mb-4 text-neo-black">Formato</h2>
              <div className="space-y-3">
                <button
                  onClick={() => setSelectedFormat('A4')}
                  className={`w-full p-3 border-neo rounded transition-all ${
                    selectedFormat === 'A4'
                      ? 'bg-neo-flame text-white shadow-neo-md'
                      : 'bg-white hover:bg-neo-lavender'
                  }`}
                >
                  A4 (210 × 297 mm)
                </button>
                <button
                  onClick={() => setSelectedFormat('Letter')}
                  className={`w-full p-3 border-neo rounded transition-all ${
                    selectedFormat === 'Letter'
                      ? 'bg-neo-flame text-white shadow-neo-md'
                      : 'bg-white hover:bg-neo-lavender'
                  }`}
                >
                  Letter (216 × 279 mm)
                </button>
              </div>
            </div>

            {/* Menu Selection */}
            <div className="bg-white border-neo p-6 shadow-neo-md">
              <h2 className="text-2xl font-bold mb-4 text-neo-black">Menús</h2>
              {menus && menus.length > 0 ? (
                <div className="space-y-2">
                  {menus.map(menu => (
                    <label
                      key={menu.id}
                      className="flex items-center p-3 border-2 border-neo-black rounded cursor-pointer hover:bg-neo-lavender"
                    >
                      <input
                        type="checkbox"
                        checked={selectedMenuIds.includes(menu.id)}
                        onChange={() => toggleMenuSelection(menu.id)}
                        className="mr-3 w-5 h-5"
                      />
                      <div>
                        <div className="font-medium">{menu.name}</div>
                        {menu.description && (
                          <div className="text-sm text-neo-gray">{menu.description}</div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-neo-gray">No hay menús disponibles</p>
              )}
            </div>

            {/* Selected Menus Order (Drag & Drop) */}
            {selectedMenus.length > 1 && (
              <div className="bg-white border-neo p-6 shadow-neo-md">
                <h2 className="text-2xl font-bold mb-4 text-neo-black">Orden de Menús</h2>
                <p className="text-sm text-neo-gray mb-4">Arrastra para reordenar</p>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={selectedMenuIds}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {selectedMenuIds.map((menuId, index) => {
                        const menu = menus.find(m => m.id === menuId);
                        return (
                          <SortableItem key={menuId} id={menuId}>
                            <div className="p-3 bg-neo-lavender border-2 border-neo-black rounded cursor-move">
                              <div className="flex items-center gap-2">
                                <span className="font-bold">{index + 1}.</span>
                                <span>{menu?.name}</span>
                              </div>
                            </div>
                          </SortableItem>
                        );
                      })}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGeneratePDF}
              disabled={isGenerating || selectedMenus.length === 0}
              className={`w-full py-4 px-6 text-xl font-bold rounded border-neo shadow-neo-lg transition-all ${
                isGenerating || selectedMenus.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-neo-flame text-white hover:bg-neo-sunset hover:shadow-neo-xl'
              }`}
            >
              {isGenerating ? 'Generando PDF...' : '📄 Descargar PDF'}
            </button>
          </div>

          {/* Right Panel - Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white border-neo p-6 shadow-neo-lg sticky top-6">
              <h2 className="text-2xl font-bold mb-4 text-neo-black">Vista Previa</h2>
              <div className="bg-neo-lavender p-4 rounded overflow-auto max-h-[800px]">
                <BrochurePreview
                  ref={previewRef}
                  business={business}
                  menus={selectedMenus}
                  template={selectedTemplate}
                  title={brochureTitle}
                  subtitle={brochureSubtitle}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
