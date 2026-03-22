import React, { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', icon, ...props }, ref) => {
    return (
      <div className="mb-4">
        {label && (
          <label className="mb-2 block text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full rounded-xl border bg-white py-3 ${icon ? 'pl-11' : 'pl-4'} pr-4 text-slate-900 placeholder-slate-400 outline-none transition-colors
              ${error ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100'}
              ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
