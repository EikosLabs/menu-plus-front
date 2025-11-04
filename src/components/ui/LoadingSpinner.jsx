import React from "react";
import PropTypes from "prop-types";

/**
 * LoadingSpinner Component
 * Full-screen loading spinner with custom message
 *
 * @param {Object} props
 * @param {string} props.message - Loading message to display
 */
const LoadingSpinner = ({ message = "Cargando información..." }) => {
	return (
		<div className="flex h-screen items-center justify-center bg-neo-lavender relative">
			{/* Background Pattern */}
			<div className="absolute inset-0 neo-bg-dots opacity-10 pointer-events-none" aria-hidden="true"></div>

			<div className="neo-card-3d p-8 flex flex-col items-center relative z-10" role="status" aria-live="polite">
				<div className="h-16 w-16 animate-spin rounded-full border-4 border-neo-black border-t-neo-flame" aria-hidden="true" />
				<p className="mt-4 neo-text-bold text-neo-flame">{message}</p>
			</div>
		</div>
	);
};

LoadingSpinner.propTypes = {
	message: PropTypes.string,
};

export default LoadingSpinner;
