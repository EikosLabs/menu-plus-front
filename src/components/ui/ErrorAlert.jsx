import React from "react";

const ErrorAlert = ({ error, onClose }) => {
	if (!error) return null;

	return (
		<div className="mb-5 flex animate-fadeIn items-center rounded-md border-red-500 border-l-4 bg-red-50 p-4 text-red-700 shadow-sm">
			<svg
				className="mr-2 h-5 w-5 flex-shrink-0 text-red-500 md:mr-3 md:h-6 md:w-6"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
				/>
			</svg>
			<span className="font-medium text-sm md:text-base">{error}</span>
			{onClose && (
				<button
					onClick={onClose}
					className="ml-auto text-red-500 hover:text-red-700"
					aria-label="Cerrar mensaje de error"
				>
					<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			)}
		</div>
	);
};

export default ErrorAlert;