/**
 * Dropzone Component - Modern Design
 * A portal waiting to receive files with ambient motion
 *
 * States:
 * - idle: Floating particles, rotating gradient border, morphing icon
 * - dragover: Intensified glow, particles accelerate toward center
 * - absorbing: Files pulled into vortex
 */

import { useState, useCallback, useRef } from 'react';
import { usePhase } from '../phased/usePhase';
import type { Phase } from '../phased/types';

interface DroppedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'entering' | 'absorbing' | 'absorbed';
  position: { x: number; y: number };
}

interface DropzoneProps {
  onFilesAccepted?: (files: File[]) => void;
  onAbsorptionComplete?: () => void;
  initialPhase?: Phase;
  maxFiles?: number;
  className?: string;
}

export function Dropzone({
  onFilesAccepted,
  onAbsorptionComplete,
  initialPhase = 'surfaced',
  maxFiles = 10,
  className = '',
}: DropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [droppedFiles, setDroppedFiles] = useState<DroppedFile[]>([]);
  const [isAbsorbing, setIsAbsorbing] = useState(false);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const { className: phaseClassName } = usePhase({ initialPhase });

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dropzoneRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files).slice(0, maxFiles);
    if (files.length === 0) return;

    const rect = dropzoneRef.current?.getBoundingClientRect();
    const dropX = rect ? e.clientX - rect.left : 100;
    const dropY = rect ? e.clientY - rect.top : 100;

    const newFiles: DroppedFile[] = files.map((file, i) => ({
      id: `${Date.now()}-${i}`,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'entering' as const,
      position: {
        x: dropX + (Math.random() - 0.5) * 100,
        y: dropY + (Math.random() - 0.5) * 60,
      },
    }));

    setDroppedFiles(newFiles);
    setIsAbsorbing(true);

    setTimeout(() => {
      setDroppedFiles(prev => prev.map(f => ({ ...f, status: 'absorbing' as const })));
    }, 100);

    setTimeout(() => {
      setDroppedFiles(prev => prev.map(f => ({ ...f, status: 'absorbed' as const })));
    }, 600);

    setTimeout(() => {
      setDroppedFiles([]);
      setIsAbsorbing(false);
      onFilesAccepted?.(files);
      onAbsorptionComplete?.();
    }, 1000);
  }, [maxFiles, onFilesAccepted, onAbsorptionComplete]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      ref={dropzoneRef}
      className={`
        ${phaseClassName}
        dropzone-modern
        relative overflow-hidden rounded-2xl
        transition-all duration-500 ease-out
        ${isDragOver ? 'dropzone-hover' : ''}
        ${isAbsorbing ? 'dropzone-absorbing' : ''}
        ${className}
      `}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Animated gradient border */}
      <div className="dropzone-border-gradient" />

      {/* Inner glass container */}
      <div className="dropzone-inner">
        {/* Ambient floating particles */}
        <div className="dropzone-particles">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="dropzone-particle-ambient"
              style={{
                '--index': i,
                '--delay': `${i * 0.8}s`,
              } as React.CSSProperties}
            />
          ))}
        </div>

        {/* Center content */}
        <div className={`
          relative z-10 flex flex-col items-center justify-center py-16 px-8
          transition-all duration-300
          ${isAbsorbing ? 'opacity-0 scale-90' : ''}
        `}>
          {/* Morphing shape icon - reuses the processing animation */}
          <div className={`
            relative w-16 h-16 mb-6
            transition-transform duration-300
            ${isDragOver ? 'scale-125' : 'scale-100'}
          `}>
            <svg width="64" height="64" viewBox="0 0 64 64" className="dropzone-icon">
              <defs>
                <linearGradient id="dropzone-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
                <filter id="dropzone-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Circle */}
              <circle
                cx="32"
                cy="32"
                r="20"
                fill="url(#dropzone-grad)"
                filter="url(#dropzone-glow)"
                className="animate-morph-shape-1"
              />

              {/* Diamond */}
              <polygon
                points="32,12 52,32 32,52 12,32"
                fill="url(#dropzone-grad)"
                filter="url(#dropzone-glow)"
                className="animate-morph-shape-2"
              />

              {/* Hexagon */}
              <polygon
                points="32,12 49.3,22 49.3,42 32,52 14.7,42 14.7,22"
                fill="url(#dropzone-grad)"
                filter="url(#dropzone-glow)"
                className="animate-morph-shape-3"
              />
            </svg>
          </div>

          {/* Text */}
          <p className={`
            text-base font-medium tracking-wide
            transition-all duration-300
            ${isDragOver ? 'text-white' : 'text-white/60'}
          `}>
            {isDragOver ? 'Release to absorb' : 'Drop files to begin'}
          </p>
        </div>

        {/* Absorption vortex */}
        {isAbsorbing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="absorption-vortex" />
          </div>
        )}
      </div>

      {/* Dropped file particles */}
      {droppedFiles.map((file) => (
        <div
          key={file.id}
          className={`
            absolute pointer-events-none z-20
            transition-all duration-500 ease-out
            ${file.status === 'absorbing' ? 'file-absorbing' : ''}
            ${file.status === 'absorbed' ? 'opacity-0 scale-0' : ''}
          `}
          style={{
            left: file.status === 'absorbing' ? '50%' : file.position.x,
            top: file.status === 'absorbing' ? '50%' : file.position.y,
            transform: file.status === 'absorbing'
              ? 'translate(-50%, -50%) scale(0.3)'
              : 'translate(-50%, -50%)',
          }}
        >
          <div className="file-particle glass-elevated px-3 py-2 rounded-lg">
            <p className="text-xs font-medium text-white/90 truncate max-w-[120px]">
              {file.name}
            </p>
            <p className="text-[10px] text-white/50">
              {formatFileSize(file.size)}
            </p>
          </div>
        </div>
      ))}

      {/* Spiral particles during absorption */}
      {isAbsorbing && (
        <>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absorption-particle"
              style={{
                '--delay': `${i * 0.1}s`,
                '--angle': `${i * 45}deg`,
              } as React.CSSProperties}
            />
          ))}
        </>
      )}
    </div>
  );
}

export default Dropzone;
