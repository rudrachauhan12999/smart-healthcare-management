import React from 'react';
import { AlertCircle, AlertTriangle, RefreshCw, X } from 'lucide-react';

export default function ErrorMessage({
  error,
  onRetry,
  onDismiss,
  title = 'System Alert',
}) {
  if (!error) return null;

  const message = typeof error === 'string' ? error : error?.message || 'An unexpected error occurred.';
  const status = error?.status;

  const isWarning = status === 404 || status === 400;

  return (
    <div
      role="alert"
      className={`rounded-xl border p-4 mb-6 transition-all ${
        isWarning
          ? 'bg-amber-50/90 border-amber-200 text-amber-900'
          : 'bg-rose-50/90 border-rose-200 text-rose-900'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          {isWarning ? (
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold tracking-tight">
              {title}
            </h4>
            {status ? (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-mono font-medium ${
                  isWarning
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                HTTP {status}
              </span>
            ) : null}
          </div>
          <p className="text-sm mt-1 text-slate-700 leading-relaxed">
            {message}
          </p>

          {onRetry && (
            <div className="mt-3">
              <button
                type="button"
                onClick={onRetry}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-xs ${
                  isWarning
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Request
              </button>
            </div>
          )}
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss error"
            className="shrink-0 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-black/5"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
