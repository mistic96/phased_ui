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

export default function App() {
  return (
    <OrchestratorProvider>
      <AppContent />
    </OrchestratorProvider>
  );
}
