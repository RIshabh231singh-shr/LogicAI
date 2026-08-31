import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  icon: Icon = null,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-lg';

  const variants = {
    primary: 'bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white shadow-subtle focus:ring-brand-500',
    secondary: 'bg-white hover:bg-workspace-subtle text-workspace-text border border-workspace-border hover:border-workspace-borderHover shadow-subtle focus:ring-workspace-border',
    outline: 'bg-transparent hover:bg-workspace-subtle text-workspace-text border border-workspace-border focus:ring-brand-500',
    ghost: 'bg-transparent hover:bg-workspace-subtle text-workspace-secondary hover:text-workspace-text focus:ring-workspace-border',
    danger: 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 focus:ring-rose-500',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-3.5 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : Icon ? (
        <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} className="shrink-0" />
      ) : null}
      {children}
    </button>
  );
}
