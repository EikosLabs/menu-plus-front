import React, { useState, useRef, useEffect } from 'react';

/**
 * Circular Color Picker con teoría del color
 * Permite seleccionar colores de forma visual y genera paletas armónicas
 */
export default function CircularColorPicker({ color, onChange, label }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);
  const [colorScheme, setColorScheme] = useState('complementary');
  const pickerRef = useRef(null);

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

  // Convertir hex a HSL al cargar
  useEffect(() => {
    if (color && color !== '#000000') {
      const hsl = hexToHSL(color);
      setHue(hsl.h);
      setSaturation(hsl.s);
      setLightness(hsl.l);
    }
  }, [color]);

  // Convertir HSL a Hex
  const hslToHex = (h, s, l) => {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  // Convertir Hex a HSL
  const hexToHSL = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { h: 0, s: 100, l: 50 };

    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  // Generar paleta de colores según esquema
  const generateColorScheme = () => {
    const schemes = {
      complementary: [hue, (hue + 180) % 360],
      analogous: [hue, (hue + 30) % 360, (hue + 60) % 360],
      triadic: [hue, (hue + 120) % 360, (hue + 240) % 360],
      tetradic: [hue, (hue + 90) % 360, (hue + 180) % 360, (hue + 270) % 360],
      monochromatic: [hue, hue, hue],
    };

    const hues = schemes[colorScheme] || schemes.complementary;

    return hues.map((h, index) => {
      let s = saturation;
      let l = lightness;

      // Variaciones en monocromático
      if (colorScheme === 'monochromatic') {
        if (index === 1) l = Math.max(20, lightness - 20);
        if (index === 2) l = Math.min(80, lightness + 20);
      }

      return hslToHex(h, s, l);
    });
  };

  const handleColorChange = (newHue, newSat, newLight) => {
    const newColor = hslToHex(newHue, newSat, newLight);
    onChange(newColor);
  };

  const handleHueChange = (e) => {
    const newHue = parseInt(e.target.value);
    setHue(newHue);
    handleColorChange(newHue, saturation, lightness);
  };

  const handleSaturationChange = (e) => {
    const newSat = parseInt(e.target.value);
    setSaturation(newSat);
    handleColorChange(hue, newSat, lightness);
  };

  const handleLightnessChange = (e) => {
    const newLight = parseInt(e.target.value);
    setLightness(newLight);
    handleColorChange(hue, saturation, newLight);
  };

  const handleHexChange = (e) => {
    const hex = e.target.value || '#000000';
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      const hsl = hexToHSL(hex);
      setHue(hsl.h);
      setSaturation(hsl.s);
      setLightness(hsl.l);
      onChange(hex);
    } else if (hex && hex.startsWith('#')) {
      onChange(hex);
    }
  };

  const selectSchemeColor = (selectedColor) => {
    const hsl = hexToHSL(selectedColor);
    setHue(hsl.h);
    setSaturation(hsl.s);
    setLightness(hsl.l);
    onChange(selectedColor);
  };

  const colorSchemes = generateColorScheme();

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
          className="w-12 h-12 rounded-lg border-2 border-slate-200 flex-shrink-0 neo-shadow-md"
          style={{ backgroundColor: color || '#000000' }}
        />
        <div className="flex-1 text-left">
          <div className="font-medium text-slate-900">{(color || '#000000').toUpperCase()}</div>
          <div className="text-slate-500 text-xs">HSL({hue}°, {saturation}%, {lightness}%)</div>
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
        <div className="absolute z-50 mt-2 w-full sm:w-96 p-6 bg-white rounded-xl neo-shadow-lg border-2 border-slate-200">
          {/* Rueda de Color Circular */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              🎨 Tono (Hue)
            </label>
            <div className="relative">
              <div
                className="h-12 rounded-lg mb-2 neo-shadow-inner"
                style={{
                  background: `linear-gradient(to right,
                    hsl(0, ${saturation}%, ${lightness}%),
                    hsl(60, ${saturation}%, ${lightness}%),
                    hsl(120, ${saturation}%, ${lightness}%),
                    hsl(180, ${saturation}%, ${lightness}%),
                    hsl(240, ${saturation}%, ${lightness}%),
                    hsl(300, ${saturation}%, ${lightness}%),
                    hsl(360, ${saturation}%, ${lightness}%))`
                }}
              />
              <input
                type="range"
                min="0"
                max="360"
                value={hue}
                onChange={handleHueChange}
                className="w-full h-3 rounded-lg appearance-none cursor-pointer slider-thumb"
                style={{
                  background: 'transparent',
                  marginTop: '-0.75rem'
                }}
              />
            </div>
            <div className="text-center text-sm text-slate-600 font-medium">{hue}°</div>
          </div>

          {/* Saturación */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              💧 Saturación
            </label>
            <div className="relative">
              <div
                className="h-12 rounded-lg mb-2 neo-shadow-inner"
                style={{
                  background: `linear-gradient(to right,
                    hsl(${hue}, 0%, ${lightness}%),
                    hsl(${hue}, 100%, ${lightness}%))`
                }}
              />
              <input
                type="range"
                min="0"
                max="100"
                value={saturation}
                onChange={handleSaturationChange}
                className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: 'transparent',
                  marginTop: '-0.75rem'
                }}
              />
            </div>
            <div className="text-center text-sm text-slate-600 font-medium">{saturation}%</div>
          </div>

          {/* Luminosidad */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              ☀️ Luminosidad
            </label>
            <div className="relative">
              <div
                className="h-12 rounded-lg mb-2 neo-shadow-inner"
                style={{
                  background: `linear-gradient(to right,
                    hsl(${hue}, ${saturation}%, 0%),
                    hsl(${hue}, ${saturation}%, 50%),
                    hsl(${hue}, ${saturation}%, 100%))`
                }}
              />
              <input
                type="range"
                min="0"
                max="100"
                value={lightness}
                onChange={handleLightnessChange}
                className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: 'transparent',
                  marginTop: '-0.75rem'
                }}
              />
            </div>
            <div className="text-center text-sm text-slate-600 font-medium">{lightness}%</div>
          </div>

          {/* Valor Hex Manual */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              🔢 Código HEX
            </label>
            <input
              type="text"
              value={color || '#000000'}
              onChange={handleHexChange}
              className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg font-mono text-sm focus:border-neo-flame focus:outline-none"
              placeholder="#000000"
            />
          </div>

          {/* Esquemas de Color */}
          <div className="border-t-2 border-slate-200 pt-6">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              🎯 Teoría del Color
            </label>
            <select
              value={colorScheme}
              onChange={(e) => setColorScheme(e.target.value)}
              className="w-full mb-4 px-3 py-2 border-2 border-slate-300 rounded-lg text-sm focus:border-neo-flame focus:outline-none"
            >
              <option value="complementary">🔴🟢 Complementarios</option>
              <option value="analogous">🌈 Análogos</option>
              <option value="triadic">🔺 Triádicos</option>
              <option value="tetradic">🟦 Tetrádicos</option>
              <option value="monochromatic">🎨 Monocromáticos</option>
            </select>

            <div className="grid grid-cols-4 gap-2">
              {colorSchemes.map((color, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectSchemeColor(color)}
                  className="aspect-square rounded-lg border-2 border-slate-300 hover:border-neo-flame transition-all neo-shadow-md hover:scale-110 transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Paleta de Colores Predefinidos */}
          <div className="border-t-2 border-slate-200 pt-6 mt-6">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              ⭐ Colores Populares
            </label>
            <div className="grid grid-cols-8 gap-2">
              {['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
                '#1a1a1a', '#2C3E50', '#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6', '#34495E'].map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => selectSchemeColor(color)}
                  className="aspect-square rounded-lg border-2 border-slate-300 hover:border-neo-flame transition-all neo-shadow-sm hover:scale-110 transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          border: 3px solid #1a1a1a;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          transition: all 0.2s ease;
        }

        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
        }

        input[type="range"]::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          border: 3px solid #1a1a1a;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          transition: all 0.2s ease;
        }

        input[type="range"]::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
        }
      `}</style>
    </div>
  );
}
