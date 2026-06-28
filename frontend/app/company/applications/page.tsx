'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { ErrorAlert, SuccessAlert } from '@/components/common/Alerts';
import { applicationAPI, driveAPI } from '@/lib/api';

interface DriveItem {
  id: string;
  title: string;
}

interface ApplicationItem {
  id: string;
  status:
    | 'APPLIED'
    | 'SHORTLISTED'
    | 'INTERVIEW_SCHEDULED'
    | 'INTERVIEWED'
    | 'OFFER_SENT'
    | 'HIRED'
    | 'REJECTED'
    | 'ACCEPTED_OFFER';
  student: {
    id: string;
    firstName?: string;
    lastName?: string;
    rollNumber: string;
    department?: string;
    batch?: number;
    cgpa?: number;
  };
  resume?: {
    id: string;
    fileName: string;
    fileSize: number;
    isVerified: boolean;
    verifyComment?: string | null;
    extractedText?: string | null;
    filePath?: string;
    preview?: string | null;
  } | null;
  ats?: {
    score: number;
    verdict: 'strong_match' | 'match' | 'maybe' | 'no_match';
    summary: string;
    strengths: string[];
    gaps: string[];
    matchedKeywords: string[];
    missingKeywords?: string[];
    scoreBreakdown?: {
      skillMatch: number;
      experienceRelevance: number;
      educationFit: number;
    };
    confidence?: 'high' | 'medium' | 'low';
    whyRejected?: string[];
    recommendation: string;
    source: 'gemini' | 'fallback';
  };
  timeline?: Array<{
    id: string;
    stage: string;
    note?: string;
    createdAt: string;
  }>;
  interviews?: Array<{
    id: string;
    scheduledAt: string;
    mode: 'ONLINE' | 'OFFLINE' | 'HYBRID';
    meetingLink?: string;
    notes?: string;
    confirmationStatus: 'PENDING' | 'CONFIRMED' | 'RESCHEDULE_REQUESTED';
  }>;
}

export default function CompanyApplicationsPage() {
  const [drives, setDrives] = useState<DriveItem[]>([]);
  const [selectedDriveId, setSelectedDriveId] = useState('');
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const selectedDrive = useMemo(
    () => drives.find((drive) => drive.id === selectedDriveId),
    [drives, selectedDriveId]
  );

  const loadApplications = async (driveId: string) => {
    if (!driveId) return;
    const response = await applicationAPI.getForDriveWithAts(driveId);
    setApplications(response.data?.data?.applications || []);
  };

  useEffect(() => {
    let active = true;

    const boot = async () => {
      try {
        setLoading(true);
        const response = await driveAPI.getMyDrives();
        if (!active) return;

        const drivesData = response.data?.data?.drives || [];
        setDrives(drivesData);
        if (drivesData.length > 0) {
          const firstDriveId = drivesData[0].id;
          setSelectedDriveId(firstDriveId);
          const applicationResponse = await applicationAPI.getForDriveWithAts(firstDriveId);
          if (active) {
            setApplications(applicationResponse.data?.data?.applications || []);
          }
        }
      } catch {
        if (active) setError('Failed to load drives or applications.');
      } finally {
        if (active) setLoading(false);
      }
    };

    void boot();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const bootSelected = async () => {
      if (!selectedDriveId) return;
      try {
        setLoading(true);
        const response = await applicationAPI.getForDriveWithAts(selectedDriveId);
        if (active) setApplications(response.data?.data?.applications || []);
      } catch {
        if (active) setError('Failed to load applications for selected drive.');
      } finally {
        if (active) setLoading(false);
      }
    };

    void bootSelected();

    return () => {
      active = false;
    };
  }, [selectedDriveId]);

  const updateApplication = async (
    id: string,
    status: 'SHORTLISTED' | 'REJECTED'
  ) => {
    try {
      setActionId(id);
      setError('');
      setSuccess('');
      await applicationAPI.updateStatus(id, status);
      setSuccess(
        status === 'SHORTLISTED'
          ? 'Application shortlisted.'
          : 'Application rejected.'
      );
      if (selectedDriveId) {
        await loadApplications(selectedDriveId);
      }
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : err instanceof Error
        ? err.message
        : String(err);
      setError(message || 'Failed to update application status.');
    } finally {
      setActionId(null);
    }
  };

  const shortlistByAts = async (application: ApplicationItem) => {
    if ((application.ats?.score || 0) < 70) {
      setError('ATS score is below the shortlist threshold of 70.');
      return;
    }

    await updateApplication(application.id, 'SHORTLISTED');
  };

  const scheduleInterview = async (application: ApplicationItem) => {
    const rawDate = window.prompt('Interview date and time (YYYY-MM-DDTHH:mm)');
    if (!rawDate) return;
    const mode = (window.prompt('Mode: ONLINE, OFFLINE, HYBRID', 'ONLINE') || 'ONLINE').toUpperCase();
    const meetingLink = window.prompt('Meeting link (optional)') || undefined;
    const notes = window.prompt('Interview note (optional)') || undefined;

    try {
      setActionId(application.id);
      setError('');
      setSuccess('');
      await applicationAPI.createInterviewSlot(application.id, {
        scheduledAt: new Date(rawDate).toISOString(),
        mode: mode as 'ONLINE' | 'OFFLINE' | 'HYBRID',
        meetingLink,
        notes,
      });
      await applicationAPI.moveStage(application.id, 'INTERVIEW_SCHEDULED', 'Interview scheduled by company');
      setSuccess('Interview scheduled successfully.');
      if (selectedDriveId) {
        await loadApplications(selectedDriveId);
      }
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : err instanceof Error
        ? err.message
        : String(err);
      setError(message || 'Failed to schedule interview.');
    } finally {
      setActionId(null);
    }
  };

  const getResumeUrl = (filePath?: string) => {
    if (!filePath) return '';
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    return `${apiBase.replace(/\/api\/v1$/, '')}${filePath}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Company Applications</h1>
          <p className="text-slate-600 mt-1">Review and shortlist applicants for your drives.</p>
        </div>

        {error && <ErrorAlert message={error} />}
        {success && <SuccessAlert message={success} />}

        <div className="flex flex-col gap-2 max-w-md">
          <label className="text-sm font-medium text-slate-700">Select Drive</label>
          <select
            value={selectedDriveId}
            onChange={(e) => setSelectedDriveId(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            {drives.length === 0 && <option value="">No drives available</option>}
            {drives.map((drive) => (
              <option key={drive.id} value={drive.id}>
                {drive.title}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          {loading && <div className="text-slate-600">Loading applications...</div>}
          {!loading && selectedDrive && applications.length === 0 && (
            <div className="text-slate-600">No applications for this drive yet.</div>
          )}

          {applications.map((application) => {
            const studentName = [application.student.firstName, application.student.lastName]
              .filter(Boolean)
              .join(' ');
            const atsScore = application.ats?.score ?? 0;
            const atsTone =
              atsScore >= 85 ? 'text-emerald-700' : atsScore >= 70 ? 'text-amber-700' : 'text-rose-700';

            return (
              <Card key={application.id}>
                <CardContent className="space-y-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {studentName || application.student.rollNumber}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {application.student.rollNumber}
                        {application.student.department ? ` • ${application.student.department}` : ''}
                        {application.student.batch ? ` • Batch ${application.student.batch}` : ''}
                        {application.student.cgpa ? ` • CGPA ${application.student.cgpa}` : ''}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-2">
                        <StatusBadge status={application.status} />
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold bg-slate-100 ${atsTone}`}>
                          ATS {atsScore}/100
                        </span>
                        <span className="text-xs uppercase tracking-wide text-slate-500">
                          {application.ats?.source === 'gemini' ? 'Gemini powered' : 'Fallback scoring'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        variant="success"
                        disabled={application.status !== 'APPLIED'}
                        isLoading={actionId === application.id}
                        onClick={() => updateApplication(application.id, 'SHORTLISTED')}
                        className="bg-black text-white hover:bg-gray-800"
                      >
                        Shortlist
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={application.status === 'REJECTED'}
                        isLoading={actionId === application.id}
                        onClick={() => updateApplication(application.id, 'REJECTED')}
                        className="bg-black text-white hover:bg-gray-800"
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={application.status !== 'APPLIED' || atsScore < 70}
                        isLoading={actionId === application.id}
                        onClick={() => shortlistByAts(application)}
                        className="bg-black text-white hover:bg-gray-800"
                      >
                        ATS Shortlist
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={application.status === 'REJECTED' || application.status === 'HIRED'}
                        isLoading={actionId === application.id}
                        onClick={() => scheduleInterview(application)}
                        className="bg-black text-white hover:bg-gray-800"
                      >
                        Schedule Interview
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm uppercase tracking-wide text-slate-500">Resume Preview</p>
                          <h4 className="font-semibold text-slate-900">
                            {application.resume?.fileName || 'No resume uploaded yet'}
                          </h4>
                        </div>
                        <span className={`text-xs font-semibold ${application.resume?.isVerified ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {application.resume?.isVerified ? 'Verified' : 'Pending verification'}
                        </span>
                      </div>
                      {application.resume?.filePath && (
                        <a
                          href={getResumeUrl(application.resume.filePath)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex text-sm font-medium text-primary-700 underline underline-offset-4"
                        >
                          Open resume PDF
                        </a>
                      )}
                      <p className="text-sm text-slate-700 leading-6 line-clamp-4">
                        {application.resume?.preview || application.resume?.extractedText
                          ? (application.resume?.preview || application.resume?.extractedText || '').slice(0, 480)
                          : 'No extracted resume text available. Open the PDF to inspect the application.'}
                      </p>
                      {application.resume?.verifyComment && (
                        <p className="text-xs text-warning-700">{application.resume.verifyComment}</p>
                      )}
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                      <div>
                        <p className="text-sm uppercase tracking-wide text-slate-500">ATS Decision</p>
                        <h4 className="text-xl font-semibold text-slate-900">{application.ats?.verdict || 'no_match'}</h4>
                        <p className="text-sm text-slate-600 mt-1">{application.ats?.summary}</p>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="text-slate-500">Strengths</p>
                          <p className="text-slate-900">
                            {application.ats?.strengths.length ? application.ats.strengths.join(', ') : 'None detected'}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Gaps</p>
                          <p className="text-slate-900">
                            {application.ats?.gaps.length ? application.ats.gaps.join(', ') : 'No major gaps flagged'}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Recommendation</p>
                          <p className="text-slate-900">{application.ats?.recommendation}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Confidence</p>
                          <p className="text-slate-900 uppercase">{application.ats?.confidence || 'n/a'}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Score Breakdown</p>
                          <p className="text-slate-900">
                            Skill {application.ats?.scoreBreakdown?.skillMatch ?? 0} • Experience {application.ats?.scoreBreakdown?.experienceRelevance ?? 0} • Education {application.ats?.scoreBreakdown?.educationFit ?? 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Why Rejected</p>
                          <p className="text-slate-900">
                            {application.ats?.whyRejected?.length
                              ? application.ats.whyRejected.join(', ')
                              : 'No hard rejection reason generated'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
                      <p className="text-sm uppercase tracking-wide text-slate-500">Interview Slots</p>
                      {application.interviews?.length ? (
                        application.interviews.map((interview) => (
                          <div key={interview.id} className="rounded-lg border border-slate-100 p-2 text-sm text-slate-700">
                            <p>{new Date(interview.scheduledAt).toLocaleString()} • {interview.mode}</p>
                            <p className="text-xs text-slate-500">{interview.confirmationStatus}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500">No interview slots yet.</p>
                      )}
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
                      <p className="text-sm uppercase tracking-wide text-slate-500">Status Timeline</p>
                      {application.timeline?.length ? (
                        application.timeline.map((event) => (
                          <div key={event.id} className="rounded-lg border border-slate-100 p-2 text-sm text-slate-700">
                            <p className="font-medium">{event.stage}</p>
                            <p className="text-xs text-slate-500">{new Date(event.createdAt).toLocaleString()}</p>
                            {event.note && <p className="text-xs text-slate-600">{event.note}</p>}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500">Timeline will appear after stage events.</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}