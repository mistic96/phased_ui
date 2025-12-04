/**
 * PHASED FRAMEWORK - PhasedContainer
 * Wraps components with phase lifecycle and animations
 */

import {
  type ReactNode,
  type CSSProperties,
  type ElementType,
  forwardRef,
} from 'react';
import { usePhase } from './usePhase';
import type { Phase, PhaseAnimationConfig } from './types';

interface PhasedContainerProps {
  children: ReactNode;
  initialPhase?: Phase;
  autoSurface?: boolean;
  surfaceDelay?: number;
  animationConfig?: Partial<PhaseAnimationConfig>;
  onPhaseChange?: (phase: Phase, previousPhase: Phase) => void;
  className?: string;
  style?: CSSProperties;
  as?: ElementType;
}

export const PhasedContainer = forwardRef<HTMLDivElement, PhasedContainerProps>(
  function PhasedContainer(
    {
      children,
      initialPhase = 'dormant',
      autoSurface = true,
      surfaceDelay = 0,
      animationConfig,
      onPhaseChange,
      className = '',
      style,
      as: Component = 'div',
    },
    ref
  ) {
    const { className: phaseClassName, isVisible, phase } = usePhase({
      initialPhase,
      autoSurface,
      surfaceDelay,
      animationConfig,
      onPhaseChange,
    });

    // Don't render if completely dormant (unless in forensic mode)
    if (!isVisible && initialPhase === 'dormant' && !autoSurface) {
      return null;
    }

    const Element = Component as 'div';

    return (
      <Element
        ref={ref}
        className={`${phaseClassName} ${className}`}
        style={style}
        data-phase={phase}
      >
        {children}
      </Element>
    );
  }
);

// ============================================
// PHASED COMPONENT WRAPPER HOC
// ============================================

interface WithPhaseOptions {
  initialPhase?: Phase;
  autoSurface?: boolean;
  surfaceDelay?: number;
}

export function withPhase<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithPhaseOptions = {}
) {
  return function PhasedComponent(props: P) {
    const phaseProps = usePhase({
      initialPhase: options.initialPhase ?? 'dormant',
      autoSurface: options.autoSurface ?? true,
      surfaceDelay: options.surfaceDelay ?? 0,
    });

    if (!phaseProps.isVisible) {
      return null;
    }

    return (
      <div className={phaseProps.className} data-phase={phaseProps.phase}>
        <WrappedComponent {...props} />
      </div>
    );
  };
}

// ============================================
// SUBSTRATE HINT COMPONENT
// Shows dissolved components as subtle hints
// ============================================

interface SubstrateHintProps {
  components: string[];
  onClick?: (componentId: string) => void;
}

export function SubstrateHint({ components, onClick }: SubstrateHintProps) {
  if (components.length === 0) return null;

  return (
    <div className="substrate-hint cursor-pointer" onClick={() => onClick?.(components[0])}>
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {components.slice(0, 3).map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-white/20"
            />
          ))}
          {components.length > 3 && (
            <span className="text-[10px] text-white/30">+{components.length - 3}</span>
          )}
        </div>
        <span>
          {components.length} component{components.length !== 1 ? 's' : ''} available on demand
        </span>
      </div>
    </div>
  );
}

export default PhasedContainer;
