import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

// ============================================
// TYPES
// ============================================

export type FeedbackType = 'acknowledge' | 'attention' | 'error';

export interface AuditEntry {
  id: string;
  timestamp: Date;
  type: FeedbackType;
  message: string;
  details?: string;
}

export interface FeedbackContextType {
  // Audit trail
  entries: AuditEntry[];
  addEntry: (type: FeedbackType, message: string, details?: string) => void;
  clearEntries: () => void;

  // Audio
  audioEnabled: boolean;
  setAudioEnabled: (enabled: boolean) => void;
  playSound: (type: FeedbackType) => void;

  // Combined - add entry and play sound
  notify: (type: FeedbackType, message: string, details?: string) => void;
}

// ============================================
// AUDIO ENGINE
// ============================================

class AudioEngine {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return this.audioContext;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  async playAcknowledge() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    await ctx.resume();

    // Soft, pleasant chime - two notes
    const now = ctx.currentTime;

    // First note
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now); // A5
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.15, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Second note (harmony)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1318.5, now + 0.05); // E6
    gain2.gain.setValueAtTime(0, now + 0.05);
    gain2.gain.linearRampToValueAtTime(0.1, now + 0.07);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.05);
    osc2.stop(now + 0.35);
  }

  async playAttention() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    await ctx.resume();

    // Gentle two-tone prompt
    const now = ctx.currentTime;

    // Rising tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.linearRampToValueAtTime(659.25, now + 0.15); // E5
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.03);
    gain.gain.setValueAtTime(0.12, now + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);

    // Second ping
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(783.99, now + 0.2); // G5
    gain2.gain.setValueAtTime(0, now + 0.2);
    gain2.gain.linearRampToValueAtTime(0.1, now + 0.22);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.2);
    osc2.stop(now + 0.5);
  }

  async playError() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    await ctx.resume();

    // Low, distinct but not jarring
    const now = ctx.currentTime;

    // Descending tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(349.23, now); // F4
    osc.frequency.linearRampToValueAtTime(261.63, now + 0.2); // C4
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.02);
    gain.gain.setValueAtTime(0.15, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  play(type: FeedbackType) {
    switch (type) {
      case 'acknowledge':
        this.playAcknowledge();
        break;
      case 'attention':
        this.playAttention();
        break;
      case 'error':
        this.playError();
        break;
    }
  }
}

// ============================================
// CONTEXT
// ============================================

const FeedbackContext = createContext<FeedbackContextType | null>(null);

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
};

// ============================================
// PROVIDER
// ============================================

export const FeedbackProvider: React.FC<{
  children: React.ReactNode;
  maxEntries?: number;
  audioEnabledByDefault?: boolean;
}> = ({ children, maxEntries = 50, audioEnabledByDefault = true }) => {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [audioEnabled, setAudioEnabled] = useState(audioEnabledByDefault);
  const audioEngineRef = useRef<AudioEngine>(new AudioEngine());

  useEffect(() => {
    audioEngineRef.current.setEnabled(audioEnabled);
  }, [audioEnabled]);

  const addEntry = useCallback((type: FeedbackType, message: string, details?: string) => {
    const entry: AuditEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type,
      message,
      details,
    };

    setEntries(prev => {
      const updated = [entry, ...prev];
      return updated.slice(0, maxEntries);
    });
  }, [maxEntries]);

  const clearEntries = useCallback(() => {
    setEntries([]);
  }, []);

  const playSound = useCallback((type: FeedbackType) => {
    audioEngineRef.current.play(type);
  }, []);

  const notify = useCallback((type: FeedbackType, message: string, details?: string) => {
    addEntry(type, message, details);
    playSound(type);
  }, [addEntry, playSound]);

  const value: FeedbackContextType = {
    entries,
    addEntry,
    clearEntries,
    audioEnabled,
    setAudioEnabled,
    playSound,
    notify,
  };

  return (
    <FeedbackContext.Provider value={value}>
      {children}
    </FeedbackContext.Provider>
  );
};

// ============================================
// AUDIT TRAIL COMPONENT
// ============================================

const AuditEntryItem: React.FC<{ entry: AuditEntry; isNew: boolean }> = ({ entry, isNew }) => {
  const getTypeStyles = () => {
    switch (entry.type) {
      case 'acknowledge':
        return 'border-emerald-500/30 bg-emerald-500/5';
      case 'attention':
        return 'border-amber-500/30 bg-amber-500/5';
      case 'error':
        return 'border-red-500/30 bg-red-500/5';
    }
  };

  const getTypeIcon = () => {
    switch (entry.type) {
      case 'acknowledge':
        return (
          <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'attention':
        return (
          <svg className="w-3.5 h-3.5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-3.5 h-3.5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div
      className={`
        audit-entry flex items-start gap-2 px-3 py-2 rounded-lg border
        ${getTypeStyles()}
        ${isNew ? 'animate-slideInRight' : ''}
        transition-all duration-200
      `}
    >
      <div className="mt-0.5">{getTypeIcon()}</div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-white/80 truncate">{entry.message}</div>
        {entry.details && (
          <div className="text-xs text-white/40 truncate mt-0.5">{entry.details}</div>
        )}
      </div>
      <div className="text-xs text-white/30 whitespace-nowrap">
        {formatTime(entry.timestamp)}
      </div>
    </div>
  );
};

export interface AuditTrailProps {
  maxVisible?: number;
  className?: string;
}

export const AuditTrail: React.FC<AuditTrailProps> = ({
  maxVisible = 5,
  className = '',
}) => {
  const { entries, clearEntries, audioEnabled, setAudioEnabled } = useFeedback();
  const [isExpanded, setIsExpanded] = useState(false);
  const [newEntryIds, setNewEntryIds] = useState<Set<string>>(new Set());

  // Track new entries for animation
  useEffect(() => {
    if (entries.length > 0) {
      const latestId = entries[0].id;
      setNewEntryIds(prev => new Set([...prev, latestId]));

      // Remove "new" status after animation
      const timer = setTimeout(() => {
        setNewEntryIds(prev => {
          const next = new Set(prev);
          next.delete(latestId);
          return next;
        });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [entries]);

  const visibleEntries = isExpanded ? entries : entries.slice(0, maxVisible);

  return (
    <div className={`audit-trail ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider">
            Activity
          </h4>
          {entries.length > 0 && (
            <span className="text-xs text-white/40">({entries.length})</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Audio toggle */}
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`
              p-1.5 rounded-md transition-colors
              ${audioEnabled ? 'bg-white/10 text-white/70' : 'bg-white/5 text-white/30'}
              hover:bg-white/15
            `}
            title={audioEnabled ? 'Mute sounds' : 'Enable sounds'}
          >
            {audioEnabled ? (
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          {/* Clear button */}
          {entries.length > 0 && (
            <button
              onClick={clearEntries}
              className="p-1.5 rounded-md bg-white/5 text-white/30 hover:bg-white/10 hover:text-white/50 transition-colors"
              title="Clear activity"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Entries */}
      {entries.length === 0 ? (
        <div className="text-xs text-white/30 text-center py-4">
          No recent activity
        </div>
      ) : (
        <div className="space-y-1.5">
          {visibleEntries.map(entry => (
            <AuditEntryItem
              key={entry.id}
              entry={entry}
              isNew={newEntryIds.has(entry.id)}
            />
          ))}

          {/* Show more/less */}
          {entries.length > maxVisible && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full text-xs text-white/40 hover:text-white/60 py-2 transition-colors"
            >
              {isExpanded ? 'Show less' : `Show ${entries.length - maxVisible} more`}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AuditTrail;
