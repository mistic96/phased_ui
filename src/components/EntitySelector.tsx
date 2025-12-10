/**
 * Entity Selector Component
 * Multi-select with phase-aware surfacing and virtualization
 *
 * Features:
 * - Search/filter entities
 * - Multi-select with animated chips
 * - Phase-aware: options surface based on relevance
 * - Keyboard navigation
 * - Virtualized list for performance
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

const ITEM_HEIGHT = 52; // Height of each option in pixels
const VISIBLE_COUNT = 5; // Number of visible items
const BUFFER_COUNT = 2; // Extra items to render above/below

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
  const [scrollTop, setScrollTop] = useState(0);
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

  // Virtualization calculations
  const totalHeight = sortedEntities.length * ITEM_HEIGHT;
  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_COUNT);
  const endIndex = Math.min(
    sortedEntities.length,
    Math.ceil((scrollTop + VISIBLE_COUNT * ITEM_HEIGHT) / ITEM_HEIGHT) + BUFFER_COUNT
  );
  const visibleEntities = sortedEntities.slice(startIndex, endIndex);
  const offsetY = startIndex * ITEM_HEIGHT;

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

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

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
          setFocusedIndex((i) => {
            const next = Math.min(i + 1, sortedEntities.length - 1);
            // Scroll to keep focused item visible
            if (listRef.current) {
              const itemTop = next * ITEM_HEIGHT;
              const itemBottom = itemTop + ITEM_HEIGHT;
              const viewTop = listRef.current.scrollTop;
              const viewBottom = viewTop + VISIBLE_COUNT * ITEM_HEIGHT;
              if (itemBottom > viewBottom) {
                listRef.current.scrollTop = itemBottom - VISIBLE_COUNT * ITEM_HEIGHT;
              }
            }
            return next;
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((i) => {
            const prev = Math.max(i - 1, 0);
            // Scroll to keep focused item visible
            if (listRef.current) {
              const itemTop = prev * ITEM_HEIGHT;
              const viewTop = listRef.current.scrollTop;
              if (itemTop < viewTop) {
                listRef.current.scrollTop = itemTop;
              }
            }
            return prev;
          });
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

  // Reset scroll when opening or search changes
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
      setScrollTop(0);
    }
  }, [isOpen, search]);

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
          <div
            ref={listRef}
            className="entity-list"
            onScroll={handleScroll}
          >
            {sortedEntities.length === 0 ? (
              <div className="entity-empty">
                No entities found
              </div>
            ) : (
              <div style={{ height: totalHeight, position: 'relative' }}>
                <div style={{ transform: `translateY(${offsetY}px)` }}>
                  {visibleEntities.map((entity, i) => {
                    const actualIndex = startIndex + i;
                    const isSelected = selectedIds.includes(entity.id);
                    const isFocused = actualIndex === focusedIndex;
                    const relevanceClass = entity.relevance
                      ? entity.relevance > 0.7 ? 'high-relevance'
                      : entity.relevance > 0.4 ? 'medium-relevance'
                      : 'low-relevance'
                      : '';

                    return (
                      <button
                        key={entity.id}
                        className={`entity-option ${isSelected ? 'selected' : ''} ${isFocused ? 'focused' : ''} ${relevanceClass}`}
                        style={{ height: ITEM_HEIGHT }}
                        onClick={() => toggleSelection(entity.id)}
                        onMouseEnter={() => setFocusedIndex(actualIndex)}
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
                  })}
                </div>
              </div>
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
