import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix para los iconos de Leaflet en producción
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/**
 * Componente para actualizar el centro del mapa cuando cambia la posición
 */
function MapUpdater({ position }) {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.setView(position, 15, { animate: true });
    }
  }, [position, map]);
  
  return null;
}

/**
 * Componente interno para manejar clics en el mapa
 */
function LocationMarker({ position, setPosition, onLocationChange }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      
      // Hacer reverse geocoding para obtener la dirección
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(res => res.json())
        .then(data => {
          onLocationChange({
            address: data.display_name || '',
            latitude: lat,
            longitude: lng
          });
        })
        .catch(err => {
          console.error('Error en reverse geocoding:', err);
          onLocationChange({
            address: '',
            latitude: lat,
            longitude: lng
          });
        });
    },
  });

  return position ? <Marker position={position} /> : null;
}

/**
 * Componente para seleccionar ubicación en el mapa
 * Usa OpenStreetMap con Leaflet
 */
export default function LocationPicker({ 
  address = '',
  latitude,
  longitude,
  onLocationChange,
  error 
}) {
  const [searchQuery, setSearchQuery] = useState(address);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [mapPosition, setMapPosition] = useState(() => {
    // Inicializar con las coordenadas si son válidas
    const hasValidCoords = latitude && longitude && (latitude !== 0 || longitude !== 0);
    return hasValidCoords ? [latitude, longitude] : null;
  });
  const searchTimeoutRef = useRef(null);

  // Verificar si hay coordenadas válidas (no 0,0)
  const hasValidCoordinates = latitude && longitude && (latitude !== 0 || longitude !== 0);

  // Actualizar posición cuando cambien las props (para editar negocio)
  useEffect(() => {
    if (hasValidCoordinates && (!mapPosition || mapPosition[0] !== latitude || mapPosition[1] !== longitude)) {
      setMapPosition([latitude, longitude]);
    }
  }, [latitude, longitude, hasValidCoordinates]);

  // Actualizar searchQuery cuando cambie la prop address
  useEffect(() => {
    if (address) {
      setSearchQuery(address);
    }
  }, [address]);

  // Buscar dirección con debounce
  const searchAddress = async (query) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error buscando dirección:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Debounce para la búsqueda
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchAddress(searchQuery);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleSelectLocation = (result) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    
    setMapPosition([lat, lon]);
    
    onLocationChange({
      address: result.display_name,
      latitude: lat,
      longitude: lon
    });

    setSearchQuery(result.display_name);
    setSearchResults([]);
  };

  const handleClearLocation = () => {
    onLocationChange({
      address: '',
      latitude: 0,
      longitude: 0
    });
    setSearchQuery('');
    setMapPosition(null);
  };

  return (
    <div className="mb-4">
      <label className="mb-1 block neo-text neo-text-bold">
        🗺️ Ubicación del Negocio (Opcional)
      </label>
      
      {/* Campo de búsqueda */}
      <div className="relative mb-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Busca una dirección o haz clic en el mapa..."
          className={`neo-input ${error ? 'border-red-500' : ''}`}
        />
        
        {searching && (
          <div className="absolute right-3 top-3">
            <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>

      {/* Resultados de búsqueda */}
      {searchResults.length > 0 && (
        <div className="mb-3 neo-card max-h-60 overflow-y-auto">
          {searchResults.map((result, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelectLocation(result)}
              className="w-full text-left p-3 hover:bg-neo-sky transition-colors border-b border-neo-black last:border-b-0"
            >
              <div className="neo-text text-sm">
                {result.display_name}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Mapa interactivo */}
      <div className="neo-card p-2 mb-3" style={{ height: '400px' }}>
        <MapContainer
          center={mapPosition || [20.0, 0.0]}
          zoom={mapPosition ? 15 : 2}
          style={{ height: '100%', width: '100%', borderRadius: '8px' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapUpdater position={mapPosition} />
          <LocationMarker 
            position={mapPosition} 
            setPosition={setMapPosition}
            onLocationChange={onLocationChange}
          />
        </MapContainer>
      </div>

      {/* Información de ubicación seleccionada */}
      {hasValidCoordinates && (
        <div className="neo-card p-3 bg-green-50">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="neo-text neo-text-bold text-sm mb-1 text-green-700">
                ✅ Ubicación seleccionada
              </div>
              {searchQuery && (
                <div className="neo-text text-xs opacity-70 mb-2">
                  {searchQuery}
                </div>
              )}
              <div className="neo-text text-xs opacity-50">
                Lat: {latitude.toFixed(6)}, Lon: {longitude.toFixed(6)}
              </div>
            </div>
            <button
              type="button"
              onClick={handleClearLocation}
              className="neo-btn-secondary text-sm px-2 py-1"
            >
              Limpiar
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1 text-red-600 text-sm">{error}</p>
      )}

      <p className="mt-2 neo-text text-xs opacity-60">
        💡 Busca una dirección o haz clic en el mapa para seleccionar la ubicación exacta de tu negocio.
      </p>
    </div>
  );
}
