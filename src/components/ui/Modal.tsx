import React, { useEffect, useRef, ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div
        ref={modalRef}
        className={`w-full ${sizeClasses[size]} overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-2xl`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
          >
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-5">
          {children}
        </div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
