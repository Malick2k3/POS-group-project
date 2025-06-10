import React, { ReactNode } from 'react';
import { useAppContext } from '../../context/AppContext';

interface CardProps {
  children: ReactNode;
  title?: string;
  className?: string;
  footer?: ReactNode;
}

const Card: React.FC<CardProps> = ({ children, title, className = '', footer }) => {
  const { darkMode } = useAppContext();
  
  return (
    <div className={`rounded-lg shadow-md overflow-hidden ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} ${className}`}>
      {title && (
        <div className={`px-4 py-3 ${darkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'}`}>
          <h3 className="font-semibold">{title}</h3>
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
      {footer && (
        <div className={`px-4 py-3 ${darkMode ? 'border-t border-gray-700 bg-gray-900' : 'border-t border-gray-200 bg-gray-50'}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;