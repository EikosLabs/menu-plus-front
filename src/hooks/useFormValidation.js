import { useState, useCallback } from 'react';

/**
 * Hook personalizado para validación de formularios
 * @param {Object} initialValues - Valores iniciales del formulario
 * @param {Object} validationRules - Reglas de validación { fieldName: (value) => errorMessage || '' }
 */
export function useFormValidation(initialValues, validationRules = {}) {
	const [values, setValues] = useState(initialValues);
	const [errors, setErrors] = useState({});
	const [touched, setTouched] = useState({});

	const validateField = useCallback((name, value) => {
		if (validationRules[name]) {
			return validationRules[name](value);
		}
		return '';
	}, [validationRules]);

	const handleChange = useCallback((e) => {
		const { name, value, type, checked } = e.target;
		const newValue = type === 'checkbox' ? checked : value;

		setValues(prev => ({
			...prev,
			[name]: newValue
		}));

		// Validate on change if field was already touched
		if (touched[name]) {
			const error = validateField(name, newValue);
			setErrors(prev => ({
				...prev,
				[name]: error
			}));
		}
	}, [touched, validateField]);

	const handleBlur = useCallback((e) => {
		const { name } = e.target;
		setTouched(prev => ({
			...prev,
			[name]: true
		}));

		const error = validateField(name, values[name]);
		setErrors(prev => ({
			...prev,
			[name]: error
		}));
	}, [values, validateField]);

	const validateAll = useCallback(() => {
		const newErrors = {};
		let isValid = true;

		Object.keys(validationRules).forEach(name => {
			const error = validateField(name, values[name]);
			if (error) {
				newErrors[name] = error;
				isValid = false;
			}
		});

		setErrors(newErrors);
		setTouched(Object.keys(validationRules).reduce((acc, key) => ({
			...acc,
			[key]: true
		}), {}));

		return isValid;
	}, [values, validationRules, validateField]);

	const resetForm = useCallback((newValues = initialValues) => {
		setValues(newValues);
		setErrors({});
		setTouched({});
	}, [initialValues]);

	return {
		values,
		errors,
		touched,
		handleChange,
		handleBlur,
		validateAll,
		resetForm,
		setValues,
		setErrors
	};
}
