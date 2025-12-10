import React, { useState, useEffect, useMemo } from 'react';

export type ValidationStatus = 'pass' | 'warn' | 'fail' | 'pending' | 'skipped';

export interface ValidationRule {
  id: string;
  name: string;
  category: string;
  status: ValidationStatus;
  message?: string;
  details?: string;
  affectedRows?: number;
  severity?: 'critical' | 'major' | 'minor';
}

export interface ValidationGridProps {
  rules: ValidationRule[];
  title?: string;
  showCategories?: boolean;
  animated?: boolean;
  onRuleClick?: (rule: ValidationRule) => void;
  onRevalidate?: () => void;
  className?: string;
}

const StatusIcon: React.FC<{ status: ValidationStatus; animated?: boolean; size?: 'sm' | 'md' }> = ({
  status,
  animated = true,
  size = 'md',
}) => {
  const sizeClasses = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  switch (status) {
    case 'pass':
      return (
        <div className={`${sizeClasses} relative`}>
          <svg className="text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {animated && (
            <div className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping" style={{ animationDuration: '2s', animationIterationCount: 1 }} />
          )}
        </div>
      );
    case 'warn':
      return (
        <div className={`${sizeClasses} relative`}>
          <svg className="text-amber-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {animated && (
            <div className="absolute inset-0 animate-pulse" style={{ animationDuration: '1.5s' }}>
              <svg className="text-amber-400/50" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      );
    case 'fail':
      return (
        <div className={`${sizeClasses} relative`}>
          <svg className="text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {animated && (
            <div className="absolute inset-0 rounded-full animate-pulse" style={{ animationDuration: '1s' }}>
              <div className="w-full h-full rounded-full bg-red-400/20" />
            </div>
          )}
        </div>
      );
    case 'pending':
      return (
        <div className={`${sizeClasses} relative`}>
          <svg className="text-blue-400 animate-spin" style={{ animationDuration: '1.5s' }} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="10" cy="10" r="7" strokeOpacity={0.3} />
            <path d="M10 3a7 7 0 0 1 7 7" strokeLinecap="round" />
          </svg>
        </div>
      );
    case 'skipped':
    default:
      return (
        <div className={`${sizeClasses}`}>
          <svg className="text-white/30" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        </div>
      );
  }
};

const SeverityBadge: React.FC<{ severity?: 'critical' | 'major' | 'minor' }> = ({ severity }) => {
  if (!severity) return null;

  const colors = {
    critical: 'bg-red-500/20 text-red-300 border-red-500/30',
    major: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    minor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${colors[severity]}`}>
      {severity}
    </span>
  );
};

const ValidationRow: React.FC<{
  rule: ValidationRule;
  index: number;
  animated: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onClick?: () => void;
}> = ({ rule, index, animated, isExpanded, onToggle, onClick }) => {
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHasEntered(true), index * 50);
    return () => clearTimeout(timer);
  }, [index]);

  const getRowBackground = () => {
    switch (rule.status) {
      case 'fail': return 'bg-red-500/5 hover:bg-red-500/10';
      case 'warn': return 'bg-amber-500/5 hover:bg-amber-500/10';
      case 'pass': return 'bg-emerald-500/5 hover:bg-emerald-500/10';
      default: return 'bg-white/[0.02] hover:bg-white/[0.04]';
    }
  };

  return (
    <div
      className={`
        validation-row
        ${hasEntered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
        transition-all duration-300 ease-out
      `}
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      <div
        className={`
          flex items-center gap-4 p-3 rounded-lg cursor-pointer
          border border-white/5
          ${getRowBackground()}
          transition-all duration-200
        `}
        onClick={() => {
          onToggle();
          onClick?.();
        }}
      >
        {/* Status icon */}
        <StatusIcon status={rule.status} animated={animated && hasEntered} />

        {/* Rule info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-white/90 truncate">
              {rule.name}
            </span>
            <SeverityBadge severity={rule.severity} />
          </div>
          {rule.message && (
            <p className="text-xs text-white/50 mt-0.5 truncate">
              {rule.message}
            </p>
          )}
        </div>

        {/* Affected rows count */}
        {rule.affectedRows !== undefined && rule.affectedRows > 0 && (
          <div className="text-xs text-white/40">
            <span className={`font-medium ${rule.status === 'fail' ? 'text-red-300' : rule.status === 'warn' ? 'text-amber-300' : 'text-white/60'}`}>
              {rule.affectedRows.toLocaleString()}
            </span>
            {' '}rows
          </div>
        )}

        {/* Category */}
        <div className="text-xs text-white/30 px-2 py-1 bg-white/5 rounded">
          {rule.category}
        </div>

        {/* Expand indicator */}
        {rule.details && (
          <svg
            className={`w-4 h-4 text-white/30 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        )}
      </div>

      {/* Expanded details */}
      {isExpanded && rule.details && (
        <div className="mt-1 ml-9 p-3 bg-white/[0.02] rounded-lg border border-white/5 text-xs text-white/60 animate-fadeIn">
          <pre className="whitespace-pre-wrap font-mono">{rule.details}</pre>
        </div>
      )}
    </div>
  );
};

export const ValidationGrid: React.FC<ValidationGridProps> = ({
  rules,
  title = 'Validation Results',
  showCategories = true,
  animated = true,
  onRuleClick,
  onRevalidate,
  className = '',
}) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<ValidationStatus | 'all'>('all');

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: rules.length,
      pass: rules.filter(r => r.status === 'pass').length,
      warn: rules.filter(r => r.status === 'warn').length,
      fail: rules.filter(r => r.status === 'fail').length,
      pending: rules.filter(r => r.status === 'pending').length,
      skipped: rules.filter(r => r.status === 'skipped').length,
    };
  }, [rules]);

  // Group by category
  const groupedRules = useMemo(() => {
    const filtered = filterStatus === 'all'
      ? rules
      : rules.filter(r => r.status === filterStatus);

    if (!showCategories) return { 'All Rules': filtered };

    return filtered.reduce((acc, rule) => {
      const cat = rule.category || 'Uncategorized';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(rule);
      return acc;
    }, {} as Record<string, ValidationRule[]>);
  }, [rules, filterStatus, showCategories]);

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const passRate = stats.total > 0 ? Math.round((stats.pass / stats.total) * 100) : 0;

  return (
    <div className={`validation-grid ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white/90">{title}</h3>
          <p className="text-sm text-white/50 mt-0.5">
            {stats.total} rules validated
          </p>
        </div>
        {onRevalidate && (
          <button
            onClick={onRevalidate}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 transition-all flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Revalidate
          </button>
        )}
      </div>

      {/* Stats summary */}
      <div className="validation-stats grid grid-cols-5 gap-2 mb-4">
        <button
          onClick={() => setFilterStatus('all')}
          className={`
            p-3 rounded-lg border transition-all text-center
            ${filterStatus === 'all'
              ? 'bg-white/10 border-white/20'
              : 'bg-white/[0.02] border-white/5 hover:border-white/10'
            }
          `}
        >
          <div className="text-2xl font-bold text-white/90">{stats.total}</div>
          <div className="text-xs text-white/40 mt-0.5">Total</div>
        </button>
        <button
          onClick={() => setFilterStatus('pass')}
          className={`
            p-3 rounded-lg border transition-all text-center
            ${filterStatus === 'pass'
              ? 'bg-emerald-500/20 border-emerald-500/30'
              : 'bg-white/[0.02] border-white/5 hover:border-emerald-500/20'
            }
          `}
        >
          <div className="text-2xl font-bold text-emerald-400">{stats.pass}</div>
          <div className="text-xs text-emerald-400/60 mt-0.5">Pass</div>
        </button>
        <button
          onClick={() => setFilterStatus('warn')}
          className={`
            p-3 rounded-lg border transition-all text-center
            ${filterStatus === 'warn'
              ? 'bg-amber-500/20 border-amber-500/30'
              : 'bg-white/[0.02] border-white/5 hover:border-amber-500/20'
            }
          `}
        >
          <div className="text-2xl font-bold text-amber-400">{stats.warn}</div>
          <div className="text-xs text-amber-400/60 mt-0.5">Warn</div>
        </button>
        <button
          onClick={() => setFilterStatus('fail')}
          className={`
            p-3 rounded-lg border transition-all text-center
            ${filterStatus === 'fail'
              ? 'bg-red-500/20 border-red-500/30'
              : 'bg-white/[0.02] border-white/5 hover:border-red-500/20'
            }
          `}
        >
          <div className="text-2xl font-bold text-red-400">{stats.fail}</div>
          <div className="text-xs text-red-400/60 mt-0.5">Fail</div>
        </button>
        <button
          onClick={() => setFilterStatus('pending')}
          className={`
            p-3 rounded-lg border transition-all text-center
            ${filterStatus === 'pending'
              ? 'bg-blue-500/20 border-blue-500/30'
              : 'bg-white/[0.02] border-white/5 hover:border-blue-500/20'
            }
          `}
        >
          <div className="text-2xl font-bold text-blue-400">{stats.pending}</div>
          <div className="text-xs text-blue-400/60 mt-0.5">Pending</div>
        </button>
      </div>

      {/* Pass rate bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-white/50 mb-1">
          <span>Pass Rate</span>
          <span className={passRate >= 80 ? 'text-emerald-400' : passRate >= 50 ? 'text-amber-400' : 'text-red-400'}>
            {passRate}%
          </span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`
              h-full rounded-full transition-all duration-700 ease-out
              ${passRate >= 80 ? 'bg-emerald-500' : passRate >= 50 ? 'bg-amber-500' : 'bg-red-500'}
            `}
            style={{ width: `${passRate}%` }}
          />
        </div>
      </div>

      {/* Rules list */}
      <div className="validation-rules space-y-4">
        {Object.entries(groupedRules).map(([category, categoryRules]) => (
          <div key={category}>
            {showCategories && Object.keys(groupedRules).length > 1 && (
              <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 flex items-center gap-2">
                {category}
                <span className="text-white/20">({categoryRules.length})</span>
              </div>
            )}
            <div className="space-y-1">
              {categoryRules.map((rule, index) => (
                <ValidationRow
                  key={rule.id}
                  rule={rule}
                  index={index}
                  animated={animated}
                  isExpanded={expandedIds.has(rule.id)}
                  onToggle={() => toggleExpanded(rule.id)}
                  onClick={() => onRuleClick?.(rule)}
                />
              ))}
            </div>
          </div>
        ))}

        {Object.keys(groupedRules).length === 0 && (
          <div className="text-center py-8 text-white/40">
            No validation rules match the current filter
          </div>
        )}
      </div>
    </div>
  );
};

export default ValidationGrid;
