import type React from 'react';

export interface AdTemplate {
  id: string;
  name: string;
  description: string;
  keywords: string;
  previewUrl: string;       // thumbnail shown in the library UI
  category: string;
  isCustom?: boolean;       // true for user-uploaded templates

  // Visual reference: for custom templates this is a base64 data URL,
  // for built-in templates this is the same as previewUrl (public path)
  referenceImageUrl?: string;

  // Legacy text-prompt fields (still used as fallback)
  visualReference?: string;
  lightingKeywords?: string;
  backgroundKeywords?: string;
  promptTemplate?: string;
}

export interface UploadedImage {
  file: File;
  previewUrl: string;
}

export interface AspectRatio {
  id: string;
  name: string;
  value: string; // e.g., '1:1', '16:9'
  icon: React.FC<{className?: string}>;
}

export interface GeneratedResult {
  template: AdTemplate;
  imageUrl: string | null;
  error?: string;
  headline?: string;
  subheadline?: string;
}

export interface HistoryItem extends GeneratedResult {
  id: string;
  timestamp: number;
  aspectRatio: string;
}
