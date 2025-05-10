import React, { useState, useEffect } from 'react';
import menuService from '../services/menuService';

export default function AddBusinessForm({ userId, onBusinessAdded, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slogan: '',
    address: '',
    phoneNumber: '',
    email: '',
    businessCategoryId: '', // Valor vacío inicialmente
  });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      setCategoryError(null); 
      setCategories([]); 
      setFormData(prev => ({ ...prev, businessCategoryId: '' })); 
      
      try {
        const backendCategories = await menuService.getBusinessCategories();
        setCategories(backendCategories); 
        
        if (backendCategories && backendCategories.length > 0) {
          setFormData(prev => ({
            ...prev,
            businessCategoryId: backendCategories[0].id.toString() 
          }));
          console.log('Categoría seleccionada automáticamente:', backendCategories[0].name);
          setCategoryError(null); 
        } else {
          setCategoryError('No hay categorías de negocio disponibles. Por favor, contacte al administrador para agregarlas.');
        }
        
      } catch (error) {
        console.error('Error al cargar categorías en AddBusinessForm:', error);
        const specificMessage = error.message || 'No se pudieron cargar las categorías de negocio.';
        setCategoryError(`${specificMessage} La creación de negocios no está disponible hasta que se solucionen las categorías. Por favor, contacte al administrador.`);
        setCategories([]); 
      } finally {
        setLoadingCategories(false);
      }
    };
    
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (loadingCategories || categories.length === 0) {
      setError('No se puede crear un negocio porque no hay categorías cargadas o disponibles. Por favor, contacte al administrador.');
      return;
    }

    setLoading(true);

    if (!userId) {
      setError('Error de autenticación: No se pudo obtener el ID del usuario. Por favor, inicie sesión de nuevo.');
      setLoading(false);
      return;
    }

    if (!formData.businessCategoryId) {
      setError('Debe seleccionar una categoría de negocio.');
      setLoading(false);
      return;
    }

    try {
      const businessData = {
        ...formData,
        userId: parseInt(userId, 10), // Asegurarse de que el userId sea un número
        businessCategoryId: parseInt(formData.businessCategoryId)
      };

      console.log('Enviando datos de negocio:', businessData);

      // Llamada real al servicio API para crear el negocio
      const newBusiness = await menuService.createFoodBusiness(businessData);
      
      onBusinessAdded(newBusiness);
    } catch (err) {
      console.error('Error detallado:', err);
      
      // Mensaje de error más específico según el tipo de error
      if (err.message && err.message.includes('categoría')) {
        setError('Error: No se encuentran categorías de negocio en la base de datos. Contacte al administrador.');
      } else if (err.message && err.message.includes('UserId')) {
        setError('Error: El ID de usuario no es válido. Por favor, inicie sesión nuevamente.');
      } else if (err.message && (err.message.includes('NetworkError') || err.message.includes('conexión') || err.message.includes('Failed to fetch') || err.message.includes('CORS'))) {
        setError('Error de conexión: No se pudo conectar al servidor. Verifique que:' +
                '\n1. El servidor backend esté en funcionamiento' +
                '\n2. No haya problemas de red' +
                '\n3. Los puertos 8080/8081 estén abiertos y accesibles' +
                '\n4. No haya restricciones de CORS (Cross-Origin Resource Sharing)');
      } else {
        setError('Error al crear el negocio. Por favor, intente de nuevo más tarde. Detalles: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fadeIn">
      {error && (
        <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}
      
      {categoryError && (
        <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded-md flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-semibold">Error al cargar categorías</p>
            <p>{categoryError}</p>
          </div>
        </div>
      )}
      
      <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
        <h3 className="text-lg font-semibold text-[#004E71] mb-5 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#E05C33]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Información Básica
        </h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#0A3342] mb-1 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-[#E05C33]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Nombre *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-[#E05C33] focus:border-[#E05C33] focus:outline-none transition-colors"
              placeholder="Nombre de tu negocio"
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
              rows="3"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-[#E05C33] focus:border-[#E05C33] focus:outline-none transition-colors"
              placeholder="Describe brevemente tu negocio"
            ></textarea>
          </div>
          
          <div>
            <label htmlFor="slogan" className="block text-sm font-medium text-[#0A3342] mb-1 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-[#E05C33]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Eslogan
            </label>
            <input
              type="text"
              id="slogan"
              name="slogan"
              value={formData.slogan}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-[#E05C33] focus:border-[#E05C33] focus:outline-none transition-colors"
              placeholder="Eslogan o frase representativa"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
        <h3 className="text-lg font-semibold text-[#004E71] mb-5 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#E05C33]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Información de Contacto
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-[#0A3342] mb-1 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-[#E05C33]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Dirección
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-[#E05C33] focus:border-[#E05C33] focus:outline-none transition-colors"
              placeholder="Dirección física"
            />
          </div>
          
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-[#0A3342] mb-1 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-[#E05C33]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Teléfono
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-[#E05C33] focus:border-[#E05C33] focus:outline-none transition-colors"
              placeholder="Número de contacto"
            />
          </div>
        
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#0A3342] mb-1 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-[#E05C33]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-[#E05C33] focus:border-[#E05C33] focus:outline-none transition-colors"
              placeholder="Correo electrónico"
            />
          </div>
          
          <div>
            <label htmlFor="businessCategoryId" className="block text-sm font-medium text-[#0A3342] mb-1 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-[#E05C33]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Categoría *
            </label>
            
            {loadingCategories ? (
              <div className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50 flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 text-[#E05C33] mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-slate-600">Cargando categorías...</span>
              </div>
            ) : categories.length > 0 ? (
            <select
              id="businessCategoryId"
              name="businessCategoryId"
              required
              value={formData.businessCategoryId}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-[#E05C33] focus:border-[#E05C33] focus:outline-none transition-colors"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                    {category.name}{category.description ? ` - ${category.description.substring(0, 30)}${category.description.length > 30 ? '...' : ''}` : ''}
                </option>
              ))}
            </select>
            ) : (
              <div className="text-red-500 text-sm">
                No hay categorías disponibles. No se puede crear un negocio.
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
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
          disabled={loading || loadingCategories || categories.length === 0}
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
              Crear Negocio
            </>
          )}
        </button>
      </div>
    </form>
  );
} 