import React from "react";
import PropTypes from "prop-types";

/**
 * FormField Component
 * Reusable form input with label, validation, and error handling
 *
 * @param {Object} props
 * @param {string} props.label - Field label
 * @param {string} props.name - Input name and ID
 * @param {string} props.type - Input type (text, textarea, select, etc.)
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.placeholder - Input placeholder
 * @param {boolean} props.required - Required field indicator
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.error - Error message
 * @param {React.ReactNode} props.children - Children for select options
 * @param {string} props.className - Additional CSS classes
 */
const FormField = ({
	label,
	name,
	type = "text",
	value,
	onChange,
	placeholder,
	required = false,
	disabled = false,
	error,
	children,
	className = ""
}) => {
	const baseInputClasses = `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
		error ? "border-red-500" : "border-gray-300"
	} ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`;

	return (
		<div className={`mb-4 ${className}`}>
			<label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
				{label}
				{required && <span className="text-red-500 ml-1">*</span>}
			</label>
			
			{type === "textarea" ? (
				<textarea
					id={name}
					name={name}
					value={value}
					onChange={onChange}
					placeholder={placeholder}
					required={required}
					disabled={disabled}
					rows={4}
					className={baseInputClasses}
				/>
			) : type === "select" ? (
				<select
					id={name}
					name={name}
					value={value}
					onChange={onChange}
					required={required}
					disabled={disabled}
					className={baseInputClasses}
				>
					{children}
				</select>
			) : (
				<input
					type={type}
					id={name}
					name={name}
					value={value}
					onChange={onChange}
					placeholder={placeholder}
					required={required}
					disabled={disabled}
					className={baseInputClasses}
				/>
			)}
			
			{error && (
				<p className="mt-1 text-sm text-red-600" role="alert">{error}</p>
			)}
		</div>
	);
};

FormField.propTypes = {
	label: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired,
	type: PropTypes.string,
	value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	onChange: PropTypes.func.isRequired,
	placeholder: PropTypes.string,
	required: PropTypes.bool,
	disabled: PropTypes.bool,
	error: PropTypes.string,
	children: PropTypes.node,
	className: PropTypes.string,
};

export default FormField;