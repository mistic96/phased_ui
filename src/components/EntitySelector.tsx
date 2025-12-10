/**
 * Entity Selector Component
 * Multi-select with phase-aware surfacing
 *
 * Features:
 * - Search/filter entities
 * - Multi-select with animated chips
 * - Phase-aware: options surface based on relevance
 * - Keyboard navigation
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { usePhase } from '../phased/usePhase';
import type { Phase } from '../phased/types';

interface Entity {
  id: string;
  name: string;
  type?: string;
  description?: string;
  relevance?: number; // 0-1, used for phase-aware surfacing
}

interface EntitySelectorProps {
  entities: Entity[];
  selectedIds?: string[];
  onChange?: (selectedIds: string[]) => void;
  placeholder?: string;
  maxSelections?: number;
  initialPhase?: Phase;
  className?: string;
}

export function EntitySelector({
  entities,
  selectedIds = [],
  onChange,
  placeholder = 'Search entities...',
  maxSelections,
  initialPhase = 'surfaced',
  className = '',
}: EntitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const { className: phaseClassName } = usePhase({ initialPhase });

  // Filter entities based on search
  const filteredEntities = useMemo(() => {
    if (!search) return entities;
    const lower = search.toLowerCase();
    return entities.filter(
      (e) =>
        e.name.toLowerCase().includes(lower) ||
        e.type?.toLowerCase().includes(lower) ||
        e.description?.toLowerCase().includes(lower)
    );
  }, [entities, search]);

  // Sort by relevance if available
  const sortedEntities = useMemo(() => {
    return [...filteredEntities].sort((a, b) => {
      // Selected items first
      const aSelected = selectedIds.includes(a.id) ? 1 : 0;
      const bSelected = selectedIds.includes(b.id) ? 1 : 0;
      if (aSelected !== bSelected) return bSelected - aSelected;
      // Then by relevance
      return (b.relevance || 0) - (a.relevance || 0);
    });
  }, [filteredEntities, selectedIds]);

  const selectedEntities = useMemo(() => {
    return entities.filter((e) => selectedIds.includes(e.id));
  }, [entities, selectedIds]);

  const toggleSelection = useCallback(
    (id: string) => {
      const isSelected = selectedIds.includes(id);
      let newSelection: string[];

      if (isSelected) {
        newSelection = selectedIds.filter((sid) => sid !== id);
      } else {
        if (maxSelections && selectedIds.length >= maxSelections) {
          return; // Max reached
        }
        newSelection = [...selectedIds, id];
      }

      onChange?.(newSelection);
    },
    [selectedIds, onChange, maxSelections]
  );

  const removeSelection = useCallback(
    (id: string) => {
      onChange?.(selectedIds.filter((sid) => sid !== id));
    },
    [selectedIds, onChange]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'ArrowDown' || e.key === 'Enter') {
          setIsOpen(true);
          setFocusedIndex(0);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((i) => Math.min(i + 1, sortedEntities.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((i) => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (focusedIndex >= 0 && sortedEntities[focusedIndex]) {
            toggleSelection(sortedEntities[focusedIndex].id);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setFocusedIndex(-1);
          break;
        case 'Backspace':
          if (!search && selectedIds.length > 0) {
            removeSelection(selectedIds[selectedIds.length - 1]);
          }
          break;
      }
    },
    [isOpen, focusedIndex, sortedEntities, toggleSelection, search, selectedIds, removeSelection]
  );

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[focusedIndex] as HTMLElement;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIndex]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.closest('.entity-selector')?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className={`entity-selector ${phaseClassName} ${className}`}>
      {/* Selected chips */}
      {selectedEntities.length > 0 && (
        <div className="entity-selected-chips">
          {selectedEntities.map((entity, index) => (
            <div
              key={entity.id}
              className="entity-chip"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="entity-chip-name">{entity.name}</span>
              {entity.type && <span className="entity-chip-type">{entity.type}</span>}
              <button
                className="entity-chip-remove"
                onClick={() => removeSelection(entity.id)}
                aria-label={`Remove ${entity.name}`}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M4 4L10 10M10 4L4 10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="entity-search-container">
        <div className="entity-search-icon">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 12L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          className="entity-search-input"
          placeholder={placeholder}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
            setFocusedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />
        {search && (
          <button
            className="entity-search-clear"
            onClick={() => {
              setSearch('');
              inputRef.current?.focus();
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M4 4L10 10M10 4L4 10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown list */}
      {isOpen && (
        <div className="entity-dropdown">
          <div ref={listRef} className="entity-list">
            {sortedEntities.length === 0 ? (
              <div className="entity-empty">
                No entities found
              </div>
            ) : (
              sortedEntities.map((entity, index) => {
                const isSelected = selectedIds.includes(entity.id);
                const isFocused = index === focusedIndex;
                const relevanceClass = entity.relevance
                  ? entity.relevance > 0.7 ? 'high-relevance'
                  : entity.relevance > 0.4 ? 'medium-relevance'
                  : 'low-relevance'
                  : '';

                return (
                  <button
                    key={entity.id}
                    className={`entity-option ${isSelected ? 'selected' : ''} ${isFocused ? 'focused' : ''} ${relevanceClass}`}
                    onClick={() => toggleSelection(entity.id)}
                    onMouseEnter={() => setFocusedIndex(index)}
                  >
                    {/* Selection indicator */}
                    <div className={`entity-option-check ${isSelected ? 'checked' : ''}`}>
                      {isSelected && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path
                            d="M2.5 6L5 8.5L9.5 3.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>

                    {/* Entity info */}
                    <div className="entity-option-content">
                      <span className="entity-option-name">{entity.name}</span>
                      {entity.type && (
                        <span className="entity-option-type">{entity.type}</span>
                      )}
                      {entity.description && (
                        <span className="entity-option-desc">{entity.description}</span>
                      )}
                    </div>

                    {/* Relevance indicator */}
                    {entity.relevance !== undefined && (
                      <div className="entity-option-relevance">
                        <div
                          className="entity-relevance-bar"
                          style={{ width: `${entity.relevance * 100}%` }}
                        />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer with count */}
          <div className="entity-dropdown-footer">
            <span>{selectedIds.length} selected</span>
            {maxSelections && (
              <span className="entity-max">max {maxSelections}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default EntitySelector;
