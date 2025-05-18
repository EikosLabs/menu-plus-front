import React, { useState } from 'react';
import AddMenuItem from './AddMenuItem'; // Restaurar la importación
import menuService from '../services/menuService';
import QRCodeComponent from './QRCodeComponent';

export default function BusinessList({ businesses, onAddMenuClick }) {
  const [showAddMenuItem, setShowAddMenuItem] = useState({}); // { [menuId]: boolean }
  const [editingMenuItem, setEditingMenuItem] = useState(null); // Platillo a editar
  const [showEditMenuItemModal, setShowEditMenuItemModal] = useState(false); // Visibilidad del modal de edición
  const [error, setError] = useState(null); // Para mostrar errores de eliminación/actualización

  const handleShowAddMenuItem = (menuId) => {
    setShowAddMenuItem(prev => ({ ...prev, [menuId]: true }));
    setEditingMenuItem(null); // Asegurar que no estamos en modo edición
    setShowEditMenuItemModal(false);
    setError(null);
  };

  const handleCancelAddMenuItem = (menuId) => {
    setShowAddMenuItem(prev => ({ ...prev, [menuId]: false }));
    setError(null);
  };

  const handleShowEditMenuItem = (menuItem, menuId) => {
    console.log("Editando platillo:", menuItem, "del menuId:", menuId);
    setEditingMenuItem({ ...menuItem, menuId }); // Guardamos el platillo y su menuId
    setShowEditMenuItemModal(true);
    setShowAddMenuItem({}); // Ocultar formulario de añadir si estuviera abierto
    setError(null);
  };

  const handleCancelEditMenuItem = () => {
    setEditingMenuItem(null);
    setShowEditMenuItemModal(false);
    setError(null);
  };

  const handleItemAdded = async (menuId, newItem) => {
    console.log("Platillo añadido, actualizando UI:", newItem);
    
    // Simplemente cerrar el modal - la recarga se gestionará desde el componente AddMenuItem
    setShowAddMenuItem(prev => ({ ...prev, [menuId]: false }));
    
    // No es necesario hacer nada más aquí, la recarga de página se maneja en AddMenuItem
  };
  
  const handleItemUpdated = async (updatedItem) => {
    // No podemos usar setBusinesses ya que businesses es una prop, no un estado local
    // Actualmente esta función no se está usando porque hemos comentado AddMenuItem
    console.log("Item actualizado:", updatedItem);
    // Aquí idealmente debería llamarse a una función del componente padre para actualizar el estado
    // Por ahora, solo limpiar el estado local
    setEditingMenuItem(null);
    setShowEditMenuItemModal(false);
    setError(null);
  };

  const handleDeleteMenuItem = async (menuId, itemId, itemName, businessId) => {
    setError(null);
    if (window.confirm(`¿Estás seguro de que quieres eliminar el platillo "${itemName}"?`)) {
      try {
        await menuService.deleteMenuItem(itemId);
        // No podemos actualizar el estado businesses directamente
        // Idealmente, deberíamos llamar a una función del componente padre
        console.log(`Platillo ${itemName} (ID: ${itemId}) eliminado.`);
        // Podríamos recargar la página o pedir al padre que actualice los datos
        window.location.reload(); // Solución temporal
      } catch (err) {
        console.error("Error al eliminar el platillo:", err);
        setError(`Error al eliminar "${itemName}": ${err.message}`);
      }
    }
  };

  console.log("BusinessList: Recibiendo businesses:", JSON.parse(JSON.stringify(businesses)));

  return (
    <div className="space-y-10 w-full">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg shadow-sm">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Modal/Formulario para Editar Platillo */} 
      {showEditMenuItemModal && editingMenuItem && (
        <AddMenuItem 
          menuId={editingMenuItem.menuId} 
          onItemAdded={handleItemUpdated} 
          onCancel={handleCancelEditMenuItem}
          existingItem={editingMenuItem} 
          isEditing={true} 
        />
      )}

      {businesses.map(business => {
        const currentBusinessId = business.id;
        const hasMenu = business.menus && business.menus.length > 0 && business.menus[0] && business.menus[0].name;
        return (
          <div 
            key={business.id} 
            className="bg-white rounded-2xl shadow-2xl hover:shadow-2xl transition-all duration-300 overflow-visible border border-gray-100 w-full"
          >
            <div className="p-8 flex justify-between items-center">
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-[#E05C33] to-[#FF7E45] text-white p-4 rounded-xl mr-6 shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-[#1A3A54]">{business.name}</h3>
                  <p className="text-gray-600 mt-1.5 max-w-2xl text-lg">{business.description || 'Sin descripción'}</p>
                </div>
              </div>
              
              {/* Código QR con botones mejorados */}
              <div className="hidden md:flex flex-col items-center bg-white p-4 rounded-xl shadow-md border border-gray-100">
                <div className="text-center mb-2">
                  <p className="font-semibold text-[#1A3A54] text-lg">Código QR del Menú</p>
                </div>
                <QRCodeComponent businessId={business.id} businessName={business.name} qrCodeId={business.qrCodeId} />
                <p className="text-xs text-gray-500 mt-2 text-center">Escanea o descarga para compartir tu menú</p>
              </div>
            </div>
            <div className="animate-fadeIn px-4 md:px-12 pb-12 pt-4 border-t border-gray-200 bg-slate-50 w-full">
              {/* QR para móvil, diseño mejorado */}
              <div className="md:hidden mb-8 p-4 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#4A90E2] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  <h4 className="text-lg font-semibold text-[#1A3A54]">Código QR del Menú</h4>
                </div>
                <QRCodeComponent businessId={business.id} businessName={business.name} qrCodeId={business.qrCodeId} />
                <p className="text-xs text-gray-500 mt-2 text-center">Escanea o descarga para compartir tu menú</p>
              </div>
              
              <div className="flex items-center mb-8 hidden md:flex">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#4A90E2] mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h4 className="text-2xl font-semibold text-[#1A3A54]">Menú del Negocio</h4>
              </div>
              {hasMenu ? (
                <div className="w-full">
                  {business.menus.map(menu => (
                    <div 
                      key={menu.id} 
                      className="bg-gradient-to-br from-[#f8fafc] to-[#e6f0fa] p-0 rounded-3xl border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300 mb-10 overflow-visible w-full"
                    >
                      {/* Encabezado del menú */}
                      <div className="flex items-center gap-8 bg-gradient-to-r from-[#4A90E2] to-[#003A57] p-8 rounded-t-3xl">
                        <div className="bg-white p-4 rounded-xl shadow-md flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#4A90E2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h5 className="font-bold text-2xl xl:text-3xl text-white mb-2">{menu.name} <span className="text-xs text-blue-200 font-normal">#{menu.id}</span></h5>
                          <p className="text-lg text-blue-100 mb-1">{menu.description || 'Sin descripción'}</p>
                          <div className="flex flex-wrap gap-3 mt-1">
                            {menu.createdAt && (
                              <span className="bg-white/30 text-white/80 px-3 py-1 rounded-full text-xs font-semibold">Creado: {new Date(menu.createdAt).toLocaleDateString()}</span>
                            )}
                            {menu.updatedAt && (
                              <span className="bg-white/30 text-white/80 px-3 py-1 rounded-full text-xs font-semibold">Actualizado: {new Date(menu.updatedAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <span className="bg-white text-[#4A90E2] px-4 py-2 rounded-full text-base font-semibold shadow">ID: {menu.id}</span>
                      </div>
                      {/* Lista de platillos */}
                      <div className="p-10 bg-white rounded-b-3xl">
                        <h6 className="font-semibold text-[#E05C33] mb-8 text-2xl flex items-center gap-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-[#E05C33]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Platillos del Menú
                        </h6>
                        <ul className="mb-5 divide-y divide-gray-100">
                          {(menu.menuItems && menu.menuItems.length > 0) ? (
                            menu.menuItems.map(item => (
                              <li key={item.id} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between group gap-2 md:gap-0">
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                  {item.imageUri ? (
                                    <img
                                      src={item.imageUri}
                                      alt={item.name}
                                      className="w-20 h-20 object-cover rounded-lg border border-gray-200 shadow-sm"
                                    />
                                  ) : (
                                    <div className="w-20 h-20 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200 text-gray-400">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4-4a3 3 0 014 0l4 4M4 8h.01M20 8h.01" />
                                      </svg>
                                    </div>
                                  )}
                                  <div className="flex flex-col gap-1">
                                    <span className="font-bold text-gray-800 text-lg flex items-center gap-2">{item.name}
                                      <span className="text-xs text-gray-400 font-normal">#{item.id}</span>
                                    </span>
                                    <span className="text-sm text-gray-600 italic">{item.description || 'Sin descripción'}</span>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      <span className="bg-orange-50 text-[#E05C33] px-2 py-0.5 rounded-full text-sm font-semibold">${item.price}</span>
                                      {item.menuItemCategoryId && (
                                        <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-xs font-semibold">Cat. {item.menuItemCategoryId}</span>
                                      )}
                                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${item.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.isAvailable ? 'Disponible' : 'No disponible'}</span>
                                      {item.createdAt && (
                                        <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-xs">Creado: {new Date(item.createdAt).toLocaleDateString()}</span>
                                      )}
                                      {item.updatedAt && (
                                        <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-xs">Actualizado: {new Date(item.updatedAt).toLocaleDateString()}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 mt-2 md:mt-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <button 
                                    onClick={() => handleShowEditMenuItem(item, menu.id)} 
                                    className="p-2 rounded-md hover:bg-blue-100 text-blue-600 transition-colors"
                                    title="Editar Platillo"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteMenuItem(menu.id, item.id, item.name, currentBusinessId)}
                                    className="p-2 rounded-md hover:bg-red-100 text-red-600 transition-colors"
                                    title="Eliminar Platillo"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </li>
                            ))
                          ) : (
                            <li className="text-gray-500 text-base py-4">No hay platillos en este menú.</li>
                          )}
                        </ul>
                        {showAddMenuItem[menu.id] ? (
                          <AddMenuItem 
                            menuId={menu.id} 
                            onItemAdded={(item) => handleItemAdded(menu.id, item)} 
                            onCancel={() => handleCancelAddMenuItem(menu.id)} 
                          />
                        ) : (
                          <button
                            className="mt-3 px-7 py-3 bg-gradient-to-r from-[#E05C33] to-[#FF7E45] text-white rounded-lg shadow hover:brightness-110 transition-colors text-lg font-semibold flex items-center gap-2.5"
                            onClick={() => handleShowAddMenuItem(menu.id)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Agregar Platillo
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-dashed border-gray-300 rounded-lg p-10 text-center shadow-sm">
                  <div className="bg-gradient-to-r from-[#EBF5F9] to-[#E6F4F8] inline-flex p-5 rounded-full mb-5 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-[#4A90E2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  </div>
                  <p className="text-gray-600 mb-6 text-xl">No hay menú para este negocio.</p>
                  <p className="text-gray-600 mb-6 text-base">Cada negocio solo puede tener un menú en la plataforma.</p>
                  <button 
                    onClick={() => onAddMenuClick(business.id)}
                    className="inline-flex items-center px-7 py-3.5 bg-gradient-to-r from-[#E05C33] to-[#FF7E45] text-white rounded-lg transition-all duration-300 font-medium shadow-md hover:shadow-lg hover:brightness-110 text-base"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Crear menú para tu negocio
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
} 