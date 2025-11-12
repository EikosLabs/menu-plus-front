import React from 'react';
import { FormField as SharedFormField, TextAreaField as SharedTextAreaField, SelectField as SharedSelectField } from '../shared/FormField.jsx';

/**
 * Componente de campo de formulario reutilizable
 */
export function FormField({ 
  label, 
  name, 
  type = 'text', 
  value, 
  onChange, 
  error, 
  required = false,
  placeholder = '',
  disabled = false,
  maxLength,
  showCharCount = false
}) {
  const handleChange = (e) => onChange(name, e.target.value);

  return (
    <div className="mb-4">
      <SharedFormField
        label={label}
        name={name}
        type={type}
        value={value}
        onChange={handleChange}
        error={error}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        maxLength={maxLength}
      />
      {showCharCount && maxLength && (
        <div className="neo-text text-xs mt-1 text-right text-neo-black opacity-60">
          {value.length} / {maxLength}
        </div>
      )}
    </div>
  );
}

/**
 * Componente de textarea reutilizable
 */
export function TextAreaField({ 
  label, 
  name, 
  value, 
  onChange, 
  error, 
  required = false,
  placeholder = '',
  disabled = false,
  maxLength,
  rows = 4,
  showCharCount = true
}) {
  const handleChange = (e) => onChange(name, e.target.value);

  return (
    <div className="mb-4">
      <SharedTextAreaField
        label={label}
        name={name}
        value={value}
        onChange={handleChange}
        error={error}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
      />
      {showCharCount && maxLength && (
        <div className="neo-text text-xs mt-1 text-right text-neo-black opacity-60">
          {value.length} / {maxLength}
        </div>
      )}
    </div>
  );
}

/**
 * Componente de select dropdown reutilizable
 */
export function SelectField({ 
  label, 
  name, 
  value, 
  onChange, 
  options = [],
  error, 
  required = false,
  placeholder = 'Selecciona una opción',
  disabled = false
}) {
  const handleChange = (e) => {
    const selectedValue = e.target.value;
    onChange(name, selectedValue === '' ? null : parseInt(selectedValue, 10));
  };

  const mappedOptions = options.map((opt) => ({ value: opt.id, label: opt.name }));

  return (
    <SharedSelectField
      label={label}
      name={name}
      value={value || ''}
      onChange={handleChange}
      options={mappedOptions}
      error={error}
      required={required}
      disabled={disabled}
      placeholder={placeholder}
    />
  );
}

/**
 * Componente de file upload con drag & drop
 */
export function FileUploadField({ 
  label, 
  name, 
  onChange, 
  error, 
  required = false,
  accept = 'image/*',
  preview = null,
  onRemove = null
}) {
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onChange(name, files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      onChange(name, files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <div className="mb-4">
      <label className="neo-text neo-text-bold block mb-1.5 text-sm">
        {label}
        {required && <span className="text-neo-flame ml-1">*</span>}
      </label>

      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          neo-border neo-border-thick border-dashed rounded-lg p-4 text-center cursor-pointer
          transition-all duration-200
          ${isDragging ? 'border-neo-flame bg-neo-lavender neo-shadow-md' : 'border-neo-black hover:neo-shadow-sm'}
          ${error ? 'border-red-500' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          aria-label={label}
        />
        
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="max-h-48 mx-auto rounded neo-border"
            />
            {onRemove && (
              <button
                type="button"
                onClick={handleRemove}
                className="neo-btn neo-btn-sm bg-red-500 text-white absolute top-2 right-2 rounded-full p-2 hover:bg-red-600"
                aria-label="Remover imagen"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ) : (
          <div>
            <svg
              className="w-10 h-10 mx-auto text-neo-black opacity-40 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="neo-text text-sm mb-0.5">
              Arrastra y suelta tu imagen aquí
            </p>
            <p className="neo-text text-xs opacity-60">
              o haz clic para seleccionar
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="neo-alert neo-alert-error mt-1.5 text-xs flex items-start gap-2 p-2" role="alert">
          <svg
            className="w-4 h-4 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
