import React from "react";

const ErrorAlert = ({ error, onClose }) => {
	if (!error) return null;

	return (
		<div className="mb-5 neo-alert neo-alert-error flex animate-fadeIn items-center">
			<svg
				className="mr-3 h-6 w-6 flex-shrink-0"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2.5}
					d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
				/>
			</svg>
			<span className="neo-text-bold flex-1">{error}</span>
			{onClose && (
				<button
					onClick={onClose}
					className="ml-auto hover:opacity-70 transition-opacity"
					aria-label="Cerrar mensaje de error"
				>
					<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			)}
		</div>
	);
};

export default ErrorAlert;
