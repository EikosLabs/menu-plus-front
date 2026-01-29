import React from "react";

// Icon components
const SectionsIcon = ({ className }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
	</svg>
);

const DocumentIcon = ({ className }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
	</svg>
);

const FlyerIcon = ({ className }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
	</svg>
);

const FolderIcon = ({ className }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
	</svg>
);

const PlusIcon = ({ className }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
	</svg>
);

const ScanIcon = ({ className }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 00-2 2v4a2 2 0 002 2h2a2 2 0 002 2v4a2 2 0 002 2H7a2 2 0 00-2-2V9a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.096 3.096m0 0L7.804 7.804m8.192 8.192a1 1 0 011.414 0l3.096 3.096m-3.096 0L7.804 7.804m8.192 8.192a1 1 0 011.414 0l3.096 3.096" />
	</svg>
);

function MenuButton({ onClick, icon: Icon, label, variant = "secondary", title }) {
	const variantClasses = {
		primary: "neo-btn neo-btn-primary",
		secondary: "neo-btn neo-btn-secondary",
		white: "neo-btn neo-btn-white",
	};

	return (
		<button
			onClick={onClick}
			className={`${variantClasses[variant]} text-xs sm:text-sm flex items-center justify-center flex-1 sm:flex-initial`}
			title={title}
		>
			<Icon className="h-4 w-4 mr-1 sm:mr-1.5 flex-shrink-0" />
			{label}
		</button>
	);
}

export default function MenuActions({
	menuId,
	businessId,
	defaultCurrency,
	onManageSections,
	onCreateCard,
	onCreateFlyer,
	onViewSaved,
	onAddItem,
	onScanMenu,
	showScanner,
}) {
	return (
		<div className="flex flex-wrap gap-2 w-full sm:w-auto">
			<MenuButton
				onClick={() => onManageSections(menuId)}
				icon={SectionsIcon}
				label="Secciones"
				variant="secondary"
			/>
			<MenuButton
				onClick={() => onCreateCard({ businessId, menuId })}
				icon={DocumentIcon}
				label="Crear Carta"
				variant="white"
				title="Carta completa para imprimir"
			/>
			<MenuButton
				onClick={() => onCreateFlyer({ businessId, menuId })}
				icon={FlyerIcon}
				label="Crear Folleto"
				variant="white"
				title="Folleto promocional"
			/>
			<MenuButton
				onClick={() => onViewSaved({ businessId, menuId })}
				icon={FolderIcon}
				label="Ver Guardados"
				variant="secondary"
				title="Ver folletos y cartas guardados"
			/>
			<MenuButton
				onClick={() => onAddItem(menuId, null, defaultCurrency)}
				icon={PlusIcon}
				label="Anadir Plato"
				variant="primary"
			/>
			{showScanner && (
				<MenuButton
					onClick={() => onScanMenu(businessId, menuId)}
					icon={ScanIcon}
					label="Escanear Menu"
					variant="secondary"
					title="Escanear menu con IA"
				/>
			)}
		</div>
	);
}
