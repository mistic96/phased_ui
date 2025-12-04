/**
 * Dropzone Component
 * File upload area with "absorption" animation
 *
 * States:
 * - idle: Waiting for files, subtle pulse
 * - dragover: Active drag, expanded with glow
 * - absorbing: Files being "pulled in" to the system
 * - processing: Files absorbed, processing started
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
    // Only set to false if leaving the dropzone entirely
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

    // Get drop position relative to dropzone
    const rect = dropzoneRef.current?.getBoundingClientRect();
    const dropX = rect ? e.clientX - rect.left : 100;
    const dropY = rect ? e.clientY - rect.top : 100;

    // Create file entries with scattered positions around drop point
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

    // Start absorption sequence
    setTimeout(() => {
      setDroppedFiles(prev => prev.map(f => ({ ...f, status: 'absorbing' as const })));
    }, 100);

    // Complete absorption
    setTimeout(() => {
      setDroppedFiles(prev => prev.map(f => ({ ...f, status: 'absorbed' as const })));
    }, 600);

    // Clear and callback
    setTimeout(() => {
      setDroppedFiles([]);
      setIsAbsorbing(false);
      onFilesAccepted?.(files);
      onAbsorptionComplete?.();
    }, 1000);
  }, [maxFiles, onFilesAccepted, onAbsorptionComplete]);

  const getStateClasses = () => {
    if (isAbsorbing) return 'dropzone-absorbing';
    if (isDragOver) return 'dropzone-active';
    return 'dropzone-idle';
  };

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
        relative overflow-hidden
        rounded-2xl border-2 border-dashed
        transition-all duration-300 ease-out
        ${getStateClasses()}
        ${className}
      `}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-white/[0.05]" />

      {/* Absorption vortex effect */}
      {isAbsorbing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="absorption-vortex" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center py-12 px-6">
        {/* Icon */}
        <div className={`
          mb-4 transition-transform duration-300
          ${isDragOver ? 'scale-110' : 'scale-100'}
          ${isAbsorbing ? 'scale-90 opacity-50' : ''}
        `}>
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            className={isDragOver ? 'animate-bounce-subtle' : ''}
          >
            <defs>
              <linearGradient id="dropzone-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            {/* Cloud/upload icon */}
            <path
              d="M32 44V28M32 28L24 36M32 28L40 36"
              stroke="url(#dropzone-gradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={isAbsorbing ? 'opacity-30' : ''}
            />
            <path
              d="M44 40C48.4183 40 52 36.4183 52 32C52 27.5817 48.4183 24 44 24C43.7373 24 43.4772 24.0122 43.2202 24.0361C42.0078 19.4404 37.4183 16 32 16C25.3726 16 20 21.3726 20 28C20 28.3367 20.0118 28.6705 20.0351 29.0012C16.0467 29.1525 12 32.2895 12 37C12 41.9706 16.0294 46 21 46H43C43.3367 46 43.6705 45.9882 44 45.9649"
              stroke="url(#dropzone-gradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              className={isAbsorbing ? 'opacity-30' : ''}
            />
          </svg>
        </div>

        {/* Text */}
        <div className="text-center">
          <p className={`
            text-lg font-medium transition-all duration-300
            ${isDragOver ? 'text-indigo-300' : 'text-white/80'}
            ${isAbsorbing ? 'opacity-0' : ''}
          `}>
            {isDragOver ? 'Release to upload' : 'Drop files here'}
          </p>
          <p className={`
            text-sm text-white/40 mt-1 transition-opacity duration-300
            ${isDragOver || isAbsorbing ? 'opacity-0' : ''}
          `}>
            or click to browse
          </p>
        </div>

        {/* Absorbing status */}
        {isAbsorbing && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-indigo-300 font-medium animate-pulse">
              Absorbing...
            </p>
          </div>
        )}
      </div>

      {/* Dropped file particles */}
      {droppedFiles.map((file) => (
        <div
          key={file.id}
          className={`
            absolute pointer-events-none
            transition-all duration-500 ease-out
            ${file.status === 'entering' ? 'opacity-100 scale-100' : ''}
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
          <div className="file-particle glass px-3 py-2 rounded-lg">
            <p className="text-xs font-medium text-white/90 truncate max-w-[120px]">
              {file.name}
            </p>
            <p className="text-[10px] text-white/50">
              {formatFileSize(file.size)}
            </p>
          </div>
        </div>
      ))}

      {/* Particle effects during absorption */}
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
