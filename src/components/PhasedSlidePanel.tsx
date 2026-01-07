/**
 * PhasedSlidePanel - Phase lifecycle aware slide panel
 *
 * Implements the Phased Framework lifecycle:
 * DORMANT → WARMING → SURFACED → FOCUSED → DISSOLVING → DORMANT
 */

import React, { useEffect, useCallback } from 'react';
import { usePhase } from '../phased/usePhase';
import type { Phase } from '../phased/types';

export type SlidePanelPosition = 'right' | 'bottom' | 'left';
export type SlidePanelSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface PhasedSlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  position?: SlidePanelPosition;
  size?: SlidePanelSize;
  children: React.ReactNode;
  showOverlay?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  onPhaseChange?: (phase: Phase) => void;
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

// Shimmer loading skeleton for warming phase
const WarmingSkeleton: React.FC<{ title?: string }> = ({ title }) => (
  <div className="animate-pulse">
    {/* Header skeleton */}
    {title && (
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="h-6 w-32 bg-white/10 rounded" />
        <div className="h-8 w-8 bg-white/10 rounded-lg" />
      </div>
    )}
    {/* Content skeleton */}
    <div className="p-6 space-y-4">
      <div className="h-4 w-3/4 bg-white/10 rounded" />
      <div className="h-4 w-1/2 bg-white/10 rounded" />
      <div className="h-32 w-full bg-white/5 rounded-lg" />
      <div className="h-4 w-2/3 bg-white/10 rounded" />
      <div className="h-4 w-1/3 bg-white/10 rounded" />
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="h-24 bg-white/5 rounded-lg" />
        <div className="h-24 bg-white/5 rounded-lg" />
      </div>
    </div>
  </div>
);

export const PhasedSlidePanel: React.FC<PhasedSlidePanelProps> = ({
  isOpen,
  onClose,
  title,
  position = 'right',
  size = 'lg',
  children,
  showOverlay = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  onPhaseChange,
}) => {
  // Use the Phased framework lifecycle
  const {
    phase,
    isVisible,
    isFocused,
    surface,
    hibernate,
    focus,
    blur,
  } = usePhase({
    initialPhase: 'dormant',
    animationConfig: { duration: 'slow', easing: 'ease-in-out' },
    onPhaseChange: (newPhase) => {
      onPhaseChange?.(newPhase);
    },
  });

  // Sync external isOpen state with phase lifecycle
  useEffect(() => {
    if (isOpen && phase === 'dormant') {
      surface();
    } else if (!isOpen && (phase === 'surfaced' || phase === 'focused' || phase === 'warming')) {
      hibernate();
    }
  }, [isOpen, phase, surface, hibernate]);

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

  // Focus handling - when user interacts with content
  const handleContentFocus = useCallback(() => {
    if (phase === 'surfaced') {
      focus();
    }
  }, [phase, focus]);

  const handleContentBlur = useCallback(() => {
    if (phase === 'focused') {
      blur();
    }
  }, [phase, blur]);

  // Don't render if dormant
  if (!isVisible) return null;

  const posClasses = positionClasses[position];
  const sizeClass = sizeClasses[position][size];

  // Phase-specific styling
  const isWarming = phase === 'warming';
  const isSurfaced = phase === 'surfaced';
  const isDissolving = phase === 'dissolving';

  // Calculate animation states based on phase
  const isPanelOpen = isSurfaced || isFocused;
  const overlayOpacity = isWarming ? 0.3 : isPanelOpen ? 1 : isDissolving ? 0.5 : 0;

  return (
    <div className={`phased-slide-panel fixed inset-0 z-50 phase-${phase}`}>
      {/* Overlay with phase-aware opacity */}
      {showOverlay && (
        <div
          className={`
            absolute inset-0 bg-white/5 backdrop-blur-md
            transition-opacity duration-500 ease-out
          `}
          style={{ opacity: overlayOpacity }}
          onClick={closeOnOverlayClick ? onClose : undefined}
        />
      )}

      {/* Panel with phase-aware transforms and styles */}
      <div
        className={`
          absolute ${posClasses.container} ${sizeClass}
          bg-slate-900/95 border-white/10
          ${position === 'right' ? 'border-l' : ''}
          ${position === 'left' ? 'border-r' : ''}
          ${position === 'bottom' ? 'border-t' : ''}
          shadow-2xl
          transform transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
          ${isPanelOpen ? posClasses.open : posClasses.closed}
          ${isFocused ? 'ring-2 ring-cyan-500/30 shadow-cyan-500/10' : ''}
          ${isDissolving ? 'opacity-70 scale-[0.99]' : ''}
          flex flex-col
        `}
        onFocus={handleContentFocus}
        onMouseEnter={handleContentFocus}
        onMouseLeave={handleContentBlur}
      >
        {/* Header */}
        {title && (
          <div className={`
            flex items-center justify-between px-6 py-4 border-b border-white/10
            transition-colors duration-300
            ${isFocused ? 'bg-white/5' : ''}
          `}>
            <div className="flex items-center gap-3">
              {/* Phase indicator dot */}
              <div className={`
                w-2 h-2 rounded-full transition-all duration-300
                ${isWarming ? 'bg-amber-400 animate-pulse' : ''}
                ${isSurfaced ? 'bg-emerald-400' : ''}
                ${isFocused ? 'bg-cyan-400 shadow-lg shadow-cyan-400/50' : ''}
                ${isDissolving ? 'bg-orange-400 animate-pulse' : ''}
              `} />
              <h2 className={`
                text-lg font-semibold transition-colors duration-300
                ${isFocused ? 'text-white' : 'text-white/90'}
              `}>
                {title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className={`
                p-2 rounded-lg transition-all duration-200
                ${isFocused
                  ? 'hover:bg-cyan-500/20 text-white/70 hover:text-white'
                  : 'hover:bg-white/10 text-white/50 hover:text-white/90'
                }
              `}
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {/* Content with phase-aware rendering */}
        <div className={`
          flex-1 overflow-auto transition-opacity duration-300
          ${isDissolving ? 'pointer-events-none' : ''}
        `}>
          {isWarming ? (
            <WarmingSkeleton title={title} />
          ) : (
            <div className={`
              transition-all duration-300
              ${isFocused ? 'opacity-100' : 'opacity-95'}
            `}>
              {children}
            </div>
          )}
        </div>

        {/* Focus indicator bar */}
        <div className={`
          absolute bottom-0 left-0 right-0 h-1
          bg-gradient-to-r from-cyan-500 to-purple-500
          transform origin-left transition-transform duration-500
          ${isFocused ? 'scale-x-100' : 'scale-x-0'}
        `} />
      </div>
    </div>
  );
};

export default PhasedSlidePanel;
