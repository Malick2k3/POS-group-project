import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string;
  className?: string;
  footer?: ReactNode;
}

const Card: React.FC<CardProps> = ({ children, title, className = '', footer }) => {
  return (
    <div className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {title && (
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-sm font-semibold tracking-wide text-slate-900">{title}</h3>
        </div>
      )}
      <div className="p-5">
        {children}
      </div>
      {footer && (
        <div className="border-t border-slate-200 bg-slate-50 px-5 py-4">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
