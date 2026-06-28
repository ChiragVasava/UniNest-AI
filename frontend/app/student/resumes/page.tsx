'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Navbar } from '@/components/layout/Navbar';
import { ResumeUploader } from '@/components/ui/ResumeUploader';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { resumeAPI } from '@/lib/api';
import { ErrorAlert, SuccessAlert } from '@/components/common/Alerts';

interface ResumeItem {
  id: string;
  fileName: string;
  fileSize: number;
  isVerified: boolean;
  verifyComment?: string;
  createdAt: string;
}

export default function StudentResumesPage() {
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const res = await resumeAPI.getMyResumes();
      setResumes(res.data?.data?.resumes || []);
    } catch {
      setError('Failed to load resumes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const loadInitialResumes = async () => {
      try {
        const res = await resumeAPI.getMyResumes();
        if (active) {
          setResumes(res.data?.data?.resumes || []);
        }
      } catch {
        if (active) {
          setError('Failed to load resumes.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadInitialResumes();

    return () => {
      active = false;
    };
  }, []);

  const handleUpload = async (file: File) => {
    setError('');
    setSuccess('');
    const formData = new FormData();
    formData.append('resume', file);
    await resumeAPI.upload(formData);
    setSuccess('Resume uploaded successfully.');
    await fetchResumes();
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      setError('');
      setSuccess('');
      await resumeAPI.delete(id);
      setSuccess('Resume deleted successfully.');
      await fetchResumes();
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : err instanceof Error
        ? err.message
        : String(err);
      setError(msg || 'Failed to delete resume.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">My Resumes</h1>
        {error && <ErrorAlert message={error} />}
        {success && <SuccessAlert message={success} />}
        <div className="bg-white border rounded-lg p-6">
          <ResumeUploader onUpload={handleUpload} maxSizeMB={5} />
          <div className="mt-6">
            <h3 className="text-lg font-medium text-slate-900">Uploaded Resumes</h3>
            {loading && <p className="text-sm text-slate-600">Loading resumes...</p>}
            {!loading && resumes.length === 0 && (
              <p className="text-sm text-slate-600">No resumes uploaded yet.</p>
            )}
            <div className="space-y-3 mt-3">
              {resumes.map((resume) => (
                <div key={resume.id} className="border rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{resume.fileName}</p>
                    <p className="text-xs text-slate-600">
                      {(resume.fileSize / 1024).toFixed(1)} KB • {new Date(resume.createdAt).toLocaleDateString()}
                    </p>
                    {resume.verifyComment && (
                      <p className="text-xs text-warning-700 mt-1">{resume.verifyComment}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={resume.isVerified ? 'verified' : 'unverified'} />
                    <Button
                      variant="outline"
                      size="sm"
                      isLoading={deletingId === resume.id}
                      onClick={() => handleDelete(resume.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
