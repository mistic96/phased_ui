/**
 * PHASED FRAMEWORK - Demo Interface
 * Showcasing phase transitions and adaptive UI patterns
 */

import { useState, useCallback } from 'react';
import {
  OrchestratorProvider,
  usePhase,
  useForensicMode,
  type Phase,
  type SystemStatus,
  type StatusState,
} from './phased';
import { StatusIndicator, StatusDemo } from './components/StatusIndicator';
import { Dropzone } from './components/Dropzone';
import { EntitySelector } from './components/EntitySelector';
import { ProgressTimeline, createWorkflowSteps, type TimelineStep } from './components/ProgressTimeline';
import { FieldMapper, type FieldMapping, type Field } from './components/FieldMapper';
import { ValidationGrid, type ValidationRule } from './components/ValidationGrid';
import {
  ChatInterface,
  type ChatMessage,
  type DetectedIntent,
  type ActionPreview,
  type InlineWidget,
  type ActionStreamItem,
  type PhaseContext,
} from './components/ChatInterface';
import { ActivityMap, type ProcessingStage, type DataFlow } from './components/ActivityMap';
import { FeedbackProvider, AuditTrail, useFeedback } from './components/FeedbackSystem';

// Sample stages for Activity Map demo
const DEMO_STAGES: ProcessingStage[] = [
  {
    id: 'ingest',
    name: 'Ingest',
    status: 'completed',
    recordsProcessed: 15420,
    recordsTotal: 15420,
    throughput: 2500,
    telemetry: {
      avgLatency: 12,
      cpuUsage: 45,
      logs: ['Batch 1 loaded: 5000 records', 'Batch 2 loaded: 5000 records', 'Batch 3 loaded: 5420 records'],
    },
  },
  {
    id: 'validate',
    name: 'Validate',
    status: 'completed',
    recordsProcessed: 15420,
    recordsTotal: 15420,
    errorCount: 3,
    telemetry: {
      avgLatency: 28,
      cpuUsage: 62,
      logs: ['Schema validation passed', '3 records failed format check', 'Quarantined invalid records'],
    },
  },
  {
    id: 'transform',
    name: 'Transform',
    status: 'active',
    progress: 67,
    recordsProcessed: 10328,
    recordsTotal: 15417,
    throughput: 1850,
    telemetry: {
      avgLatency: 45,
      cpuUsage: 78,
      logs: ['Applying field mappings...', 'Date format conversion in progress', 'Currency normalization active'],
    },
  },
  {
    id: 'enrich',
    name: 'Enrich',
    status: 'waiting',
    telemetry: {
      logs: ['Waiting for transform stage...'],
    },
  },
  {
    id: 'load',
    name: 'Load',
    status: 'idle',
    telemetry: {
      logs: ['Standing by...'],
    },
  },
];

const DEMO_FLOWS: DataFlow[] = [
  { from: 'ingest', to: 'validate', active: false },
  { from: 'validate', to: 'transform', active: true, particleCount: 4 },
  { from: 'transform', to: 'enrich', active: false },
  { from: 'enrich', to: 'load', active: false },
];

// Sample validation rules for demo
const DEMO_VALIDATION_RULES: ValidationRule[] = [
  { id: 'v1', name: 'Required Fields Present', category: 'Schema', status: 'pass', message: 'All required fields are present in the dataset' },
  { id: 'v2', name: 'Email Format', category: 'Format', status: 'pass', message: 'All email addresses match expected format' },
  { id: 'v3', name: 'Date Range Check', category: 'Business Rules', status: 'warn', message: '15 records have dates in the future', affectedRows: 15, severity: 'minor', details: 'Records with future dates:\n- Row 45: 2025-03-15\n- Row 128: 2025-06-22\n- Row 203: 2025-01-30\n... and 12 more' },
  { id: 'v4', name: 'Duplicate Detection', category: 'Data Quality', status: 'fail', message: '3 duplicate customer records found', affectedRows: 3, severity: 'major', details: 'Duplicate entries detected:\n- customer_id: 1042 (appears 2x)\n- customer_id: 3891 (appears 3x)' },
  { id: 'v5', name: 'Numeric Range', category: 'Business Rules', status: 'pass', message: 'All amounts within acceptable range' },
  { id: 'v6', name: 'Foreign Key Integrity', category: 'Schema', status: 'pass', message: 'All foreign key references are valid' },
  { id: 'v7', name: 'Null Value Check', category: 'Data Quality', status: 'warn', message: '8 optional fields contain null values', affectedRows: 8, severity: 'minor' },
  { id: 'v8', name: 'Character Encoding', category: 'Format', status: 'pass', message: 'All text fields use valid UTF-8 encoding' },
  { id: 'v9', name: 'PII Detection', category: 'Security', status: 'fail', message: 'Potential SSN patterns detected', affectedRows: 2, severity: 'critical', details: 'Warning: Possible PII detected in free-text fields.\nReview rows 892 and 1204 for Social Security Number patterns.' },
  { id: 'v10', name: 'Business Logic', category: 'Business Rules', status: 'pending', message: 'Awaiting external validation service' },
];

// Sample fields for Field Mapper demo
const SOURCE_FIELDS: Field[] = [
  { id: 's1', name: 'customer_name', type: 'string', description: 'Full customer name', sample: '"John Doe"' },
  { id: 's2', name: 'email_address', type: 'string', description: 'Contact email', sample: '"john@example.com"' },
  { id: 's3', name: 'purchase_date', type: 'date', description: 'Date of purchase', sample: '"2024-01-15"' },
  { id: 's4', name: 'total_amount', type: 'number', description: 'Order total', sample: '299.99' },
  { id: 's5', name: 'is_active', type: 'boolean', description: 'Account status', sample: 'true' },
  { id: 's6', name: 'tags', type: 'array', description: 'Customer tags', sample: '["vip", "retail"]' },
];

const TARGET_FIELDS: Field[] = [
  { id: 't1', name: 'full_name', type: 'string', description: 'Customer full name', required: true },
  { id: 't2', name: 'email', type: 'string', description: 'Email address', required: true },
  { id: 't3', name: 'order_date', type: 'date', description: 'Order timestamp', required: true },
  { id: 't4', name: 'amount', type: 'number', description: 'Total amount' },
  { id: 't5', name: 'status', type: 'boolean', description: 'Active status' },
  { id: 't6', name: 'labels', type: 'array', description: 'Category labels' },
];

// Sample entities for demo
const DEMO_ENTITIES = [
  { id: '1', name: 'Acme Corporation', type: 'Client', description: 'Enterprise software company', relevance: 0.95 },
  { id: '2', name: 'TechStart Inc', type: 'Client', description: 'AI startup', relevance: 0.88 },
  { id: '3', name: 'Global Finance', type: 'Client', description: 'Investment banking', relevance: 0.72 },
  { id: '4', name: 'DataFlow Systems', type: 'Partner', description: 'Data integration platform', relevance: 0.65 },
  { id: '5', name: 'CloudNine Services', type: 'Vendor', description: 'Cloud infrastructure', relevance: 0.58 },
  { id: '6', name: 'Retail Plus', type: 'Client', description: 'E-commerce platform', relevance: 0.45 },
  { id: '7', name: 'HealthTech Labs', type: 'Partner', description: 'Healthcare analytics', relevance: 0.38 },
  { id: '8', name: 'SecureNet', type: 'Vendor', description: 'Security solutions', relevance: 0.25 },
];

// ============================================
// PHASE DEMO CARD
// Interactive component showing phase states
// ============================================

interface PhaseDemoCardProps {
  title: string;
  description: string;
  initialPhase?: Phase;
  delay?: number;
}

function PhaseDemoCard({ title, description, initialPhase = 'dormant', delay = 0 }: PhaseDemoCardProps) {
  const {
    phase,
    className,
    surface,
    dissolve,
    focus,
    blur,
    hibernate,
    isFocused,
  } = usePhase({
    initialPhase,
    autoSurface: true,
    surfaceDelay: delay,
  });

  return (
    <div
      className={`
        ${className}
        relative p-6 rounded-2xl glass-elevated
        ${isFocused ? 'ring-2 ring-cyan-400/50' : ''}
      `}
    >
      {/* Phase badge */}
      <div className="absolute top-3 right-3">
        <span className={`
          px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded
          ${phase === 'dormant' ? 'bg-gray-500/20 text-gray-400' : ''}
          ${phase === 'warming' ? 'bg-amber-500/20 text-amber-400' : ''}
          ${phase === 'surfaced' ? 'bg-emerald-500/20 text-emerald-400' : ''}
          ${phase === 'focused' ? 'bg-cyan-500/20 text-cyan-400' : ''}
          ${phase === 'dissolving' ? 'bg-purple-500/20 text-purple-400' : ''}
        `}>
          {phase}
        </span>
      </div>

      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-white/60 mb-4">{description}</p>

      {/* Controls */}
      <div className="flex flex-wrap gap-2">
        <PhaseButton onClick={surface} disabled={phase === 'surfaced' || phase === 'focused'}>
          Surface
        </PhaseButton>
        <PhaseButton onClick={focus} disabled={phase !== 'surfaced'}>
          Focus
        </PhaseButton>
        <PhaseButton onClick={blur} disabled={phase !== 'focused'}>
          Blur
        </PhaseButton>
        <PhaseButton onClick={dissolve} disabled={phase === 'dormant' || phase === 'dissolving'}>
          Dissolve
        </PhaseButton>
        <PhaseButton onClick={hibernate} disabled={phase === 'dormant'}>
          Hibernate
        </PhaseButton>
      </div>
    </div>
  );
}

function PhaseButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-3 py-1.5 text-xs font-medium rounded-lg
        transition-all duration-200
        ${disabled
          ? 'bg-white/5 text-white/30 cursor-not-allowed'
          : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white active:scale-95'
        }
      `}
    >
      {children}
    </button>
  );
}

// ============================================
// PHASE LIFECYCLE VISUALIZATION
// ============================================

function PhaseLifecycleViz() {
  const phases: Phase[] = ['dormant', 'warming', 'surfaced', 'focused', 'dissolving'];
  const [activePhase, setActivePhase] = useState<Phase>('surfaced');

  return (
    <div className="p-6 rounded-2xl glass">
      <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-6">
        Phase Lifecycle
      </h3>

      <div className="flex items-center justify-between gap-2">
        {phases.map((phase, index) => (
          <div key={phase} className="flex items-center">
            <button
              onClick={() => setActivePhase(phase)}
              className={`
                relative flex flex-col items-center gap-2 p-3 rounded-xl
                transition-all duration-300
                ${activePhase === phase
                  ? 'bg-white/10 scale-110'
                  : 'bg-white/5 hover:bg-white/8'
                }
              `}
            >
              {/* Phase indicator */}
              <div
                className={`
                  w-8 h-8 rounded-full
                  ${phase === 'dormant' ? 'bg-gray-600' : ''}
                  ${phase === 'warming' ? 'bg-amber-500 animate-pulse' : ''}
                  ${phase === 'surfaced' ? 'bg-emerald-500' : ''}
                  ${phase === 'focused' ? 'bg-cyan-400 ring-4 ring-cyan-400/30' : ''}
                  ${phase === 'dissolving' ? 'bg-purple-500 opacity-50' : ''}
                `}
              />
              <span className="text-[10px] font-medium text-white/60 uppercase">
                {phase}
              </span>
            </button>

            {/* Arrow between phases */}
            {index < phases.length - 1 && (
              <div className="w-8 h-0.5 bg-white/10 mx-1" />
            )}
          </div>
        ))}
      </div>

      {/* Phase description */}
      <div className="mt-6 p-4 rounded-lg bg-white/5">
        <PhaseDescription phase={activePhase} />
      </div>
    </div>
  );
}

function PhaseDescription({ phase }: { phase: Phase }) {
  const descriptions: Record<Phase, { title: string; desc: string }> = {
    dormant: {
      title: 'Dormant',
      desc: 'Hidden but subscribed to events. Component exists in the substrate, ready to surface when conditions are met.',
    },
    warming: {
      title: 'Warming',
      desc: 'Loading data and preparing render. The component is becoming visible with a subtle pulse animation.',
    },
    surfaced: {
      title: 'Surfaced',
      desc: 'Fully visible and interactive. The component is available for user interaction.',
    },
    focused: {
      title: 'Focused',
      desc: 'Primary user attention. Enhanced visual treatment with glow effect. Other components may dim.',
    },
    dissolving: {
      title: 'Dissolving',
      desc: 'Fading out but still interactive. User can still interact during the transition.',
    },
  };

  const { title, desc } = descriptions[phase];

  return (
    <div>
      <h4 className="font-semibold text-white/90 mb-1">{title}</h4>
      <p className="text-sm text-white/50">{desc}</p>
    </div>
  );
}

// ============================================
// FORENSIC MODE TOGGLE
// ============================================

function ForensicModeToggle() {
  const { isForensic, toggle } = useForensicMode();

  return (
    <button
      onClick={toggle}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg
        transition-all duration-300
        ${isForensic
          ? 'bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/30'
          : 'bg-white/5 text-white/60 hover:bg-white/10'
        }
      `}
    >
      <span className="text-lg">{isForensic ? '🔬' : '✨'}</span>
      <span className="text-sm font-medium">
        {isForensic ? 'Forensic Mode' : 'Adaptive Mode'}
      </span>
    </button>
  );
}

// ============================================
// ANIMATION SHOWCASE
// ============================================

function AnimationShowcase() {
  const [animating, setAnimating] = useState<string | null>(null);

  const animations = [
    { id: 'surface', label: 'Surface In', className: 'animate-surface-in' },
    { id: 'dissolve', label: 'Dissolve Out', className: 'animate-dissolve-out' },
  ];

  const triggerAnimation = (id: string) => {
    setAnimating(null);
    setTimeout(() => setAnimating(id), 50);
  };

  return (
    <div className="p-6 rounded-2xl glass">
      <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-6">
        Transition Animations
      </h3>

      <div className="grid grid-cols-2 gap-6">
        {animations.map(({ id, label, className }) => (
          <div key={id} className="space-y-3">
            <button
              onClick={() => triggerAnimation(id)}
              className="w-full px-4 py-2 bg-white/10 hover:bg-white/15 rounded-lg text-sm font-medium transition-colors"
            >
              {label}
            </button>
            <div className="h-24 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden">
              <div
                key={animating === id ? Date.now() : 'static'}
                className={`
                  w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500
                  ${animating === id ? className : ''}
                `}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// MAIN APP
// ============================================

function AppContent() {
  const [statusState, setStatusState] = useState<StatusState>({
    status: 'idle',
    message: 'Ready',
  });
  const [selectedEntityIds, setSelectedEntityIds] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(2);
  const [workflowSteps, setWorkflowSteps] = useState<TimelineStep[]>(() =>
    createWorkflowSteps(
      ['Upload', 'Validate', 'Map Fields', 'Transform', 'Review', 'Complete'],
      2 // Start at step 2 (Map Fields is active)
    )
  );

  const advanceWorkflow = useCallback(() => {
    setCurrentStep(prev => {
      const next = Math.min(prev + 1, 5);
      setWorkflowSteps(createWorkflowSteps(
        ['Upload', 'Validate', 'Map Fields', 'Transform', 'Review', 'Complete'],
        next
      ));
      return next;
    });
  }, []);

  const resetWorkflow = useCallback(() => {
    setCurrentStep(0);
    setWorkflowSteps(createWorkflowSteps(
      ['Upload', 'Validate', 'Map Fields', 'Transform', 'Review', 'Complete'],
      0
    ));
  }, []);

  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([
    { sourceId: 's1', targetId: 't1' }, // Pre-map one for demo
  ]);

  const handleAutoMap = useCallback(() => {
    // Simulate auto-mapping with confidence scores
    setFieldMappings([
      { sourceId: 's1', targetId: 't1', confidence: 0.95, isAutoSuggested: true },
      { sourceId: 's2', targetId: 't2', confidence: 0.98, isAutoSuggested: true },
      { sourceId: 's3', targetId: 't3', confidence: 0.87, isAutoSuggested: true },
      { sourceId: 's4', targetId: 't4', confidence: 0.92, isAutoSuggested: true },
      { sourceId: 's5', targetId: 't5', confidence: 0.78, isAutoSuggested: true },
      { sourceId: 's6', targetId: 't6', confidence: 0.85, isAutoSuggested: true },
    ]);
  }, []);

  // Chat state with forward-looking features
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'system',
      content: 'Data transformation session started',
      timestamp: new Date(Date.now() - 60000),
    },
    {
      id: '2',
      role: 'assistant',
      content: 'Hello! I can help you transform and validate your data. What would you like to do?',
      timestamp: new Date(Date.now() - 55000),
      metadata: { confidence: 0.98, processingTime: 245 },
    },
    {
      id: '3',
      role: 'assistant',
      content: '12 records have missing date values - want me to flag them for review?',
      timestamp: new Date(Date.now() - 30000),
      isProactiveNudge: true,
    },
  ]);
  const [isChatTyping, setIsChatTyping] = useState(false);

  // Action stream for real-time system actions
  const [actionStream, setActionStream] = useState<ActionStreamItem[]>([
    { id: 'a1', timestamp: new Date(Date.now() - 120000), action: 'Session initialized', status: 'completed' },
    { id: 'a2', timestamp: new Date(Date.now() - 60000), action: 'Data file loaded', status: 'completed', detail: '15,420 records' },
    { id: 'a3', timestamp: new Date(Date.now() - 30000), action: 'Schema detected', status: 'completed', detail: '12 fields' },
  ]);

  // Phase context for context bar
  const phaseContext: PhaseContext = {
    currentPhase: 'Field Mapping',
    phaseProgress: 65,
    dataLoaded: [
      { name: 'Records', count: 15420 },
      { name: 'Fields', count: 12 },
    ],
    pendingItems: ['3 unmapped fields', 'Date format review'],
  };

  // Smart suggestions based on current phase
  const smartSuggestions = [
    'Auto-map remaining fields',
    'Show validation errors',
    'Export mapped data',
    'Review date formats',
  ];

  // Predictive text based on input
  const [predictiveText, setPredictiveText] = useState<string | undefined>(undefined);

  const handleSendMessage = useCallback((content: string) => {
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
      status: 'sent',
    };
    setChatMessages(prev => [...prev, userMessage]);
    setPredictiveText(undefined);

    // Add to action stream
    setActionStream(prev => [...prev, {
      id: `as-${Date.now()}`,
      timestamp: new Date(),
      action: 'Processing request',
      status: 'running',
      detail: content.slice(0, 30) + (content.length > 30 ? '...' : ''),
    }]);

    // Simulate AI response with forward-looking features
    setIsChatTyping(true);
    setTimeout(() => {
      const lowerContent = content.toLowerCase();
      let assistantMessage: ChatMessage;

      // Respond with intent detection for mapping-related queries
      if (lowerContent.includes('map') || lowerContent.includes('field')) {
        assistantMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: 'I understand you want to work with field mappings. Let me help:',
          timestamp: new Date(),
          metadata: { confidence: 0.92, processingTime: 340 },
          detectedIntent: {
            type: 'map_fields',
            confidence: 0.92,
            description: 'Map source fields to target schema fields',
            suggestedAction: 'Open Field Mapper',
            alternatives: [
              { type: 'validate', description: 'Validate existing field mappings', confidence: 0.65 },
              { type: 'export', description: 'Export current mapping configuration', confidence: 0.45 },
            ],
          },
          thinking: [
            { step: 'Intent analysis', detail: 'Detected field mapping intent from keywords', duration: 45 },
            { step: 'Context check', detail: 'Current phase is Field Mapping - high relevance', duration: 23 },
            { step: 'Action selection', detail: 'Recommending Field Mapper component', duration: 18 },
          ],
        };
      }
      // Respond with action preview for validation queries
      else if (lowerContent.includes('valid') || lowerContent.includes('check')) {
        assistantMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: 'I can run validation on your data. Here\'s what will happen:',
          timestamp: new Date(),
          metadata: { confidence: 0.88, processingTime: 420 },
          actionPreview: {
            title: 'Run Data Validation',
            changes: [
              { type: 'add', target: 'ValidationReport', detail: 'Generate validation report' },
              { type: 'modify', target: 'RecordStatus', detail: 'Update status for 15,420 records' },
              { type: 'add', target: 'ErrorFlags', detail: 'Flag records with issues' },
            ],
            estimatedImpact: 'Will process 15,420 records • ~3 seconds',
          },
        };
      }
      // Respond with inline widget for selection queries
      else if (lowerContent.includes('select') || lowerContent.includes('pick') || lowerContent.includes('choose')) {
        assistantMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: 'Which fields would you like to include in the export?',
          timestamp: new Date(),
          metadata: { confidence: 0.85, processingTime: 280 },
          inlineWidget: {
            type: 'field-picker',
            data: {
              fields: ['client_id', 'name', 'email', 'created_date', 'status', 'amount'],
              selected: ['client_id', 'name', 'email'],
            },
          },
        };
      }
      // Default response with thinking steps
      else {
        assistantMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: 'I\'ve analyzed your request. Here\'s what I found:',
          timestamp: new Date(),
          metadata: { confidence: 0.85 + Math.random() * 0.14, processingTime: 200 + Math.floor(Math.random() * 300) },
          thinking: [
            { step: 'Query parsing', detail: 'Analyzed natural language input', duration: 32 },
            { step: 'Context retrieval', detail: 'Loaded current session state', duration: 18 },
            { step: 'Response generation', detail: 'Generated contextual response', duration: 156 },
          ],
          inlineWidget: {
            type: 'validation-summary',
            data: { passed: 15123, failed: 42, warnings: 255 },
          },
        };
      }

      setChatMessages(prev => [...prev, assistantMessage]);
      setIsChatTyping(false);

      // Update action stream
      setActionStream(prev => prev.map(item =>
        item.status === 'running' ? { ...item, status: 'completed' as const } : item
      ));
    }, 1500 + Math.random() * 1000);
  }, []);

  // Intent handlers
  const handleIntentConfirm = useCallback((intent: DetectedIntent) => {
    console.log('Intent confirmed:', intent);
    setActionStream(prev => [...prev, {
      id: `as-${Date.now()}`,
      timestamp: new Date(),
      action: `Executing: ${intent.suggestedAction}`,
      status: 'running',
    }]);
    // Simulate completing the action
    setTimeout(() => {
      setActionStream(prev => prev.map(item =>
        item.status === 'running' ? { ...item, status: 'completed' as const } : item
      ));
    }, 2000);
  }, []);

  const handleIntentReject = useCallback((intent: DetectedIntent) => {
    console.log('Intent rejected:', intent);
    setChatMessages(prev => [...prev, {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: 'No problem! Can you tell me more about what you\'d like to do?',
      timestamp: new Date(),
      metadata: { confidence: 1.0, processingTime: 50 },
    }]);
  }, []);

  const handleActionConfirm = useCallback((preview: ActionPreview) => {
    console.log('Action confirmed:', preview);
    setActionStream(prev => [...prev, {
      id: `as-${Date.now()}`,
      timestamp: new Date(),
      action: preview.title,
      status: 'running',
    }]);
    setTimeout(() => {
      setActionStream(prev => prev.map(item =>
        item.status === 'running' ? { ...item, status: 'completed' as const } : item
      ));
      setChatMessages(prev => [...prev, {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `${preview.title} completed successfully.`,
        timestamp: new Date(),
        metadata: { confidence: 1.0, processingTime: 2340 },
        inlineWidget: {
          type: 'validation-summary',
          data: { passed: 15378, failed: 12, warnings: 30 },
        },
      }]);
    }, 2500);
  }, []);

  const handleWidgetInteraction = useCallback((widget: InlineWidget, action: string, data: unknown) => {
    console.log('Widget interaction:', widget.type, action, data);
  }, []);

  const handleStatusChange = useCallback((status: SystemStatus) => {
    setStatusState({
      status,
      message: status === 'processing' ? 'Mapping fields...' : undefined,
      progress: status === 'processing' ? 47 : undefined,
      step: status === 'processing' ? 2 : undefined,
      totalSteps: status === 'processing' ? 8 : undefined,
    });
  }, []);

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Phased
            </h1>
            <p className="text-white/50 mt-1">Intent-first interfaces</p>
          </div>

          <div className="flex items-center gap-4">
            <StatusIndicator state={statusState} size="md" />
            <ForensicModeToggle />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto space-y-12">
        {/* Status Indicator Demo */}
        <section>
          <StatusDemo onStatusChange={handleStatusChange} currentStatus={statusState.status} />
        </section>

        {/* Phase Lifecycle */}
        <section>
          <PhaseLifecycleViz />
        </section>

        {/* Animation Showcase */}
        <section>
          <AnimationShowcase />
        </section>

        {/* Dropzone Demo */}
        <section>
          <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-6">
            File Dropzone with Absorption
          </h3>
          <Dropzone
            onFilesAccepted={(files) => {
              console.log('Files accepted:', files);
              handleStatusChange('processing');
              setTimeout(() => handleStatusChange('success'), 2000);
            }}
            onAbsorptionComplete={() => {
              console.log('Absorption complete');
            }}
            className="max-w-2xl"
          />
          <p className="text-xs text-white/40 mt-3 max-w-2xl">
            Drag and drop files to see the absorption animation. Files are pulled toward the center with a vortex effect.
          </p>
        </section>

        {/* Entity Selector Demo */}
        <section>
          <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-6">
            Entity Selector with Relevance Surfacing
          </h3>
          <EntitySelector
            entities={DEMO_ENTITIES}
            selectedIds={selectedEntityIds}
            placeholder="Search clients, partners, vendors..."
            maxSelections={5}
            onChange={(ids) => {
              setSelectedEntityIds(ids);
              console.log('Selected:', ids);
              if (ids.length > 0) {
                handleStatusChange('listening');
              } else {
                handleStatusChange('idle');
              }
            }}
            className="max-w-xl"
          />
          <p className="text-xs text-white/40 mt-3 max-w-xl">
            Entities sorted by relevance score. Higher relevance items surface first. Multi-select with animated chips.
          </p>
        </section>

        {/* Progress Timeline Demo */}
        <section>
          <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-6">
            Progress Timeline
          </h3>
          <ProgressTimeline
            steps={workflowSteps}
            orientation="horizontal"
            animated={true}
            onStepClick={(step, index) => {
              console.log('Clicked step:', step.label, index);
            }}
            className="max-w-3xl"
          />
          <div className="flex gap-3 mt-4">
            <button
              onClick={advanceWorkflow}
              disabled={currentStep >= 5}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Advance Step
            </button>
            <button
              onClick={resetWorkflow}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 transition-all"
            >
              Reset
            </button>
          </div>
          <p className="text-xs text-white/40 mt-3 max-w-xl">
            Animated workflow visualization with phase-aware step indicators. Click "Advance Step" to see transitions.
          </p>
        </section>

        {/* Field Mapper Demo */}
        <section>
          <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-6">
            Field Mapper
          </h3>
          <FieldMapper
            sourceFields={SOURCE_FIELDS}
            targetFields={TARGET_FIELDS}
            mappings={fieldMappings}
            onMappingsChange={setFieldMappings}
            onAutoMap={handleAutoMap}
          />
          <p className="text-xs text-white/40 mt-3">
            Drag from source fields to target fields to create mappings. Click "Auto-Map" to see AI-suggested mappings with confidence scores.
          </p>
        </section>

        {/* Validation Grid Demo */}
        <section>
          <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-6">
            Validation Grid
          </h3>
          <ValidationGrid
            rules={DEMO_VALIDATION_RULES}
            title="Data Validation Results"
            showCategories={true}
            animated={true}
            onRuleClick={(rule) => console.log('Rule clicked:', rule.name)}
            onRevalidate={() => console.log('Revalidate requested')}
          />
        </section>

        {/* Chat Interface Demo */}
        <section>
          <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-6">
            Chat Interface — Forward-Looking Features
          </h3>
          <div className="max-w-4xl h-[600px] rounded-xl border border-white/10 overflow-hidden">
            <ChatInterface
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              onIntentConfirm={handleIntentConfirm}
              onIntentReject={handleIntentReject}
              onActionConfirm={handleActionConfirm}
              onWidgetInteraction={handleWidgetInteraction}
              isTyping={isChatTyping}
              placeholder="Try: 'map fields', 'validate data', or 'select fields'..."
              showTimestamps={true}
              showMetadata={true}
              phaseContext={phaseContext}
              actionStream={actionStream}
              smartSuggestions={smartSuggestions}
              predictiveText={predictiveText}
              showActionStream={true}
            />
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3 max-w-4xl">
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-xs text-white/50 mb-1">Context Bar</div>
              <div className="text-xs text-white/30">Phase + data state</div>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-xs text-white/50 mb-1">Intent Cards</div>
              <div className="text-xs text-white/30">Type "map fields"</div>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-xs text-white/50 mb-1">Action Preview</div>
              <div className="text-xs text-white/30">Type "validate"</div>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-xs text-white/50 mb-1">Inline Widgets</div>
              <div className="text-xs text-white/30">Type "select"</div>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-xs text-white/50 mb-1">Action Stream</div>
              <div className="text-xs text-white/30">Real-time panel</div>
            </div>
          </div>
          <p className="text-xs text-white/40 mt-3 max-w-4xl">
            Features: Context Bar • Intent Detection with Alternatives • Action Previews • Expandable Reasoning • Inline Widgets • Proactive Nudges • Smart Suggestions • Action Stream Panel
          </p>
        </section>

        {/* Activity Map Demo */}
        <section>
          <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-6">
            Activity Map
          </h3>
          <ActivityMap
            stages={DEMO_STAGES}
            flows={DEMO_FLOWS}
            showTelemetry={true}
            animated={true}
            onStageClick={(stage) => console.log('Stage clicked:', stage.name)}
          />
          <p className="text-xs text-white/40 mt-3">
            Watch data flow through processing stages. Click any stage to view detailed telemetry in forensic mode.
          </p>
        </section>

        {/* Feedback System Demo */}
        <section>
          <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-6">
            Feedback System
          </h3>
          <div className="max-w-md">
            <FeedbackDemo />
          </div>
          <p className="text-xs text-white/40 mt-3 max-w-md">
            Subtle audit trail with 3-tone audio feedback. Click buttons to trigger notifications with sounds.
          </p>
        </section>

        {/* Phase Demo Cards */}
        <section>
          <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-6">
            Interactive Phase Components
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <PhaseDemoCard
              title="File Upload"
              description="Dropzone component with absorption animation"
              delay={0}
            />
            <PhaseDemoCard
              title="Entity Selector"
              description="Client/entity picker with surfacing behavior"
              delay={150}
            />
            <PhaseDemoCard
              title="Validation Grid"
              description="Data validation results with row-level actions"
              delay={300}
            />
            <PhaseDemoCard
              title="Field Mapper"
              description="Column mapping interface with AI suggestions"
              delay={450}
            />
            <PhaseDemoCard
              title="Metrics Cards"
              description="Processing metrics and confidence scores"
              delay={600}
            />
            <PhaseDemoCard
              title="Export Actions"
              description="Export options with format selection"
              delay={750}
            />
          </div>
        </section>

        {/* Substrate Hint */}
        <section>
          <div className="substrate-hint cursor-pointer hover:border-white/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
              </div>
              <span className="text-white/40">
                12 more components available on demand — ChatSidebar, TimelineView, AuditLog, ConfidenceViz, ReasoningTree, DiffViewer...
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto mt-16 pt-8 border-t border-white/10">
        <p className="text-center text-sm text-white/30">
          Phased Framework Demo — DataIngestionV4 Prototype
        </p>
      </footer>
    </div>
  );
}

// Feedback System Demo Component
function FeedbackDemo() {
  const { notify } = useFeedback();

  const demoMessages = {
    acknowledge: [
      'File uploaded successfully',
      'Mapping saved',
      'Validation complete',
      'Record processed',
    ],
    attention: [
      'Review required: 3 fields need mapping',
      'Waiting for user confirmation',
      'New data available for processing',
    ],
    error: [
      'Failed to connect to database',
      'Invalid date format in row 42',
      'Schema validation failed',
    ],
  };

  const triggerDemo = (type: 'acknowledge' | 'attention' | 'error') => {
    const messages = demoMessages[type];
    const message = messages[Math.floor(Math.random() * messages.length)];
    notify(type, message);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => triggerDemo('acknowledge')}
          className="px-3 py-2 text-xs font-medium rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all"
        >
          Acknowledge
        </button>
        <button
          onClick={() => triggerDemo('attention')}
          className="px-3 py-2 text-xs font-medium rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-all"
        >
          Attention
        </button>
        <button
          onClick={() => triggerDemo('error')}
          className="px-3 py-2 text-xs font-medium rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition-all"
        >
          Error
        </button>
        <span className="text-xs text-white/30 ml-2">← Click to test sounds & audit</span>
      </div>
      <AuditTrail maxVisible={5} />
    </div>
  );
}

export default function App() {
  return (
    <OrchestratorProvider>
      <FeedbackProvider audioEnabledByDefault={true}>
        <AppContent />
      </FeedbackProvider>
    </OrchestratorProvider>
  );
}
