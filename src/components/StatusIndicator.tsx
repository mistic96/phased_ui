/**
 * Morphing Status Indicator
 * A living presence that communicates system state through form, motion, and color
 */

import { type CSSProperties } from 'react';
import type { SystemStatus, StatusState } from '../phased/types';

interface StatusIndicatorProps {
  state: StatusState;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  showProgress?: boolean;
}

const SIZE_MAP = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
};

const STATUS_COLORS: Record<SystemStatus, string> = {
  idle: 'var(--color-idle)',
  listening: 'var(--color-listening)',
  thinking: 'var(--color-thinking)',
  processing: 'var(--color-processing)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  error: 'var(--color-error)',
};

const STATUS_LABELS: Record<SystemStatus, string> = {
  idle: 'Ready',
  listening: 'Listening...',
  thinking: 'Analyzing...',
  processing: 'Processing',
  success: 'Complete',
  warning: 'Attention needed',
  error: 'Error',
};

export function StatusIndicator({
  state,
  size = 'md',
  showLabel = true,
  showProgress = true,
}: StatusIndicatorProps) {
  const { status, message, progress, step, totalSteps } = state;
  const dimension = SIZE_MAP[size];

  const indicatorStyle: CSSProperties = {
    width: dimension,
    height: dimension,
    backgroundColor: STATUS_COLORS[status],
    borderRadius: '50%',
  };

  const label = message || STATUS_LABELS[status];
  const progressText = progress !== undefined
    ? `${progress}%`
    : step !== undefined && totalSteps !== undefined
      ? `Step ${step} of ${totalSteps}`
      : null;

  return (
    <div className="flex items-center gap-4">
      {/* The morphing indicator */}
      <div className="relative">
        <div
          className={`status-indicator status-${status}`}
          style={indicatorStyle}
        />

        {/* Ripple effect for listening/processing */}
        {(status === 'listening' || status === 'processing') && (
          <div
            className="absolute inset-0 rounded-full animate-ping opacity-30"
            style={{ backgroundColor: STATUS_COLORS[status] }}
          />
        )}
      </div>

      {/* Labels */}
      {(showLabel || showProgress) && (
        <div className="flex flex-col">
          {showLabel && (
            <span className="text-sm font-medium text-white/90">
              {label}
            </span>
          )}
          {showProgress && progressText && (
            <span className="text-xs text-white/50">
              {progressText}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// INTERACTIVE DEMO COMPONENT
// Shows all status states
// ============================================

interface StatusDemoProps {
  onStatusChange?: (status: SystemStatus) => void;
  currentStatus?: SystemStatus;
}

export function StatusDemo({ onStatusChange, currentStatus = 'idle' }: StatusDemoProps) {
  const statuses: SystemStatus[] = [
    'idle',
    'listening',
    'thinking',
    'processing',
    'success',
    'warning',
    'error',
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
        Status Indicator States
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => onStatusChange?.(status)}
            className={`
              p-4 rounded-xl transition-all duration-300
              ${currentStatus === status
                ? 'bg-white/10 ring-2 ring-white/20'
                : 'bg-white/5 hover:bg-white/8'
              }
            `}
          >
            <StatusIndicator
              state={{ status, message: STATUS_LABELS[status] }}
              size="lg"
              showLabel
              showProgress={false}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default StatusIndicator;
