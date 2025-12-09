import React, { useState, useEffect } from "react";
import menuService from "../services/menuService";
import AddMenuItem from "./AddMenuItem";
import QRCodeComponent from "./QRCodeComponent";
import SectionManager from "./SectionManager";
import MenuCardGenerator from "./FlyerEditor/MenuCardGenerator";
import PromotionalFlyerGenerator from "./FlyerEditor/PromotionalFlyerGenerator";
import SavedFlyersList from "./FlyerEditor/SavedFlyersList";
import { compareIds, normalizeMenuItemIds } from '../utils/idNormalization';

export default function BusinessList({
	businesses,
	onAddMenuClick,
	onEditBusinessClick,
	setBusinesses,
	onMenuScanner,
	onRefresh,
}) {
	const [showAddMenuItem, setShowAddMenuItem] = useState({});
	const [menuItemToEdit, setMenuItemToEdit] = useState(null);
	const [showQr, setShowQr] = useState(null);
	const [showSectionManager, setShowSectionManager] = useState(null);
	const [selectedSection, setSelectedSection] = useState(null);
	const [selectedMenuId, setSelectedMenuId] = useState(null);
	const [selectedBusinessCurrency, setSelectedBusinessCurrency] = useState(0); // Default USD
	const [showMenuCard, setShowMenuCard] = useState(null); // { businessId, menuId }
	const [showPromotionalFlyer, setShowPromotionalFlyer] = useState(null); // { businessId, menuId }
	const [showSavedFlyers, setShowSavedFlyers] = useState(null); // { menuId }
	const [isRefreshing, setIsRefreshing] = useState(false);

	// Función para refrescar datos desde el servidor
	const handleRefreshBusinessData = async () => {
		try {
			setIsRefreshing(true);
			console.log('Refrescando datos de negocios desde servidor...');

			// Usar el callback onRefresh proporcionado por UserDashboard
			if (onRefresh && typeof onRefresh === 'function') {
				await onRefresh();
				console.log('Datos de negocios actualizados correctamente vía callback');
			} else {
				console.error('onRefresh no es una función o no está disponible');
				// Fallback: Obtener datos actualizados del servidor
				const updatedBusinesses = await menuService.getUserBusinesses();
				setBusinesses(updatedBusinesses);
			}
		} catch (error) {
			console.error('Error al refrescar datos:', error);
		} finally {
			setIsRefreshing(false);
		}
	};

	// Sin polling automático - las actualizaciones ocurren solo cuando el usuario realiza acciones

	const handleShowAddMenuItem = (menuId, sectionId = null, businessCurrency = 0) => {
		setShowAddMenuItem({ ...showAddMenuItem, [menuId]: true });
		setMenuItemToEdit(null);
		setSelectedSection(sectionId);
		setSelectedMenuId(menuId);
		setSelectedBusinessCurrency(businessCurrency);
	};

	const handleCancelAddMenuItem = (menuId) => {
		setShowAddMenuItem({ ...showAddMenuItem, [menuId]: false });
		setSelectedMenuId(null);
	};

	const handleShowEditMenuItem = (menuItem, menuId, businessCurrency = 0, sectionId = null) => {
		setMenuItemToEdit({
			...menuItem,
			menuId: menuId,
			sectionId: sectionId || menuItem.sectionId || null,
		});
		setShowAddMenuItem({ ...showAddMenuItem, [menuId]: true });
		setSelectedMenuId(menuId);
		setSelectedBusinessCurrency(businessCurrency);
		setSelectedSection(sectionId || menuItem.sectionId || null);
	};

	const handleCancelEditMenuItem = () => {
		setMenuItemToEdit(null);
		setShowAddMenuItem({});
		setSelectedMenuId(null);
	};

	const handleItemAdded = async (menuId, newItem) => {
		try {
			const normalizedNewItem = normalizeMenuItemIds(newItem);
			console.log('Agregando item con IDs normalizados:', normalizedNewItem);

			setBusinesses((prevBusinesses) =>
				prevBusinesses.map((business) => ({
					...business,
					menus: business.menus?.map((menu) =>
						compareIds(menu.id, menuId)  // ← COMPARACIÓN SEGURA
							? {
									...menu,
									menuItems: [...(menu.menuItems || []), normalizedNewItem],
									sections: menu.sections?.map((section) =>
										compareIds(section.id, normalizedNewItem.sectionId)  // ← COMPARACIÓN SEGURA
											? {
													...section,
													menuItems: [...(section.menuItems || []), normalizedNewItem],
												}
											: section,
									),
								}
							: menu,
					),
				})),
			);
		} catch (error) {
			console.error('Error adding item:', error);
		}
	};

	const handleItemUpdated = async (updatedItem) => {
		try {
			const normalizedItem = normalizeMenuItemIds(updatedItem);
			console.log('Actualizando item con IDs normalizados:', normalizedItem);

			setBusinesses((prevBusinesses) =>
				prevBusinesses.map((business) => ({
					...business,
					menus: business.menus?.map((menu) => {
						// Encontrar el item actual y ver si cambió de sección usando comparaciones seguras
						let oldSectionId = null;
						menu.sections?.forEach((section) => {
							const found = section.menuItems?.find(item => compareIds(item.id, normalizedItem.id));
							if (found) {
								oldSectionId = section.id;
							}
						});

						const changedSection = !compareIds(oldSectionId, normalizedItem.sectionId);

						// Actualizar en menuItems general del menú
						const updatedMenuItems = menu.menuItems?.map((item) =>
							compareIds(item.id, normalizedItem.id)
								? { ...item, ...normalizedItem }
								: item
						) || [];

						// Actualizar en secciones
						const updatedSections = menu.sections?.map((section) => {
							// Si cambió de sección
							if (changedSection) {
								// Eliminar de la sección anterior
								if (compareIds(section.id, oldSectionId)) {
									return {
										...section,
										menuItems: section.menuItems?.filter((item) => !compareIds(item.id, normalizedItem.id)) || [],
									};
								}
								// Agregar a la nueva sección
								if (compareIds(section.id, normalizedItem.sectionId)) {
									return {
										...section,
										menuItems: [...(section.menuItems || []), normalizedItem],
									};
								}
								// Otras secciones: sin cambios
								return section;
							}

							// Si NO cambió de sección, solo actualizar en su sección actual
							if (compareIds(section.id, oldSectionId)) {
								return {
									...section,
									menuItems: section.menuItems?.map((item) =>
										compareIds(item.id, normalizedItem.id)
											? { ...item, ...normalizedItem }
											: item
									) || [],
								};
							}

							// Otras secciones: sin cambios
							return section;
						}) || [];

						return {
							...menu,
							menuItems: updatedMenuItems,
							sections: updatedSections,
						};
					}),
				})),
			);

			console.log('Item actualizado correctamente');
		} catch (error) {
			console.error('Error updating item:', error);
		}
	};

	const handleLoadFlyer = (flyer, businessId, menuId) => {
		setShowSavedFlyers(null);

		// Parse the data with error handling
		let selectedItemIds = [];
		let itemsOrder = [];

		try {
			selectedItemIds = flyer.selectedItemIds ? JSON.parse(flyer.selectedItemIds) : [];
		} catch (error) {
			console.error('Error parsing selectedItemIds:', error);
		}

		try {
			itemsOrder = flyer.itemsOrder ? JSON.parse(flyer.itemsOrder) : [];
		} catch (error) {
			console.error('Error parsing itemsOrder:', error);
		}

		// Open the appropriate editor with the saved configuration
		if (flyer.type === 'carta') {
			setShowMenuCard({
				businessId,
				menuId,
				savedFlyer: {
					id: flyer.id,
					name: flyer.name,
					templateId: flyer.templateId,
					itemsOrder: itemsOrder,
					paperSize: flyer.paperSize
				}
			});
		} else {
			setShowPromotionalFlyer({
				businessId,
				menuId,
				savedFlyer: {
					id: flyer.id,
					name: flyer.name,
					templateId: flyer.templateId,
					selectedItemIds: selectedItemIds,
					paperSize: flyer.paperSize
				}
			});
		}
	};

	const handleDeleteMenuItem = async (menuId, itemId, itemName, businessId) => {
		if (!confirm(`¿Estás seguro de que quieres eliminar "${itemName}"?`)) {
			return;
		}

		try {
			await menuService.deleteMenuItem(itemId);
			console.log('Eliminando item con ID:', itemId);

			setBusinesses((prevBusinesses) =>
				prevBusinesses.map((business) => ({
					...business,
					menus: business.menus?.map((menu) => ({
						...menu,
						menuItems: menu.menuItems?.filter((item) => !compareIds(item.id, itemId)) || [],  // ← COMPARACIÓN SEGURA
						sections: menu.sections?.map((section) => ({
							...section,
							menuItems: section.menuItems?.filter(
								(item) => !compareIds(item.id, itemId),  // ← COMPARACIÓN SEGURA
							) || [],
						})),
					})),
				})),
			);

			alert(`Plato "${itemName}" eliminado correctamente.`);
		} catch (error) {
			alert(`Error al eliminar el plato: ${error.message}`);
		}
	};

	const handleManageSections = (menuId) => {
		setShowSectionManager(menuId);
	};

	const handleSectionAdded = async (newSection) => {
		try {
			setBusinesses((prevBusinesses) =>
				prevBusinesses.map((business) => ({
					...business,
					menus: business.menus?.map((menu) =>
						menu.id === newSection.menuId
							? {
									...menu,
									sections: [
										...(menu.sections || []),
										{ ...newSection, menuItems: [] },
									],
								}
							: menu,
					),
				})),
			);
		} catch (error) {}
	};

	return (
		<div className="space-y-6 sm:space-y-8 lg:space-y-10">
			{/* Indicador de refresco */}
			{isRefreshing && (
				<div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg mb-6 flex items-center">
					<div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent mr-3"></div>
					<p className="text-blue-700 font-medium">Actualizando datos...</p>
				</div>
			)}

			{businesses.map((business) => (
				<div
					key={business.id}
					className="neo-card-3d overflow-hidden transform transition-all duration-300 hover:scale-[1.02]"
				>
					<div className="relative bg-neo-flame border-b-neo-thick border-neo-black p-4 sm:p-5 lg:p-6 text-white">
						<div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
							<div className="lg:col-span-8">
								<div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
									{(business.imageUrl || business.imageKey) && (
										<div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-white rounded-lg overflow-hidden border-2 border-white/20">
											<img
												src={business.imageUrl || business.imageKey}
												alt={business.name}
												className="w-full h-full object-cover"
												onError={(e) => {
													e.target.style.display = 'none';
													e.target.nextElementSibling.style.display = 'flex';
												}}
											/>
											<div className="w-full h-full bg-white/10 flex items-center justify-center" style={{display: 'none'}}>
												<svg className="w-6 h-6 sm:w-8 sm:h-8 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
												</svg>
											</div>
										</div>
									)}
									<div className="min-w-0 flex-1">
										<h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 lg:mb-2 truncate">{business.name}</h2>
										<p className="text-white text-opacity-90 text-sm sm:text-base lg:text-lg">
											{business.businessCategory?.name || "Sin categoría"}
										</p>
									</div>
								</div>
								<div className="mt-2 sm:mt-3 flex flex-wrap gap-1.5 sm:gap-2">
									{business.address && (
										<span className="bg-white bg-opacity-10 py-1 px-2 sm:px-3 rounded-full text-xs flex items-center">
											<svg
												className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 flex-shrink-0"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
												/>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
												/>
											</svg>
											{business.address}
										</span>
									)}
									{business.phoneNumber && (
										<span className="bg-white bg-opacity-10 py-1 px-2 sm:px-3 rounded-full text-xs flex items-center">
											<svg
												className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 flex-shrink-0"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
												/>
											</svg>
											{business.phoneNumber}
										</span>
									)}
									{business.email && (
										<span className="bg-white bg-opacity-10 py-1 px-2 sm:px-3 rounded-full text-xs flex items-center">
											<svg
												className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 flex-shrink-0"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
												/>
											</svg>
											{business.email}
										</span>
									)}
								</div>

								{(business.facebookUrl || business.instagramUrl || business.twitterUrl || business.whatsAppNumber) && (
									<div className="mt-2 sm:mt-3 flex flex-wrap gap-1.5 sm:gap-2">
										{business.facebookUrl && (
											<a
												href={business.facebookUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="bg-white bg-opacity-20 hover:bg-opacity-30 py-1 sm:py-1.5 px-2 sm:px-3 rounded-full text-xs flex items-center transition-all"
											>
												<svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
													<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
												</svg>
												Facebook
											</a>
										)}
										{business.instagramUrl && (
											<a
												href={business.instagramUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="bg-white bg-opacity-20 hover:bg-opacity-30 py-1 sm:py-1.5 px-2 sm:px-3 rounded-full text-xs flex items-center transition-all"
											>
												<svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
													<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
												</svg>
												Instagram
											</a>
										)}
										{business.twitterUrl && (
											<a
												href={business.twitterUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="bg-white bg-opacity-20 hover:bg-opacity-30 py-1 sm:py-1.5 px-2 sm:px-3 rounded-full text-xs flex items-center transition-all"
											>
												<svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
													<path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
												</svg>
												Twitter
											</a>
										)}
										{business.whatsAppNumber && (
											<a
												href={`https://wa.me/${business.whatsAppNumber.replace(/[^0-9]/g, '')}`}
												target="_blank"
												rel="noopener noreferrer"
												className="bg-white bg-opacity-20 hover:bg-opacity-30 py-1 sm:py-1.5 px-2 sm:px-3 rounded-full text-xs flex items-center transition-all"
											>
												<svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
													<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
												</svg>
												WhatsApp
											</a>
										)}
									</div>
								)}
							</div>
							<div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto mt-4 lg:mt-0">
								<button
									onClick={() => {
                                        if (business.slug) {
                                            window.open(`/${business.slug}`, '_blank');
                                        } else {
                                            alert('Este negocio no tiene una URL pública configurada correctamente.');
                                        }
                                    }}
									className={`neo-btn neo-btn-white text-xs sm:text-sm flex items-center justify-center flex-1 sm:flex-initial min-w-[100px] ${!business.slug ? 'opacity-50 cursor-not-allowed' : ''}`}
									title={business.slug ? "Ver Landing Page pública" : "URL no disponible"}
                                    disabled={!business.slug}
								>
									<svg className="h-4 w-4 mr-1 sm:mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
									</svg>
									Ver Web
								</button>
								<button
									onClick={() => onEditBusinessClick(business)}
									className="neo-btn neo-btn-white text-xs sm:text-sm flex items-center justify-center flex-1 sm:flex-initial min-w-[100px]"
								>
									<svg
										className="h-4 w-4 mr-1 sm:mr-1.5 flex-shrink-0"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
										/>
									</svg>
									Editar
								</button>
								<button
									onClick={() => setShowQr(business.id)}
									className="neo-btn neo-btn-white text-xs sm:text-sm flex items-center justify-center flex-1 sm:flex-initial min-w-[100px]"
								>
									<svg
										className="h-4 w-4 mr-1 sm:mr-1.5 flex-shrink-0"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
										/>
									</svg>
									Ver QR
								</button>
							</div>
						</div>
					</div>

					<div className="p-4 sm:p-5 md:p-6">
						{business.menus && business.menus.length > 0 ? (
							business.menus.map((menu) => (
								<div key={menu.id} className="mb-4 sm:mb-6">
									<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
										<h3 className="text-lg sm:text-xl font-bold text-[#1A3A54] flex items-center">
											<svg
												className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-[#1a1a1a] flex-shrink-0"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
												/>
											</svg>
											{menu.name}
										</h3>
										<div className="flex flex-wrap gap-2 w-full sm:w-auto">
											<button
												onClick={() => handleManageSections(menu.id)}
												className="neo-btn neo-btn-secondary text-xs sm:text-sm flex items-center justify-center flex-1 sm:flex-initial"
											>
												<svg
													className="h-4 w-4 mr-1 sm:mr-1.5 flex-shrink-0"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M4 6h16M4 12h16M4 18h7"
													/>
												</svg>
												Secciones
											</button>
											<button
												onClick={() => setShowMenuCard({ businessId: business.id, menuId: menu.id })}
												className="neo-btn neo-btn-white text-xs sm:text-sm flex items-center justify-center flex-1 sm:flex-initial"
												title="Carta completa para imprimir"
											>
												<svg
													className="h-4 w-4 mr-1 sm:mr-1.5 flex-shrink-0"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
													/>
												</svg>
												Crear Carta
											</button>
											<button
												onClick={() => setShowPromotionalFlyer({ businessId: business.id, menuId: menu.id })}
												className="neo-btn neo-btn-white text-xs sm:text-sm flex items-center justify-center flex-1 sm:flex-initial"
												title="Folleto promocional"
											>
												<svg
													className="h-4 w-4 mr-1 sm:mr-1.5 flex-shrink-0"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
													/>
												</svg>
												Crear Folleto
											</button>
											<button
												onClick={() => setShowSavedFlyers({ businessId: business.id, menuId: menu.id })}
												className="neo-btn neo-btn-secondary text-xs sm:text-sm flex items-center justify-center flex-1 sm:flex-initial"
												title="Ver folletos y cartas guardados"
											>
												<svg
													className="h-4 w-4 mr-1 sm:mr-1.5 flex-shrink-0"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"
													/>
												</svg>
												Ver Guardados
											</button>
											<button
												onClick={() => {
													setSelectedSection(null);
													handleShowAddMenuItem(menu.id, null, business.defaultCurrency);
												}}
												className="neo-btn neo-btn-primary text-xs sm:text-sm flex items-center justify-center flex-1 sm:flex-initial"
											>
												<svg
													className="h-4 w-4 mr-1 sm:mr-1.5 flex-shrink-0"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M12 6v6m0 0v6m0-6h6m-6 0H6"
													/>
												</svg>
												Añadir Plato
											</button>
											{onMenuScanner && (
												<button
													onClick={() => onMenuScanner(business.id, menu.id)}
													className="neo-btn neo-btn-secondary text-xs sm:text-sm flex items-center justify-center flex-1 sm:flex-initial"
													title="Escanear menú con IA"
												>
													<svg
														className="h-4 w-4 mr-1 sm:mr-1.5 flex-shrink-0"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M3 9a2 2 0 00-2 2v4a2 2 0 002 2h2a2 2 0 002 2v4a2 2 0 002 2H7a2 2 0 00-2-2V9a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
														/>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M12 2l3.096 3.096m0 0L7.804 7.804m8.192 8.192a1 1 0 011.414 0l3.096 3.096m-3.096 0L7.804 7.804m8.192 8.192a1 1 0 011.414 0l3.096 3.096"
														/>
													</svg>
													Escanear Menu
												</button>
											)}
										</div>
									</div>

									{menu.description && (
										<p className="text-gray-600 mb-4">{menu.description}</p>
									)}

									{menu.sections && menu.sections.length > 0 ? (
										<div className="space-y-6">
											{menu.sections
												.sort((a, b) => a.order - b.order)
												.map((section) => (
													<div key={section.id} className="space-y-4">
														<div className="flex justify-between items-center">
															<h4 className="text-lg font-bold text-[#1A3A54] flex items-center">
																<svg
																	className="h-4 w-4 mr-2 text-[#1a1a1a]"
																	fill="none"
																	viewBox="0 0 24 24"
																	stroke="currentColor"
																>
																	<path
																		strokeLinecap="round"
																		strokeLinejoin="round"
																		strokeWidth={2}
																		d="M4 6h16M4 12h16M4 18h7"
																	/>
																</svg>
																{section.name}
															</h4>
															<button
																onClick={() => {
																	setSelectedSection(section.id);
																	handleShowAddMenuItem(menu.id, section.id, business.defaultCurrency);
																}}
																className="neo-btn neo-btn-primary neo-btn-sm flex items-center"
															>
																<svg
																	className="h-3.5 w-3.5 mr-1"
																	fill="none"
																	viewBox="0 0 24 24"
																	stroke="currentColor"
																>
																	<path
																		strokeLinecap="round"
																		strokeLinejoin="round"
																		strokeWidth={2}
																		d="M12 6v6m0 0v6m0-6h6m-6 0H6"
																	/>
																</svg>
																Añadir Plato
															</button>
														</div>

														{section.menuItems &&
														section.menuItems.length > 0 ? (
															<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
																{section.menuItems.map((item) => (
																	<div
																		key={item.id}
																		className="flex border rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition-all duration-300 relative group"
																	>
																		<img
																			src={
																				item.imageUri ||
																				"https://ooni.com/cdn/shop/articles/20220211142347-margherita-9920_ba86be55-674e-4f35-8094-2067ab41a671.jpg?v=1737104576&width=1080"
																			}
																			alt={item.name}
																			className="w-20 h-20 object-cover rounded-lg mr-3 flex-shrink-0"
																		/>
																		<div className="flex-1 min-w-0">
																			<div className="flex justify-between items-start">
																				<h5 className="font-semibold text-[#1A3A54] truncate">
																					{item.name}
																				</h5>
																				<span className="text-[#1a1a1a] font-bold">
																					${item.price.toFixed(2)}
																				</span>
																			</div>
																			<p className="text-gray-600 text-sm line-clamp-2">
																				{item.description}
																			</p>
																			<div className="mt-2 flex justify-between items-center">
																				<span
																					className={`text-xs px-2 py-0.5 rounded-full ${
																						item.isAvailable
																							? "bg-green-100 text-green-800"
																							: "bg-red-100 text-red-800"
																					}`}
																				>
																					{item.isAvailable
																						? "Disponible"
																						: "No disponible"}
																				</span>
																				<div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
																					<button
																						onClick={() =>
																							handleShowEditMenuItem(
																								item,
																								menu.id,
																								business.defaultCurrency,
																								section.id,
																							)
																						}
																						className="text-blue-600 hover:text-blue-800 p-1"
																						aria-label="Editar plato"
																					>
																						<svg
																							className="h-4 w-4"
																							fill="none"
																							viewBox="0 0 24 24"
																							stroke="currentColor"
																						>
																							<path
																								strokeLinecap="round"
																								strokeLinejoin="round"
																								strokeWidth={2}
																								d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
																							/>
																						</svg>
																					</button>
																					<button
																						onClick={() =>
																							handleDeleteMenuItem(
																								menu.id,
																								item.id,
																								item.name,
																								business.id,
																							)
																						}
																						className="text-red-600 hover:text-red-800 p-1"
																						aria-label="Eliminar plato"
																					>
																						<svg
																							className="h-4 w-4"
																							fill="none"
																							viewBox="0 0 24 24"
																							stroke="currentColor"
																						>
																							<path
																								strokeLinecap="round"
																								strokeLinejoin="round"
																								strokeWidth={2}
																								d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
																							/>
																						</svg>
																					</button>
																				</div>
																			</div>
																		</div>
																	</div>
																))}
															</div>
														) : (
															<div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-2 rounded">
																<p className="text-sm text-yellow-700">
																	No hay platos en esta sección.
																</p>
															</div>
														)}
													</div>
												))}
										</div>
									) : (
										<div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded">
											<p className="text-sm text-yellow-700">
												Este menú no tiene secciones todavía. Usa el botón
												"Secciones" para crearlas y empezar a añadir platos.
											</p>
										</div>
									)}
								</div>
							))
						) : (
							<div className="flex flex-col items-center justify-center py-8">
								<div className="bg-blue-50 p-6 rounded-xl w-full max-w-md text-center">
									<svg
										className="h-12 w-12 mx-auto text-blue-500 mb-4"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
										/>
									</svg>
									<h3 className="text-lg font-semibold text-blue-800 mb-2">
										No tienes un menú todavía
									</h3>
									<p className="text-blue-600 mb-6">
										Añade un menú para comenzar a mostrar tus platos a tus
										clientes
									</p>
									<button
										onClick={() => onAddMenuClick(business.id)}
										className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
									>
										Añadir Menú
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			))}

			{selectedMenuId && showAddMenuItem[selectedMenuId] && (
				<AddMenuItem
					menuId={selectedMenuId}
					sectionId={selectedSection}
					businessCurrency={selectedBusinessCurrency}
					onItemAdded={(newItem) => {
						if (menuItemToEdit) {
							handleItemUpdated(newItem);
						} else {
							handleItemAdded(selectedMenuId, newItem);
						}
					}}
					onCancel={() => {
						menuItemToEdit
							? handleCancelEditMenuItem()
							: handleCancelAddMenuItem(selectedMenuId);
						setSelectedSection(null);
					}}
					onRefresh={handleRefreshBusinessData}
					existingItem={menuItemToEdit}
					isEditing={!!menuItemToEdit}
				/>
			)}

			{showQr && (() => {
				const business = businesses.find(b => b.id === showQr);
				const menu = business?.menus?.[0];
				// Buscar qrCodeId en diferentes formatos (camelCase y PascalCase por si acaso)
				const qrCodeId = menu?.qrCodeId || menu?.QrCodeId || menu?.qrCode || menu?.QrCode;
				
				console.log('DEBUG QR Modal:', {
					business,
					menu,
					qrCodeId,
					menuKeys: menu ? Object.keys(menu) : []
				});
				
				return (
                    <QRCodeComponent 
                        businessName={business?.name}
                        businessLogoUrl={business?.logoUri || business?.imageUrl || business?.heroImageUri || null}
                        qrCodeId={qrCodeId}
                        menuId={menu?.id}
                        onClose={() => setShowQr(null)} 
                    />
                );
            })()}

			{showSectionManager && (
				<SectionManager
					menuId={showSectionManager}
					onClose={() => setShowSectionManager(null)}
					onSectionAdded={handleSectionAdded}
				/>
			)}

			{showMenuCard && (() => {
				const business = businesses.find(b => b.id === showMenuCard.businessId);
				const menu = business?.menus?.find(m => m.id === showMenuCard.menuId);
				const menuItems = menu?.sections?.flatMap(section => section.menuItems || []) || [];

				if (!business || !menu) {
					return null;
				}

				return (
					<MenuCardGenerator
						business={business}
						menu={menu}
						menuItems={menuItems}
						onClose={() => setShowMenuCard(null)}
						savedFlyer={showMenuCard.savedFlyer}
					/>
				);
			})()}

			{showPromotionalFlyer && (() => {
				const business = businesses.find(b => b.id === showPromotionalFlyer.businessId);
				const menu = business?.menus?.find(m => m.id === showPromotionalFlyer.menuId);
				const menuItems = menu?.sections?.flatMap(section => section.menuItems || []) || [];

				return (
					<PromotionalFlyerGenerator
						business={business}
						menu={menu}
						menuItems={menuItems}
						onClose={() => setShowPromotionalFlyer(null)}
						savedFlyer={showPromotionalFlyer.savedFlyer}
					/>
				);
			})()}

			{showSavedFlyers && (() => {
				const menu = businesses
					.find(b => b.id === showSavedFlyers.businessId)
					?.menus?.find(m => m.id === showSavedFlyers.menuId);

				return (
					<SavedFlyersList
						menu={menu}
						onClose={() => setShowSavedFlyers(null)}
						onLoadFlyer={(flyer) => handleLoadFlyer(flyer, showSavedFlyers.businessId, showSavedFlyers.menuId)}
					/>
				);
			})()}
		</div>
	);
}
