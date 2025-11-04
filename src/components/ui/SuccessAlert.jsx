import React from "react";
import PropTypes from "prop-types";

/**
 * SuccessAlert Component
 * Displays success messages with consistent styling and optional close button
 *
 * @param {Object} props
 * @param {string} props.message - Success message to display
 * @param {Function} props.onClose - Optional callback for close button
 */
const SuccessAlert = ({ message, onClose }) => {
	if (!message) return null;

	return (
		<div
			className="mb-5 neo-alert neo-alert-success flex animate-fadeIn items-center bg-green-50 border-l-4 border-green-500 text-green-700 p-4"
			role="alert"
			aria-live="polite"
		>
			<svg
				className="mr-3 h-6 w-6 flex-shrink-0"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				aria-hidden="true"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2.5}
					d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
			<span className="neo-text-bold flex-1">{message}</span>
			{onClose && (
				<button
					onClick={onClose}
					className="ml-auto hover:opacity-70 transition-opacity"
					aria-label="Cerrar mensaje de éxito"
					type="button"
				>
					<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			)}
		</div>
	);
};

SuccessAlert.propTypes = {
	message: PropTypes.string,
	onClose: PropTypes.func,
};

export default SuccessAlert;
