import React from 'react';

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  icon: Icon = null,
}) {
  const variants = {
    default: 'bg-zinc-100 text-zinc-700 border-zinc-200',
    primary: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-0.5 gap-1.5',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`}
    >
      {Icon && <Icon size={size === 'sm' ? 12 : 13} className="shrink-0" />}
      {children}
    </span>
  );
}
