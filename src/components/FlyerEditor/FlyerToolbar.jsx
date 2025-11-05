import { useState } from 'react';

/**
 * Flyer Toolbar Component
 * Sidebar with tools and properties panel
 */
export default function FlyerToolbar({
  elements = [],
  selectedElement,
  onElementSelect,
  onElementUpdate,
  onElementDelete,
  onElementDuplicate,
  paperSize,
  onPaperSizeChange,
  zoom,
  onZoomChange,
  viewMode,
  onViewModeChange,
}) {
  const [activeTab, setActiveTab] = useState('properties'); // 'properties' | 'layers'

  const selectedEl = elements.find(el => el.id === selectedElement);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Tabs */}
      <div className="flex border-b-2 border-black">
        <button
          onClick={() => setActiveTab('properties')}
          className={`flex-1 px-3 py-2 neo-text-bold text-sm ${
            activeTab === 'properties'
              ? 'bg-neo-flame text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          Propiedades
        </button>
        <button
          onClick={() => setActiveTab('layers')}
          className={`flex-1 px-3 py-2 neo-text-bold text-sm ${
            activeTab === 'layers'
              ? 'bg-neo-flame text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          Capas
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'properties' ? (
          <PropertiesPanel
            selectedElement={selectedEl}
            onElementUpdate={onElementUpdate}
            onElementDelete={onElementDelete}
            onElementDuplicate={onElementDuplicate}
            paperSize={paperSize}
            onPaperSizeChange={onPaperSizeChange}
            zoom={zoom}
            onZoomChange={onZoomChange}
            viewMode={viewMode}
            onViewModeChange={onViewModeChange}
          />
        ) : (
          <LayersPanel
            elements={elements}
            selectedElement={selectedElement}
            onElementSelect={onElementSelect}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Properties Panel
 */
function PropertiesPanel({
  selectedElement,
  onElementUpdate,
  onElementDelete,
  onElementDuplicate,
  paperSize,
  onPaperSizeChange,
  zoom,
  onZoomChange,
  viewMode,
  onViewModeChange,
}) {
  return (
    <div className="space-y-4">
      {/* Document Settings */}
      <Section title="Documento">
        <FormField label="Tamaño de Papel">
          <select
            value={paperSize}
            onChange={(e) => onPaperSizeChange(e.target.value)}
            className="neo-select w-full"
          >
            <option value="A4">A4 (210 x 297 mm)</option>
            <option value="LETTER">Letter (8.5 x 11 in)</option>
          </select>
        </FormField>

        <FormField label={`Zoom: ${zoom}%`}>
          <input
            type="range"
            min="25"
            max="200"
            step="5"
            value={zoom}
            onChange={(e) => onZoomChange(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex gap-1 mt-1">
            <button
              onClick={() => onZoomChange(50)}
              className="neo-btn neo-btn-sm flex-1 text-xs"
            >
              50%
            </button>
            <button
              onClick={() => onZoomChange(100)}
              className="neo-btn neo-btn-sm flex-1 text-xs"
            >
              100%
            </button>
            <button
              onClick={() => onZoomChange(150)}
              className="neo-btn neo-btn-sm flex-1 text-xs"
            >
              150%
            </button>
          </div>
        </FormField>

        <FormField label="Modo de Vista">
          <div className="flex gap-2">
            <button
              onClick={() => onViewModeChange('edit')}
              className={`neo-btn neo-btn-sm flex-1 ${
                viewMode === 'edit' ? 'neo-btn-primary' : ''
              }`}
            >
              ✏️ Editar
            </button>
            <button
              onClick={() => onViewModeChange('preview')}
              className={`neo-btn neo-btn-sm flex-1 ${
                viewMode === 'preview' ? 'neo-btn-primary' : ''
              }`}
            >
              👁️ Vista Previa
            </button>
          </div>
        </FormField>
      </Section>

      {/* Element Properties */}
      {selectedElement ? (
        <>
          <Section title={`Elemento: ${selectedElement.type}`}>
            {selectedElement.locked && (
              <div className="neo-alert mb-3 text-xs">
                🔒 Este elemento está bloqueado
              </div>
            )}

            {/* Position */}
            <FormField label="Posición">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="neo-text text-xs">X (%)</label>
                  <input
                    type="number"
                    value={Math.round(selectedElement.x)}
                    onChange={(e) => onElementUpdate(selectedElement.id, {
                      x: Number(e.target.value)
                    })}
                    disabled={selectedElement.locked}
                    className="neo-input w-full text-sm"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="neo-text text-xs">Y (%)</label>
                  <input
                    type="number"
                    value={Math.round(selectedElement.y)}
                    onChange={(e) => onElementUpdate(selectedElement.id, {
                      y: Number(e.target.value)
                    })}
                    disabled={selectedElement.locked}
                    className="neo-input w-full text-sm"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </FormField>

            {/* Text Properties */}
            {selectedElement.type === 'text' && (
              <TextProperties
                element={selectedElement}
                onUpdate={(updates) => onElementUpdate(selectedElement.id, updates)}
              />
            )}

            {/* Rectangle Properties */}
            {selectedElement.type === 'rectangle' && (
              <RectangleProperties
                element={selectedElement}
                onUpdate={(updates) => onElementUpdate(selectedElement.id, updates)}
              />
            )}

            {/* Image Properties */}
            {selectedElement.type === 'image' && (
              <ImageProperties
                element={selectedElement}
                onUpdate={(updates) => onElementUpdate(selectedElement.id, updates)}
              />
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => onElementDuplicate(selectedElement.id)}
                disabled={selectedElement.locked}
                className="neo-btn neo-btn-sm flex-1"
              >
                📋 Duplicar
              </button>
              <button
                onClick={() => {
                  if (confirm('¿Eliminar este elemento?')) {
                    onElementDelete(selectedElement.id);
                  }
                }}
                disabled={selectedElement.locked}
                className="neo-btn neo-btn-sm flex-1 bg-red-500 text-white"
              >
                🗑️ Eliminar
              </button>
            </div>
          </Section>
        </>
      ) : (
        <div className="neo-alert">
          <p className="neo-text text-sm">
            Selecciona un elemento para ver sus propiedades
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Text Element Properties
 */
function TextProperties({ element, onUpdate }) {
  return (
    <>
      <FormField label="Contenido">
        <textarea
          value={element.content || ''}
          onChange={(e) => onUpdate({ content: e.target.value })}
          disabled={element.locked}
          className="neo-textarea w-full text-sm"
          rows="3"
        />
      </FormField>

      <FormField label="Tamaño de Fuente">
        <input
          type="number"
          value={element.fontSize || 14}
          onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
          disabled={element.locked}
          className="neo-input w-full text-sm"
          min="8"
          max="72"
        />
      </FormField>

      <FormField label="Peso de Fuente">
        <select
          value={element.fontWeight || 'normal'}
          onChange={(e) => onUpdate({ fontWeight: e.target.value })}
          disabled={element.locked}
          className="neo-select w-full text-sm"
        >
          <option value="300">Ligera</option>
          <option value="normal">Normal</option>
          <option value="500">Media</option>
          <option value="600">Semi-negrita</option>
          <option value="bold">Negrita</option>
        </select>
      </FormField>

      <FormField label="Color">
        <input
          type="color"
          value={element.color || '#000000'}
          onChange={(e) => onUpdate({ color: e.target.value })}
          disabled={element.locked}
          className="w-full h-10 neo-border rounded cursor-pointer"
        />
      </FormField>

      <FormField label="Alineación">
        <div className="flex gap-1">
          {['left', 'center', 'right'].map(align => (
            <button
              key={align}
              onClick={() => onUpdate({ align })}
              disabled={element.locked}
              className={`neo-btn neo-btn-sm flex-1 ${
                element.align === align ? 'neo-btn-primary' : ''
              }`}
            >
              {align === 'left' ? '⬅️' : align === 'center' ? '↔️' : '➡️'}
            </button>
          ))}
        </div>
      </FormField>
    </>
  );
}

/**
 * Rectangle Element Properties
 */
function RectangleProperties({ element, onUpdate }) {
  return (
    <>
      <FormField label="Ancho (%)">
        <input
          type="number"
          value={element.width || 100}
          onChange={(e) => onUpdate({ width: Number(e.target.value) })}
          disabled={element.locked}
          className="neo-input w-full text-sm"
          min="0"
          max="100"
        />
      </FormField>

      <FormField label="Alto (%)">
        <input
          type="number"
          value={element.height || 100}
          onChange={(e) => onUpdate({ height: Number(e.target.value) })}
          disabled={element.locked}
          className="neo-input w-full text-sm"
          min="0"
          max="100"
        />
      </FormField>

      <FormField label="Color de Relleno">
        <input
          type="color"
          value={element.fill || '#ffffff'}
          onChange={(e) => onUpdate({ fill: e.target.value })}
          disabled={element.locked}
          className="w-full h-10 neo-border rounded cursor-pointer"
        />
      </FormField>

      <FormField label="Border Radius">
        <input
          type="number"
          value={element.borderRadius || 0}
          onChange={(e) => onUpdate({ borderRadius: Number(e.target.value) })}
          disabled={element.locked}
          className="neo-input w-full text-sm"
          min="0"
          max="50"
        />
      </FormField>
    </>
  );
}

/**
 * Image Element Properties
 */
function ImageProperties({ element, onUpdate }) {
  return (
    <>
      <FormField label="URL de Imagen">
        <input
          type="text"
          value={element.src || ''}
          onChange={(e) => onUpdate({ src: e.target.value })}
          disabled={element.locked}
          className="neo-input w-full text-sm"
          placeholder="https://..."
        />
      </FormField>

      <FormField label="Ancho (%)">
        <input
          type="number"
          value={element.width || 100}
          onChange={(e) => onUpdate({ width: Number(e.target.value) })}
          disabled={element.locked}
          className="neo-input w-full text-sm"
          min="0"
          max="100"
        />
      </FormField>

      <FormField label="Alto (%)">
        <input
          type="number"
          value={element.height || 100}
          onChange={(e) => onUpdate({ height: Number(e.target.value) })}
          disabled={element.locked}
          className="neo-input w-full text-sm"
          min="0"
          max="100"
        />
      </FormField>

      <FormField label="Border Radius (%)">
        <input
          type="number"
          value={element.borderRadius || 0}
          onChange={(e) => onUpdate({ borderRadius: Number(e.target.value) })}
          disabled={element.locked}
          className="neo-input w-full text-sm"
          min="0"
          max="50"
        />
      </FormField>
    </>
  );
}

/**
 * Layers Panel
 */
function LayersPanel({ elements, selectedElement, onElementSelect }) {
  return (
    <div className="space-y-2">
      <div className="neo-text-bold mb-3 text-sm">
        Capas ({elements.length})
      </div>

      {elements.length === 0 ? (
        <div className="neo-alert text-sm">
          No hay elementos en el canvas
        </div>
      ) : (
        <div className="space-y-1">
          {elements.map((element) => (
            <button
              key={element.id}
              onClick={() => onElementSelect(element.id)}
              className={`
                w-full text-left px-3 py-2 rounded neo-border text-sm
                ${selectedElement === element.id
                  ? 'bg-neo-flame text-white neo-border-thick'
                  : 'bg-white hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <span className="neo-text-bold truncate">
                  {element.locked && '🔒 '}
                  {element.id}
                </span>
                <span className="text-xs opacity-70">
                  {element.type}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Section Component
 */
function Section({ title, children }) {
  return (
    <div className="neo-card-3d p-3">
      <h4 className="neo-h5 mb-3 text-sm">{title}</h4>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}

/**
 * Form Field Component
 */
function FormField({ label, children }) {
  return (
    <div>
      {label && (
        <label className="neo-text-bold block mb-1 text-xs">
          {label}
        </label>
      )}
      {children}
    </div>
  );
}
