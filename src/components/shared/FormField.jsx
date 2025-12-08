import React from 'react';

/**
 * Componente reutilizable para campos de formulario
 */
export function FormField({
	label,
	name,
	type = 'text',
	value,
	onChange,
	onBlur,
	error,
	required = false,
	disabled = false,
	placeholder = '',
	className = '',
	maxLength,
	showCharCount = false,
	...props
}) {
	const baseClassName = `neo-input ${error ? 'border-red-500' : ''} ${className}`;

	return (
		<div className="mb-4">
			<label
				htmlFor={name}
				className="mb-1 block neo-text neo-text-bold"
			>
				{label} {required && <span className="text-neo-flame ml-1">*</span>}
			</label>
			<input
				type={type}
				id={name}
				name={name}
				value={value}
				onChange={onChange}
				onBlur={onBlur}
				className={baseClassName}
				placeholder={placeholder}
				disabled={disabled}
				required={required}
				maxLength={maxLength}
				{...props}
			/>
			{showCharCount && maxLength && (
				<div className="neo-text text-xs mt-1 text-right text-neo-black opacity-60">
					{value?.length || 0} / {maxLength}
				</div>
			)}
			{error && (
				<p className="mt-1 text-red-600 text-sm">{error}</p>
			)}
		</div>
	);
}

export function TextAreaField({
	label,
	name,
	value,
	onChange,
	onBlur,
	error,
	required = false,
	disabled = false,
	placeholder = '',
	rows = 3,
	className = '',
	maxLength,
	showCharCount = true,
	...props
}) {
	const baseClassName = `neo-input neo-textarea ${error ? 'border-red-500' : ''} ${className}`;

	return (
		<div className="mb-4">
			<label
				htmlFor={name}
				className="mb-1 block neo-text neo-text-bold"
			>
				{label} {required && <span className="text-neo-flame ml-1">*</span>}
			</label>
			<textarea
				id={name}
				name={name}
				value={value}
				onChange={onChange}
				onBlur={onBlur}
				rows={rows}
				className={baseClassName}
				placeholder={placeholder}
				disabled={disabled}
				required={required}
				maxLength={maxLength}
				{...props}
			/>
			{showCharCount && maxLength && (
				<div className="neo-text text-xs mt-1 text-right text-neo-black opacity-60">
					{value?.length || 0} / {maxLength}
				</div>
			)}
			{error && (
				<p className="mt-1 text-red-600 text-sm">{error}</p>
			)}
		</div>
	);
}

export function SelectField({
	label,
	name,
	value,
	onChange,
	onBlur,
	error,
	options = [],
	required = false,
	disabled = false,
	placeholder = 'Seleccionar...',
	className = '',
	children,
	...props
}) {
	const baseClassName = `neo-input neo-select ${error ? 'border-red-500' : ''} ${className}`;

	return (
		<div className="mb-4">
			<label
				htmlFor={name}
				className="mb-1 block neo-text neo-text-bold"
			>
				{label} {required && <span className="text-neo-flame ml-1">*</span>}
			</label>
			<select
				id={name}
				name={name}
				value={value}
				onChange={onChange}
				onBlur={onBlur}
				className={baseClassName}
				disabled={disabled}
				required={required}
				{...props}
			>
				{placeholder && <option value="">{placeholder}</option>}
				{children ? children : options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
			{error && (
				<p className="mt-1 text-red-600 text-sm">{error}</p>
			)}
		</div>
	);
}

export function CheckboxField({
	label,
	name,
	checked,
	onChange,
	disabled = false,
	className = '',
	...props
}) {
	return (
		<div className="flex items-center mb-4">
			<input
				type="checkbox"
				id={name}
				name={name}
				checked={checked}
				onChange={onChange}
				className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
				disabled={disabled}
				{...props}
			/>
			<label
				htmlFor={name}
				className="ml-2 block font-medium text-gray-700 text-sm"
			>
				{label}
			</label>
		</div>
	);
}
