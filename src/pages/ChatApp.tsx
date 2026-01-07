/**
 * ChatApp - Full-screen chat-centric interface
 * The main application page with intent-driven overlays
 *
 * Now with Phased Framework integration:
 * - OrchestratorProvider for global phase management
 * - PhasedSlidePanel for lifecycle-aware overlays
 */

import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ChatInterface,
  type ChatMessage,
  type DetectedIntent,
  type ActionPreview,
  type InlineWidget,
  type ActionStreamItem,
  type PhaseContext,
} from '../components/ChatInterface';
import { ProgressTimeline, type TimelineStep } from '../components/ProgressTimeline';
import { PhasedSlidePanel } from '../components/PhasedSlidePanel';
import { InlineDropzone } from '../components/InlineDropzone';
import { FieldMapper, type FieldMapping, type Field } from '../components/FieldMapper';
import { ValidationGrid, type ValidationRule } from '../components/ValidationGrid';
import { ActivityMap, type ProcessingStage, type DataFlow } from '../components/ActivityMap';
import { StatusIndicator } from '../components/StatusIndicator';
import { type StatusState, type Phase } from '../phased/types';
import { OrchestratorProvider } from '../phased/OrchestratorContext';
import { FeedbackProvider, useFeedback } from '../components/FeedbackSystem';

// =============================================================================
// DEMO DATA
// =============================================================================

const INITIAL_STEPS: TimelineStep[] = [
  { id: '1', label: 'Upload', status: 'completed', description: 'File received' },
  { id: '2', label: 'Parse', status: 'completed', description: 'Schema detected' },
  { id: '3', label: 'Map', status: 'active', description: 'Field mapping' },
  { id: '4', label: 'Validate', status: 'pending', description: 'Data validation' },
  { id: '5', label: 'Transform', status: 'pending', description: 'Apply rules' },
  { id: '6', label: 'Export', status: 'pending', description: 'Generate output' },
];

const SOURCE_FIELDS: Field[] = [
  { id: 's1', name: 'customer_id', type: 'string', sample: 'CUST-001' },
  { id: 's2', name: 'full_name', type: 'string', sample: 'John Smith' },
  { id: 's3', name: 'email_address', type: 'string', sample: 'john@example.com' },
  { id: 's4', name: 'phone', type: 'string', sample: '+1-555-0123' },
  { id: 's5', name: 'created_at', type: 'date', sample: '2024-01-15' },
  { id: 's6', name: 'total_orders', type: 'number', sample: '42' },
];

const TARGET_FIELDS: Field[] = [
  { id: 't1', name: 'id', type: 'string', required: true },
  { id: 't2', name: 'name', type: 'string', required: true },
  { id: 't3', name: 'contact_email', type: 'string', required: true },
  { id: 't4', name: 'phone_number', type: 'string' },
  { id: 't5', name: 'registration_date', type: 'date', required: true },
  { id: 't6', name: 'order_count', type: 'number' },
];

const VALIDATION_RULES: ValidationRule[] = [
  { id: 'v1', name: 'ID Required', category: 'Required Fields', status: 'pass', message: 'All records have ID' },
  { id: 'v2', name: 'Name Required', category: 'Required Fields', status: 'pass', message: 'All records have name' },
  { id: 'v3', name: 'Email Format', category: 'Format Validation', status: 'warn', message: '3 records have unusual format', affectedRows: 3 },
  { id: 'v4', name: 'Date Format', category: 'Format Validation', status: 'fail', message: '12 records have invalid dates', affectedRows: 12 },
  { id: 'v5', name: 'Phone Format', category: 'Format Validation', status: 'warn', message: '8 records missing country code', affectedRows: 8 },
  { id: 'v6', name: 'Order Count Range', category: 'Data Range', status: 'pass', message: 'All values within expected range' },
];

const ACTIVITY_STAGES: ProcessingStage[] = [
  { id: 'ingest', name: 'Ingest', status: 'completed', recordsProcessed: 15420, recordsTotal: 15420, throughput: 2500, telemetry: { avgLatency: 12, cpuUsage: 45, logs: ['Batch loaded'] } },
  { id: 'validate', name: 'Validate', status: 'active', recordsProcessed: 8200, recordsTotal: 15420, errorCount: 12, telemetry: { avgLatency: 28, cpuUsage: 62, logs: ['Validating...'] } },
  { id: 'transform', name: 'Transform', status: 'waiting', recordsProcessed: 0, recordsTotal: 15420, telemetry: { avgLatency: 0, cpuUsage: 0, logs: [] } },
  { id: 'export', name: 'Export', status: 'idle', recordsProcessed: 0, recordsTotal: 15420, telemetry: { avgLatency: 0, cpuUsage: 0, logs: [] } },
];

const ACTIVITY_FLOWS: DataFlow[] = [
  { from: 'ingest', to: 'validate', active: true, particleCount: 5 },
  { from: 'validate', to: 'transform', active: false },
  { from: 'transform', to: 'export', active: false },
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

function ChatAppContent() {
  const { notify } = useFeedback();

  // Timeline state
  const [steps, setSteps] = useState<TimelineStep[]>(INITIAL_STEPS);

  // Slide panel state
  const [activePanel, setActivePanel] = useState<'field-mapper' | 'validation' | 'activity' | null>(null);

  // Field mapper state
  const [mappings, setMappings] = useState<FieldMapping[]>([
    { sourceId: 's1', targetId: 't1', confidence: 0.95 },
    { sourceId: 's2', targetId: 't2', confidence: 0.92 },
    { sourceId: 's3', targetId: 't3', confidence: 0.88 },
  ]);

  // Status state
  const [statusState, setStatusState] = useState<StatusState>({
    status: 'processing',
    message: 'Mapping fields...',
    progress: 65,
    step: 3,
    totalSteps: 6,
  });

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'system',
      content: 'Session started — DataIngestionV4',
      timestamp: new Date(Date.now() - 120000),
    },
    {
      id: '2',
      role: 'assistant',
      content: 'Welcome! I\'ve loaded your customer data file (15,420 records). I\'ve auto-mapped 3 of 6 fields. Would you like me to complete the mapping or review what I\'ve done?',
      timestamp: new Date(Date.now() - 60000),
      metadata: { confidence: 0.95, processingTime: 340 },
    },
    {
      id: '3',
      role: 'assistant',
      content: 'I noticed 12 records have date format issues that may need attention.',
      timestamp: new Date(Date.now() - 30000),
      isProactiveNudge: true,
    },
  ]);
  const [isChatTyping, setIsChatTyping] = useState(false);

  // Action stream
  const [actionStream, setActionStream] = useState<ActionStreamItem[]>([
    { id: 'a1', timestamp: new Date(Date.now() - 120000), action: 'Session initialized', status: 'completed' },
    { id: 'a2', timestamp: new Date(Date.now() - 60000), action: 'File parsed', status: 'completed', detail: '15,420 records' },
    { id: 'a3', timestamp: new Date(Date.now() - 30000), action: 'Auto-mapping', status: 'completed', detail: '3 fields mapped' },
  ]);

  // Phase context
  const phaseContext: PhaseContext = {
    currentPhase: 'Field Mapping',
    phaseProgress: 65,
    dataLoaded: [
      { name: 'Records', count: 15420 },
      { name: 'Mapped', count: 3 },
    ],
    pendingItems: ['3 unmapped fields', '12 date issues'],
  };

  // Smart suggestions
  const smartSuggestions = [
    'Complete field mapping',
    'Show validation issues',
    'View data flow',
    'Fix date formats',
  ];

  // Handle file drop
  const handleFileDrop = useCallback((files: File[]) => {
    const file = files[0];
    notify('acknowledge', `File received: ${file.name}`);

    // Add message to chat
    setChatMessages(prev => [...prev, {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: `Uploaded: ${file.name}`,
      timestamp: new Date(),
      status: 'sent',
    }]);

    // Simulate processing
    setIsChatTyping(true);
    setActionStream(prev => [...prev, {
      id: `as-${Date.now()}`,
      timestamp: new Date(),
      action: 'Processing file',
      status: 'running',
      detail: file.name,
    }]);

    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `I've received "${file.name}". Analyzing the structure now...`,
        timestamp: new Date(),
        metadata: { confidence: 1.0, processingTime: 1200 },
      }]);
      setIsChatTyping(false);
      setActionStream(prev => prev.map(item =>
        item.status === 'running' ? { ...item, status: 'completed' as const } : item
      ));
      notify('acknowledge', 'File processed successfully');
    }, 2000);
  }, [notify]);

  // Handle send message with intent detection
  const handleSendMessage = useCallback((content: string) => {
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
      status: 'sent',
    };
    setChatMessages(prev => [...prev, userMessage]);

    setActionStream(prev => [...prev, {
      id: `as-${Date.now()}`,
      timestamp: new Date(),
      action: 'Processing',
      status: 'running',
      detail: content.slice(0, 25) + '...',
    }]);

    setIsChatTyping(true);
    const lowerContent = content.toLowerCase();

    setTimeout(() => {
      let assistantMessage: ChatMessage;

      // Field mapping intent
      if (lowerContent.includes('map') || lowerContent.includes('field') || lowerContent.includes('complete')) {
        assistantMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: 'I can help with field mapping:',
          timestamp: new Date(),
          metadata: { confidence: 0.94, processingTime: 280 },
          detectedIntent: {
            type: 'map_fields',
            confidence: 0.94,
            description: 'Open the field mapper to review and complete mappings',
            suggestedAction: 'Open Field Mapper',
            alternatives: [
              { type: 'validate', description: 'Auto-complete remaining mappings', confidence: 0.72 },
            ],
          },
        };
      }
      // Validation intent
      else if (lowerContent.includes('valid') || lowerContent.includes('issue') || lowerContent.includes('error') || lowerContent.includes('date')) {
        assistantMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: 'Here\'s the validation status:',
          timestamp: new Date(),
          metadata: { confidence: 0.91, processingTime: 320 },
          actionPreview: {
            title: 'Show Validation Results',
            changes: [
              { type: 'add', target: 'View', detail: 'Open validation grid' },
              { type: 'modify', target: 'Focus', detail: 'Highlight 12 date format issues' },
            ],
            estimatedImpact: '6 rules • 15,420 records checked',
          },
        };
      }
      // Activity/flow intent
      else if (lowerContent.includes('flow') || lowerContent.includes('activity') || lowerContent.includes('process') || lowerContent.includes('status')) {
        assistantMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: 'Here\'s the current processing status:',
          timestamp: new Date(),
          metadata: { confidence: 0.89, processingTime: 250 },
          detectedIntent: {
            type: 'query',
            confidence: 0.89,
            description: 'View real-time data flow and processing stages',
            suggestedAction: 'Open Activity Map',
          },
        };
      }
      // Upload intent - show inline dropzone
      else if (lowerContent.includes('upload') || lowerContent.includes('file') || lowerContent.includes('add data')) {
        assistantMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: 'Drop your file below to continue:',
          timestamp: new Date(),
          metadata: { confidence: 0.96, processingTime: 150 },
        };
        // We'll render the dropzone via a special flag
        (assistantMessage as ChatMessage & { showDropzone?: boolean }).showDropzone = true;
      }
      // Default response
      else {
        assistantMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: 'I can help you with:\n• **Field mapping** - Review and complete mappings\n• **Validation** - Check data quality issues\n• **Activity** - View processing status\n• **Upload** - Add more data files',
          timestamp: new Date(),
          metadata: { confidence: 0.85, processingTime: 200 },
          inlineWidget: {
            type: 'validation-summary',
            data: { passed: 4, failed: 1, warnings: 2 },
          },
        };
      }

      setChatMessages(prev => [...prev, assistantMessage]);
      setIsChatTyping(false);
      setActionStream(prev => prev.map(item =>
        item.status === 'running' ? { ...item, status: 'completed' as const } : item
      ));
    }, 1200 + Math.random() * 800);
  }, []);

  // Intent handlers
  const handleIntentConfirm = useCallback((intent: DetectedIntent) => {
    notify('acknowledge', `Opening ${intent.suggestedAction}`);
    setActionStream(prev => [...prev, {
      id: `as-${Date.now()}`,
      timestamp: new Date(),
      action: intent.suggestedAction,
      status: 'completed',
    }]);

    // Open appropriate panel
    if (intent.type === 'map_fields') {
      setActivePanel('field-mapper');
    } else if (intent.type === 'validate') {
      setActivePanel('validation');
    } else if (intent.type === 'query') {
      setActivePanel('activity');
    }
  }, [notify]);

  const handleIntentReject = useCallback((_intent: DetectedIntent) => {
    setChatMessages(prev => [...prev, {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: 'No problem. What would you like to do instead?',
      timestamp: new Date(),
      metadata: { confidence: 1.0, processingTime: 50 },
    }]);
  }, []);

  const handleActionConfirm = useCallback((preview: ActionPreview) => {
    notify('acknowledge', preview.title);
    setActionStream(prev => [...prev, {
      id: `as-${Date.now()}`,
      timestamp: new Date(),
      action: preview.title,
      status: 'completed',
    }]);

    if (preview.title.includes('Validation')) {
      setActivePanel('validation');
    }
  }, [notify]);

  const handleWidgetInteraction = useCallback((_widget: InlineWidget, _action: string, _data: unknown) => {
    // Handle widget interactions
  }, []);

  // Handle mapping changes
  const handleMappingChange = useCallback((newMappings: FieldMapping[]) => {
    setMappings(newMappings);
    const mappedCount = newMappings.length;

    // Update status
    setStatusState(prev => ({
      ...prev,
      progress: Math.round((mappedCount / TARGET_FIELDS.length) * 100),
    }));

    // Update phase context notification
    if (mappedCount === TARGET_FIELDS.length) {
      notify('acknowledge', 'All fields mapped!');
      setSteps(prev => prev.map(step =>
        step.id === '3' ? { ...step, status: 'completed' as const } :
        step.id === '4' ? { ...step, status: 'active' as const } : step
      ));
    }
  }, [notify]);

  // Handle panel phase transitions (Phased Framework lifecycle)
  const handlePanelPhaseChange = useCallback((panelId: string, phase: Phase) => {
    // Log phase transitions to action stream for visibility
    if (phase === 'surfaced') {
      setActionStream(prev => [...prev, {
        id: `as-phase-${Date.now()}`,
        timestamp: new Date(),
        action: `${panelId} panel surfaced`,
        status: 'completed',
      }]);
    } else if (phase === 'focused') {
      // Play subtle audio feedback when panel receives focus
      notify('acknowledge', 'Panel focused');
    } else if (phase === 'dissolving') {
      setActionStream(prev => [...prev, {
        id: `as-phase-${Date.now()}`,
        timestamp: new Date(),
        action: `${panelId} panel closing`,
        status: 'completed',
      }]);
    }
  }, [notify]);

  return (
    <div className="chat-app h-screen flex flex-col bg-slate-950">
      {/* Header with Progress Timeline */}
      <header className="flex-shrink-0 border-b border-white/10 bg-slate-900/50">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              DataIngestionV4
            </h1>
            <div className="h-6 w-px bg-white/10" />
            <StatusIndicator state={statusState} size="sm" />
          </div>
          <Link
            to="/demo"
            className="text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            View Component Demo →
          </Link>
        </div>
        <div className="px-6 pb-4">
          <ProgressTimeline
            steps={steps}
            orientation="horizontal"
            animated={true}
          />
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-hidden">
        <ChatInterface
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          onIntentConfirm={handleIntentConfirm}
          onIntentReject={handleIntentReject}
          onActionConfirm={handleActionConfirm}
          onWidgetInteraction={handleWidgetInteraction}
          isTyping={isChatTyping}
          placeholder="Ask me anything about your data..."
          showTimestamps={true}
          showMetadata={true}
          phaseContext={phaseContext}
          actionStream={actionStream}
          smartSuggestions={smartSuggestions}
          showActionStream={true}
          className="h-full"
        />
      </main>

      {/* Floating Dropzone Trigger */}
      <div className="fixed bottom-24 right-8 z-40">
        <InlineDropzone
          onFileDrop={handleFileDrop}
          compact={true}
          accept=".csv,.xlsx,.json"
        />
      </div>

      {/* Phased Slide Panels - with lifecycle awareness */}
      <PhasedSlidePanel
        isOpen={activePanel === 'field-mapper'}
        onClose={() => setActivePanel(null)}
        title="Field Mapper"
        size="xl"
        position="right"
        onPhaseChange={(phase) => handlePanelPhaseChange('field-mapper', phase)}
      >
        <div className="p-6">
          <FieldMapper
            sourceFields={SOURCE_FIELDS}
            targetFields={TARGET_FIELDS}
            mappings={mappings}
            onMappingsChange={handleMappingChange}
          />
        </div>
      </PhasedSlidePanel>

      <PhasedSlidePanel
        isOpen={activePanel === 'validation'}
        onClose={() => setActivePanel(null)}
        title="Validation Results"
        size="xl"
        position="right"
        onPhaseChange={(phase) => handlePanelPhaseChange('validation', phase)}
      >
        <div className="p-6">
          <ValidationGrid
            rules={VALIDATION_RULES}
            onRuleClick={(rule) => console.log('Rule clicked:', rule)}
            onRevalidate={() => notify('acknowledge', 'Revalidating...')}
          />
        </div>
      </PhasedSlidePanel>

      <PhasedSlidePanel
        isOpen={activePanel === 'activity'}
        onClose={() => setActivePanel(null)}
        title="Activity Map"
        size="xl"
        position="right"
        onPhaseChange={(phase) => handlePanelPhaseChange('activity', phase)}
      >
        <div className="p-6">
          <ActivityMap
            stages={ACTIVITY_STAGES}
            flows={ACTIVITY_FLOWS}
            showTelemetry={true}
            animated={true}
            onStageClick={(stage) => console.log('Stage:', stage.name)}
          />
        </div>
      </PhasedSlidePanel>
    </div>
  );
}

// Wrap with OrchestratorProvider and FeedbackProvider
// OrchestratorProvider: Global phase state management (Phased Framework)
// FeedbackProvider: Audio/haptic feedback system
export default function ChatApp() {
  return (
    <OrchestratorProvider
      initialContext={{
        role: 'analyst',
        urgency: 'normal',
        device: 'desktop',
      }}
    >
      <FeedbackProvider>
        <ChatAppContent />
      </FeedbackProvider>
    </OrchestratorProvider>
  );
}
