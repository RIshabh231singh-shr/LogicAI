import React from 'react';
import Button from './Button';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-workspace-border bg-white/60 ${className}`}>
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-workspace-subtle border border-workspace-border text-workspace-secondary mb-4">
          <Icon size={22} />
        </div>
      )}
      <h3 className="text-sm font-semibold text-workspace-text mb-1">{title}</h3>
      <p className="max-w-sm text-xs text-workspace-secondary leading-relaxed mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} icon={actionIcon} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
