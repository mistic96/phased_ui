/**
 * PHASED FRAMEWORK - Orchestrator Context
 * Central state management for adaptive UI
 */

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from 'react';
import type {
  Phase,
  UserContext,
  StatusState,
  AdaptiveComponentConfig,
  AdaptiveComponentState,
  ForensicEvent,
  OrchestratorState,
  OrchestratorActions,
} from './types';

// ============================================
// DEFAULT VALUES
// ============================================

const defaultUserContext: UserContext = {
  userId: 'demo-user',
  role: 'analyst',
  urgency: 'normal',
  device: 'desktop',
  forensicMode: false,
  preferences: {},
  sessionHistory: [],
};

const defaultStatus: StatusState = {
  status: 'idle',
  message: 'Ready',
};

const defaultState: OrchestratorState = {
  components: new Map(),
  context: defaultUserContext,
  systemStatus: defaultStatus,
  forensicMode: false,
};

// ============================================
// ACTIONS
// ============================================

type OrchestratorAction =
  | { type: 'REGISTER_COMPONENT'; config: AdaptiveComponentConfig }
  | { type: 'UNREGISTER_COMPONENT'; componentId: string }
  | { type: 'SET_PHASE'; componentId: string; phase: Phase; reason?: string }
  | { type: 'SET_CONTEXT'; updates: Partial<UserContext> }
  | { type: 'SET_FORENSIC_MODE'; enabled: boolean }
  | { type: 'SET_STATUS'; status: StatusState }
  | { type: 'EVALUATE_ALL' };

// ============================================
// REDUCER
// ============================================

function orchestratorReducer(
  state: OrchestratorState,
  action: OrchestratorAction
): OrchestratorState {
  switch (action.type) {
    case 'REGISTER_COMPONENT': {
      const newComponents = new Map(state.components);
      const initialState: AdaptiveComponentState = {
        phase: 'dormant',
        opacity: 0,
        relevanceScore: 0,
        lastTransition: null,
        transitionTimestamp: Date.now(),
      };
      newComponents.set(action.config.id, initialState);
      return { ...state, components: newComponents };
    }

    case 'UNREGISTER_COMPONENT': {
      const newComponents = new Map(state.components);
      newComponents.delete(action.componentId);
      return { ...state, components: newComponents };
    }

    case 'SET_PHASE': {
      const componentState = state.components.get(action.componentId);
      if (!componentState) return state;

      const newComponents = new Map(state.components);
      newComponents.set(action.componentId, {
        ...componentState,
        phase: action.phase,
        transitionTimestamp: Date.now(),
      });
      return { ...state, components: newComponents };
    }

    case 'SET_CONTEXT': {
      return {
        ...state,
        context: { ...state.context, ...action.updates },
      };
    }

    case 'SET_FORENSIC_MODE': {
      return {
        ...state,
        forensicMode: action.enabled,
        context: { ...state.context, forensicMode: action.enabled },
      };
    }

    case 'SET_STATUS': {
      return { ...state, systemStatus: action.status };
    }

    case 'EVALUATE_ALL': {
      // In a real implementation, this would evaluate all conditions
      // and update component phases accordingly
      return state;
    }

    default:
      return state;
  }
}

// ============================================
// CONTEXT
// ============================================

interface OrchestratorContextValue {
  state: OrchestratorState;
  actions: OrchestratorActions;
  forensicEvents: ForensicEvent[];
}

const OrchestratorContext = createContext<OrchestratorContextValue | null>(null);

// ============================================
// PROVIDER
// ============================================

interface OrchestratorProviderProps {
  children: ReactNode;
  initialContext?: Partial<UserContext>;
}

export function OrchestratorProvider({
  children,
  initialContext = {},
}: OrchestratorProviderProps) {
  const [state, dispatch] = useReducer(orchestratorReducer, {
    ...defaultState,
    context: { ...defaultUserContext, ...initialContext },
  });

  // Forensic event log (in-memory for demo)
  const forensicEvents: ForensicEvent[] = [];

  const logForensicEvent = useCallback((event: Omit<ForensicEvent, 'id' | 'timestamp'>) => {
    const fullEvent: ForensicEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    forensicEvents.push(fullEvent);
  }, []);

  // Actions
  const actions: OrchestratorActions = {
    surface: useCallback((componentId: string, reason?: string) => {
      dispatch({ type: 'SET_PHASE', componentId, phase: 'surfaced', reason });
      logForensicEvent({
        eventType: 'phase_transition',
        componentId,
        details: { phase: 'surfaced', reason },
      });
    }, [logForensicEvent]),

    dissolve: useCallback((componentId: string) => {
      dispatch({ type: 'SET_PHASE', componentId, phase: 'dissolving' });
      logForensicEvent({
        eventType: 'phase_transition',
        componentId,
        details: { phase: 'dissolving' },
      });
    }, [logForensicEvent]),

    focus: useCallback((componentId: string) => {
      dispatch({ type: 'SET_PHASE', componentId, phase: 'focused' });
      logForensicEvent({
        eventType: 'phase_transition',
        componentId,
        details: { phase: 'focused' },
      });
    }, [logForensicEvent]),

    blur: useCallback((componentId: string) => {
      dispatch({ type: 'SET_PHASE', componentId, phase: 'surfaced' });
      logForensicEvent({
        eventType: 'phase_transition',
        componentId,
        details: { phase: 'surfaced', from: 'focused' },
      });
    }, [logForensicEvent]),

    setContext: useCallback((updates: Partial<UserContext>) => {
      dispatch({ type: 'SET_CONTEXT', updates });
      logForensicEvent({
        eventType: 'system_event',
        details: { action: 'context_update', updates },
      });
    }, [logForensicEvent]),

    setForensicMode: useCallback((enabled: boolean) => {
      dispatch({ type: 'SET_FORENSIC_MODE', enabled });
      logForensicEvent({
        eventType: 'system_event',
        details: { action: 'forensic_mode', enabled },
      });
    }, [logForensicEvent]),

    setStatus: useCallback((status: StatusState) => {
      dispatch({ type: 'SET_STATUS', status });
    }, []),

    registerComponent: useCallback((config: AdaptiveComponentConfig) => {
      dispatch({ type: 'REGISTER_COMPONENT', config });
    }, []),

    unregisterComponent: useCallback((componentId: string) => {
      dispatch({ type: 'UNREGISTER_COMPONENT', componentId });
    }, []),

    evaluateAll: useCallback(() => {
      dispatch({ type: 'EVALUATE_ALL' });
    }, []),
  };

  return (
    <OrchestratorContext.Provider value={{ state, actions, forensicEvents }}>
      {children}
    </OrchestratorContext.Provider>
  );
}

// ============================================
// HOOKS
// ============================================

export function useOrchestrator() {
  const context = useContext(OrchestratorContext);
  if (!context) {
    throw new Error('useOrchestrator must be used within an OrchestratorProvider');
  }
  return context;
}

export function useSystemStatus() {
  const { state, actions } = useOrchestrator();
  return {
    status: state.systemStatus,
    setStatus: actions.setStatus,
  };
}

export function useForensicMode() {
  const { state, actions, forensicEvents } = useOrchestrator();
  return {
    isForensic: state.forensicMode,
    toggle: () => actions.setForensicMode(!state.forensicMode),
    enable: () => actions.setForensicMode(true),
    disable: () => actions.setForensicMode(false),
    events: forensicEvents,
  };
}

export function useUserContext() {
  const { state, actions } = useOrchestrator();
  return {
    context: state.context,
    setContext: actions.setContext,
  };
}
