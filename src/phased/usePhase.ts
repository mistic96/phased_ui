/**
 * PHASED FRAMEWORK - usePhase Hook
 * Manages component phase lifecycle with animations
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type {
  Phase,
  PhaseTransition,
  PhaseAnimationConfig,
  AdaptiveComponentState,
} from './types';
import { DEFAULT_ANIMATION_CONFIG, getPhaseOpacity } from './types';

interface UsePhaseOptions {
  initialPhase?: Phase;
  animationConfig?: Partial<PhaseAnimationConfig>;
  onPhaseChange?: (phase: Phase, previousPhase: Phase) => void;
  autoSurface?: boolean;
  surfaceDelay?: number;
}

interface UsePhaseReturn {
  phase: Phase;
  state: AdaptiveComponentState;
  className: string;

  // Transition methods
  surface: () => void;
  dissolve: () => void;
  focus: () => void;
  blur: () => void;
  hibernate: () => void;

  // State checks
  isVisible: boolean;
  isInteractive: boolean;
  isFocused: boolean;

  // Animation helpers
  transitionTo: (targetPhase: Phase) => void;
}

const PHASE_DURATION_MS: Record<PhaseAnimationConfig['duration'], number> = {
  fast: 150,
  normal: 300,
  slow: 500,
  'very-slow': 800,
};

export function usePhase(options: UsePhaseOptions = {}): UsePhaseReturn {
  const {
    initialPhase = 'dormant',
    animationConfig = {},
    onPhaseChange,
    autoSurface = false,
    surfaceDelay = 0,
  } = options;

  const config = { ...DEFAULT_ANIMATION_CONFIG, ...animationConfig };
  const duration = PHASE_DURATION_MS[config.duration];

  const [phase, setPhase] = useState<Phase>(initialPhase);
  const [lastTransition, setLastTransition] = useState<PhaseTransition | null>(null);
  const previousPhaseRef = useRef<Phase>(initialPhase);
  const transitionTimeoutRef = useRef<number | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  // Auto-surface on mount if enabled
  useEffect(() => {
    if (autoSurface && initialPhase === 'dormant') {
      const timer = setTimeout(() => {
        setPhase('warming');
        setTimeout(() => setPhase('surfaced'), duration / 2);
      }, surfaceDelay);
      return () => clearTimeout(timer);
    }
  }, [autoSurface, initialPhase, surfaceDelay, duration]);

  // Notify on phase change
  useEffect(() => {
    if (phase !== previousPhaseRef.current) {
      onPhaseChange?.(phase, previousPhaseRef.current);
      previousPhaseRef.current = phase;
    }
  }, [phase, onPhaseChange]);

  const transitionTo = useCallback((targetPhase: Phase) => {
    // Clear any pending transitions
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    const currentPhase = previousPhaseRef.current;

    // Determine transition type
    let transition: PhaseTransition | null = null;

    if (targetPhase === 'surfaced' && (currentPhase === 'dormant' || currentPhase === 'dissolving')) {
      transition = 'surface';
      // Go through warming phase
      setPhase('warming');
      setLastTransition(transition);
      transitionTimeoutRef.current = window.setTimeout(() => {
        setPhase('surfaced');
      }, duration / 2);
    } else if (targetPhase === 'focused' && currentPhase === 'surfaced') {
      transition = 'focus';
      setPhase('focused');
      setLastTransition(transition);
    } else if (targetPhase === 'surfaced' && currentPhase === 'focused') {
      transition = 'blur';
      setPhase('surfaced');
      setLastTransition(transition);
    } else if (targetPhase === 'dissolving') {
      transition = 'dissolve';
      setPhase('dissolving');
      setLastTransition(transition);
    } else if (targetPhase === 'dormant') {
      transition = 'hibernate';
      setPhase('dissolving');
      setLastTransition(transition);
      transitionTimeoutRef.current = window.setTimeout(() => {
        setPhase('dormant');
      }, duration);
    } else {
      // Direct transition
      setPhase(targetPhase);
    }
  }, [duration]);

  const surface = useCallback(() => transitionTo('surfaced'), [transitionTo]);
  const dissolve = useCallback(() => transitionTo('dissolving'), [transitionTo]);
  const focus = useCallback(() => transitionTo('focused'), [transitionTo]);
  const blur = useCallback(() => transitionTo('surfaced'), [transitionTo]);
  const hibernate = useCallback(() => transitionTo('dormant'), [transitionTo]);

  // Compute state
  const state: AdaptiveComponentState = {
    phase,
    opacity: getPhaseOpacity(phase),
    relevanceScore: phase === 'focused' ? 1 : phase === 'surfaced' ? 0.8 : 0,
    lastTransition,
    transitionTimestamp: Date.now(),
  };

  // Compute class name
  const className = `phased-component phase-${phase}`;

  // State checks
  const isVisible = phase !== 'dormant';
  const isInteractive = phase === 'surfaced' || phase === 'focused' || phase === 'dissolving';
  const isFocused = phase === 'focused';

  return {
    phase,
    state,
    className,
    surface,
    dissolve,
    focus,
    blur,
    hibernate,
    isVisible,
    isInteractive,
    isFocused,
    transitionTo,
  };
}

export default usePhase;
