import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-lg',
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Dialog */}
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div 
          className={`w-full ${maxWidth} transform overflow-hidden rounded-xl bg-white text-left align-middle shadow-elevated border border-workspace-border transition-all`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-workspace-border px-6 py-4">
            <div>
              <h3 className="text-base font-semibold text-workspace-text">{title}</h3>
              {description && (
                <p className="mt-0.5 text-xs text-workspace-secondary">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-workspace-muted hover:bg-workspace-subtle hover:text-workspace-text transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5">{children}</div>
        </div>
      </div>
    </div>
  );
}
