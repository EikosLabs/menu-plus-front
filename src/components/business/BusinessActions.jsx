import React from "react";

// Icon components
const ExternalLinkIcon = ({ className }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
	</svg>
);

const EditIcon = ({ className }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
	</svg>
);

const QRIcon = ({ className }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
	</svg>
);

// Shared button styles
const baseButtonClass = "group px-3 py-1.5 bg-white text-gray-800 font-bold text-xs sm:text-sm rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center";

function ActionButton({ onClick, icon: Icon, iconColor, label, disabled, title }) {
	return (
		<button
			onClick={onClick}
			className={`${baseButtonClass} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
			title={title}
			disabled={disabled}
		>
			<Icon className={`h-4 w-4 mr-1.5 ${iconColor} group-hover:scale-110 transition-transform`} />
			{label}
		</button>
	);
}

export default function BusinessActions({ business, onEditClick, onQRClick }) {
	const handleWebClick = () => {
		if (business.slug) {
			window.open(`/${business.slug}`, '_blank');
		} else {
			alert('Este negocio no tiene una URL publica configurada correctamente.');
		}
	};

	return (
		<div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto mt-4 lg:mt-0">
			<ActionButton
				onClick={handleWebClick}
				icon={ExternalLinkIcon}
				iconColor="text-blue-500"
				label="Web"
				disabled={!business.slug}
				title={business.slug ? "Ver Landing Page publica" : "URL no disponible"}
			/>
			<ActionButton
				onClick={() => onEditClick(business)}
				icon={EditIcon}
				iconColor="text-amber-500"
				label="Editar"
				title="Editar negocio"
			/>
			<ActionButton
				onClick={() => onQRClick(business.id)}
				icon={QRIcon}
				iconColor="text-purple-500"
				label="QR"
				title="Ver codigo QR"
			/>
		</div>
	);
}
