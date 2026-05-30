'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { applicationAPI } from '@/lib/api';
import { ErrorAlert, SuccessAlert } from '@/components/common/Alerts';

interface Application {
  id: string;
  status:
    | 'APPLIED'
    | 'SHORTLISTED'
    | 'INTERVIEW_SCHEDULED'
    | 'INTERVIEWED'
    | 'OFFER_SENT'
    | 'HIRED'
    | 'ACCEPTED_OFFER'
    | 'REJECTED';
  drive: {
    id: string;
    title: string;
    company: string;
    salary?: number;
  };
  timeline?: Array<{ id: string; stage: string; note?: string; createdAt: string }>;
  interviews?: Array<{
    id: string;
    scheduledAt: string;
    mode: 'ONLINE' | 'OFFLINE' | 'HYBRID';
    confirmationStatus: 'PENDING' | 'CONFIRMED' | 'RESCHEDULE_REQUESTED';
    meetingLink?: string;
  }>;
}

export default function StudentApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const fetchApps = async () => {
    try {
      setLoading(true);
      const res = await applicationAPI.getMyApplications();
      setApps(res.data?.data?.applications || []);
    } catch {
      setError('Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const loadInitialApps = async () => {
      try {
        const res = await applicationAPI.getMyApplications();
        if (active) {
          setApps(res.data?.data?.applications || []);
        }
      } catch {
        if (active) {
          setError('Failed to load applications.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadInitialApps();

    return () => {
      active = false;
    };
  }, []);

  const confirmInterview = async (interviewId: string) => {
    try {
      setActingId(interviewId);
      setError('');
      await applicationAPI.confirmInterviewSlot(interviewId);
      setSuccess('Interview confirmed.');
      await fetchApps();
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : err instanceof Error
        ? err.message
        : String(err);
      setError(msg || 'Failed to confirm interview.');
    } finally {
      setActingId(null);
    }
  };

  const requestReschedule = async (interviewId: string) => {
    const note = window.prompt('Reason for reschedule request (optional)') || undefined;
    try {
      setActingId(interviewId);
      setError('');
      await applicationAPI.requestInterviewReschedule(interviewId, note);
      setSuccess('Reschedule request sent.');
      await fetchApps();
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : err instanceof Error
        ? err.message
        : String(err);
      setError(msg || 'Failed to request reschedule.');
    } finally {
      setActingId(null);
    }
  };

  const withdrawApplication = async (id: string) => {
    try {
      setError('');
      setSuccess('');
      setWithdrawingId(id);
      await applicationAPI.withdraw(id);
      setSuccess('Application withdrawn successfully.');
      await fetchApps();
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : err instanceof Error
        ? err.message
        : String(err);
      setError(msg || 'Could not withdraw application.');
    } finally {
      setWithdrawingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">My Applications</h1>
        {error && <ErrorAlert message={error} />}
        {success && <SuccessAlert message={success} />}
        <div className="space-y-4">
          {loading && <div className="text-slate-600">Loading applications...</div>}
          {apps.length === 0 && <div className="text-slate-600">No applications yet.</div>}
          {apps.map((a) => (
            <Card key={a.id}>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                  <h3 className="text-lg font-medium text-slate-900">{a.drive.title}</h3>
                  <p className="text-sm text-slate-600">{a.drive.company}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={a.status} />
                    {a.status === 'APPLIED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        isLoading={withdrawingId === a.id}
                        onClick={() => withdrawApplication(a.id)}
                      >
                        Withdraw
                      </Button>
                    )}
                  </div>
                </div>

                {!!a.interviews?.length && (
                  <div className="rounded-lg border border-slate-200 p-3 space-y-2">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Interview Slot</p>
                    {a.interviews.map((i) => (
                      <div key={i.id} className="text-sm text-slate-700 space-y-1">
                        <p>{new Date(i.scheduledAt).toLocaleString()} • {i.mode}</p>
                        <p className="text-xs text-slate-500">{i.confirmationStatus}</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="success" isLoading={actingId === i.id} onClick={() => confirmInterview(i.id)}>
                            Confirm
                          </Button>
                          <Button size="sm" variant="outline" isLoading={actingId === i.id} onClick={() => requestReschedule(i.id)}>
                            Request Reschedule
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!!a.timeline?.length && (
                  <div className="rounded-lg border border-slate-200 p-3 space-y-2">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Timeline</p>
                    {a.timeline.map((event) => (
                      <p key={event.id} className="text-xs text-slate-600">
                        {event.stage} • {new Date(event.createdAt).toLocaleDateString()}
                      </p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
