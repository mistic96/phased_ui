import React, { useEffect, useState } from 'react';

export type SlidePanelPosition = 'right' | 'bottom' | 'left';
export type SlidePanelSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface SlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  position?: SlidePanelPosition;
  size?: SlidePanelSize;
  children: React.ReactNode;
  showOverlay?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

const sizeClasses: Record<SlidePanelPosition, Record<SlidePanelSize, string>> = {
  right: {
    sm: 'w-80',
    md: 'w-[480px]',
    lg: 'w-[640px]',
    xl: 'w-[800px]',
    full: 'w-full',
  },
  left: {
    sm: 'w-80',
    md: 'w-[480px]',
    lg: 'w-[640px]',
    xl: 'w-[800px]',
    full: 'w-full',
  },
  bottom: {
    sm: 'h-48',
    md: 'h-72',
    lg: 'h-96',
    xl: 'h-[500px]',
    full: 'h-full',
  },
};

const positionClasses: Record<SlidePanelPosition, { container: string; open: string; closed: string }> = {
  right: {
    container: 'right-0 top-0 h-full',
    open: 'translate-x-0',
    closed: 'translate-x-full',
  },
  left: {
    container: 'left-0 top-0 h-full',
    open: 'translate-x-0',
    closed: '-translate-x-full',
  },
  bottom: {
    container: 'bottom-0 left-0 w-full',
    open: 'translate-y-0',
    closed: 'translate-y-full',
  },
};

export const SlidePanel: React.FC<SlidePanelProps> = ({
  isOpen,
  onClose,
  title,
  position = 'right',
  size = 'lg',
  children,
  showOverlay = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle open/close animations
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsVisible(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeOnEscape, isOpen, onClose]);

  if (!isVisible) return null;

  const posClasses = positionClasses[position];
  const sizeClass = sizeClasses[position][size];

  return (
    <div className="slide-panel-container fixed inset-0 z-50">
      {/* Overlay */}
      {showOverlay && (
        <div
          className={`
            absolute inset-0 bg-black/60 backdrop-blur-sm
            transition-opacity duration-300
            ${isAnimating ? 'opacity-100' : 'opacity-0'}
          `}
          onClick={closeOnOverlayClick ? onClose : undefined}
        />
      )}

      {/* Panel */}
      <div
        className={`
          slide-panel absolute ${posClasses.container} ${sizeClass}
          bg-slate-900/95 border-white/10
          ${position === 'right' ? 'border-l' : ''}
          ${position === 'left' ? 'border-r' : ''}
          ${position === 'bottom' ? 'border-t' : ''}
          shadow-2xl
          transform transition-transform duration-300 ease-out
          ${isAnimating ? posClasses.open : posClasses.closed}
          flex flex-col
        `}
      >
        {/* Header */}
        {title && (
          <div className="slide-panel-header flex items-center justify-between px-6 py-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white/90">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white/90 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="slide-panel-content flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SlidePanel;
