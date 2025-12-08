import React, { useState, useRef, useEffect } from 'react';

/**
 * Color Picker Mejorado
 * Combina un selector nativo robusto con paletas predefinidas
 */
export default function CircularColorPicker({ color, onChange, label }) {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef(null);
  const inputRef = useRef(null);

  // Cerrar cuando se hace click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleHexChange = (e) => {
    const hex = e.target.value;
    // Allow typing but validate before calling onChange if valid hex
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      onChange(hex);
    } else if (hex.startsWith('#') && hex.length <= 7) {
        // Just update local state if we were managing it, but here we rely on parent
        // So we might need to let the parent handle partial inputs or just wait for valid hex
        // For now, we only trigger onChange on valid hex to avoid errors
    }
  };

  // Popular palettes based on business types
  const presetColors = [
    '#1a1a1a', '#ffffff', '#000000', '#666666', // Grayscale
    '#DC2626', '#EF4444', '#F87171', // Reds
    '#D97706', '#F59E0B', '#FBBF24', // Oranges
    '#166534', '#22C55E', '#86EFAC', // Greens
    '#1E40AF', '#3B82F6', '#93C5FD', // Blues
    '#6B21A8', '#A855F7', '#D8B4FE', // Purples
    '#9D174D', '#EC4899', '#F9A8D4', // Pinks
    '#92400E', '#B45309', '#D97706', // Browns
  ];

  return (
    <div ref={pickerRef} className="relative">
      <label className="mb-1 block flex items-center font-medium text-[#0A3342] text-sm">
        {label}
      </label>

      {/* Color Display Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-slate-300 bg-white hover:border-neo-flame transition-all neo-shadow-sm"
      >
        <div
          className="w-12 h-12 rounded-lg border-2 border-slate-200 flex-shrink-0 neo-shadow-md relative overflow-hidden"
          style={{ backgroundColor: color || '#000000' }}
        >
             {/* Invisible native input to cover the box for fallback/quick access if needed */}
        </div>
        <div className="flex-1 text-left">
          <div className="font-medium text-slate-900">{(color || '#000000').toUpperCase()}</div>
          <div className="text-slate-500 text-xs">Click para editar</div>
        </div>
        <svg
          className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Picker Dropdown */}
      {isOpen && (
        <div className="absolute z-[60] bottom-full left-0 mb-2 w-full sm:w-80 p-4 bg-white rounded-xl neo-shadow-lg border-2 border-slate-200 animate-fadeIn">
          
          {/* Native Picker Trigger */}
          <div className="mb-4">
             <label className="block text-sm font-semibold text-slate-700 mb-2">
              Selector de Color
            </label>
            <div className="flex gap-2">
                <div className="relative flex-1 h-10">
                    <input
                        type="color"
                        value={color || '#000000'}
                        onChange={(e) => onChange(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <button type="button" className="w-full h-full bg-neo-lavender hover:bg-neo-gray border-2 border-slate-300 rounded-lg flex items-center justify-center text-sm font-medium text-slate-700 transition-colors">
                        🎨 Abrir Selector del Sistema
                    </button>
                </div>
                <input
                    type="text"
                    value={color || '#000000'}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-28 px-3 py-2 border-2 border-slate-300 rounded-lg font-mono text-sm focus:border-neo-flame focus:outline-none uppercase"
                    maxLength={7}
                />
            </div>
          </div>

          {/* Presets */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Colores Sugeridos
            </label>
            <div className="grid grid-cols-8 gap-2">
              {presetColors.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  onClick={() => onChange(presetColor)}
                  className={`aspect-square rounded-lg border-2 transition-all hover:scale-110 transform ${color === presetColor ? 'border-neo-flame ring-2 ring-neo-flame ring-offset-1' : 'border-slate-200'}`}
                  style={{ backgroundColor: presetColor }}
                  title={presetColor}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
