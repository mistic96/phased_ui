import React, { useState, useCallback } from 'react';

export interface InlineDropzoneProps {
  onFileDrop: (files: File[]) => void;
  accept?: string;
  maxFiles?: number;
  disabled?: boolean;
  compact?: boolean;
}

export const InlineDropzone: React.FC<InlineDropzoneProps> = ({
  onFileDrop,
  accept = '*',
  maxFiles = 5,
  disabled = false,
  compact = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isAbsorbing, setIsAbsorbing] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files).slice(0, maxFiles);
    if (files.length > 0) {
      // Trigger absorption animation
      setIsAbsorbing(true);
      setTimeout(() => {
        setIsAbsorbing(false);
        onFileDrop(files);
      }, 600);
    }
  }, [disabled, maxFiles, onFileDrop]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, maxFiles);
    if (files.length > 0) {
      setIsAbsorbing(true);
      setTimeout(() => {
        setIsAbsorbing(false);
        onFileDrop(files);
      }, 600);
    }
    e.target.value = '';
  }, [maxFiles, onFileDrop]);

  if (compact) {
    return (
      <div
        className={`
          inline-dropzone-compact relative
          inline-flex items-center gap-2 px-4 py-2 rounded-lg
          border border-dashed transition-all duration-200
          ${isDragging
            ? 'border-blue-400 bg-blue-500/20 scale-105'
            : 'border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/10'
          }
          ${isAbsorbing ? 'animate-pulse border-emerald-400 bg-emerald-500/20' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          onChange={handleFileSelect}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <svg className="w-4 h-4 text-white/50" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
        <span className="text-xs text-white/50">
          {isAbsorbing ? 'Processing...' : 'Drop file or click'}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`
        inline-dropzone relative my-3 p-6 rounded-xl
        border-2 border-dashed transition-all duration-300
        ${isDragging
          ? 'border-blue-400 bg-blue-500/20 scale-[1.02]'
          : 'border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/10'
        }
        ${isAbsorbing ? 'border-emerald-400 bg-emerald-500/20' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept={accept}
        multiple={maxFiles > 1}
        onChange={handleFileSelect}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />

      {/* Absorption animation rings */}
      {isAbsorbing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="absolute w-16 h-16 rounded-full border-2 border-emerald-400 animate-ping opacity-75" />
          <div className="absolute w-24 h-24 rounded-full border border-emerald-400/50 animate-ping opacity-50" style={{ animationDelay: '150ms' }} />
        </div>
      )}

      <div className="flex flex-col items-center gap-3 text-center">
        <div className={`
          p-3 rounded-xl transition-all duration-300
          ${isDragging ? 'bg-blue-500/30 scale-110' : 'bg-white/10'}
          ${isAbsorbing ? 'bg-emerald-500/30 scale-90' : ''}
        `}>
          <svg className={`w-8 h-8 transition-colors ${isDragging ? 'text-blue-400' : 'text-white/50'}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <p className={`text-sm font-medium transition-colors ${isDragging ? 'text-blue-300' : 'text-white/70'}`}>
            {isAbsorbing ? 'Processing file...' : isDragging ? 'Drop to upload' : 'Drop a file here to continue'}
          </p>
          <p className="text-xs text-white/40 mt-1">
            or click to browse
          </p>
        </div>
      </div>
    </div>
  );
};

export default InlineDropzone;
