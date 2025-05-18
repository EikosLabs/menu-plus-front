import React, { useState, useEffect, useRef } from 'react';
import menuService from '../services/menuService';

export default function AddMenuItem({ menuId, onItemAdded, onCancel, existingItem, isEditing }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    isAvailable: true,
    menuItemCategoryId: null,
    menuId: menuId,
    image: null,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const fileInputRef = useRef(null);
  const formRef = useRef(null);
  const [touched, setTouched] = useState({
    name: false,
    price: false
  });
  
  // Variable para controlar si el componente está montado
  const isMounted = useRef(true);

  // Para cerrar el modal al presionar Escape
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && !loading) {
        onCancel();
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      isMounted.current = false; // Marcar como desmontado
    };
  }, [loading, onCancel]);

  useEffect(() => {
    async function fetchCategories() {
      if (!isMounted.current) return;
      setLoadingCategories(true);
      try {
        const categoriesData = await menuService.getMenuItemCategories();
        if (isMounted.current) {
          setCategories(categoriesData || []);
        }
      } catch (err) {
        console.error("Error al cargar categorías:", err);
        // No actualizamos el estado si el componente está desmontado
        if (isMounted.current) {
          setError("No se pudieron cargar las categorías. Intente nuevamente.");
        }
      } finally {
        if (isMounted.current) {
          setLoadingCategories(false);
        }
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!isMounted.current) return;
    
    if (isEditing && existingItem) {
      setFormData({
        name: existingItem.name || '',
        description: existingItem.description || '',
        price: existingItem.price?.toString() || '',
        isAvailable: existingItem.isAvailable !== undefined ? existingItem.isAvailable : true,
        menuItemCategoryId: existingItem.menuItemCategoryId || null,
        menuId: existingItem.menuId || menuId,
        image: null,
      });
      setImagePreview(existingItem.imageUri || null);
    } else {
      // Resetear para modo "Añadir"
      setFormData({
        name: '',
        description: '',
        price: '',
        isAvailable: true,
        menuItemCategoryId: null,
        menuId: menuId,
        image: null,
      });
      setImagePreview(null);
    }
  }, [isEditing, existingItem, menuId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'menuItemCategoryId' && value === '' ? null : value)
    }));
    
    // Marcar el campo como tocado cuando el usuario interactúa con él
    if (!touched[name]) {
      setTouched(prev => ({
        ...prev,
        [name]: true
      }));
    }
    
    setError(null);
    setMessage(null);
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return value.trim() ? '' : 'El nombre del platillo es obligatorio';
      case 'price':
        return value && parseFloat(value) > 0 ? '' : 'El precio debe ser mayor que cero';
      default:
        return '';
    }
  };

  // Verificar si hay errores de validación para mostrarlos visualmente
  const getFieldError = (fieldName) => {
    if (!touched[fieldName]) return '';
    return validateField(fieldName, formData[fieldName]);
  };

  const nameError = getFieldError('name');
  const priceError = getFieldError('price');

  const handleFileChange = (e) => {
    if (!isMounted.current) return;
    
    const file = e.target.files[0];
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image: null }));
    if (fileInputRef.current) fileInputRef.current.value = null;

    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('El archivo debe ser una imagen (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      setError('La imagen no debe exceder 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (isMounted.current) {
        setImagePreview(reader.result);
      }
    };
    reader.readAsDataURL(file);

    setFormData(prev => ({
      ...prev,
      image: file
    }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación básica sin depender de los estados "touched"
    if (!formData.name || !formData.name.trim()) {
      setError('El nombre del platillo es obligatorio');
      return;
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('El precio debe ser mayor que cero');
      return;
    }
    
    // Iniciar carga
    setLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      // Preparación de datos básica
      const dataToSend = {
        name: formData.name.trim(),
        description: formData.description || '',
        price: parseFloat(formData.price),
        menuId: menuId,
        isAvailable: formData.isAvailable,
        menuItemCategoryId: formData.menuItemCategoryId === '' ? null : 
                          formData.menuItemCategoryId ? parseInt(formData.menuItemCategoryId) : null,
        image: formData.image
      };
      
      console.log("Enviando datos para " + (isEditing ? "actualizar" : "crear") + " platillo:", dataToSend);
      
      // Realizar la operación según sea edición o creación
      if (isEditing && existingItem) {
        const payload = {
          name: dataToSend.name,
          description: dataToSend.description,
          price: dataToSend.price,
          isAvailable: dataToSend.isAvailable,
          menuItemCategoryId: dataToSend.menuItemCategoryId
        };
        
        await menuService.updateMenuItem(existingItem.id, payload);
        console.log("Platillo actualizado con éxito");
        
        // Notificar y cerrar
        if (onItemAdded) {
          try { onItemAdded({...existingItem, ...payload}); } catch(e) { console.error(e); }
        }
        
        // Desactivar estado de carga y mostrar mensaje
        setLoading(false);
        setMessage('¡Platillo actualizado correctamente!');
        
        // Cerrar el modal después de un breve retraso
        setTimeout(() => {
          try { if (onCancel) onCancel(); } catch(e) { console.error(e); }
        }, 1500);
      } else {
        // FLUJO DE CREACIÓN - Simplificado y con recarga forzada
        console.log("Iniciando creación de platillo para menú ID:", menuId);
        
        try {
          const result = await menuService.createMenuItem(dataToSend);
          console.log("Platillo creado exitosamente:", result);
          
          // Mostrar mensaje de éxito pero mantener cargando
          setMessage('¡Platillo agregado correctamente! Recargando página...');
          
          // Intentar llamar al callback
          if (onItemAdded) {
            try { onItemAdded(result); } catch(e) { console.error(e); }
          }
          
          // FORZAR RECARGA DE LA PÁGINA - Solución radical pero efectiva
          console.log("Forzando recarga de página en 1 segundo...");
          setTimeout(() => {
            window.location.reload();
          }, 1000);
          
        } catch (createError) {
          console.error("Error creando platillo:", createError);
          setLoading(false);
          setError(createError.message || "Error al crear el platillo. Inténtelo nuevamente.");
        }
      }
    } catch (err) {
      console.error("Error general en handleSubmit:", err);
      setLoading(false);
      setError(err.message || "Ha ocurrido un error inesperado. Por favor, inténtelo nuevamente.");
    }
  };

  // Evitar que el clic dentro del modal se propague al fondo
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-auto flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-all duration-300"
      onClick={onCancel}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4 transition-all duration-300 transform animate-fadeInUp"
        onClick={handleModalClick}
      >
        <div className="relative p-6 md:p-8">
          <button 
            onClick={() => {
              if (!loading) {
                onCancel();
              }
            }}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label="Cerrar modal"
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-center mb-6">
            <div className={`${isEditing ? 'bg-blue-500' : 'bg-[#004E71]'} bg-opacity-10 p-3.5 rounded-lg mr-4 flex-shrink-0`}>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-7 w-7 ${isEditing ? 'text-blue-600' : 'text-[#004E71]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isEditing ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                )}
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#004E71]">
              {isEditing ? 'Editar Platillo' : 'Agregar Nuevo Platillo'}
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

          {message && (
            <div className="mb-6 p-3.5 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-md animate-fadeIn">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">Éxito:</span>&nbsp;
                <span>{message}</span>
              </div>
            </div>
          )}

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Columna izquierda - Detalles del platillo */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    Nombre del Platillo *
                    {touched.name && nameError && (
                      <span className="text-red-500 ml-2 text-xs">({nameError})</span>
                    )}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-2.5 border ${touched.name && nameError ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-lg focus:ring-[#E05C33] focus:border-[#E05C33] transition-colors`}
                    placeholder="Ej. Hamburguesa Clásica"
                    required
                    aria-invalid={touched.name && nameError ? "true" : "false"}
                    aria-describedby={touched.name && nameError ? "name-error" : undefined}
                    disabled={loading}
                  />
                  {touched.name && nameError && (
                    <p id="name-error" className="mt-1 text-sm text-red-600">{nameError}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-[#E05C33] focus:border-[#E05C33] transition-colors"
                    placeholder="Describa los ingredientes y preparación..."
                    disabled={loading}
                  ></textarea>
                  <p className="mt-1 text-xs text-gray-500">Una buena descripción ayuda a tus clientes a entender mejor el platillo.</p>
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    Precio *
                    {touched.price && priceError && (
                      <span className="text-red-500 ml-2 text-xs">({priceError})</span>
                    )}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      step="0.01"
                      min="0"
                      className={`w-full pl-7 pr-12 py-2.5 border ${touched.price && priceError ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-lg focus:ring-[#E05C33] focus:border-[#E05C33] transition-colors`}
                      placeholder="0.00"
                      required
                      aria-invalid={touched.price && priceError ? "true" : "false"}
                      aria-describedby={touched.price && priceError ? "price-error" : undefined}
                      disabled={loading}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">MXN</span>
                    </div>
                  </div>
                  {touched.price && priceError && (
                    <p id="price-error" className="mt-1 text-sm text-red-600">{priceError}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="menuItemCategoryId" className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría
                  </label>
                  <select
                    id="menuItemCategoryId"
                    name="menuItemCategoryId"
                    value={formData.menuItemCategoryId || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-[#E05C33] focus:border-[#E05C33] transition-colors bg-white text-sm"
                    disabled={loading || loadingCategories}
                  >
                    <option value="">Sin categoría</option>
                    {loadingCategories ? (
                      <option disabled>Cargando categorías...</option>
                    ) : (
                      categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))
                    )}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">Las categorías ayudan a organizar mejor tu menú.</p>
                </div>

                <div className="flex items-center pt-2">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    name="isAvailable"
                    checked={formData.isAvailable}
                    onChange={handleChange}
                    className="h-4 w-4 text-[#E05C33] focus:ring-[#E05C33] border-gray-300 rounded"
                    disabled={loading}
                  />
                  <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-700">
                    Disponible para ordenar
                  </label>
                </div>
              </div>

              {/* Columna derecha - Imagen */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imagen del Platillo
                  </label>
                  
                  <div 
                    className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                    onClick={() => !loading && fileInputRef.current && fileInputRef.current.click()}
                  >
                    <div className="space-y-1 text-center">
                      {imagePreview ? (
                        <div className="relative">
                          <img src={imagePreview} alt="Vista previa" className="mx-auto h-40 object-cover rounded-lg shadow-md transition-transform group-hover:scale-105" />
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setImagePreview(null);
                              if (fileInputRef.current) fileInputRef.current.value = null;
                              setFormData(prev => ({ ...prev, image: null }));
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors"
                            disabled={loading}
                            aria-label="Eliminar imagen"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <>
                          <svg className="mx-auto h-12 w-12 text-gray-400 group-hover:text-gray-500 transition-colors" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <div className="flex text-sm text-gray-600 justify-center">
                            <span className="relative rounded-md font-medium text-[#E05C33] hover:text-[#FF7E45] focus:outline-none transition-colors">
                              Subir una imagen
                            </span>
                            <p className="pl-1">o arrastrar y soltar</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, WebP hasta 5MB
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  <input 
                    ref={fileInputRef} 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="hidden" 
                    disabled={loading}
                  />
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-lg border-l-4 border-yellow-400">
                  <div className="flex">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800 mb-1">Consejo para mejores resultados</h4>
                      <p className="text-sm text-yellow-700">
                        Las imágenes más atractivas aumentan las ventas. Utiliza fotos profesionales, bien iluminadas y con fondos que destaquen tu platillo.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 flex flex-col sm:flex-row justify-end items-center gap-3 sm:gap-4 pt-4 border-t border-gray-200 mt-2">
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[#E05C33] to-[#FF7E45] text-white rounded-lg text-sm font-semibold shadow-md hover:shadow-lg hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E05C33] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isEditing ? 'Actualizando...' : 'Guardando...'}
                  </>
                ) : (isEditing ? 'Actualizar Platillo' : 'Agregar Platillo')}
              </button>
            </div>
          </form>
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