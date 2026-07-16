'use client';

import React, { useEffect, useState } from 'react';
import { universityAPI } from '@/lib/api';
import axios from 'axios';
import { ErrorAlert, SuccessAlert } from '@/components/common/Alerts';

interface DriveRequest {
  id: string;
  title: string;
  description: string;
  salary: number;
  cgpaCutoff: number;
  eligibleDepartments: string[];
  eligibleBatches: number[];
  interviewFormat: string;
  company: {
    companyName: string;
    website: string;
  };
}

export default function UniversityCompaniesPage() {
  // Invite state
  const [inviteEmail, setInviteEmail] = useState('');
  const [companyName, setCompanyName] = useState('');

  // Drives requests state
  const [driveRequests, setDriveRequests] = useState<DriveRequest[]>([]);

  // Alerts state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchDriveRequests = async () => {
    try {
      const res = await universityAPI.getDriveRequests();
      setDriveRequests(res.data.data || []);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchDriveRequests();
  }, []);

  const handleInviteCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await universityAPI.inviteCompany(inviteEmail, companyName);
      setSuccess(`Invitation email successfully sent to ${companyName}!`);
      setInviteEmail('');
      setCompanyName('');
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.message : '';
      setError(msg || 'Failed to send company invitation.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDrive = async (id: string) => {
    setError('');
    setSuccess('');
    try {
      await universityAPI.approveDrive(id);
      setSuccess('Placement drive request approved and made active!');
      fetchDriveRequests();
    } catch (err) {
      setError('Failed to approve drive request.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-slate-100">
      
      {/* Notifications */}
      <div className="lg:col-span-3">
        {error && <ErrorAlert message={error} />}
        {success && <SuccessAlert message={success} />}
      </div>

      {/* Invite Company panel */}
      <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 space-y-6">
        <div>
          <h3 className="font-extrabold text-xl text-white">Invite Recruiter</h3>
          <p className="text-xs text-slate-400 mt-1">
            Send an email invitation containing a unique registration token to a target company partner
          </p>
        </div>

        <form onSubmit={handleInviteCompany} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Google India"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">HR Email Address</label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="hr@company.com"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition"
          >
            {loading ? 'Sending Invitation...' : 'Send Invite Token'}
          </button>
        </form>
      </div>

      {/* Recruiter Placement Drive Requests */}
      <div className="lg:col-span-2 bg-slate-950 p-8 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-extrabold text-xl text-white">Placement Drive Requests</h3>
            <p className="text-xs text-slate-400 mt-1">Review and approve company-requested recruitment drives</p>
          </div>
          <button
            onClick={fetchDriveRequests}
            className="text-xs font-semibold px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition"
          >
            🔄 Sync
          </button>
        </div>

        {driveRequests.length === 0 ? (
          <div className="p-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
            No pending company drive requests.
          </div>
        ) : (
          <div className="space-y-4">
            {driveRequests.map((drive) => (
              <div
                key={drive.id}
                className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-white">{drive.title}</span>
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20 font-bold uppercase">
                      {drive.company.companyName}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 max-w-lg line-clamp-2">
                    {drive.description || 'No drive summary provided.'}
                  </p>

                  {/* Criteria tags */}
                  <div className="flex flex-wrap gap-2 pt-1 text-[10px] font-mono">
                    <span className="bg-slate-850 text-slate-300 px-2 py-1 rounded">
                      💰 INR {drive.salary ? drive.salary.toLocaleString() : 'N/A'} LPA
                    </span>
                    <span className="bg-slate-850 text-slate-300 px-2 py-1 rounded">
                      🎓 CGPA ≥ {drive.cgpaCutoff}
                    </span>
                    <span className="bg-slate-850 text-slate-300 px-2 py-1 rounded">
                      ⚡ Depts: {drive.eligibleDepartments.join(', ')}
                    </span>
                    <span className="bg-slate-850 text-slate-300 px-2 py-1 rounded">
                      📅 Batches: {drive.eligibleBatches.join(', ')}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => handleApproveDrive(drive.id)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl shadow-md transition"
                  >
                    Approve Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
