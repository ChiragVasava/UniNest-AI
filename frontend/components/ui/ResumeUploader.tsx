'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface Props {
  onUpload?: (file: File) => Promise<void> | void;
  maxSizeMB?: number;
}

export function ResumeUploader({ onUpload, maxSizeMB = 5 }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = async (f?: File) => {
    setError(null);
    if (!f) return;

    const maxBytes = maxSizeMB * 1024 * 1024;
    if (f.size > maxBytes) {
      setError(`File too large. Max ${maxSizeMB}MB.`);
      return;
    }

    // Prefer MIME check, fall back to extension
    const isPdf = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setError('Only PDF resumes are allowed.');
      return;
    }

    try {
      setIsUploading(true);
      await onUpload?.(f);
    } catch (err) {
      setError((err as Error)?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">Upload Resume (PDF)</label>
      <div className="flex items-center gap-3">
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => handleFile(e.target.files?.[0])}
          className="text-sm"
        />
        <Button variant="secondary" isLoading={isUploading} onClick={() => {}}>
          Upload
        </Button>
      </div>
      {error && <p className="text-sm text-danger-600">{error}</p>}
      <p className="text-xs text-slate-500">Max {maxSizeMB}MB. PDF only.</p>
    </div>
  );
}
