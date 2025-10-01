import React from "react";

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
				<p className="mt-1 text-sm text-red-600">{error}</p>
			)}
		</div>
	);
};

export default FormField;