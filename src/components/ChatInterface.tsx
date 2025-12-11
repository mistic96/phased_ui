import React, { useState, useRef, useEffect, useCallback } from 'react';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export type MessageRole = 'user' | 'assistant' | 'system';
export type MessageStatus = 'sending' | 'sent' | 'error';
export type IntentType = 'map_fields' | 'validate' | 'transform' | 'export' | 'configure' | 'query' | 'unknown';
export type ActionStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface DetectedIntent {
  type: IntentType;
  confidence: number;
  description: string;
  suggestedAction: string;
  alternatives?: { type: IntentType; description: string; confidence: number }[];
}

export interface ActionPreview {
  title: string;
  changes: { type: 'add' | 'modify' | 'remove'; target: string; detail: string }[];
  estimatedImpact: string;
}

export interface InlineWidget {
  type: 'field-picker' | 'date-selector' | 'validation-summary' | 'progress' | 'confirmation';
  data: Record<string, unknown>;
}

export interface ThinkingStep {
  step: string;
  detail: string;
  duration?: number;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  status?: MessageStatus;
  metadata?: {
    confidence?: number;
    processingTime?: number;
    tokensUsed?: number;
  };
  // Forward-looking features
  detectedIntent?: DetectedIntent;
  actionPreview?: ActionPreview;
  inlineWidget?: InlineWidget;
  thinking?: ThinkingStep[];
  isProactiveNudge?: boolean;
}

export interface ActionStreamItem {
  id: string;
  timestamp: Date;
  action: string;
  status: ActionStatus;
  detail?: string;
}

export interface PhaseContext {
  currentPhase: string;
  phaseProgress: number;
  dataLoaded: { name: string; count: number }[];
  pendingItems: string[];
}

export interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  onIntentConfirm?: (intent: DetectedIntent) => void;
  onIntentReject?: (intent: DetectedIntent) => void;
  onActionConfirm?: (preview: ActionPreview) => void;
  onWidgetInteraction?: (widget: InlineWidget, action: string, data: unknown) => void;
  isTyping?: boolean;
  placeholder?: string;
  disabled?: boolean;
  showTimestamps?: boolean;
  showMetadata?: boolean;
  className?: string;
  // Forward-looking props
  phaseContext?: PhaseContext;
  actionStream?: ActionStreamItem[];
  smartSuggestions?: string[];
  predictiveText?: string;
  showActionStream?: boolean;
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

// Context Bar - Shows current phase and data state
const ContextBar: React.FC<{ context: PhaseContext }> = ({ context }) => (
  <div className="context-bar flex items-center gap-4 px-4 py-2 bg-white/5 border-b border-white/10 text-xs">
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
      <span className="text-white/70 font-medium">{context.currentPhase}</span>
      <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${context.phaseProgress}%` }}
        />
      </div>
      <span className="text-white/40">{context.phaseProgress}%</span>
    </div>
    <div className="h-4 w-px bg-white/10" />
    <div className="flex items-center gap-3 text-white/50">
      {context.dataLoaded.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
          </svg>
          {item.name}: {item.count}
        </span>
      ))}
    </div>
    {context.pendingItems.length > 0 && (
      <>
        <div className="h-4 w-px bg-white/10" />
        <span className="text-amber-400/70">
          {context.pendingItems.length} pending
        </span>
      </>
    )}
  </div>
);

// Action Stream Panel - Real-time system actions
const ActionStreamPanel: React.FC<{ items: ActionStreamItem[] }> = ({ items }) => {
  const getStatusIcon = (status: ActionStatus) => {
    switch (status) {
      case 'running':
        return (
          <svg className="w-3 h-3 animate-spin text-blue-400" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="10" cy="10" r="7" strokeOpacity={0.3} />
            <path d="M10 3a7 7 0 0 1 7 7" strokeLinecap="round" />
          </svg>
        );
      case 'completed':
        return (
          <svg className="w-3 h-3 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'failed':
        return (
          <svg className="w-3 h-3 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        );
      default:
        return <span className="w-3 h-3 rounded-full bg-white/20" />;
    }
  };

  return (
    <div className="action-stream w-64 border-l border-white/10 bg-white/[0.02] flex flex-col">
      <div className="px-3 py-2 border-b border-white/10">
        <h4 className="text-xs font-medium text-white/50 uppercase tracking-wider">Action Stream</h4>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {items.map((item) => (
          <div
            key={item.id}
            className={`
              flex items-start gap-2 p-2 rounded-lg text-xs
              ${item.status === 'running' ? 'bg-blue-500/10' : 'bg-transparent'}
              transition-colors duration-200
            `}
          >
            <div className="mt-0.5">{getStatusIcon(item.status)}</div>
            <div className="flex-1 min-w-0">
              <div className="text-white/70 truncate">{item.action}</div>
              {item.detail && (
                <div className="text-white/40 truncate">{item.detail}</div>
              )}
            </div>
            <div className="text-white/30 flex-shrink-0">
              {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Typing Indicator
const TypingIndicator: React.FC = () => (
  <div className="typing-indicator flex items-center gap-1 px-4 py-3">
    <div className="flex items-center gap-1">
      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
    <span className="text-xs text-white/40 ml-2">thinking...</span>
  </div>
);

// Intent Card - Shows detected intent with confidence
type IntentAlternative = { type: IntentType; description: string; confidence: number };

const IntentCard: React.FC<{
  intent: DetectedIntent;
  onConfirm: () => void;
  onReject: () => void;
  onSelectAlternative: (alt: IntentAlternative) => void;
}> = ({ intent, onConfirm, onReject, onSelectAlternative }) => {
  const [showAlternatives, setShowAlternatives] = useState(false);

  const getIntentIcon = (type: IntentType) => {
    const icons: Record<IntentType, React.ReactNode> = {
      map_fields: (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      ),
      validate: (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ),
      transform: (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
        </svg>
      ),
      export: (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      ),
      configure: (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
      ),
      query: (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      ),
      unknown: (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      ),
    };
    return icons[type];
  };

  const confidenceColor = intent.confidence >= 0.8
    ? 'text-emerald-400 bg-emerald-500/20'
    : intent.confidence >= 0.5
      ? 'text-amber-400 bg-amber-500/20'
      : 'text-red-400 bg-red-500/20';

  return (
    <div className="intent-card bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4 my-3">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
          {getIntentIcon(intent.type)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-white/90">Detected Intent</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${confidenceColor}`}>
              {Math.round(intent.confidence * 100)}% confident
            </span>
          </div>
          <p className="text-sm text-white/70 mb-2">{intent.description}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={onConfirm}
              className="px-3 py-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-medium hover:bg-blue-500/30 transition-colors"
            >
              {intent.suggestedAction}
            </button>
            <button
              onClick={onReject}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/50 text-xs hover:bg-white/10 transition-colors"
            >
              Not quite
            </button>
            {intent.alternatives && intent.alternatives.length > 0 && (
              <button
                onClick={() => setShowAlternatives(!showAlternatives)}
                className="px-3 py-1.5 rounded-lg text-white/40 text-xs hover:text-white/60 transition-colors"
              >
                {showAlternatives ? 'Hide' : 'Or did you mean...'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Branching Paths - Alternatives */}
      {showAlternatives && intent.alternatives && (
        <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
          {intent.alternatives.map((alt, i) => (
            <button
              key={i}
              onClick={() => onSelectAlternative(alt)}
              className="w-full flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left"
            >
              <div className="p-1.5 rounded bg-white/10 text-white/50">
                {getIntentIcon(alt.type)}
              </div>
              <div className="flex-1">
                <span className="text-sm text-white/70">{alt.description}</span>
              </div>
              <span className="text-xs text-white/30">{Math.round(alt.confidence * 100)}%</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Action Preview - Shows what will happen before execution
const ActionPreviewCard: React.FC<{
  preview: ActionPreview;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ preview, onConfirm, onCancel }) => {
  const getChangeIcon = (type: 'add' | 'modify' | 'remove') => {
    switch (type) {
      case 'add':
        return <span className="text-emerald-400">+</span>;
      case 'modify':
        return <span className="text-amber-400">~</span>;
      case 'remove':
        return <span className="text-red-400">-</span>;
    }
  };

  return (
    <div className="action-preview bg-white/5 border border-white/10 rounded-xl p-4 my-3">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
        </svg>
        <span className="text-sm font-medium text-white/90">Preview: {preview.title}</span>
      </div>

      <div className="bg-black/30 rounded-lg p-3 mb-3 font-mono text-xs space-y-1">
        {preview.changes.map((change, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="w-4 text-center">{getChangeIcon(change.type)}</span>
            <span className="text-white/50">{change.target}:</span>
            <span className="text-white/70">{change.detail}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-white/40">{preview.estimatedImpact}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/50 text-xs hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium hover:bg-emerald-500/30 transition-colors"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// Expandable Reasoning - Shows AI thinking process
const ThinkingSection: React.FC<{ steps: ThinkingStep[] }> = ({ steps }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="thinking-section mt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs text-white/40 hover:text-white/60 transition-colors"
      >
        <svg
          className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
        <span>Show reasoning ({steps.length} steps)</span>
      </button>

      {expanded && (
        <div className="mt-2 pl-4 border-l-2 border-white/10 space-y-2">
          {steps.map((step, i) => (
            <div key={i} className="text-xs">
              <div className="flex items-center gap-2 text-white/50">
                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">
                  {i + 1}
                </span>
                <span className="font-medium">{step.step}</span>
                {step.duration && <span className="text-white/30">{step.duration}ms</span>}
              </div>
              <p className="text-white/40 ml-7 mt-0.5">{step.detail}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Inline Widget - Embeddable mini-components
const InlineWidgetRenderer: React.FC<{
  widget: InlineWidget;
  onInteraction: (action: string, data: unknown) => void;
}> = ({ widget, onInteraction }) => {
  switch (widget.type) {
    case 'field-picker':
      const fields = widget.data.fields as string[];
      const selected = widget.data.selected as string[];
      return (
        <div className="inline-widget bg-white/5 border border-white/10 rounded-lg p-3 my-2">
          <div className="text-xs text-white/50 mb-2">Select fields:</div>
          <div className="flex flex-wrap gap-2">
            {fields.map((field) => (
              <button
                key={field}
                onClick={() => onInteraction('toggle', field)}
                className={`
                  px-2 py-1 rounded text-xs transition-colors
                  ${selected.includes(field)
                    ? 'bg-blue-500/30 border border-blue-500/50 text-blue-300'
                    : 'bg-white/5 border border-white/10 text-white/50 hover:bg-white/10'
                  }
                `}
              >
                {field}
              </button>
            ))}
          </div>
        </div>
      );

    case 'validation-summary':
      const summary = widget.data as { passed: number; failed: number; warnings: number };
      const total = summary.passed + summary.failed + summary.warnings;
      return (
        <div className="inline-widget bg-white/5 border border-white/10 rounded-lg p-3 my-2">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-white/70">{summary.passed} passed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-white/70">{summary.failed} failed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-white/70">{summary.warnings} warnings</span>
            </div>
          </div>
          <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden flex">
            <div className="bg-emerald-500" style={{ width: `${(summary.passed / total) * 100}%` }} />
            <div className="bg-red-500" style={{ width: `${(summary.failed / total) * 100}%` }} />
            <div className="bg-amber-500" style={{ width: `${(summary.warnings / total) * 100}%` }} />
          </div>
        </div>
      );

    case 'progress':
      const progress = widget.data as { current: number; total: number; label: string };
      return (
        <div className="inline-widget bg-white/5 border border-white/10 rounded-lg p-3 my-2">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-white/70">{progress.label}</span>
            <span className="text-white/50">{progress.current} / {progress.total}</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      );

    case 'confirmation':
      const conf = widget.data as { message: string; confirmLabel: string; cancelLabel: string };
      return (
        <div className="inline-widget bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 my-2">
          <p className="text-sm text-white/70 mb-3">{conf.message}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onInteraction('confirm', true)}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium hover:bg-amber-500/30 transition-colors"
            >
              {conf.confirmLabel}
            </button>
            <button
              onClick={() => onInteraction('cancel', false)}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/50 text-xs hover:bg-white/10 transition-colors"
            >
              {conf.cancelLabel}
            </button>
          </div>
        </div>
      );

    case 'date-selector':
      return (
        <div className="inline-widget bg-white/5 border border-white/10 rounded-lg p-3 my-2">
          <input
            type="date"
            className="bg-white/10 border border-white/20 rounded px-3 py-1.5 text-sm text-white/70"
            onChange={(e) => onInteraction('select', e.target.value)}
          />
        </div>
      );

    default:
      return null;
  }
};

// Proactive Nudge - AI-initiated suggestions
const ProactiveNudge: React.FC<{ content: string }> = ({ content }) => (
  <div className="proactive-nudge flex items-start gap-2 p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 my-3">
    <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
      </svg>
    </div>
    <div className="flex-1">
      <div className="text-xs text-purple-300/70 mb-1">I noticed something</div>
      <p className="text-sm text-white/70">{content}</p>
    </div>
  </div>
);

// Smart Suggestions Bar
const SmartSuggestionsBar: React.FC<{
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}> = ({ suggestions, onSelect }) => (
  <div className="smart-suggestions flex items-center gap-2 px-4 py-2 overflow-x-auto">
    <span className="text-xs text-white/40 flex-shrink-0">Try:</span>
    {suggestions.map((suggestion, i) => (
      <button
        key={i}
        onClick={() => onSelect(suggestion)}
        className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/60 hover:bg-white/10 hover:text-white/80 transition-colors whitespace-nowrap flex-shrink-0"
      >
        {suggestion}
      </button>
    ))}
  </div>
);

// =============================================================================
// MESSAGE BUBBLE COMPONENT
// =============================================================================

const MessageBubble: React.FC<{
  message: ChatMessage;
  showTimestamp: boolean;
  showMetadata: boolean;
  isLatest: boolean;
  onIntentConfirm?: (intent: DetectedIntent) => void;
  onIntentReject?: (intent: DetectedIntent) => void;
  onActionConfirm?: (preview: ActionPreview) => void;
  onWidgetInteraction?: (widget: InlineWidget, action: string, data: unknown) => void;
}> = ({
  message,
  showTimestamp,
  showMetadata,
  isLatest,
  onIntentConfirm,
  onIntentReject,
  onActionConfirm,
  onWidgetInteraction,
}) => {
  const [hasEntered, setHasEntered] = useState(!isLatest);

  useEffect(() => {
    if (isLatest) {
      const timer = setTimeout(() => setHasEntered(true), 50);
      return () => clearTimeout(timer);
    }
  }, [isLatest]);

  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isSystem) {
    return (
      <div
        className={`
          chat-message chat-message-system
          flex justify-center my-4
          ${hasEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
          transition-all duration-300
        `}
      >
        <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white/50">
          {message.content}
        </div>
      </div>
    );
  }

  // Proactive Nudge
  if (message.isProactiveNudge) {
    return (
      <div
        className={`
          ${hasEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          transition-all duration-300 ease-out
        `}
      >
        <ProactiveNudge content={message.content} />
      </div>
    );
  }

  return (
    <div
      className={`
        chat-message flex flex-col
        ${isUser ? 'items-end' : 'items-start'}
        ${hasEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        transition-all duration-300 ease-out
      `}
    >
      {/* Role label */}
      <div className={`text-xs text-white/40 mb-1 ${isUser ? 'mr-2' : 'ml-2'}`}>
        {isUser ? 'You' : 'Assistant'}
      </div>

      {/* Message bubble */}
      <div
        className={`
          chat-bubble relative max-w-[80%] px-4 py-3 rounded-2xl
          ${isUser
            ? 'bg-blue-500/20 border border-blue-500/30 rounded-br-md'
            : 'bg-white/5 border border-white/10 rounded-bl-md'
          }
          ${message.status === 'error' ? 'border-red-500/50 bg-red-500/10' : ''}
          ${message.status === 'sending' ? 'opacity-70' : ''}
        `}
      >
        {/* Content */}
        <div className="text-sm text-white/90 whitespace-pre-wrap">
          {message.content}
        </div>

        {/* Intent Card */}
        {message.detectedIntent && onIntentConfirm && onIntentReject && (
          <IntentCard
            intent={message.detectedIntent}
            onConfirm={() => onIntentConfirm(message.detectedIntent!)}
            onReject={() => onIntentReject(message.detectedIntent!)}
            onSelectAlternative={(alt) => onIntentConfirm({ ...alt, suggestedAction: 'Proceed', alternatives: [] })}
          />
        )}

        {/* Action Preview */}
        {message.actionPreview && onActionConfirm && (
          <ActionPreviewCard
            preview={message.actionPreview}
            onConfirm={() => onActionConfirm(message.actionPreview!)}
            onCancel={() => {}}
          />
        )}

        {/* Inline Widget */}
        {message.inlineWidget && onWidgetInteraction && (
          <InlineWidgetRenderer
            widget={message.inlineWidget}
            onInteraction={(action, data) => onWidgetInteraction(message.inlineWidget!, action, data)}
          />
        )}

        {/* Expandable Reasoning */}
        {message.thinking && message.thinking.length > 0 && (
          <ThinkingSection steps={message.thinking} />
        )}

        {/* Metadata for assistant messages */}
        {!isUser && showMetadata && message.metadata && (
          <div className="flex items-center gap-3 mt-2 pt-2 border-t border-white/5 text-xs text-white/30">
            {message.metadata.confidence !== undefined && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {Math.round(message.metadata.confidence * 100)}%
              </span>
            )}
            {message.metadata.processingTime !== undefined && (
              <span>{message.metadata.processingTime}ms</span>
            )}
            {message.metadata.tokensUsed !== undefined && (
              <span>{message.metadata.tokensUsed} tokens</span>
            )}
          </div>
        )}

        {/* Status indicator */}
        {isUser && message.status === 'sending' && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4">
            <svg className="animate-spin text-blue-400" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="10" cy="10" r="7" strokeOpacity={0.3} />
              <path d="M10 3a7 7 0 0 1 7 7" strokeLinecap="round" />
            </svg>
          </div>
        )}
        {isUser && message.status === 'error' && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 text-red-400">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {/* Timestamp */}
      {showTimestamp && (
        <div className={`text-xs text-white/30 mt-1 ${isUser ? 'mr-2' : 'ml-2'}`}>
          {formatTime(message.timestamp)}
        </div>
      )}
    </div>
  );
};

// =============================================================================
// MAIN CHAT INTERFACE COMPONENT
// =============================================================================

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  onIntentConfirm,
  onIntentReject,
  onActionConfirm,
  onWidgetInteraction,
  isTyping = false,
  placeholder = 'Type a message...',
  disabled = false,
  showTimestamps = true,
  showMetadata = false,
  className = '',
  phaseContext,
  actionStream,
  smartSuggestions,
  predictiveText,
  showActionStream = false,
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = input.trim();
    if (trimmed && !disabled) {
      onSendMessage(trimmed);
      setInput('');
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    }
  }, [input, disabled, onSendMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    // Tab to accept predictive text
    if (e.key === 'Tab' && predictiveText && !input.includes(predictiveText)) {
      e.preventDefault();
      setInput(predictiveText);
    }
  }, [handleSubmit, predictiveText, input]);

  const handleSuggestionSelect = useCallback((suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  }, []);

  return (
    <div className={`chat-interface flex h-full ${className}`}>
      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Context Bar */}
        {phaseContext && <ContextBar context={phaseContext} />}

        {/* Messages area */}
        <div className="chat-messages flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-white/30">
              <svg className="w-12 h-12 mb-3 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
              <p className="text-sm">Start a conversation</p>
              <p className="text-xs text-white/20 mt-1">I'll understand your intent and guide you through</p>
            </div>
          )}

          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              showTimestamp={showTimestamps}
              showMetadata={showMetadata}
              isLatest={index === messages.length - 1}
              onIntentConfirm={onIntentConfirm}
              onIntentReject={onIntentReject}
              onActionConfirm={onActionConfirm}
              onWidgetInteraction={onWidgetInteraction}
            />
          ))}

          {isTyping && (
            <div className="chat-message flex flex-col items-start">
              <div className="text-xs text-white/40 mb-1 ml-2">Assistant</div>
              <div className="chat-bubble bg-white/5 border border-white/10 rounded-2xl rounded-bl-md">
                <TypingIndicator />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Smart Suggestions */}
        {smartSuggestions && smartSuggestions.length > 0 && (
          <SmartSuggestionsBar
            suggestions={smartSuggestions}
            onSelect={handleSuggestionSelect}
          />
        )}

        {/* Input area */}
        <div className="chat-input-area border-t border-white/10 p-4">
          <form onSubmit={handleSubmit} className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                rows={1}
                className="
                  w-full px-4 py-3 rounded-xl
                  bg-white/5 border border-white/10
                  text-white/90 placeholder-white/30
                  resize-none overflow-hidden
                  focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200
                "
              />
              {/* Predictive text overlay */}
              {predictiveText && input && predictiveText.toLowerCase().startsWith(input.toLowerCase()) && input !== predictiveText && (
                <div className="absolute inset-0 pointer-events-none px-4 py-3 text-white/20">
                  <span className="invisible">{input}</span>
                  <span>{predictiveText.slice(input.length)}</span>
                  <span className="ml-2 text-xs text-white/30">Tab ↹</span>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={disabled || !input.trim()}
              className="
                p-3 rounded-xl
                bg-blue-500/20 border border-blue-500/30
                text-blue-300
                hover:bg-blue-500/30 hover:border-blue-500/50
                disabled:opacity-30 disabled:cursor-not-allowed
                transition-all duration-200
                flex-shrink-0
              "
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </form>
          <div className="text-xs text-white/30 mt-2 text-center">
            Press Enter to send • Shift+Enter for new line • Tab to accept suggestion
          </div>
        </div>
      </div>

      {/* Action Stream Panel */}
      {showActionStream && actionStream && (
        <ActionStreamPanel items={actionStream} />
      )}
    </div>
  );
};

export default ChatInterface;
