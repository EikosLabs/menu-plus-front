import { useState, useEffect } from 'react';
import menuService from '../services/menuService';

export default function SectionManager({ menuId, onSectionAdded, onSectionMoved, onClose }) {
  const [sections, setSections] = useState([]);
  const [newSection, setNewSection] = useState({ name: '', description: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (menuId) {
      loadSections();
    }
  }, [menuId]);

  const loadSections = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedSections = await menuService.getSections(menuId);
      setSections(fetchedSections || []);
    } catch (error) {
      setError('Error al cargar las secciones: ' + error.message);
      console.error('Error cargando secciones:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSection(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSection = async (e) => {
    e.preventDefault();
    if (!newSection.name.trim()) {
      setError('El nombre de la sección es requerido');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const createdSection = await menuService.createSection(menuId, newSection);
      setSections(prev => [...prev, createdSection]);
      setNewSection({ name: '', description: '' });
      
      if (onSectionAdded) {
        onSectionAdded(createdSection);
      }
    } catch (error) {
      setError('Error al crear la sección: ' + error.message);
      console.error('Error creando sección:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveUp = async (sectionId) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedSection = await menuService.moveSectionUp(menuId, sectionId);
      await loadSections(); // Recargamos para obtener el orden actualizado
      
      if (onSectionMoved) {
        onSectionMoved(updatedSection);
      }
    } catch (error) {
      setError('Error al mover la sección: ' + error.message);
      console.error('Error moviendo sección:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveDown = async (sectionId) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedSection = await menuService.moveSectionDown(menuId, sectionId);
      await loadSections(); // Recargamos para obtener el orden actualizado
      
      if (onSectionMoved) {
        onSectionMoved(updatedSection);
      }
    } catch (error) {
      setError('Error al mover la sección: ' + error.message);
      console.error('Error moviendo sección:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Evitar que el clic dentro del modal se propague al fondo
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  // Cerrar el modal al presionar Escape
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && !isLoading && onClose) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isLoading, onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 overflow-auto flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-all duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4 transition-all duration-300 transform animate-fadeInUp"
        onClick={handleModalClick}
      >
        <div className="relative p-6 md:p-8">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label="Cerrar modal"
            disabled={isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-center mb-6">
            <div className="bg-blue-500 bg-opacity-10 p-3.5 rounded-lg mr-4 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Gestionar Secciones
            </h2>
          </div>

          {error && (
            <div className="mb-6 p-3.5 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md animate-fadeIn">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Error:</span>&nbsp;
                <span>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleAddSection}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-700">
                Nombre de la sección
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={newSection.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Ej: Entradas, Platos Principales, Postres..."
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium mb-1 text-gray-700">
                Descripción (opcional)
              </label>
              <textarea
                id="description"
                name="description"
                value={newSection.description}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Descripción breve de la sección..."
                rows={3}
                disabled={isLoading}
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mb-6 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Agregando...
                </div>
              ) : 'Agregar Sección'}
            </button>
          </form>
          
          <div>
            <h4 className="text-base font-medium mb-2 text-gray-800">Secciones actuales</h4>
            
            {sections.length === 0 ? (
              <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg">No hay secciones creadas</p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {sections.sort((a, b) => a.order - b.order).map((section) => (
                  <div key={section.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">{section.name}</p>
                      {section.description && (
                        <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleMoveUp(section.id)}
                        disabled={isLoading || section.order === 0}
                        className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 text-blue-600 hover:text-blue-800 transition-colors"
                        title="Mover hacia arriba"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleMoveDown(section.id)}
                        disabled={isLoading || section.order === sections.length - 1}
                        className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 text-blue-600 hover:text-blue-800 transition-colors"
                        title="Mover hacia abajo"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeInUp { animation: fadeInUp 0.3s ease-out forwards; }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
} 