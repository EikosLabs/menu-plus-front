import React, { useState, useEffect } from 'react';
import menuService from '../services/menuService';

export default function AddMenuForm({ businessId, onMenuAdded, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    foodBusinessId: businessId
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [business, setBusiness] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const checkBusiness = async () => {
      setStatus('Verificando el negocio...');
      try {
        console.log('Verificando negocio con ID:', businessId);
        const businessData = await menuService.getFoodBusiness(businessId);
        console.log('Datos del negocio recibidos:', businessData);
        setBusiness(businessData);
        
        if (businessData.menus && businessData.menus.length > 0) {
          setError('Este negocio ya tiene un menú. No se pueden crear más menús.');
          setStatus('Este negocio ya tiene un menú.');
        } else {
          setStatus('Negocio verificado correctamente. Puede crear un nuevo menú.');
        }
      } catch (err) {
        console.error('Error al verificar el negocio:', err);
        setError('Error al verificar el negocio. Por favor, intente de nuevo.');
        setStatus('Error al verificar el negocio.');
      }
    };

    if (businessId) {
      checkBusiness();
    } else {
      setError('No se ha especificado un negocio válido');
      setStatus('Error: No hay negocio seleccionado');
    }
  }, [businessId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(null);
  };

  const validateForm = () => {
    console.log('Validando formulario con datos:', formData);
    
    if (!formData.name.trim()) {
      setError('El nombre del menú es requerido');
      setStatus('Error: Nombre del menú requerido');
      return false;
    }

    if (!businessId) {
      setError('No se ha especificado un negocio válido');
      setStatus('Error: No hay negocio seleccionado');
      return false;
    }

    if (business?.menus?.length > 0) {
      setError('Este negocio ya tiene un menú. No se pueden crear más menús.');
      setStatus('Error: Negocio ya tiene un menú');
      return false;
    }

    setStatus('Formulario válido, puede proceder');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setStatus('Iniciando proceso de creación...');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setStatus('Creando menú...');

    try {
      console.log('Enviando datos del menú:', formData);
      const newMenu = await menuService.createMenu(formData);
      console.log('Menú creado exitosamente:', newMenu);
      
      if (newMenu && newMenu.id) {
        setStatus('¡Menú creado exitosamente!');
        onMenuAdded(newMenu);
      } else {
        throw new Error('El servidor no devolvió un ID válido para el menú');
      }
    } catch (err) {
      console.error('Error al crear el menú:', err);
      setError(err.message || 'Error al crear el menú. Por favor, intente de nuevo.');
      setStatus('Error al crear el menú');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fadeIn menu-form">
      {error && (
        <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {status && !error && (
        <div className="p-4 bg-blue-100 border-l-4 border-blue-500 text-blue-700 rounded-md flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{status}</span>
        </div>
      )}
      
      <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
        <div className="flex items-center mb-6">
          <div className="bg-[#004E71] bg-opacity-10 p-2.5 rounded-lg mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#004E71]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-[#004E71]">Crear Nuevo Menú</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#0A3342] mb-1 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-[#E05C33]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              Nombre del Menú *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-[#E05C33] focus:border-[#E05C33] focus:outline-none transition-colors"
              placeholder="Ej. Menú de Desayunos, Carta Principal, etc."
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-[#0A3342] mb-1 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-[#E05C33]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-[#E05C33] focus:border-[#E05C33] focus:outline-none transition-colors"
              placeholder="Describe brevemente este menú"
            ></textarea>
          </div>
        </div>
        
        <div className="mt-8 border-t border-slate-200 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-slate-600 mb-4 md:mb-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1 text-[#004E71]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Después de crear el menú, podrás añadir platillos y categorías.
            </p>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-[#E05C33] hover:bg-[#FF9B54] text-white rounded-lg shadow-md transition-colors disabled:bg-slate-400 disabled:shadow-none flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creando...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Crear Menú
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
} 