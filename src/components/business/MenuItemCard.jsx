import React from "react";

const EditIcon = ({ className }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
	</svg>
);

const TrashIcon = ({ className }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
	</svg>
);

const DEFAULT_IMAGE = "https://ooni.com/cdn/shop/articles/20220211142347-margherita-9920_ba86be55-674e-4f35-8094-2067ab41a671.jpg?v=1737104576&width=1080";

export default function MenuItemCard({ item, onEdit, onDelete }) {
	return (
		<div className="flex border rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition-all duration-300 relative group">
			<img
				src={item.imageUri || DEFAULT_IMAGE}
				alt={item.name}
				className="w-20 h-20 object-cover rounded-lg mr-3 flex-shrink-0"
			/>
			<div className="flex-1 min-w-0">
				<div className="flex justify-between items-start">
					<h5 className="font-semibold text-[#1A3A54] truncate">{item.name}</h5>
					<span className="text-[#1a1a1a] font-bold">${item.price.toFixed(2)}</span>
				</div>
				<p className="text-gray-600 text-sm line-clamp-2">{item.description}</p>
				<div className="mt-2 flex justify-between items-center">
					<span
						className={`text-xs px-2 py-0.5 rounded-full ${
							item.isAvailable
								? "bg-green-100 text-green-800"
								: "bg-red-100 text-red-800"
						}`}
					>
						{item.isAvailable ? "Disponible" : "No disponible"}
					</span>
					<div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
						<button
							onClick={onEdit}
							className="text-blue-600 hover:text-blue-800 p-1"
							aria-label="Editar plato"
						>
							<EditIcon className="h-4 w-4" />
						</button>
						<button
							onClick={onDelete}
							className="text-red-600 hover:text-red-800 p-1"
							aria-label="Eliminar plato"
						>
							<TrashIcon className="h-4 w-4" />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
