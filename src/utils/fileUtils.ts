/**
 * File utilities for file upload components
 * Shared functionality for single and multi-file upload
 */

import { ProgrammingLanguage } from '@/types';

/**
 * Map of file extensions to programming languages
 */
export const FILE_EXTENSION_MAP: Record<string, ProgrammingLanguage> = {
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.mjs': 'javascript',
  '.cjs': 'javascript',
  '.py': 'python',
  '.java': 'java',
  '.cs': 'csharp',
  '.go': 'go',
  '.rs': 'rust',
  '.cpp': 'cpp',
  '.cc': 'cpp',
  '.cxx': 'cpp',
  '.c': 'cpp',
  '.h': 'cpp',
  '.hpp': 'cpp',
};

/**
 * List of supported file extensions
 */
export const SUPPORTED_EXTENSIONS = Object.keys(FILE_EXTENSION_MAP);

/**
 * File size limits
 */
export const MAX_FILE_SIZE = 100 * 1024; // 100KB per file
export const MAX_MULTI_FILE_COUNT = 20;
export const MAX_MULTI_FILE_TOTAL_SIZE = 500 * 1024; // 500KB total

/**
 * Detect programming language from file extension
 */
export function getLanguageFromExtension(fileName: string): ProgrammingLanguage {
  const ext = fileName.toLowerCase().match(/\.[^.]+$/)?.[0];
  return ext && FILE_EXTENSION_MAP[ext] ? FILE_EXTENSION_MAP[ext] : 'auto';
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Validate a single file for upload
 */
export function validateFile(file: File): string | null {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return `File too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}.`;
  }

  // Check file extension
  const ext = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];
  if (!ext || !SUPPORTED_EXTENSIONS.includes(ext)) {
    return `Unsupported file type. Supported: ${SUPPORTED_EXTENSIONS.join(', ')}`;
  }

  return null;
}

/**
 * Read file content with encoding validation
 */
export async function readFileContent(file: File): Promise<{ content: string; error: string | null }> {
  try {
    const content = await file.text();

    // Basic encoding validation - check for replacement character
    if (!content || content.includes('\uFFFD')) {
      return {
        content: '',
        error: 'Unable to read file. Please ensure it is a valid text file with UTF-8 encoding.',
      };
    }

    return { content, error: null };
  } catch {
    return {
      content: '',
      error: 'Failed to read file. Please try again.',
    };
  }
}

/**
 * Generate a unique ID for file tracking
 */
export function generateFileId(): string {
  return Math.random().toString(36).substring(2, 11);
}
