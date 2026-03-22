import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

  const variantClasses = {
    primary: 'border border-slate-900 bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-400',
    secondary: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-300',
    success: 'border border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-300',
    danger: 'border border-red-600 bg-red-600 text-white hover:bg-red-700 focus:ring-red-300',
    warning: 'border border-amber-500 bg-amber-500 text-slate-950 hover:bg-amber-400 focus:ring-amber-300',
    ghost: 'border border-transparent bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-300',
  };

  const sizeClasses = {
    sm: 'rounded-lg px-3 py-2 text-xs',
    md: 'rounded-xl px-4 py-2.5 text-sm',
    lg: 'rounded-2xl px-6 py-3 text-base',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
