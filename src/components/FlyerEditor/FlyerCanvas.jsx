import { forwardRef, useEffect, useState } from 'react';
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
import { PAPER_SIZES } from './utils/templateDefaults';

/**
 * Flyer Canvas Component
 * Renders the flyer design with drag & drop functionality
 */
const FlyerCanvas = forwardRef(({
  elements = [],
  selectedElement,
  onElementSelect,
  onElementUpdate,
  paperSize = 'A4',
  zoom = 100,
  viewMode = 'edit',
  template,
}, ref) => {
  const paper = PAPER_SIZES[paperSize];
  const scale = zoom / 100;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  /**
   * Handle drag end
   */
  const handleDragEnd = (event) => {
    const { active, delta } = event;

    if (!delta) return;

    const element = elements.find(el => el.id === active.id);
    if (!element || element.locked) return;

    // Calculate new position in percentage
    const deltaXPercent = (delta.x / paper.pxWidth) * 100;
    const deltaYPercent = (delta.y / paper.pxHeight) * 100;

    onElementUpdate(active.id, {
      x: Math.max(0, Math.min(100, element.x + deltaXPercent)),
      y: Math.max(0, Math.min(100, element.y + deltaYPercent)),
    });
  };

  /**
   * Render canvas styles
   */
  const canvasStyle = {
    width: `${paper.pxWidth}px`,
    height: `${paper.pxHeight}px`,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    backgroundColor: template?.styles?.backgroundColor || '#ffffff',
    position: 'relative',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
  };

  return (
    <div className="flex items-start justify-center min-h-full">
      <div
        ref={ref}
        className="flyer-canvas neo-border"
        style={canvasStyle}
        onClick={(e) => {
          // Deselect if clicking canvas background
          if (e.target === e.currentTarget) {
            onElementSelect(null);
          }
        }}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {elements.map((element) => (
            <CanvasElement
              key={element.id}
              element={element}
              isSelected={selectedElement === element.id}
              onSelect={() => onElementSelect(element.id)}
              onUpdate={(updates) => onElementUpdate(element.id, updates)}
              paperSize={paper}
              viewMode={viewMode}
            />
          ))}
        </DndContext>
      </div>
    </div>
  );
});

FlyerCanvas.displayName = 'FlyerCanvas';

export default FlyerCanvas;

/**
 * Individual Canvas Element
 */
function CanvasElement({
  element,
  isSelected,
  onSelect,
  onUpdate,
  paperSize,
  viewMode,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: element.id,
    disabled: element.locked || viewMode === 'preview',
  });

  const style = {
    position: 'absolute',
    left: `${element.x}%`,
    top: `${element.y}%`,
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: element.locked || viewMode === 'preview' ? 'default' : 'move',
    zIndex: isSelected ? 1000 : element.zIndex || 1,
  };

  // Add selection border in edit mode
  if (isSelected && viewMode === 'edit') {
    style.outline = '2px dashed #ff6b35';
    style.outlineOffset = '2px';
  }

  /**
   * Render element based on type
   */
  const renderElement = () => {
    switch (element.type) {
      case 'text':
        return (
          <TextElement
            element={element}
            onUpdate={onUpdate}
            viewMode={viewMode}
          />
        );

      case 'rectangle':
        return <RectangleElement element={element} />;

      case 'image':
        return <ImageElement element={element} />;

      case 'container':
        return (
          <ContainerElement
            element={element}
            viewMode={viewMode}
          />
        );

      case 'polygon':
        return <PolygonElement element={element} />;

      default:
        return null;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      {...(viewMode === 'edit' && !element.locked ? { ...attributes, ...listeners } : {})}
    >
      {renderElement()}
    </div>
  );
}

/**
 * Text Element
 */
function TextElement({ element, onUpdate, viewMode }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(element.content);

  const handleDoubleClick = () => {
    if (viewMode === 'edit' && !element.locked) {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editedContent !== element.content) {
      onUpdate({ content: editedContent });
    }
  };

  const textStyle = {
    fontSize: `${element.fontSize}px`,
    fontWeight: element.fontWeight || 'normal',
    color: element.color || '#000000',
    textAlign: element.align || 'left',
    fontFamily: element.fontFamily || 'Poppins, sans-serif',
    textTransform: element.textTransform || 'none',
    letterSpacing: element.letterSpacing ? `${element.letterSpacing}px` : 'normal',
    lineHeight: element.lineHeight || 1.2,
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
  };

  if (isEditing) {
    return (
      <input
        type="text"
        value={editedContent}
        onChange={(e) => setEditedContent(e.target.value)}
        onBlur={handleBlur}
        autoFocus
        style={{
          ...textStyle,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          width: '100%',
        }}
      />
    );
  }

  return (
    <div
      style={textStyle}
      onDoubleClick={handleDoubleClick}
    >
      {element.content}
    </div>
  );
}

/**
 * Rectangle Element
 */
function RectangleElement({ element }) {
  const style = {
    width: `${element.width}%`,
    height: `${element.height}%`,
    backgroundColor: element.fill || 'transparent',
    border: element.stroke ? `${element.strokeWidth || 1}px solid ${element.stroke}` : 'none',
    borderRadius: element.borderRadius ? `${element.borderRadius}px` : '0',
  };

  // Handle gradient
  if (element.fill?.includes('gradient')) {
    style.background = element.fill;
  }

  return <div style={style} />;
}

/**
 * Image Element
 */
function ImageElement({ element }) {
  const style = {
    width: element.width ? `${element.width}%` : 'auto',
    height: element.height ? `${element.height}%` : 'auto',
    borderRadius: element.borderRadius ? `${element.borderRadius}%` : '0',
    objectFit: 'cover',
  };

  if (!element.src) return null;

  return (
    <img
      src={element.src}
      alt={element.alt || ''}
      style={style}
      crossOrigin="anonymous"
    />
  );
}

/**
 * Container Element (for menu items)
 */
function ContainerElement({ element, viewMode }) {
  const containerStyle = {
    width: `${element.width}%`,
    height: `${element.height}%`,
    display: element.layout === 'grid' ? 'grid' : 'flex',
    flexDirection: element.layout === 'vertical' ? 'column' : 'row',
    gap: `${element.gap || 10}px`,
    gridTemplateColumns: element.columns ? `repeat(${element.columns}, 1fr)` : 'auto',
    overflow: 'hidden',
  };

  return (
    <div style={containerStyle}>
      {element.children?.map((child) => (
        <MenuItem
          key={child.id}
          item={child}
          viewMode={viewMode}
        />
      ))}
    </div>
  );
}

/**
 * Menu Item Element
 */
function MenuItem({ item, viewMode }) {
  const { data, styles } = item;

  const itemStyle = {
    backgroundColor: '#ffffff',
    borderRadius: `${styles.borderRadius || 0}px`,
    padding: '8px',
    border: '1px solid #e0e0e0',
    overflow: 'hidden',
  };

  return (
    <div style={itemStyle}>
      {styles.showImage && data.imageUri && (
        <img
          src={data.imageUri}
          alt={data.name}
          style={{
            width: '100%',
            height: `${styles.imageSize || 80}px`,
            objectFit: 'cover',
            borderRadius: `${styles.borderRadius || 0}px`,
            marginBottom: '6px',
          }}
          crossOrigin="anonymous"
        />
      )}
      <div style={{ fontSize: `${styles.fontSize || 14}px`, fontWeight: 'bold', marginBottom: '4px' }}>
        {data.name}
      </div>
      {data.description && (
        <div style={{
          fontSize: `${styles.descFontSize || 11}px`,
          color: '#666666',
          marginBottom: '4px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          {data.description}
        </div>
      )}
      <div style={{
        fontSize: `${styles.priceFontSize || 14}px`,
        fontWeight: 'bold',
        color: '#000000',
      }}>
        ${data.price.toFixed(2)}
      </div>
    </div>
  );
}

/**
 * Polygon Element
 */
function PolygonElement({ element }) {
  // This is a placeholder - for complex shapes, you might want to use SVG
  return (
    <div
      style={{
        width: `${element.width || 100}%`,
        height: `${element.height || 100}%`,
        backgroundColor: element.fill || 'transparent',
      }}
    />
  );
}
