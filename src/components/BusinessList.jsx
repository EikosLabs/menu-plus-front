import React, { useState } from "react";
import menuService from "../services/menuService";
import AddMenuItem from "./AddMenuItem";
import QRCodeComponent from "./QRCodeComponent";
import SectionManager from "./SectionManager";

export default function BusinessList({
	businesses,
	onAddMenuClick,
	setBusinesses,
}) {
	const [showAddMenuItem, setShowAddMenuItem] = useState({});
	const [menuItemToEdit, setMenuItemToEdit] = useState(null);
	const [showQr, setShowQr] = useState(null);
	const [showSectionManager, setShowSectionManager] = useState(null);
	const [selectedSection, setSelectedSection] = useState(null);
	const [selectedMenuId, setSelectedMenuId] = useState(null);

	const handleShowAddMenuItem = (menuId, sectionId = null) => {
		setShowAddMenuItem({ ...showAddMenuItem, [menuId]: true });
		setMenuItemToEdit(null);
		setSelectedSection(sectionId);
		setSelectedMenuId(menuId);
	};

	const handleCancelAddMenuItem = (menuId) => {
		setShowAddMenuItem({ ...showAddMenuItem, [menuId]: false });
		setSelectedMenuId(null);
	};

	const handleShowEditMenuItem = (menuItem, menuId) => {
		setMenuItemToEdit({
			...menuItem,
			menuId: menuId,
		});
		setShowAddMenuItem({ ...showAddMenuItem, [menuId]: true });
		setSelectedMenuId(menuId);
	};

	const handleCancelEditMenuItem = () => {
		setMenuItemToEdit(null);
		setShowAddMenuItem({});
		setSelectedMenuId(null);
	};

	const handleItemAdded = async (menuId, newItem) => {
		try {
			setBusinesses((prevBusinesses) =>
				prevBusinesses.map((business) => ({
					...business,
					menus: business.menus?.map((menu) =>
						menu.id === menuId
							? {
									...menu,
									menuItems: [...(menu.menuItems || []), newItem],
									sections: menu.sections?.map((section) =>
										section.id === newItem.sectionId
											? {
													...section,
													menuItems: [...(section.menuItems || []), newItem],
												}
											: section,
									),
								}
							: menu,
					),
				})),
			);
		} catch (error) {}
	};

	const handleItemUpdated = async (updatedItem) => {
		try {
			setBusinesses((prevBusinesses) =>
				prevBusinesses.map((business) => ({
					...business,
					menus: business.menus?.map((menu) => ({
						...menu,
						menuItems: menu.menuItems?.map((item) =>
							item.id === updatedItem.id ? { ...item, ...updatedItem } : item,
						),
						sections: menu.sections?.map((section) => ({
							...section,
							menuItems: section.menuItems?.map((item) =>
								item.id === updatedItem.id ? { ...item, ...updatedItem } : item,
							),
						})),
					})),
				})),
			);
		} catch (error) {}
	};

	const handleDeleteMenuItem = async (menuId, itemId, itemName, businessId) => {
		if (!confirm(`¿Estás seguro de que quieres eliminar "${itemName}"?`)) {
			return;
		}

		try {
			await menuService.deleteMenuItem(itemId);

			setBusinesses((prevBusinesses) =>
				prevBusinesses.map((business) => ({
					...business,
					menus: business.menus?.map((menu) => ({
						...menu,
						menuItems: menu.menuItems?.filter((item) => item.id !== itemId),
						sections: menu.sections?.map((section) => ({
							...section,
							menuItems: section.menuItems?.filter(
								(item) => item.id !== itemId,
							),
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
		<div className="space-y-6">
			{businesses.map((business) => (
				<div
					key={business.id}
					className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100 transform transition-all duration-300 hover:shadow-xl"
				>
					<div className="relative bg-gradient-to-r from-[#003A57] to-[#004E71] p-6 text-white">
						<div className="flex justify-between items-start">
							<div>
								<h2 className="text-2xl font-bold mb-1">{business.name}</h2>
								<p className="text-blue-100 text-sm">
									Categoría:{" "}
									{business.businessCategory?.name || "Sin categoría"}
								</p>
								<div className="mt-3 flex flex-wrap gap-2">
									{business.address && (
										<span className="bg-white bg-opacity-10 py-1 px-3 rounded-full text-xs flex items-center">
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
										<span className="bg-white bg-opacity-10 py-1 px-3 rounded-full text-xs flex items-center">
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
													d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
												/>
											</svg>
											{business.phoneNumber}
										</span>
									)}
									{business.email && (
										<span className="bg-white bg-opacity-10 py-1 px-3 rounded-full text-xs flex items-center">
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
													d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
												/>
											</svg>
											{business.email}
										</span>
									)}
								</div>
							</div>
							<div className="flex gap-2">
								<button
									onClick={() => setShowQr(business.id)}
									className="bg-white text-[#003A57] px-4 py-2 rounded-lg shadow-md hover:bg-opacity-90 font-medium text-sm flex items-center transition-all duration-300 transform hover:scale-105"
								>
									<svg
										className="h-4 w-4 mr-1.5"
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

					<div className="p-6">
						{business.menus && business.menus.length > 0 ? (
							business.menus.map((menu) => (
								<div key={menu.id} className="mb-6">
									<div className="flex justify-between items-center mb-4">
										<h3 className="text-xl font-bold text-[#1A3A54] flex items-center">
											<svg
												className="h-5 w-5 mr-2 text-[#1a1a1a]"
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
										<div className="flex space-x-2">
											<button
												onClick={() => handleManageSections(menu.id)}
												className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 font-medium text-sm flex items-center transition-all duration-300"
											>
												<svg
													className="h-4 w-4 mr-1.5"
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
												onClick={() => {
													setSelectedSection(null);
													handleShowAddMenuItem(menu.id);
												}}
												className="bg-[#1a1a1a] text-white px-4 py-2 rounded-lg shadow-md hover:bg-[#404040] font-medium text-sm flex items-center transition-all duration-300"
											>
												<svg
													className="h-4 w-4 mr-1.5"
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
																	handleShowAddMenuItem(menu.id, section.id);
																}}
																className="bg-[#1a1a1a] text-white px-3 py-1.5 rounded-lg shadow-md hover:bg-[#404040] font-medium text-xs flex items-center transition-all duration-300"
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
					onItemAdded={(newItem) => handleItemAdded(selectedMenuId, newItem)}
					onCancel={() => {
						menuItemToEdit
							? handleCancelEditMenuItem()
							: handleCancelAddMenuItem(selectedMenuId);
						setSelectedSection(null);
					}}
					existingItem={menuItemToEdit}
					isEditing={!!menuItemToEdit}
				/>
			)}

			{showQr && (
				<QRCodeComponent businessId={showQr} onClose={() => setShowQr(null)} />
			)}

			{showSectionManager && (
				<SectionManager
					menuId={showSectionManager}
					onClose={() => setShowSectionManager(null)}
					onSectionAdded={handleSectionAdded}
				/>
			)}
		</div>
	);
}
