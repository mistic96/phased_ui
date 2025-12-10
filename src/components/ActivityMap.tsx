import React, { useState, useCallback, useMemo } from 'react';

export type StageStatus = 'idle' | 'active' | 'completed' | 'error' | 'waiting';

export interface ProcessingStage {
  id: string;
  name: string;
  status: StageStatus;
  progress?: number; // 0-100
  recordsProcessed?: number;
  recordsTotal?: number;
  throughput?: number; // records per second
  errorCount?: number;
  telemetry?: {
    startTime?: Date;
    endTime?: Date;
    avgLatency?: number;
    peakMemory?: number;
    cpuUsage?: number;
    logs?: string[];
  };
}

export interface DataFlow {
  from: string;
  to: string;
  active: boolean;
  particleCount?: number;
}

export interface ActivityMapProps {
  stages: ProcessingStage[];
  flows: DataFlow[];
  onStageClick?: (stage: ProcessingStage) => void;
  selectedStageId?: string;
  showTelemetry?: boolean;
  animated?: boolean;
  className?: string;
}

const StageNode: React.FC<{
  stage: ProcessingStage;
  isSelected: boolean;
  onClick: () => void;
  position: { x: number; y: number };
}> = ({ stage, isSelected, onClick, position }) => {
  const getStatusColor = () => {
    switch (stage.status) {
      case 'active': return 'border-blue-500 bg-blue-500/20';
      case 'completed': return 'border-emerald-500 bg-emerald-500/20';
      case 'error': return 'border-red-500 bg-red-500/20';
      case 'waiting': return 'border-amber-500 bg-amber-500/20';
      default: return 'border-white/20 bg-white/5';
    }
  };

  const getGlowColor = () => {
    switch (stage.status) {
      case 'active': return '0 0 30px rgba(59, 130, 246, 0.4)';
      case 'completed': return '0 0 20px rgba(16, 185, 129, 0.3)';
      case 'error': return '0 0 25px rgba(239, 68, 68, 0.4)';
      default: return 'none';
    }
  };

  const getStatusIcon = () => {
    switch (stage.status) {
      case 'active':
        return (
          <svg className="w-5 h-5 text-blue-400 animate-spin" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="10" cy="10" r="7" strokeOpacity={0.3} />
            <path d="M10 3a7 7 0 0 1 7 7" strokeLinecap="round" />
          </svg>
        );
      case 'completed':
        return (
          <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'waiting':
        return (
          <svg className="w-5 h-5 text-amber-400 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-white/30" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div
      className="stage-node absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
      style={{ left: position.x, top: position.y }}
      onClick={onClick}
    >
      <div
        className={`
          relative p-4 rounded-xl border-2 transition-all duration-300
          ${getStatusColor()}
          ${isSelected ? 'ring-2 ring-white/30 scale-110' : 'hover:scale-105'}
        `}
        style={{ boxShadow: getGlowColor() }}
      >
        {/* Status icon */}
        <div className="flex items-center justify-center mb-2">
          {getStatusIcon()}
        </div>

        {/* Stage name */}
        <div className="text-sm font-medium text-white/90 text-center whitespace-nowrap">
          {stage.name}
        </div>

        {/* Progress bar */}
        {stage.status === 'active' && stage.progress !== undefined && (
          <div className="mt-2 w-20 h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-400 rounded-full transition-all duration-300"
              style={{ width: `${stage.progress}%` }}
            />
          </div>
        )}

        {/* Stats */}
        {stage.recordsProcessed !== undefined && (
          <div className="mt-1 text-xs text-white/50 text-center">
            {stage.recordsProcessed.toLocaleString()}
            {stage.recordsTotal && ` / ${stage.recordsTotal.toLocaleString()}`}
          </div>
        )}

        {/* Error badge */}
        {stage.errorCount !== undefined && stage.errorCount > 0 && (
          <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
            {stage.errorCount}
          </div>
        )}

        {/* Active pulse ring */}
        {stage.status === 'active' && (
          <div className="absolute inset-0 rounded-xl border-2 border-blue-400/50 animate-ping" style={{ animationDuration: '2s' }} />
        )}
      </div>
    </div>
  );
};

const FlowLine: React.FC<{
  fromPos: { x: number; y: number };
  toPos: { x: number; y: number };
  active: boolean;
  particleCount: number;
}> = ({ fromPos, toPos, active, particleCount }) => {
  const dx = toPos.x - fromPos.x;
  const dy = toPos.y - fromPos.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  return (
    <div
      className="flow-line absolute origin-left"
      style={{
        left: fromPos.x,
        top: fromPos.y,
        width: length,
        transform: `rotate(${angle}deg)`,
      }}
    >
      {/* Base line */}
      <div className={`h-0.5 ${active ? 'bg-blue-500/40' : 'bg-white/10'} transition-colors duration-300`} />

      {/* Animated particles */}
      {active && Array.from({ length: particleCount }).map((_, i) => (
        <div
          key={i}
          className="flow-particle absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-400"
          style={{
            animation: `flowParticle 2s linear infinite`,
            animationDelay: `${(i / particleCount) * 2}s`,
          }}
        />
      ))}

      {/* Arrow head */}
      <div
        className={`absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0
          border-t-[4px] border-t-transparent
          border-b-[4px] border-b-transparent
          border-l-[8px] ${active ? 'border-l-blue-500/60' : 'border-l-white/20'}
          transition-colors duration-300`}
      />
    </div>
  );
};

const TelemetryPanel: React.FC<{
  stage: ProcessingStage;
  onClose: () => void;
}> = ({ stage, onClose }) => {
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const telemetry = stage.telemetry;

  return (
    <div className="telemetry-panel absolute right-0 top-0 bottom-0 w-80 bg-black/90 border-l border-white/10 p-4 overflow-y-auto animate-slideIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white/90">{stage.name} Telemetry</h3>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-white/10 text-white/50 hover:text-white/90 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Status */}
      <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
        <div className="text-xs text-white/50 mb-1">Status</div>
        <div className={`text-sm font-medium capitalize ${
          stage.status === 'completed' ? 'text-emerald-400' :
          stage.status === 'active' ? 'text-blue-400' :
          stage.status === 'error' ? 'text-red-400' :
          'text-white/70'
        }`}>
          {stage.status}
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {stage.recordsProcessed !== undefined && (
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="text-xs text-white/50 mb-1">Records</div>
            <div className="text-lg font-semibold text-white/90">
              {stage.recordsProcessed.toLocaleString()}
            </div>
          </div>
        )}
        {stage.throughput !== undefined && (
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="text-xs text-white/50 mb-1">Throughput</div>
            <div className="text-lg font-semibold text-white/90">
              {stage.throughput}/s
            </div>
          </div>
        )}
        {telemetry?.avgLatency !== undefined && (
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="text-xs text-white/50 mb-1">Avg Latency</div>
            <div className="text-lg font-semibold text-white/90">
              {formatDuration(telemetry.avgLatency)}
            </div>
          </div>
        )}
        {telemetry?.cpuUsage !== undefined && (
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="text-xs text-white/50 mb-1">CPU Usage</div>
            <div className="text-lg font-semibold text-white/90">
              {telemetry.cpuUsage}%
            </div>
          </div>
        )}
      </div>

      {/* Error count */}
      {stage.errorCount !== undefined && stage.errorCount > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
          <div className="text-xs text-red-400/70 mb-1">Errors</div>
          <div className="text-lg font-semibold text-red-400">
            {stage.errorCount}
          </div>
        </div>
      )}

      {/* Logs */}
      {telemetry?.logs && telemetry.logs.length > 0 && (
        <div>
          <div className="text-xs text-white/50 mb-2">Recent Logs</div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {telemetry.logs.map((log, i) => (
              <div key={i} className="text-xs text-white/60 font-mono p-2 bg-white/5 rounded">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const ActivityMap: React.FC<ActivityMapProps> = ({
  stages,
  flows,
  onStageClick,
  selectedStageId,
  showTelemetry = true,
  animated = true,
  className = '',
}) => {
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);
  const selectedId = selectedStageId ?? internalSelectedId;

  const selectedStage = useMemo(
    () => stages.find(s => s.id === selectedId),
    [stages, selectedId]
  );

  // Calculate stage positions in a horizontal flow
  const stagePositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    const width = 800;
    const height = 200;
    const padding = 80;

    stages.forEach((stage, index) => {
      positions[stage.id] = {
        x: padding + ((width - padding * 2) / (stages.length - 1 || 1)) * index,
        y: height / 2,
      };
    });

    return positions;
  }, [stages]);

  const handleStageClick = useCallback((stage: ProcessingStage) => {
    setInternalSelectedId(prev => prev === stage.id ? null : stage.id);
    onStageClick?.(stage);
  }, [onStageClick]);

  const handleClosePanel = useCallback(() => {
    setInternalSelectedId(null);
  }, []);

  return (
    <div className={`activity-map relative ${className}`}>
      {/* Main visualization area */}
      <div className="activity-map-canvas relative h-[250px] bg-white/[0.02] rounded-xl border border-white/10 overflow-hidden">
        {/* Flow lines (rendered first, behind nodes) */}
        {flows.map((flow, index) => {
          const fromPos = stagePositions[flow.from];
          const toPos = stagePositions[flow.to];
          if (!fromPos || !toPos) return null;

          return (
            <FlowLine
              key={`${flow.from}-${flow.to}-${index}`}
              fromPos={{ x: fromPos.x + 40, y: fromPos.y }}
              toPos={{ x: toPos.x - 40, y: toPos.y }}
              active={animated && flow.active}
              particleCount={flow.particleCount ?? 3}
            />
          );
        })}

        {/* Stage nodes */}
        {stages.map(stage => (
          <StageNode
            key={stage.id}
            stage={stage}
            isSelected={selectedId === stage.id}
            onClick={() => handleStageClick(stage)}
            position={stagePositions[stage.id]}
          />
        ))}

        {/* Telemetry panel */}
        {showTelemetry && selectedStage && (
          <TelemetryPanel stage={selectedStage} onClose={handleClosePanel} />
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-xs text-white/40">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500/50 border border-blue-500" />
          <span>Active</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500/50 border border-emerald-500" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500/50 border border-amber-500" />
          <span>Waiting</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/50 border border-red-500" />
          <span>Error</span>
        </div>
      </div>
    </div>
  );
};

export default ActivityMap;
