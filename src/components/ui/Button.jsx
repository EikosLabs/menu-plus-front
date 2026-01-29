import React from 'react';

/**
 * Spinner component for use inside buttons
 */
const ButtonSpinner = ({ size = 'sm', className = '' }) => {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <svg
      className={`animate-spin ${sizeClasses[size]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
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
  );
};

/**
 * Button variants configuration
 */
const variants = {
  primary: 'neo-btn bg-neo-flame text-white hover:bg-neo-flame/90',
  secondary: 'neo-btn bg-neo-black text-white hover:bg-neo-black/90',
  outline: 'neo-btn bg-white border-2 border-neo-black text-neo-black hover:bg-gray-50',
  ghost: 'neo-btn bg-transparent text-neo-black hover:bg-gray-100',
  danger: 'neo-btn bg-red-500 text-white hover:bg-red-600',
  success: 'neo-btn bg-green-500 text-white hover:bg-green-600',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
  xl: 'px-8 py-4 text-xl',
};

/**
 * Button component with loading state
 * Replaces 24+ inline spinner implementations across the codebase
 * 
 * @example
 * // Basic usage
 * <Button onClick={handleClick}>Click me</Button>
 * 
 * // With loading state
 * <Button loading={isSubmitting}>Submit</Button>
 * 
 * // With loading text
 * <Button loading={isSubmitting} loadingText="Saving...">Save</Button>
 * 
 * // Different variants
 * <Button variant="danger">Delete</Button>
 * <Button variant="outline">Cancel</Button>
 */
export function Button({
  children,
  loading = false,
  loadingText,
  disabled = false,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  type = 'button',
  className = '',
  ...props
}) {
  const isDisabled = disabled || loading;

  const baseClasses = `
    inline-flex items-center justify-center gap-2
    font-semibold transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neo-flame
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variantClasses = variants[variant] || variants.primary;
  const sizeClasses = sizes[size] || sizes.md;
  const widthClasses = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${widthClasses} ${className}`.trim()}
      {...props}
    >
      {loading ? (
        <>
          <ButtonSpinner size={size === 'sm' ? 'xs' : 'sm'} />
          {loadingText || children}
        </>
      ) : (
        <>
          {leftIcon && <span className="button-icon-left">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="button-icon-right">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}

/**
 * Icon Button - Square button for icons only
 */
export function IconButton({
  icon,
  loading = false,
  disabled = false,
  variant = 'ghost',
  size = 'md',
  label,
  className = '',
  ...props
}) {
  const isDisabled = disabled || loading;

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };

  return (
    <button
      type="button"
      disabled={isDisabled}
      aria-label={label}
      title={label}
      className={`
        inline-flex items-center justify-center rounded-lg
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neo-flame
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizeClasses[size]}
        ${className}
      `.trim()}
      {...props}
    >
      {loading ? <ButtonSpinner size="sm" /> : icon}
    </button>
  );
}

/**
 * Button Group - Wrapper for grouped buttons
 */
export function ButtonGroup({ children, className = '' }) {
  return (
    <div className={`inline-flex rounded-lg overflow-hidden ${className}`}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child, {
          className: `${child.props.className || ''} ${
            index === 0 ? 'rounded-r-none' : index === React.Children.count(children) - 1 ? 'rounded-l-none' : 'rounded-none'
          } ${index !== 0 ? '-ml-px' : ''}`.trim(),
        });
      })}
    </div>
  );
}

// Export spinner for standalone use if needed
export { ButtonSpinner };

export default Button;
