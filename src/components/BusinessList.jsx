import React, { useState } from 'react';

export default function BusinessList({ businesses, onAddMenuClick }) {
  const [expandedBusiness, setExpandedBusiness] = useState(null);

  const toggleExpand = (businessId) => {
    setExpandedBusiness(expandedBusiness === businessId ? null : businessId);
  };

  return (
    <div className="space-y-8">
      {businesses.map(business => (
        <div 
          key={business.id} 
          className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
        >
          <div 
            className="p-7 cursor-pointer transition-all hover:bg-slate-50 flex justify-between items-center"
            onClick={() => toggleExpand(business.id)}
          >
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-[#E05C33] to-[#FF7E45] text-white p-3.5 rounded-xl mr-5 shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#1A3A54]">{business.name}</h3>
                <p className="text-gray-600 mt-1 max-w-xl">{business.description || 'Sin descripción'}</p>
              </div>
            </div>
            <div className="flex items-center">
              {(!business.menus || business.menus.length === 0) && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onAddMenuClick(business.id);
                }}
                  className="bg-gradient-to-r from-[#E05C33] to-[#FF7E45] text-white font-medium py-2.5 px-5 rounded-lg mr-4 transition-all duration-300 shadow-md hover:shadow-lg flex items-center space-x-2 hover:brightness-110"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Añadir Menú</span>
              </button>
              )}
              <div className={`bg-slate-100 p-2.5 rounded-full transition-transform duration-300 shadow-sm ${expandedBusiness === business.id ? 'rotate-180 bg-blue-50' : ''}`}>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-5 w-5 ${expandedBusiness === business.id ? 'text-[#4A90E2]' : 'text-[#1A3A54]'}`}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          
          {expandedBusiness === business.id && (
            <div className="animate-fadeIn px-7 pb-7 pt-2 border-t border-gray-200 bg-slate-50">
              <div className="flex items-center mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#4A90E2] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h4 className="text-lg font-semibold text-[#1A3A54]">Menú del Negocio</h4>
              </div>

              {business.menus && business.menus.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {business.menus.map(menu => (
                    <div 
                      key={menu.id} 
                      className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-start">
                        <div className="bg-gradient-to-br from-[#4A90E2] to-[#003A57] p-3 rounded-lg mr-3 shadow-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-[#1A3A54] text-lg">{menu.name}</h5>
                          <p className="text-sm text-gray-600 mt-1 mb-3">{menu.description || 'Sin descripción'}</p>
                          <a 
                            href={`/menu/${menu.id}`} 
                            className="inline-flex items-center text-sm font-medium text-[#E05C33] hover:text-[#FF7E45] transition-colors mt-2 group"
                          >
                            <span>Ver detalles</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-dashed border-gray-300 rounded-lg p-8 text-center shadow-sm">
                  <div className="bg-gradient-to-r from-[#EBF5F9] to-[#E6F4F8] inline-flex p-4 rounded-full mb-4 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#4A90E2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  </div>
                  <p className="text-gray-600 mb-5 text-lg">No hay menú para este negocio.</p>
                  <p className="text-gray-600 mb-5">Cada negocio solo puede tener un menú en la plataforma.</p>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddMenuClick(business.id);
                    }}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#E05C33] to-[#FF7E45] text-white rounded-lg transition-all duration-300 font-medium shadow-md hover:shadow-lg hover:brightness-110"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Crear menú para tu negocio
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 