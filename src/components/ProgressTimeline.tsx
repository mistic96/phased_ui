import React, { useEffect, useState } from 'react';

export type StepStatus = 'pending' | 'active' | 'completed' | 'error' | 'skipped';

export interface TimelineStep {
  id: string;
  label: string;
  description?: string;
  status: StepStatus;
  icon?: React.ReactNode;
  metadata?: Record<string, string | number>;
}

export interface ProgressTimelineProps {
  steps: TimelineStep[];
  orientation?: 'horizontal' | 'vertical';
  showConnectors?: boolean;
  animated?: boolean;
  onStepClick?: (step: TimelineStep, index: number) => void;
  className?: string;
}

const StatusIcon: React.FC<{ status: StepStatus; animated?: boolean }> = ({ status, animated }) => {
  const baseClasses = "w-5 h-5 transition-all duration-300";

  switch (status) {
    case 'completed':
      return (
        <svg className={`${baseClasses} text-emerald-400`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      );
    case 'error':
      return (
        <svg className={`${baseClasses} text-red-400`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      );
    case 'active':
      return (
        <div className={`${baseClasses} ${animated ? 'animate-pulse' : ''}`}>
          <div className="w-full h-full rounded-full bg-blue-400 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-white animate-ping" />
          </div>
        </div>
      );
    case 'skipped':
      return (
        <svg className={`${baseClasses} text-white/30`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      );
    default: // pending
      return (
        <div className={`${baseClasses} rounded-full border-2 border-white/30`} />
      );
  }
};

const StepNode: React.FC<{
  step: TimelineStep;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  orientation: 'horizontal' | 'vertical';
  showConnectors: boolean;
  animated: boolean;
  onClick?: () => void;
}> = ({ step, index, isFirst, isLast, orientation, showConnectors, animated, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHasEntered(true), index * 100);
    return () => clearTimeout(timer);
  }, [index]);

  const getStatusColor = () => {
    switch (step.status) {
      case 'completed': return 'bg-emerald-500/20 border-emerald-500/50';
      case 'active': return 'bg-blue-500/20 border-blue-500/50 shadow-lg shadow-blue-500/20';
      case 'error': return 'bg-red-500/20 border-red-500/50';
      case 'skipped': return 'bg-white/5 border-white/10';
      default: return 'bg-white/5 border-white/20';
    }
  };

  const getConnectorColor = () => {
    switch (step.status) {
      case 'completed': return 'bg-emerald-500/60';
      case 'active': return 'bg-gradient-to-r from-emerald-500/60 to-blue-500/60';
      case 'error': return 'bg-gradient-to-r from-emerald-500/60 to-red-500/60';
      default: return 'bg-white/20';
    }
  };

  const isVertical = orientation === 'vertical';

  return (
    <div
      className={`
        timeline-step relative flex items-center
        ${isVertical ? 'flex-row' : 'flex-col'}
        ${hasEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        transition-all duration-500 ease-out
      `}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Connector Before */}
      {showConnectors && !isFirst && (
        <div
          className={`
            timeline-connector absolute
            ${isVertical
              ? 'left-5 -top-1 w-0.5 h-8 -translate-x-1/2'
              : 'top-5 -left-1 h-0.5 w-8 -translate-y-1/2'
            }
            ${getConnectorColor()}
            transition-all duration-500
          `}
        />
      )}

      {/* Step Node */}
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          timeline-node relative z-10 flex items-center justify-center
          w-10 h-10 rounded-full border-2
          ${getStatusColor()}
          ${onClick ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
          ${animated && step.status === 'active' ? 'animate-pulse' : ''}
          transition-all duration-300
        `}
      >
        {step.icon || <StatusIcon status={step.status} animated={animated} />}

        {/* Active ring animation */}
        {step.status === 'active' && animated && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-blue-400/50 animate-ping" />
            <div className="absolute -inset-1 rounded-full border border-blue-400/30 animate-pulse" />
          </>
        )}
      </button>

      {/* Label and Description */}
      <div
        className={`
          timeline-label
          ${isVertical ? 'ml-4 text-left' : 'mt-3 text-center'}
          ${isHovered ? 'opacity-100' : 'opacity-80'}
          transition-opacity duration-200
        `}
      >
        <div className={`
          font-medium text-sm
          ${step.status === 'active' ? 'text-blue-300' : ''}
          ${step.status === 'completed' ? 'text-emerald-300' : ''}
          ${step.status === 'error' ? 'text-red-300' : ''}
          ${step.status === 'pending' || step.status === 'skipped' ? 'text-white/60' : ''}
        `}>
          {step.label}
        </div>
        {step.description && (
          <div className="text-xs text-white/40 mt-0.5 max-w-[120px]">
            {step.description}
          </div>
        )}

        {/* Metadata tooltip on hover */}
        {isHovered && step.metadata && Object.keys(step.metadata).length > 0 && (
          <div className={`
            absolute z-20 mt-2 p-2 rounded-lg bg-black/90 border border-white/10
            text-xs text-white/70 whitespace-nowrap
            ${isVertical ? 'left-14' : 'left-1/2 -translate-x-1/2'}
            animate-fadeIn
          `}>
            {Object.entries(step.metadata).map(([key, value]) => (
              <div key={key} className="flex gap-2">
                <span className="text-white/40">{key}:</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Connector After (for horizontal layout) */}
      {showConnectors && !isLast && isVertical && (
        <div
          className={`
            timeline-connector-after absolute left-5 -bottom-1 w-0.5 h-8 -translate-x-1/2
            ${step.status === 'completed' ? 'bg-emerald-500/60' : 'bg-white/20'}
            transition-all duration-500
          `}
        />
      )}
    </div>
  );
};

export const ProgressTimeline: React.FC<ProgressTimelineProps> = ({
  steps,
  orientation = 'horizontal',
  showConnectors = true,
  animated = true,
  onStepClick,
  className = '',
}) => {
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    const count = steps.filter(s => s.status === 'completed').length;
    setCompletedCount(count);
  }, [steps]);

  const progressPercent = steps.length > 0 ? (completedCount / steps.length) * 100 : 0;
  const isVertical = orientation === 'vertical';

  return (
    <div className={`progress-timeline ${className}`}>
      {/* Progress bar */}
      <div className="timeline-progress mb-4">
        <div className="flex items-center justify-between text-xs text-white/50 mb-1">
          <span>Progress</span>
          <span>{completedCount} of {steps.length} steps</span>
        </div>
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Timeline */}
      <div
        className={`
          timeline-container relative
          ${isVertical
            ? 'flex flex-col gap-8'
            : 'flex flex-row items-start justify-between gap-4'
          }
        `}
      >
        {/* Background connector line */}
        {showConnectors && steps.length > 1 && (
          <div
            className={`
              absolute
              ${isVertical
                ? 'left-5 top-5 bottom-5 w-0.5 -translate-x-1/2 bg-gradient-to-b'
                : 'top-5 left-5 right-5 h-0.5 -translate-y-1/2 bg-gradient-to-r'
              }
              from-white/10 via-white/20 to-white/10
            `}
          />
        )}

        {steps.map((step, index) => (
          <StepNode
            key={step.id}
            step={step}
            index={index}
            isFirst={index === 0}
            isLast={index === steps.length - 1}
            orientation={orientation}
            showConnectors={showConnectors}
            animated={animated}
            onClick={onStepClick ? () => onStepClick(step, index) : undefined}
          />
        ))}
      </div>
    </div>
  );
};

// Demo helper to create workflow steps
export const createWorkflowSteps = (
  labels: string[],
  currentStep: number,
  errorStep?: number
): TimelineStep[] => {
  return labels.map((label, index) => ({
    id: `step-${index}`,
    label,
    status:
      errorStep !== undefined && index === errorStep ? 'error' :
      index < currentStep ? 'completed' :
      index === currentStep ? 'active' :
      'pending',
  }));
};

export default ProgressTimeline;
