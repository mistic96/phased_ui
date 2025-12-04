/**
 * Morphing Status Indicator
 * A living presence that communicates system state through form, motion, and color
 *
 * Shape States:
 * IDLE: ◯ Soft circle, calm breathing
 * LISTENING: ◯ Circle with expanding ripples
 * THINKING: ◎~~~ Organic blob, fluid morphing
 * PROCESSING: ⟨◈⟩ Geometric diamond, rotating
 * SUCCESS: ◆ Solid diamond, crystallized
 * WARNING: ⬡ Hexagon, slow pulse
 * ERROR: ✕ Fractured, subtle instability
 */

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
  idle: '#3b82f6',
  listening: '#6366f1',
  thinking: '#8b5cf6',
  processing: '#06b6d4',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
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

// SVG Shape Components for each state
function IdleShape({ size, color }: { size: number; color: string }) {
  const r = size * 0.35;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <filter id="glow-idle" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill={color}
        filter="url(#glow-idle)"
        className="animate-idle-breathe"
      />
    </svg>
  );
}

function ListeningShape({ size, color }: { size: number; color: string }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.25;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Ripple rings */}
      <circle cx={cx} cy={cy} r={r * 1.8} fill="none" stroke={color} strokeWidth="1" opacity="0.2" className="animate-ripple-1" />
      <circle cx={cx} cy={cy} r={r * 1.4} fill="none" stroke={color} strokeWidth="1.5" opacity="0.3" className="animate-ripple-2" />
      {/* Core circle */}
      <circle cx={cx} cy={cy} r={r} fill={color} className="animate-listening-pulse" />
    </svg>
  );
}

function ThinkingShape({ size, color }: { size: number; color: string }) {
  const cx = size / 2;
  const cy = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <filter id="glow-thinking" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Organic blob that morphs */}
      <path
        d={`M ${cx} ${cy - size * 0.35}
            Q ${cx + size * 0.35} ${cy - size * 0.2} ${cx + size * 0.3} ${cy + size * 0.1}
            Q ${cx + size * 0.25} ${cy + size * 0.4} ${cx} ${cy + size * 0.35}
            Q ${cx - size * 0.25} ${cy + size * 0.4} ${cx - size * 0.3} ${cy + size * 0.1}
            Q ${cx - size * 0.35} ${cy - size * 0.2} ${cx} ${cy - size * 0.35}
            Z`}
        fill={color}
        filter="url(#glow-thinking)"
        className="animate-thinking-morph"
      />
    </svg>
  );
}

function ProcessingShape({ size, color }: { size: number; color: string }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.32;
  // Diamond/geometric shape
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <filter id="glow-processing" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g className="animate-processing-rotate" style={{ transformOrigin: `${cx}px ${cy}px` }}>
        {/* Outer diamond */}
        <polygon
          points={`${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`}
          fill={color}
          filter="url(#glow-processing)"
        />
        {/* Inner facet */}
        <polygon
          points={`${cx},${cy - r * 0.5} ${cx + r * 0.5},${cy} ${cx},${cy + r * 0.5} ${cx - r * 0.5},${cy}`}
          fill="rgba(255,255,255,0.2)"
        />
      </g>
    </svg>
  );
}

function SuccessShape({ size, color }: { size: number; color: string }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.3;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <filter id="glow-success" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Solid diamond - crystallized */}
      <polygon
        points={`${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`}
        fill={color}
        filter="url(#glow-success)"
        className="animate-success-settle"
      />
      {/* Checkmark inside */}
      <polyline
        points={`${cx - r * 0.3},${cy} ${cx - r * 0.05},${cy + r * 0.25} ${cx + r * 0.35},${cy - r * 0.25}`}
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-check-draw"
      />
    </svg>
  );
}

function WarningShape({ size, color }: { size: number; color: string }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.32;
  // Hexagon shape
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <filter id="glow-warning" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <polygon
        points={points.join(' ')}
        fill={color}
        filter="url(#glow-warning)"
        className="animate-warning-slow"
      />
      {/* Exclamation mark */}
      <line x1={cx} y1={cy - r * 0.35} x2={cx} y2={cy + r * 0.1} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={cx} cy={cy + r * 0.35} r="2" fill="white" />
    </svg>
  );
}

function ErrorShape({ size, color }: { size: number; color: string }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.3;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <filter id="glow-error" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Fractured octagon */}
      <g className="animate-error-slow" filter="url(#glow-error)">
        <polygon
          points={`${cx},${cy - r} ${cx + r * 0.7},${cy - r * 0.7} ${cx + r},${cy} ${cx + r * 0.7},${cy + r * 0.7} ${cx},${cy + r} ${cx - r * 0.7},${cy + r * 0.7} ${cx - r},${cy} ${cx - r * 0.7},${cy - r * 0.7}`}
          fill={color}
        />
        {/* Crack lines */}
        <line x1={cx - r * 0.2} y1={cy - r * 0.6} x2={cx + r * 0.1} y2={cy - r * 0.1} stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
        <line x1={cx + r * 0.1} y1={cy - r * 0.1} x2={cx + r * 0.5} y2={cy + r * 0.3} stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
      </g>
      {/* X mark */}
      <g stroke="white" strokeWidth="2" strokeLinecap="round">
        <line x1={cx - r * 0.3} y1={cy - r * 0.3} x2={cx + r * 0.3} y2={cy + r * 0.3} />
        <line x1={cx + r * 0.3} y1={cy - r * 0.3} x2={cx - r * 0.3} y2={cy + r * 0.3} />
      </g>
    </svg>
  );
}

// Shape renderer based on status
function StatusShape({ status, size }: { status: SystemStatus; size: number }) {
  const color = STATUS_COLORS[status];

  switch (status) {
    case 'idle':
      return <IdleShape size={size} color={color} />;
    case 'listening':
      return <ListeningShape size={size} color={color} />;
    case 'thinking':
      return <ThinkingShape size={size} color={color} />;
    case 'processing':
      return <ProcessingShape size={size} color={color} />;
    case 'success':
      return <SuccessShape size={size} color={color} />;
    case 'warning':
      return <WarningShape size={size} color={color} />;
    case 'error':
      return <ErrorShape size={size} color={color} />;
    default:
      return <IdleShape size={size} color={color} />;
  }
}

export function StatusIndicator({
  state,
  size = 'md',
  showLabel = true,
  showProgress = true,
}: StatusIndicatorProps) {
  const { status, message, progress, step, totalSteps } = state;
  const dimension = SIZE_MAP[size];

  const label = message || STATUS_LABELS[status];
  const progressText = progress !== undefined
    ? `${progress}%`
    : step !== undefined && totalSteps !== undefined
      ? `Step ${step} of ${totalSteps}`
      : null;

  return (
    <div className="flex items-center gap-4">
      {/* The morphing indicator */}
      <div className="relative flex items-center justify-center">
        <StatusShape status={status} size={dimension} />
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
