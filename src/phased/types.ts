/**
 * PHASED FRAMEWORK - Core Types
 * Intent-first interfaces
 *
 * Components exist in different phases of visibility:
 * DORMANT → WARMING → SURFACED → FOCUSED → DISSOLVING → DORMANT
 */

// ============================================
// PHASE SYSTEM
// ============================================

export type Phase =
  | 'dormant'     // Hidden, but subscribed to events
  | 'warming'     // Loading data, preparing render
  | 'surfaced'    // Visible, available for interaction
  | 'focused'     // Primary user attention
  | 'dissolving'; // Fading, but still interactive

export type PhaseTransition =
  | 'surface'     // dormant/dissolving → surfaced
  | 'focus'       // surfaced → focused
  | 'blur'        // focused → surfaced
  | 'dissolve'    // surfaced/focused → dissolving
  | 'hibernate';  // dissolving → dormant

// ============================================
// STATUS INDICATOR STATES
// ============================================

export type SystemStatus =
  | 'idle'        // Ready, calm breathing
  | 'listening'   // Responsive ripples
  | 'thinking'    // Slow morphing, analyzing
  | 'processing'  // Geometric rotation
  | 'success'     // Crystallized settle
  | 'warning'     // Subtle vibration
  | 'error';      // Unstable fracture

export interface StatusState {
  status: SystemStatus;
  message?: string;
  progress?: number;       // 0-100 for processing
  step?: number;           // Current step
  totalSteps?: number;     // Total steps
}

// ============================================
// CONDITIONS & RULES
// ============================================

export type ConditionType =
  | 'context'     // User context (role, urgency, device)
  | 'data'        // Data state changes
  | 'intent'      // Detected user intent
  | 'time'        // Time-based conditions
  | 'confidence'  // AI confidence levels
  | 'user'        // Explicit user actions
  | 'system';     // System events

export type ConditionOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'greaterThan'
  | 'lessThan'
  | 'exists'
  | 'notExists'
  | 'changed'
  | 'matches';    // Regex

export interface Condition {
  type: ConditionType;
  operator: ConditionOperator;
  field: string;
  value: unknown;
  weight?: number;  // For relevance scoring (0-1)
}

// ============================================
// COMPONENT REGISTRATION
// ============================================

export interface AdaptiveComponentConfig {
  id: string;
  displayName: string;
  category: string;
  description?: string;

  // Visibility rules (declarative)
  surfaceWhen?: Condition[];
  dissolveWhen?: Condition[];
  forceShowWhen?: Condition[];

  // Priority for rendering order
  priority?: number;

  // Data dependencies
  dataSubscriptions?: string[];
}

export interface AdaptiveComponentState {
  phase: Phase;
  opacity: number;
  relevanceScore: number;
  lastTransition: PhaseTransition | null;
  transitionTimestamp: number;
}

// ============================================
// USER CONTEXT
// ============================================

export type UserRole =
  | 'analyst'
  | 'manager'
  | 'compliance'
  | 'admin'
  | 'viewer';

export type Urgency =
  | 'low'
  | 'normal'
  | 'high'
  | 'critical';

export type Device =
  | 'desktop'
  | 'tablet'
  | 'mobile'
  | 'voice'
  | 'ar';

export interface UserContext {
  userId: string;
  role: UserRole;
  urgency: Urgency;
  device: Device;
  forensicMode: boolean;
  preferences: Record<string, unknown>;
  sessionHistory: InteractionEvent[];
}

export interface InteractionEvent {
  timestamp: number;
  type: 'click' | 'hover' | 'focus' | 'input' | 'gesture' | 'voice';
  componentId?: string;
  data?: unknown;
}

// ============================================
// ORCHESTRATOR
// ============================================

export interface OrchestratorState {
  components: Map<string, AdaptiveComponentState>;
  context: UserContext;
  systemStatus: StatusState;
  forensicMode: boolean;
}

export interface OrchestratorActions {
  // Phase transitions
  surface: (componentId: string, reason?: string) => void;
  dissolve: (componentId: string) => void;
  focus: (componentId: string) => void;
  blur: (componentId: string) => void;

  // Context updates
  setContext: (updates: Partial<UserContext>) => void;
  setForensicMode: (enabled: boolean) => void;

  // Status updates
  setStatus: (status: StatusState) => void;

  // Component registration
  registerComponent: (config: AdaptiveComponentConfig) => void;
  unregisterComponent: (componentId: string) => void;

  // Batch operations
  evaluateAll: () => void;
}

// ============================================
// FORENSIC / AUDIT
// ============================================

export interface ForensicEvent {
  id: string;
  timestamp: number;
  eventType:
    | 'phase_transition'
    | 'user_interaction'
    | 'data_change'
    | 'ai_decision'
    | 'system_event';
  componentId?: string;
  details: Record<string, unknown>;
  auditHash?: string;
}

export interface ForensicTimeline {
  events: ForensicEvent[];
  startTime: number;
  endTime?: number;
}

// ============================================
// ANIMATION CONFIGURATION
// ============================================

export interface PhaseAnimationConfig {
  duration: 'fast' | 'normal' | 'slow' | 'very-slow';
  easing: 'ease-in' | 'ease-out' | 'ease-in-out' | 'spring';
  delay?: number;
}

export const DEFAULT_ANIMATION_CONFIG: PhaseAnimationConfig = {
  duration: 'normal',
  easing: 'ease-in-out',
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export const phaseToClassName = (phase: Phase): string => `phase-${phase}`;

export const statusToClassName = (status: SystemStatus): string => `status-${status}`;

export const getPhaseOpacity = (phase: Phase): number => {
  switch (phase) {
    case 'dormant': return 0;
    case 'warming': return 0.3;
    case 'surfaced': return 1;
    case 'focused': return 1;
    case 'dissolving': return 0.5;
    default: return 1;
  }
};

export const isPhaseInteractive = (phase: Phase): boolean => {
  return phase === 'surfaced' || phase === 'focused' || phase === 'dissolving';
};

export const isPhaseVisible = (phase: Phase): boolean => {
  return phase !== 'dormant';
};
