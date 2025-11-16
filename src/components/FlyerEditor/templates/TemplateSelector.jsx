import { getAllTemplates } from '../utils/templateDefaults';

/**
 * Template Selector Component
 * Displays available templates with previews
 */
export default function TemplateSelector({
  selectedTemplate,
  onSelectTemplate,
  onClose
}) {
  const templates = getAllTemplates();

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6">
        <h3 className="neo-h4 mb-2">Elige un Template para tu Folleto</h3>
        <p className="neo-text text-gray-600">
          Los templates definen estructura y componentes (columnas, espacios, tarjetas, botones).
          Los colores siempre vienen del branding del negocio y no del template.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            isSelected={selectedTemplate === template.id}
            onSelect={() => onSelectTemplate(template.id)}
          />
        ))}
      </div>

      {selectedTemplate && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={onClose}
            className="neo-btn neo-btn-primary px-8"
          >
            Continuar con {templates.find(t => t.id === selectedTemplate)?.name}
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Individual Template Card
 */
function TemplateCard({ template, isSelected, onSelect }) {
  const getPreviewStyles = () => {
    const styles = template.styles;
    return {
      backgroundColor: '#ffffff',
      borderColor: '#000000',
      borderWidth: styles.borderWidth,
      borderRadius: styles.borderRadius,
      fontFamily: styles.fontFamily,
    };
  };

  return (
    <div
      onClick={onSelect}
      className={`
        neo-card-3d cursor-pointer transition-all duration-200
        ${isSelected
          ? 'ring-4 ring-neo-flame transform scale-105'
          : 'hover:transform hover:scale-102'}
      `}
      style={{ borderWidth: '3px' }}
    >
      {/* Template Preview */}
      <div
        className="aspect-[210/297] mb-4 overflow-hidden relative"
        style={getPreviewStyles()}
      >
        {/* Header Preview */}
        <div
          className="absolute top-0 left-0 right-0 p-4 flex items-center justify-center"
          style={{
            height: `${template.layout.header.height}%`,
            backgroundColor: '#f5f5f5',
          }}
        >
          <div
            className="text-center font-bold"
            style={{
              fontSize: '12px',
              color: '#000000',
            }}
          >
            <div className="mb-1">{template.thumbnail} {template.name}</div>
          </div>
        </div>

        {/* Content Preview */}
        <div
          className="absolute left-0 right-0 p-3"
          style={{
            top: `${template.layout.header.height}%`,
            bottom: `${template.layout.footer.height}%`,
          }}
        >
          {/* Simulated items */}
          <div
            className={`grid gap-2 h-full`}
            style={{
              gridTemplateColumns: `repeat(${template.layout.content.columns}, 1fr)`,
            }}
          >
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded"
                style={{
                  backgroundColor: '#f0f0f0',
                  borderRadius: `${template.styles.borderRadius}px`,
                  border: template.styles.borderWidth > 0
                    ? `${template.styles.borderWidth}px solid #000000`
                    : 'none',
                }}
              >
                {template.styles.showImages && (
                  <div
                    className="bg-gray-300"
                    style={{
                      height: '30px',
                      borderRadius: `${template.styles.borderRadius}px ${template.styles.borderRadius}px 0 0`,
                    }}
                  />
                )}
                <div className="p-2">
                  <div
                    className="bg-gray-400 mb-1"
                    style={{
                      height: '4px',
                      borderRadius: '2px',
                      width: '70%',
                    }}
                  />
                  <div
                    className="bg-gray-300"
                    style={{
                      height: '3px',
                      borderRadius: '2px',
                      width: '90%',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Preview */}
        <div
          className="absolute bottom-0 left-0 right-0 p-2 text-center"
          style={{
            height: `${template.layout.footer.height}%`,
            fontSize: '6px',
            color: '#666666',
          }}
        >
          Contacto
        </div>
      </div>

      {/* Template Info */}
      <div className="p-4 pt-0">
        <h4 className="neo-h5 mb-1 flex items-center gap-2">
          <span className="text-2xl">{template.thumbnail}</span>
          {template.name}
          {isSelected && (
            <span className="ml-auto text-neo-flame">✓</span>
          )}
        </h4>
        <p className="neo-text text-sm text-gray-600">
          {template.description}
        </p>

        {/* Template Features */}
        <div className="mt-3 flex flex-wrap gap-2">
          {template.styles.showImages && (
            <span className="px-2 py-1 bg-gray-100 rounded text-xs neo-text-bold">
              📷 Con imágenes
            </span>
          )}
          {template.layout.content.columns > 1 && (
            <span className="px-2 py-1 bg-gray-100 rounded text-xs neo-text-bold">
              ⚡ {template.layout.content.columns} columnas
            </span>
          )}
          {template.styles.compact && (
            <span className="px-2 py-1 bg-gray-100 rounded text-xs neo-text-bold">
              📦 Compacto
            </span>
          )}
          {template.styles.spacing === 'generous' && (
            <span className="px-2 py-1 bg-gray-100 rounded text-xs neo-text-bold">
              ✨ Espacioso
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
