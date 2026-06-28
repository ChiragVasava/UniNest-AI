'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { applicationAPI, driveAPI, offerAPI } from '@/lib/api';
import { ErrorAlert, SuccessAlert } from '@/components/common/Alerts';

interface Drive {
  id: string;
  title: string;
}

interface Application {
  id: string;
  status: 'APPLIED' | 'SHORTLISTED' | 'REJECTED' | 'ACCEPTED_OFFER';
  student: {
    id: string;
    name: string;
    rollNumber: string;
    cgpa?: number;
  };
}

interface DriveOffer {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED' | 'EXPIRED';
  salary: number;
  joinDate?: string;
  expiresAt?: string;
  counterOfferText?: string;
  offerDetails?: Record<string, unknown>;
  student: {
    id: string;
    name: string;
    rollNumber: string;
  };
}

export default function CompanyOffersPage() {
  const [drives, setDrives] = useState<Drive[]>([]);
  const [selectedDriveId, setSelectedDriveId] = useState('');
  const [applications, setApplications] = useState<Application[]>([]);
  const [offers, setOffers] = useState<DriveOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingToStudentId, setSendingToStudentId] = useState<string | null>(null);
  const [respondingOfferId, setRespondingOfferId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // drives are loaded in the initial effect below

  const loadDriveData = async (driveId: string) => {
    if (!driveId) return;

    try {
      setLoading(true);
      const [applicationRes, offerRes] = await Promise.all([
        applicationAPI.getForDrive(driveId),
        offerAPI.getForDrive(driveId),
      ]);

      setApplications(applicationRes.data?.data?.applications || []);
      setOffers(offerRes.data?.data?.offers || []);
    } catch {
      setError('Failed to load applications/offers for selected drive.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const loadInitialDrives = async () => {
      try {
        const res = await driveAPI.getMyDrives();
        const myDrives = res.data?.data?.drives || [];

        if (!active) return;

        setDrives(myDrives);
        if (myDrives.length > 0) {
          setSelectedDriveId(myDrives[0].id);
        } else {
          setLoading(false);
        }
      } catch {
        if (active) {
          setError('Failed to load your drives.');
          setLoading(false);
        }
      }
    };

    void loadInitialDrives();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedDriveId) return;

    let active = true;

    const loadSelectedDriveData = async () => {
      try {
        setLoading(true);
        const [applicationRes, offerRes] = await Promise.all([
          applicationAPI.getForDrive(selectedDriveId),
          offerAPI.getForDrive(selectedDriveId),
        ]);

        if (!active) return;

        setApplications(applicationRes.data?.data?.applications || []);
        setOffers(offerRes.data?.data?.offers || []);
      } catch {
        if (active) {
          setError('Failed to load applications/offers for selected drive.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadSelectedDriveData();

    return () => {
      active = false;
    };
  }, [selectedDriveId]);

  const sendOffer = async (application: Application) => {
    const salaryInput = window.prompt('Enter offered salary (CTC):');
    if (!salaryInput) return;

    const salary = Number(salaryInput);
    if (Number.isNaN(salary) || salary <= 0) {
      setError('Please enter a valid salary amount.');
      return;
    }

    const joinDate = window.prompt('Enter join date (YYYY-MM-DD), optional:') || undefined;
    const expiresAt = window.prompt('Enter offer expiry date (YYYY-MM-DD), optional:') || undefined;
    const role = window.prompt('Enter role / position for this offer, optional:') || selectedDriveId;
    const department = window.prompt('Enter department / team, optional:') || undefined;
    const location = window.prompt('Enter work location / office, optional:') || undefined;
    const description = window.prompt('Enter offer / project description, optional:') || undefined;
    const project = window.prompt('Enter project name, optional:') || undefined;

    try {
      setError('');
      setSuccess('');
      setSendingToStudentId(application.student.id);
      await offerAPI.create({
        studentId: application.student.id,
        driveId: selectedDriveId,
        salary,
        joinDate,
        expiresAt,
        offerDetails: {
          role,
          position: role,
          department,
          location,
          description,
          project,
          companyName: drives.find((drive) => drive.id === selectedDriveId)?.title,
        },
      });
      setSuccess('Offer sent successfully.');
      await loadDriveData(selectedDriveId);
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : err instanceof Error
        ? err.message
        : String(err);
      setError(msg || 'Failed to send offer.');
    } finally {
      setSendingToStudentId(null);
    }
  };

  const respondToCounter = async (offerId: string, decision: 'ACCEPT' | 'REJECT') => {
    try {
      setRespondingOfferId(offerId);
      setError('');
      const note = window.prompt('Optional note for this response:') || undefined;
      await offerAPI.respondToCounter(offerId, decision, note);
      setSuccess(decision === 'ACCEPT' ? 'Counter accepted and offer reopened.' : 'Counter rejected.');
      await loadDriveData(selectedDriveId);
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : err instanceof Error
        ? err.message
        : String(err);
      setError(msg || 'Failed to respond to counter offer.');
    } finally {
      setRespondingOfferId(null);
    }
  };

  const offerByStudentId = new Map(offers.map((offer) => [offer.student.id, offer]));

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Offer Management</h1>
        {error && <ErrorAlert message={error} />}
        {success && <SuccessAlert message={success} />}

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">Select Drive</label>
          <select
            value={selectedDriveId}
            onChange={(e) => setSelectedDriveId(e.target.value)}
            className="w-full max-w-md px-3 py-2 border rounded-lg"
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
          {loading && <div className="text-slate-600">Loading candidates...</div>}
          {!loading && applications.length === 0 && (
            <div className="text-slate-600">No applications for this drive yet.</div>
          )}

          {applications.map((application) => {
            const existingOffer = offerByStudentId.get(application.student.id);

            return (
            <Card key={application.id}>
              <CardContent className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-slate-900">{application.student.name}</h3>
                  <p className="text-sm text-slate-600">
                    {application.student.rollNumber}
                    {application.student.cgpa ? ` • CGPA ${application.student.cgpa}` : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <StatusBadge status={application.status} />
                  {existingOffer ? (
                    <div className="flex flex-col items-end gap-1 text-right">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={existingOffer.status} />
                        <span className="text-sm text-slate-600">₹{existingOffer.salary.toLocaleString()}</span>
                      </div>
                      {existingOffer.expiresAt && (
                        <p className="text-xs text-slate-500">
                          Expires: {new Date(existingOffer.expiresAt).toLocaleDateString()}
                        </p>
                      )}
                      {existingOffer.offerDetails && (
                        <p className="text-xs text-slate-500 max-w-xs">
                          {(existingOffer.offerDetails.role as string) || (existingOffer.offerDetails.position as string) || 'Role'}
                          {existingOffer.offerDetails.location ? ` • ${existingOffer.offerDetails.location as string}` : ''}
                        </p>
                      )}
                      {existingOffer.counterOfferText && (
                        <p className="text-xs text-amber-700 max-w-xs">Counter: {existingOffer.counterOfferText}</p>
                      )}
                      {existingOffer.status === 'COUNTERED' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="success"
                            isLoading={respondingOfferId === existingOffer.id}
                            onClick={() => respondToCounter(existingOffer.id, 'ACCEPT')}
                          >
                            Accept Counter
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            isLoading={respondingOfferId === existingOffer.id}
                            onClick={() => respondToCounter(existingOffer.id, 'REJECT')}
                          >
                            Reject Counter
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Button
                      onClick={() => sendOffer(application)}
                      isLoading={sendingToStudentId === application.student.id}
                      disabled={application.status !== 'SHORTLISTED'}
                      className="bg-black text-white hover:bg-gray-800"
                    >
                      Send Offer
                    </Button>
                  )}
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
