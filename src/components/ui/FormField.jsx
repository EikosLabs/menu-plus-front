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
	const getInputClass = () => {
		let classes = "neo-input w-full";
		if (error) classes += " border-red-500";
		if (disabled) classes += " bg-neo-gray opacity-60 cursor-not-allowed";
		return classes;
	};

	return (
		<div className={`neo-space-md ${className}`}>
			<label htmlFor={name} className="neo-text neo-text-bold block mb-2">
				{label}
				{required && <span className="text-neo-flame ml-1">*</span>}
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
					className={getInputClass()}
				/>
			) : type === "select" ? (
				<select
					id={name}
					name={name}
					value={value}
					onChange={onChange}
					required={required}
					disabled={disabled}
					className={getInputClass()}
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
					className={getInputClass()}
				/>
			)}

			{error && (
				<p className="neo-alert neo-alert-error mt-2">{error}</p>
			)}
		</div>
	);
};

export default FormField;