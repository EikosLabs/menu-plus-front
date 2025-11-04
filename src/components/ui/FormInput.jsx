/**
 * Componente de input reutilizable con iconos
 * Reduce duplicación de código en formularios
 */

import React from 'react';

export const FormInput = ({
  label,
  icon,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  className = ''
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1 block flex items-center font-medium text-[#0A3342] text-sm"
      >
        {icon && (
          <svg
            className="mr-1 h-4 w-4 text-[#1a1a1a]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={icon}
            />
          </svg>
        )}
        {label} {required && '*'}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full rounded-lg border border-slate-300 px-4 py-2.5 transition-colors focus:border-[#1a1a1a] focus:outline-none focus:ring-[#1a1a1a] ${className}`}
        placeholder={placeholder}
      />
    </div>
  );
};

export const FormTextarea = ({
  label,
  icon,
  name,
  value,
  onChange,
  placeholder,
  rows = 3,
  required = false
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1 block flex items-center font-medium text-[#0A3342] text-sm"
      >
        {icon && (
          <svg
            className="mr-1 h-4 w-4 text-[#1a1a1a]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={icon}
            />
          </svg>
        )}
        {label} {required && '*'}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        required={required}
        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 transition-colors focus:border-[#1a1a1a] focus:outline-none focus:ring-[#1a1a1a]"
        placeholder={placeholder}
      />
    </div>
  );
};

export const FormSelect = ({
  label,
  icon,
  name,
  value,
  onChange,
  options,
  required = false,
  loading = false,
  loadingText = 'Cargando...',
  emptyText = 'No hay opciones disponibles'
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1 block flex items-center font-medium text-[#0A3342] text-sm"
      >
        {icon && (
          <svg
            className="mr-1 h-4 w-4 text-[#1a1a1a]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={icon}
            />
          </svg>
        )}
        {label} {required && '*'}
      </label>

      {loading ? (
        <div className="flex w-full items-center justify-center rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5">
          <svg
            className="mr-2 h-5 w-5 animate-spin text-[#1a1a1a]"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-slate-600">{loadingText}</span>
        </div>
      ) : options.length > 0 ? (
        <select
          id={name}
          name={name}
          required={required}
          value={value}
          onChange={onChange}
          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 transition-colors focus:border-[#1a1a1a] focus:outline-none focus:ring-[#1a1a1a]"
        >
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
              {option.description && option.description.length > 30
                ? ` - ${option.description.substring(0, 30)}...`
                : option.description
                ? ` - ${option.description}`
                : ''}
            </option>
          ))}
        </select>
      ) : (
        <div className="text-red-500 text-sm">{emptyText}</div>
      )}
    </div>
  );
};

export const FormColorPicker = ({ label, name, value, onChange, required = false }) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1 block font-medium text-[#0A3342] text-sm"
      >
        {label} {required && '*'}
      </label>
      <input
        type="color"
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="h-12 w-full cursor-pointer rounded-lg border border-slate-300"
      />
    </div>
  );
};
