import React, { forwardRef } from 'react';

const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    icon: Icon = null,
    className = '',
    id,
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-workspace-secondary">
          {label}
        </label>
      )}
      <div className="relative rounded-lg shadow-subtle">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-workspace-muted">
            <Icon size={16} />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`block w-full rounded-lg border bg-white text-sm text-workspace-text placeholder-workspace-muted transition-colors
            ${Icon ? 'pl-9' : 'pl-3.5'} pr-3.5 py-2
            ${error 
              ? 'border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500' 
              : 'border-workspace-border hover:border-workspace-borderHover focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
            }
            focus:outline-none disabled:bg-workspace-subtle disabled:cursor-not-allowed ${className}`}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-xs text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-workspace-muted">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Input;
