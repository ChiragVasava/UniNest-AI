'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { driveAPI, applicationAPI } from '@/lib/api';
import { ErrorAlert, SuccessAlert } from '@/components/common/Alerts';

interface Drive {
  id: string;
  title: string;
  company: {
    companyName: string;
    sector?: string;
  };
  description?: string;
  salary?: number;
  cgpaCutoff?: number;
  interviewFormat?: string;
}

export default function StudentDrivesPage() {
  const [drives, setDrives] = useState<Drive[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [applyingDriveId, setApplyingDriveId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDrives = async () => {
      setLoading(true);
      try {
        // Request a very large limit so the backend returns all drives
        // (backend may still cap results server-side).
        const res = await driveAPI.getAll(1000000);
        setDrives(res.data?.data?.drives || []);
      } catch {
        setError('Failed to load drives. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchDrives();
  }, []);

  const filtered = drives.filter((d) => {
    return (
      !query ||
      d.title.toLowerCase().includes(query.toLowerCase()) ||
      d.company.companyName.toLowerCase().includes(query.toLowerCase())
    );
  });

  const handleApply = async (driveId: string) => {
    try {
      setError('');
      setSuccess('');
      setApplyingDriveId(driveId);
      await applicationAPI.apply(driveId);
      setSuccess('Applied successfully. You can track it in Applications.');
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : err instanceof Error
        ? err.message
        : String(err);
      setError(msg || 'Could not apply for this drive.');
    } finally {
      setApplyingDriveId(null);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Browse Drives</h1>

        {error && <ErrorAlert message={error} />}
        {success && <SuccessAlert message={success} />}

        <div className="flex gap-3 mb-6">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search role or company" className="flex-1 px-4 py-2 border rounded-lg" />
          <Button variant="outline" onClick={() => setQuery('')}>Clear</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading && <div>Loading drives...</div>}
          {!loading && filtered.length === 0 && <div className="text-slate-600">No drives found.</div>}
          {filtered.map((d) => (
            <Card key={d.id} className="hover:shadow-lg">
              <CardContent>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{d.title}</h3>
                    <p className="text-sm text-slate-600">
                      {d.company.companyName}
                      {d.company.sector ? ` • ${d.company.sector}` : ''}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {d.salary ? `₹${d.salary.toLocaleString()}` : 'Salary not disclosed'}
                      {d.cgpaCutoff !== undefined ? ` • CGPA cutoff: ${d.cgpaCutoff}` : ''}
                      {d.interviewFormat ? ` • ${d.interviewFormat}` : ''}
                    </p>
                    <p className="mt-2 text-sm text-slate-700">{d.description}</p>
                  </div>
                  <div className="flex flex-col gap-2 bg-black text-white hover:bg-gray-800">
                    <Button
                      variant="primary"
                      isLoading={applyingDriveId === d.id}
                      onClick={() => handleApply(d.id)}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
