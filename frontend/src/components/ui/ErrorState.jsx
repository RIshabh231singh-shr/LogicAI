import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

export default function ErrorState({
  title = 'Unable to load information',
  message = 'We encountered an issue retrieving data from the server.',
  onRetry,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center rounded-xl border border-rose-200 bg-rose-50/50 ${className}`}>
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-3">
        <AlertCircle size={20} />
      </div>
      <h4 className="text-sm font-semibold text-rose-900 mb-1">{title}</h4>
      <p className="max-w-md text-xs text-rose-700 leading-relaxed mb-4">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="secondary" size="sm" icon={RefreshCw}>
          Try Again
        </Button>
      )}
    </div>
  );
}
