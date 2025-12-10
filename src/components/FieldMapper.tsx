import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';

export interface Field {
  id: string;
  name: string;
  type: string;
  description?: string;
  required?: boolean;
  sample?: string;
}

export interface FieldMapping {
  sourceId: string;
  targetId: string;
  confidence?: number; // 0-1 for auto-suggested mappings
  isAutoSuggested?: boolean;
}

export interface FieldMapperProps {
  sourceFields: Field[];
  targetFields: Field[];
  mappings: FieldMapping[];
  onMappingsChange: (mappings: FieldMapping[]) => void;
  onAutoMap?: () => void;
  className?: string;
}

interface DragState {
  isDragging: boolean;
  sourceField: Field | null;
  startPosition: { x: number; y: number } | null;
  currentPosition: { x: number; y: number } | null;
}

const FieldCard: React.FC<{
  field: Field;
  side: 'source' | 'target';
  isConnected: boolean;
  isHighlighted: boolean;
  isDragTarget: boolean;
  onDragStart?: (e: React.MouseEvent) => void;
  onDrop?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}> = ({
  field,
  side,
  isConnected,
  isHighlighted,
  isDragTarget,
  onDragStart,
  onDrop,
  onMouseEnter,
  onMouseLeave,
}) => {
  const getTypeColor = () => {
    switch (field.type.toLowerCase()) {
      case 'string': return 'text-emerald-400 bg-emerald-500/20';
      case 'number': return 'text-blue-400 bg-blue-500/20';
      case 'date': return 'text-purple-400 bg-purple-500/20';
      case 'boolean': return 'text-amber-400 bg-amber-500/20';
      case 'array': return 'text-cyan-400 bg-cyan-500/20';
      case 'object': return 'text-pink-400 bg-pink-500/20';
      default: return 'text-white/60 bg-white/10';
    }
  };

  return (
    <div
      className={`
        field-card relative p-3 rounded-lg border transition-all duration-200
        ${isConnected
          ? 'bg-emerald-500/10 border-emerald-500/30'
          : 'bg-white/5 border-white/10 hover:border-white/20'
        }
        ${isHighlighted ? 'ring-2 ring-blue-400/50 border-blue-400/30' : ''}
        ${isDragTarget ? 'scale-105 bg-blue-500/20 border-blue-400/50' : ''}
        ${side === 'source' ? 'cursor-grab active:cursor-grabbing mr-2' : 'ml-2'}
      `}
      onMouseDown={side === 'source' ? onDragStart : undefined}
      onMouseUp={side === 'target' ? onDrop : undefined}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      data-field-id={field.id}
      data-side={side}
    >
      {/* Connection indicator */}
      <div
        className={`
          field-connector absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full
          border-2 transition-all duration-200
          ${side === 'source' ? '-right-1.5' : '-left-1.5'}
          ${isConnected
            ? 'bg-emerald-500 border-emerald-400 scale-110'
            : 'bg-white/10 border-white/30'
          }
          ${isDragTarget ? 'bg-blue-500 border-blue-400 scale-125' : ''}
        `}
      />

      {/* Field info */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-white/90 truncate">
              {field.name}
            </span>
            {field.required && (
              <span className="text-red-400 text-xs">*</span>
            )}
          </div>
          {field.description && (
            <p className="text-xs text-white/40 mt-0.5 truncate">
              {field.description}
            </p>
          )}
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor()}`}>
          {field.type}
        </span>
      </div>

      {/* Sample value */}
      {field.sample && (
        <div className="mt-2 text-xs text-white/30 font-mono truncate">
          {field.sample}
        </div>
      )}
    </div>
  );
};

const ConnectionLine: React.FC<{
  mapping: FieldMapping;
  sourceRef: React.RefObject<HTMLDivElement | null>;
  targetRef: React.RefObject<HTMLDivElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onRemove: () => void;
  isHovered: boolean;
  scrollVersion: number; // Triggers recalculation on scroll
}> = ({ mapping, sourceRef, targetRef, containerRef, onRemove, isHovered, scrollVersion }) => {
  const [path, setPath] = useState('');
  const [midPoint, setMidPoint] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updatePath = () => {
      if (!sourceRef.current || !targetRef.current || !containerRef.current) return;

      const container = containerRef.current.getBoundingClientRect();

      // Find the connector dots
      const sourceConnector = sourceRef.current.querySelector('.field-connector');
      const targetConnector = targetRef.current.querySelector('.field-connector');

      if (!sourceConnector || !targetConnector) return;

      const sc = sourceConnector.getBoundingClientRect();
      const tc = targetConnector.getBoundingClientRect();

      const startX = sc.left + sc.width / 2 - container.left;
      const startY = sc.top + sc.height / 2 - container.top;
      const endX = tc.left + tc.width / 2 - container.left;
      const endY = tc.top + tc.height / 2 - container.top;

      // Bezier curve control points
      const controlOffset = Math.abs(endX - startX) * 0.4;

      const pathD = `M ${startX} ${startY} C ${startX + controlOffset} ${startY}, ${endX - controlOffset} ${endY}, ${endX} ${endY}`;
      setPath(pathD);
      setMidPoint({
        x: (startX + endX) / 2,
        y: (startY + endY) / 2,
      });
    };

    updatePath();
    window.addEventListener('resize', updatePath);
    return () => window.removeEventListener('resize', updatePath);
  }, [sourceRef, targetRef, containerRef, scrollVersion]);

  if (!path) return null;

  return (
    <g className="connection-line">
      {/* Glow effect */}
      <path
        d={path}
        fill="none"
        stroke={mapping.isAutoSuggested ? 'rgba(139, 92, 246, 0.3)' : 'rgba(16, 185, 129, 0.3)'}
        strokeWidth={isHovered ? 8 : 4}
        className="transition-all duration-200"
      />
      {/* Main line */}
      <path
        d={path}
        fill="none"
        stroke={mapping.isAutoSuggested ? '#8b5cf6' : '#10b981'}
        strokeWidth={2}
        strokeDasharray={mapping.isAutoSuggested ? '8 4' : 'none'}
        className="transition-all duration-200"
      >
        {mapping.isAutoSuggested && (
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to="-24"
            dur="1s"
            repeatCount="indefinite"
          />
        )}
      </path>
      {/* Delete button on hover */}
      {isHovered && (
        <g
          className="cursor-pointer"
          onClick={onRemove}
        >
          <circle
            cx={midPoint.x}
            cy={midPoint.y}
            r={12}
            fill="#1a1a24"
            stroke="rgba(239, 68, 68, 0.5)"
            strokeWidth={2}
          />
          <text
            x={midPoint.x}
            y={midPoint.y}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#ef4444"
            fontSize={14}
            fontWeight="bold"
          >
            ×
          </text>
        </g>
      )}
      {/* Confidence badge for auto-suggested */}
      {mapping.isAutoSuggested && mapping.confidence !== undefined && !isHovered && (
        <g>
          <rect
            x={midPoint.x - 20}
            y={midPoint.y - 10}
            width={40}
            height={20}
            rx={10}
            fill="#1a1a24"
            stroke="rgba(139, 92, 246, 0.5)"
            strokeWidth={1}
          />
          <text
            x={midPoint.x}
            y={midPoint.y}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#8b5cf6"
            fontSize={10}
          >
            {Math.round(mapping.confidence * 100)}%
          </text>
        </g>
      )}
    </g>
  );
};

export const FieldMapper: React.FC<FieldMapperProps> = ({
  sourceFields,
  targetFields,
  mappings,
  onMappingsChange,
  onAutoMap,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sourceColumnRef = useRef<HTMLDivElement>(null);
  const targetColumnRef = useRef<HTMLDivElement>(null);
  const sourceRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const targetRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    sourceField: null,
    startPosition: null,
    currentPosition: null,
  });
  const [hoveredMapping, setHoveredMapping] = useState<string | null>(null);
  const [hoveredTarget, setHoveredTarget] = useState<string | null>(null);
  const [scrollVersion, setScrollVersion] = useState(0);

  // Handle scroll to update connection lines
  const handleScroll = useCallback(() => {
    setScrollVersion(v => v + 1);
  }, []);

  // Get connected field IDs
  const connectedSources = useMemo(
    () => new Set(mappings.map(m => m.sourceId)),
    [mappings]
  );
  const connectedTargets = useMemo(
    () => new Set(mappings.map(m => m.targetId)),
    [mappings]
  );

  // Handle drag start
  const handleDragStart = useCallback((field: Field, e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const sourceEl = sourceRefs.current.get(field.id);
    if (!sourceEl) return;

    const connector = sourceEl.querySelector('.field-connector');
    if (!connector) return;

    const connectorRect = connector.getBoundingClientRect();
    setDragState({
      isDragging: true,
      sourceField: field,
      startPosition: {
        x: connectorRect.left + connectorRect.width / 2 - rect.left,
        y: connectorRect.top + connectorRect.height / 2 - rect.top,
      },
      currentPosition: {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      },
    });
  }, []);

  // Handle drag move
  useEffect(() => {
    if (!dragState.isDragging) return;

    const handleMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setDragState(prev => ({
        ...prev,
        currentPosition: {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        },
      }));
    };

    const handleUp = () => {
      setDragState({
        isDragging: false,
        sourceField: null,
        startPosition: null,
        currentPosition: null,
      });
      setHoveredTarget(null);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [dragState.isDragging]);

  // Handle drop on target
  const handleDrop = useCallback((targetField: Field) => {
    if (!dragState.sourceField) return;

    // Check if this target is already mapped
    const existingMapping = mappings.find(m => m.targetId === targetField.id);
    let newMappings = [...mappings];

    if (existingMapping) {
      // Replace existing mapping
      newMappings = newMappings.filter(m => m.targetId !== targetField.id);
    }

    // Remove any existing mapping for this source
    newMappings = newMappings.filter(m => m.sourceId !== dragState.sourceField!.id);

    // Add new mapping
    newMappings.push({
      sourceId: dragState.sourceField.id,
      targetId: targetField.id,
    });

    onMappingsChange(newMappings);
  }, [dragState.sourceField, mappings, onMappingsChange]);

  // Remove mapping
  const removeMapping = useCallback((sourceId: string, targetId: string) => {
    onMappingsChange(mappings.filter(m => !(m.sourceId === sourceId && m.targetId === targetId)));
    setHoveredMapping(null);
  }, [mappings, onMappingsChange]);

  // Render drag line
  const renderDragLine = () => {
    if (!dragState.isDragging || !dragState.startPosition || !dragState.currentPosition) return null;

    const { startPosition, currentPosition } = dragState;
    const controlOffset = Math.abs(currentPosition.x - startPosition.x) * 0.4;
    const path = `M ${startPosition.x} ${startPosition.y} C ${startPosition.x + controlOffset} ${startPosition.y}, ${currentPosition.x - controlOffset} ${currentPosition.y}, ${currentPosition.x} ${currentPosition.y}`;

    return (
      <path
        d={path}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={2}
        strokeDasharray="6 3"
        className="pointer-events-none"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="0"
          to="-18"
          dur="0.5s"
          repeatCount="indefinite"
        />
      </path>
    );
  };

  const mappingStats = {
    total: targetFields.filter(f => f.required).length,
    mapped: mappings.filter(m => {
      const target = targetFields.find(f => f.id === m.targetId);
      return target?.required;
    }).length,
  };

  return (
    <div className={`field-mapper ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-white/60">
          <span className="text-emerald-400 font-medium">{mappings.length}</span> of{' '}
          <span className="font-medium">{targetFields.length}</span> fields mapped
          {mappingStats.total > 0 && (
            <span className="ml-2 text-white/40">
              ({mappingStats.mapped}/{mappingStats.total} required)
            </span>
          )}
        </div>
        {onAutoMap && (
          <button
            onClick={onAutoMap}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 transition-all flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            Auto-Map
          </button>
        )}
      </div>

      {/* Mapping container */}
      <div
        ref={containerRef}
        className="field-mapper-container relative grid grid-cols-[1fr_auto_1fr] gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/10"
      >
        {/* Source fields */}
        <div
          ref={sourceColumnRef}
          className="field-column field-column-source space-y-2 pr-2"
          onScroll={handleScroll}
        >
          <div className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
            Source Fields
          </div>
          {sourceFields.map(field => (
            <div
              key={field.id}
              ref={el => { if (el) sourceRefs.current.set(field.id, el); }}
            >
              <FieldCard
                field={field}
                side="source"
                isConnected={connectedSources.has(field.id)}
                isHighlighted={dragState.sourceField?.id === field.id}
                isDragTarget={false}
                onDragStart={(e) => handleDragStart(field, e)}
              />
            </div>
          ))}
        </div>

        {/* Connection area - SVG spans full container */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 10 }}
        >
          {/* Existing connections */}
          {mappings.map(mapping => {
            const sourceRef = { current: sourceRefs.current.get(mapping.sourceId) || null };
            const targetRef = { current: targetRefs.current.get(mapping.targetId) || null };
            const mappingKey = `${mapping.sourceId}-${mapping.targetId}`;

            return (
              <ConnectionLine
                key={mappingKey}
                mapping={mapping}
                sourceRef={sourceRef}
                targetRef={targetRef}
                containerRef={containerRef}
                onRemove={() => removeMapping(mapping.sourceId, mapping.targetId)}
                isHovered={hoveredMapping === mappingKey}
                scrollVersion={scrollVersion}
              />
            );
          })}
          {/* Drag line */}
          {renderDragLine()}
        </svg>

        {/* Spacer for visual separation */}
        <div className="w-24" />

        {/* Target fields */}
        <div
          ref={targetColumnRef}
          className="field-column field-column-target space-y-2 pl-2"
          onScroll={handleScroll}
        >
          <div className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
            Target Fields
          </div>
          {targetFields.map(field => (
            <div
              key={field.id}
              ref={el => { if (el) targetRefs.current.set(field.id, el); }}
            >
              <FieldCard
                field={field}
                side="target"
                isConnected={connectedTargets.has(field.id)}
                isHighlighted={false}
                isDragTarget={dragState.isDragging && hoveredTarget === field.id}
                onDrop={() => handleDrop(field)}
                onMouseEnter={() => dragState.isDragging && setHoveredTarget(field.id)}
                onMouseLeave={() => setHoveredTarget(null)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-4 text-xs text-white/40">
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-emerald-500 rounded" />
          <span>Manual mapping</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-purple-500 rounded" style={{ background: 'repeating-linear-gradient(90deg, #8b5cf6 0, #8b5cf6 8px, transparent 8px, transparent 12px)' }} />
          <span>Auto-suggested</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-red-400">*</span>
          <span>Required field</span>
        </div>
      </div>
    </div>
  );
};

export default FieldMapper;
