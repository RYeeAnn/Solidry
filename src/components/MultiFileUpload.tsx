'use client';

import { useState, useRef, useCallback } from 'react';
import { ProgrammingLanguage } from '@/types';
import {
  SUPPORTED_EXTENSIONS,
  MAX_FILE_SIZE,
  MAX_MULTI_FILE_COUNT,
  MAX_MULTI_FILE_TOTAL_SIZE,
  getLanguageFromExtension,
  formatFileSize,
  generateFileId,
} from '@/utils/fileUtils';

export interface UploadedFile {
  id: string;
  name: string;
  content: string;
  size: number;
  language: ProgrammingLanguage;
}

interface MultiFileUploadProps {
  onFilesChange: (files: UploadedFile[]) => void;
  files: UploadedFile[];
  disabled?: boolean;
  maxFiles?: number;
  maxTotalSize?: number;
}

export default function MultiFileUpload({
  onFilesChange,
  files,
  disabled = false,
  maxFiles = MAX_MULTI_FILE_COUNT,
  maxTotalSize = MAX_MULTI_FILE_TOTAL_SIZE,
}: MultiFileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentTotalSize = files.reduce((sum, f) => sum + f.size, 0);

  const validateSingleFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `"${file.name}" is too large (max ${formatFileSize(MAX_FILE_SIZE)})`;
    }

    const ext = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];
    if (!ext || !SUPPORTED_EXTENSIONS.includes(ext)) {
      return `"${file.name}" has unsupported extension`;
    }

    return null;
  };

  const processFiles = useCallback(
    async (fileList: FileList) => {
      setError(null);

      const newFiles: UploadedFile[] = [];
      const errors: string[] = [];

      if (files.length + fileList.length > maxFiles) {
        setError(`Maximum ${maxFiles} files allowed. Currently have ${files.length}.`);
        return;
      }

      let additionalSize = 0;

      for (const file of Array.from(fileList)) {
        if (files.some((f) => f.name === file.name)) {
          errors.push(`"${file.name}" already added`);
          continue;
        }

        const validationError = validateSingleFile(file);
        if (validationError) {
          errors.push(validationError);
          continue;
        }

        if (currentTotalSize + additionalSize + file.size > maxTotalSize) {
          errors.push(`Adding "${file.name}" would exceed total size limit`);
          continue;
        }

        try {
          const content = await file.text();

          if (!content || content.includes('\uFFFD')) {
            errors.push(`"${file.name}" has encoding issues`);
            continue;
          }

          newFiles.push({
            id: generateFileId(),
            name: file.name,
            content,
            size: file.size,
            language: getLanguageFromExtension(file.name),
          });

          additionalSize += file.size;
        } catch {
          errors.push(`Failed to read "${file.name}"`);
        }
      }

      if (errors.length > 0) {
        setError(errors.join('. '));
      }

      if (newFiles.length > 0) {
        onFilesChange([...files, ...newFiles]);
      }
    },
    [files, maxFiles, maxTotalSize, currentTotalSize, onFilesChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (disabled) return;

      const fileList = e.dataTransfer.files;
      if (fileList.length > 0) {
        processFiles(fileList);
      }
    },
    [disabled, processFiles]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = e.target.files;
      if (fileList && fileList.length > 0) {
        processFiles(fileList);
      }
      e.target.value = '';
    },
    [processFiles]
  );

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleRemoveFile = (id: string) => {
    onFilesChange(files.filter((f) => f.id !== id));
    setError(null);
  };

  const handleClearAll = () => {
    onFilesChange([]);
    setError(null);
  };

  return (
    <div className="space-y-3">
      {/* Drop Zone */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          panel p-4 border-2 border-dashed rounded-lg cursor-pointer
          transition-all duration-200 text-center
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-foreground/30 hover:bg-foreground/5'}
          ${isDragOver ? 'border-foreground/50 bg-foreground/10' : 'border-border'}
          ${error ? 'border-red-500/30 bg-red-500/5' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={SUPPORTED_EXTENSIONS.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
          multiple
        />

        <div className="flex flex-col items-center gap-2">
          <svg
            className="w-6 h-6 text-foreground/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <div className="text-sm">
            <span className="font-medium">Click to upload</span>
            <span className="text-foreground/60"> or drag and drop multiple files</span>
          </div>
          <div className="text-xs text-foreground/40">
            Max {maxFiles} files, {formatFileSize(maxTotalSize)} total
          </div>
        </div>
      </div>

      {error && <div className="text-xs text-red-600 dark:text-red-400 px-1">{error}</div>}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground/70">
              {files.length} file{files.length !== 1 ? 's' : ''} ({formatFileSize(currentTotalSize)})
            </span>
            <button
              onClick={handleClearAll}
              className="text-xs text-foreground/60 hover:text-foreground underline"
              disabled={disabled}
            >
              Clear all
            </button>
          </div>

          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between panel px-3 py-2 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <svg
                    className="w-4 h-4 flex-shrink-0 text-foreground/40"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="truncate font-medium">{file.name}</span>
                  <span className="text-foreground/50 flex-shrink-0">
                    {formatFileSize(file.size)}
                  </span>
                  <span className="text-foreground/40 flex-shrink-0 uppercase text-[10px]">
                    {file.language}
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveFile(file.id)}
                  className="text-foreground/40 hover:text-red-500 transition-colors flex-shrink-0 ml-2"
                  disabled={disabled}
                  aria-label={`Remove ${file.name}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
