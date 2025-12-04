/**
 * PHASED FRAMEWORK
 * Intent-first interfaces
 *
 * Export all public APIs
 */

// Types
export * from './types';

// Hooks
export { usePhase } from './usePhase';
export {
  useOrchestrator,
  useSystemStatus,
  useForensicMode,
  useUserContext,
} from './OrchestratorContext';

// Components
export { OrchestratorProvider } from './OrchestratorContext';
export { PhasedContainer, SubstrateHint, withPhase } from './PhasedContainer';
