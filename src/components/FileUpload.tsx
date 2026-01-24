'use client';

import { useState, useRef, useCallback } from 'react';
import { ProgrammingLanguage } from '@/types';
import {
  SUPPORTED_EXTENSIONS,
  MAX_FILE_SIZE,
  getLanguageFromExtension,
  formatFileSize,
  validateFile,
  readFileContent,
} from '@/utils/fileUtils';

interface FileUploadProps {
  onFileSelect: (content: string, language: ProgrammingLanguage, fileName: string) => void;
  disabled?: boolean;
}

interface UploadedFileInfo {
  name: string;
  size: number;
  language: ProgrammingLanguage;
}

export default function FileUpload({ onFileSelect, disabled = false }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFileInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);

      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      const { content, error: readError } = await readFileContent(file);
      if (readError) {
        setError(readError);
        return;
      }

      const language = getLanguageFromExtension(file.name);

      setUploadedFile({
        name: file.name,
        size: file.size,
        language,
      });

      onFileSelect(content, language, file.name);
    },
    [onFileSelect]
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

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        processFile(files[0]);
      }
    },
    [disabled, processFile]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        processFile(files[0]);
      }
      // Reset input so the same file can be selected again
      e.target.value = '';
    },
    [processFile]
  );

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedFile(null);
    setError(null);
  };

  return (
    <div className="space-y-2">
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
        />

        <div className="flex flex-col items-center gap-2">
          {uploadedFile ? (
            <>
              <svg
                className="w-6 h-6 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-sm font-medium">{uploadedFile.name}</div>
              <div className="text-xs text-foreground/60">
                {formatFileSize(uploadedFile.size)} · {uploadedFile.language.toUpperCase()}
              </div>
              <button
                onClick={handleClear}
                className="text-xs text-foreground/60 hover:text-foreground underline"
              >
                Clear
              </button>
            </>
          ) : (
            <>
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
                <span className="text-foreground/60"> or drag and drop</span>
              </div>
              <div className="text-xs text-foreground/40">
                {SUPPORTED_EXTENSIONS.slice(0, 6).join(', ')}... (max {formatFileSize(MAX_FILE_SIZE)})
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="text-xs text-red-600 dark:text-red-400 px-1">{error}</div>
      )}
    </div>
  );
}
