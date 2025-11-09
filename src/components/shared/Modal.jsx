import React, { useEffect } from 'react';

/**
 * Componente Modal reutilizable
 */
export default function Modal({
	isOpen,
	onClose,
	title,
	children,
	maxWidth = 'max-w-xl',
	showCloseButton = true,
	icon = null,
	iconBgColor = 'bg-neo-flame',
	iconColor = 'text-neo-flame',
	onEscapeKey = true
}) {
	useEffect(() => {
		if (!onEscapeKey) return;

		const handleEscapeKey = (e) => {
			if (e.key === 'Escape' && isOpen) {
				onClose();
			}
		};

		document.addEventListener('keydown', handleEscapeKey);
		return () => document.removeEventListener('keydown', handleEscapeKey);
	}, [isOpen, onClose, onEscapeKey]);

	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}

		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [isOpen]);

	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 transition-all duration-300 p-4"
			onClick={onClose}
		>
			<div
				className={`w-full ${maxWidth} max-h-[85vh] transform animate-fadeInUp overflow-y-auto bg-white neo-border neo-shadow-2xl transition-all duration-300`}
				onClick={(e) => e.stopPropagation()}
			>
				<div className="relative p-4 sm:p-5">
					{showCloseButton && (
						<button
							onClick={onClose}
							className="absolute top-3 right-3 neo-btn neo-btn-sm bg-neo-lavender hover:bg-neo-lavender-dark"
							aria-label="Cerrar modal"
						>
							<svg
								className="h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					)}

					{title && (
						<div className="mb-4 flex items-center">
							{icon && (
								<div
									className={`${iconBgColor} mr-3 flex-shrink-0 rounded-lg bg-opacity-10 p-2.5`}
								>
									<div className={`h-6 w-6 ${iconColor}`}>
										{icon}
									</div>
								</div>
							)}
							<h2 className="neo-heading neo-h4 text-lg sm:text-xl">
								{title}
							</h2>
						</div>
					)}

					{children}
				</div>
			</div>
		</div>
	);
}
