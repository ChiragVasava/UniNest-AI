'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Navbar } from '@/components/layout/Navbar';
import { ResumeUploader } from '@/components/ui/ResumeUploader';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { resumeAPI } from '@/lib/api';
import { ErrorAlert, SuccessAlert, LoadingSpinner } from '@/components/common/Alerts';

interface ResumeItem {
  id: string;
  fileName: string;
  fileSize: number;
  isVerified: boolean;
  verifyComment?: string;
  createdAt: string;
}

interface FeedbackResult {
  summary: string;
  formattingTips: string[];
  skillEnhancements: string[];
  projectSuggestions: string[];
  layoutAdvice: string[];
}

export default function StudentResumesPage() {
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // AI Feedback Modal state
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [feedbackResumeName, setFeedbackResumeName] = useState('');

  // Resume Builder state
  const [showBuilder, setShowBuilder] = useState(false);
  const [builderName, setBuilderName] = useState('');
  const [builderEmail, setBuilderEmail] = useState('');
  const [builderPhone, setBuilderPhone] = useState('');
  const [builderDegree, setBuilderDegree] = useState('');
  const [builderCgpa, setBuilderCgpa] = useState('');
  const [builderSkills, setBuilderSkills] = useState('');
  const [builderProjectTitle, setBuilderProjectTitle] = useState('');
  const [builderProjectDesc, setBuilderProjectDesc] = useState('');

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
    fetchResumes();
  }, []);

  const handleUpload = async (file: File) => {
    setError('');
    setSuccess('');
    try {
      const formData = new FormData();
      formData.append('resume', file);
      await resumeAPI.upload(formData);
      setSuccess('Resume uploaded successfully.');
      await fetchResumes();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload resume.');
    }
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

  const handleFetchFeedback = async (id: string, fileName: string) => {
    setError('');
    setFeedback(null);
    setFeedbackResumeName(fileName);
    setLoadingFeedback(true);

    try {
      const res = await resumeAPI.getFeedback(id);
      setFeedback(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'AI review requires resume extracted text. Please re-upload your PDF.');
    } finally {
      setLoadingFeedback(false);
    }
  };

  const handlePrintResume = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
      <Navbar />

      {/* Printable Area - Hide layout when printing */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-resume, .printable-resume * {
            visibility: visible;
          }
          .printable-resume {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Toggle headers */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Placement Resumes</h1>
          <button
            onClick={() => setShowBuilder(!showBuilder)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md text-sm transition"
          >
            {showBuilder ? '📂 Manage Resumes' : '✍️ Build Custom Resume'}
          </button>
        </div>

        {error && <ErrorAlert message={error} />}
        {success && <SuccessAlert message={success} />}

        {!showBuilder ? (
          /* Resume Uploader & List view */
          <div className="space-y-6">
            <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6">
              <ResumeUploader onUpload={handleUpload} maxSizeMB={5} />
            </div>

            <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Uploaded Placement Resumes</h3>
              
              {loading && <p className="text-sm text-slate-500">Syncing files...</p>}
              {!loading && resumes.length === 0 && (
                <p className="text-sm text-slate-400 italic">No resumes uploaded yet.</p>
              )}

              <div className="space-y-3">
                {resumes.map((resume) => (
                  <div key={resume.id} className="border border-slate-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-xs transition">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{resume.fileName}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {(resume.fileSize / 1024).toFixed(1)} KB • {new Date(resume.createdAt).toLocaleDateString()}
                      </p>
                      {resume.verifyComment && (
                        <p className="text-xs text-amber-600 font-semibold mt-1">⚠️ comment: {resume.verifyComment}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={resume.isVerified ? 'verified' : 'unverified'} />
                      
                      <button
                        onClick={() => handleFetchFeedback(resume.id, resume.fileName)}
                        className="text-xs font-bold px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition"
                      >
                        🤖 AI Review
                      </button>

                      <Button
                        variant="outline"
                        size="sm"
                        isLoading={deletingId === resume.id}
                        onClick={() => handleDelete(resume.id)}
                        className="border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Resume Builder Form + Live Compilation Preview */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Input Form */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-extrabold text-lg text-slate-900">Custom Resume Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={builderName}
                    onChange={(e) => setBuilderName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={builderEmail}
                      onChange={(e) => setBuilderEmail(e.target.value)}
                      placeholder="john@email.com"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      value={builderPhone}
                      onChange={(e) => setBuilderPhone(e.target.value)}
                      placeholder="+91..."
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Degree / College</label>
                    <input
                      type="text"
                      value={builderDegree}
                      onChange={(e) => setBuilderDegree(e.target.value)}
                      placeholder="B.E. CSE / FTE-MSU"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">CGPA / Score</label>
                    <input
                      type="text"
                      value={builderCgpa}
                      onChange={(e) => setBuilderCgpa(e.target.value)}
                      placeholder="e.g. 8.9 CGPA"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Skills (Comma-separated)</label>
                  <input
                    type="text"
                    value={builderSkills}
                    onChange={(e) => setBuilderSkills(e.target.value)}
                    placeholder="Java, Python, Next.js, PostgreSQL"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <h4 className="font-bold text-xs text-slate-600 mb-2">Academic Project Details</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Project Title</label>
                      <input
                        type="text"
                        value={builderProjectTitle}
                        onChange={(e) => setBuilderProjectTitle(e.target.value)}
                        placeholder="e.g. AI Placement Portal"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Project description</label>
                      <textarea
                        value={builderProjectDesc}
                        onChange={(e) => setBuilderProjectDesc(e.target.value)}
                        placeholder="Explain technologies used, metrics achieved, and architecture implemented."
                        rows={3}
                        className="w-full border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePrintResume}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md transition text-sm mt-4"
                >
                  📥 Export/Print Premium Resume PDF
                </button>
              </div>
            </div>

            {/* Live Compile Preview */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Live Resume compilation</span>
              <div className="printable-resume w-full border border-slate-100 p-8 rounded-lg shadow-sm bg-white text-slate-900 font-serif leading-relaxed text-xs aspect-[1/1.4]">
                <div className="text-center border-b pb-3 mb-4">
                  <h2 className="text-xl font-bold uppercase tracking-tight">{builderName || 'Your Name'}</h2>
                  <p className="text-[10px] text-slate-600 mt-1">
                    {builderEmail || 'email@college.edu'} | {builderPhone || '+91-XXXXXXXXXX'}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold border-b border-slate-200 uppercase tracking-wide text-[10px] text-slate-700 mb-1.5">Education</h3>
                    <div className="flex justify-between font-sans">
                      <span className="font-semibold">{builderDegree || 'Degree & Institution Name'}</span>
                      <span className="font-bold text-indigo-600">{builderCgpa || '9.0 CGPA'}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold border-b border-slate-200 uppercase tracking-wide text-[10px] text-slate-700 mb-1.5">Technical Skills</h3>
                    <p className="text-slate-700 font-sans">
                      {builderSkills.split(',').map(s => s.trim()).filter(Boolean).join(' • ') || 'Your skills list will appear here.'}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold border-b border-slate-200 uppercase tracking-wide text-[10px] text-slate-700 mb-1.5">Projects</h3>
                    <div className="space-y-2">
                      <div>
                        <h4 className="font-bold font-sans">{builderProjectTitle || 'Project Title'}</h4>
                        <p className="text-slate-600 text-[10px] mt-0.5 whitespace-pre-line">
                          {builderProjectDesc || 'Project bullet descriptions detailing methodologies, API integrations, database designs, or metrics.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* AI Resume Feedback Modal Dialog */}
      {loadingFeedback && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full text-slate-800 text-center">
            <LoadingSpinner />
            <h3 className="font-extrabold text-lg mt-3 text-slate-900">Reviewing Resume...</h3>
            <p className="text-sm text-slate-500 mt-1">Gemini AI is analyzing layout, formatting, and key project statements.</p>
          </div>
        </div>
      )}

      {feedback && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-xl w-full text-slate-850 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <div>
                <h3 className="font-black text-xl text-slate-900">🤖 AI Placement Review</h3>
                <p className="text-xs text-slate-500">{feedbackResumeName}</p>
              </div>
              <button
                onClick={() => setFeedback(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5 text-sm">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">Overview Summary</span>
                <p className="text-slate-700 mt-1">{feedback.summary}</p>
              </div>

              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-2">📋 Formatting Tips</span>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  {feedback.formattingTips.map((tip, idx) => <li key={idx}>{tip}</li>)}
                </ul>
              </div>

              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-2">⚡ Skill Enhancements</span>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  {feedback.skillEnhancements.map((tip, idx) => <li key={idx}>{tip}</li>)}
                </ul>
              </div>

              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-2">🚀 Project Wording Suggestions</span>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  {feedback.projectSuggestions.map((tip, idx) => <li key={idx}>{tip}</li>)}
                </ul>
              </div>

              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-2">🎨 Margins & Layout Advice</span>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  {feedback.layoutAdvice.map((tip, idx) => <li key={idx}>{tip}</li>)}
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t mt-5">
              <button
                onClick={() => setFeedback(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition"
              >
                Close Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
