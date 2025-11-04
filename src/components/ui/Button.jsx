import React from "react";
import PropTypes from "prop-types";

/**
 * Button Component
 * Reusable button with Neobrutalist styling and multiple variants
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} props.onClick - Click handler
 * @param {string} props.type - Button type (button, submit, reset)
 * @param {string} props.variant - Visual variant (primary, secondary, danger, success, outline, white)
 * @param {string} props.size - Button size (sm, md, lg)
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.loading - Loading state with spinner
 * @param {string} props.className - Additional CSS classes
 */
const Button = ({
	children,
	onClick,
	type = "button",
	variant = "primary",
	size = "md",
	disabled = false,
	loading = false,
	className = "",
	...props
}) => {
	// Ultra Aesthetic Neobrutalist styles
	const baseClasses = "neo-btn";

	const variants = {
		primary: "neo-btn-primary",
		secondary: "neo-btn-secondary",
		danger: "bg-red-500 text-white neo-border neo-shadow-md hover:bg-red-600 active:shadow-none active:translate-x-[6px] active:translate-y-[6px]",
		success: "bg-green-500 text-white neo-border neo-shadow-md hover:bg-green-600 active:shadow-none active:translate-x-[6px] active:translate-y-[6px]",
		outline: "neo-btn-outline",
		white: "neo-btn-white"
	};

	const sizes = {
		sm: "neo-btn-sm",
		md: "",
		lg: "neo-btn-lg"
	};

	const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${
		disabled || loading ? "opacity-50 cursor-not-allowed" : ""
	} ${className}`;

	return (
		<button
			type={type}
			onClick={onClick}
			disabled={disabled || loading}
			className={classes}
			{...props}
		>
			{loading && (
				<svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
					<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
					<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
				</svg>
			)}
			{children}
		</button>
	);
};

Button.propTypes = {
	children: PropTypes.node.isRequired,
	onClick: PropTypes.func,
	type: PropTypes.oneOf(["button", "submit", "reset"]),
	variant: PropTypes.oneOf(["primary", "secondary", "danger", "success", "outline", "white"]),
	size: PropTypes.oneOf(["sm", "md", "lg"]),
	disabled: PropTypes.bool,
	loading: PropTypes.bool,
	className: PropTypes.string,
};

export default Button;