'use client';

import React, { useEffect, useState } from 'react';
import { universityAPI } from '@/lib/api';
import axios from 'axios';
import { ErrorAlert, SuccessAlert } from '@/components/common/Alerts';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  rollNumber: string;
  phone: string;
  department: string;
  batch: number;
  cgpa: number;
  isProfileLocked: boolean;
  verificationStatus: string;
  user: { email: string };
}

export default function UniversityDashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Rejection modal states
  const [rejectingStudentId, setRejectingStudentId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingReject, setSubmittingReject] = useState(false);

  const fetchPendingStudents = async () => {
    try {
      setLoading(true);
      const res = await universityAPI.getPendingStudents();
      setStudents(res.data.data || []);
    } catch (err) {
      setError('Failed to fetch pending student requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingStudents();
  }, []);

  const handleApprove = async (id: string) => {
    setError('');
    setSuccess('');
    try {
      await universityAPI.verifyStudent(id);
      setSuccess('Student profile verified successfully!');
      fetchPendingStudents();
    } catch (err) {
      setError('Failed to verify student profile.');
    }
  };

  const handleOpenRejectModal = (id: string) => {
    setRejectingStudentId(id);
    setRejectionReason('');
  };

  const handleConfirmReject = async () => {
    if (!rejectingStudentId || !rejectionReason.trim()) return;
    setError('');
    setSuccess('');
    setSubmittingReject(true);

    try {
      await universityAPI.rejectStudent(rejectingStudentId, rejectionReason);
      setSuccess('Verification request rejected and comments logged.');
      setRejectingStudentId(null);
      fetchPendingStudents();
    } catch (err) {
      setError('Failed to log profile rejection.');
    } finally {
      setSubmittingReject(false);
    }
  };

  const handleToggleLock = async (id: string, currentLockState: boolean) => {
    setError('');
    setSuccess('');
    try {
      await universityAPI.toggleLockStudent(id, !currentLockState);
      setSuccess(`Student profile ${!currentLockState ? 'locked' : 'unlocked'} successfully!`);
      fetchPendingStudents();
    } catch (err) {
      setError('Failed to toggle profile lock.');
    }
  };

  return (
    <div className="space-y-8 text-slate-100">
      {/* Page Messages */}
      {error && <ErrorAlert message={error} />}
      {success && <SuccessAlert message={success} />}

      {/* Analytics Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Awaiting Verification</p>
            <h3 className="text-3xl font-black text-white mt-1.5">{students.length}</h3>
          </div>
          <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center font-bold text-xl">
            ⏳
          </div>
        </div>

        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Recruiters Onboard</p>
            <h3 className="text-3xl font-black text-white mt-1.5">Active</h3>
          </div>
          <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center font-bold text-xl">
            🏢
          </div>
        </div>

        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Placement Drives</p>
            <h3 className="text-3xl font-black text-white mt-1.5">Scheduled</h3>
          </div>
          <div className="w-12 h-12 bg-green-500/10 text-green-400 rounded-xl flex items-center justify-center font-bold text-xl">
            🎯
          </div>
        </div>
      </div>

      {/* Pending Students Verification Requests */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-extrabold text-lg text-white">Pending Verification Requests</h3>
          <button 
            onClick={fetchPendingStudents} 
            className="text-xs font-semibold px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition"
          >
            🔄 Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading student requests...</div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No pending student verification requests.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-left text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-950/60">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Roll Number</th>
                  <th className="px-6 py-4">Branch / Batch</th>
                  <th className="px-6 py-4">CGPA</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-900/40 transition">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-bold text-sm text-slate-200">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-xs text-slate-400">{student.user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm">{student.rollNumber}</td>
                    <td className="px-6 py-4 text-sm">
                      {student.department} / {student.batch}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold">{student.cgpa}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20">
                        Pending Verify
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleLock(student.id, student.isProfileLocked)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition ${
                          student.isProfileLocked
                            ? 'bg-slate-800 border-slate-700 text-amber-400'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {student.isProfileLocked ? '🔑 Unlock' : '🔒 Lock'}
                      </button>

                      <button
                        onClick={() => handleOpenRejectModal(student.id)}
                        className="text-xs font-bold px-3 py-1.5 bg-red-950/20 text-red-400 hover:bg-red-900/30 rounded-lg border border-red-900/40 transition"
                      >
                        ✕ Reject
                      </button>

                      <button
                        onClick={() => handleApprove(student.id)}
                        className="text-xs font-bold px-3 py-1.5 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-lg border border-green-500/20 transition"
                      >
                        ✓ Approve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rejection Modal Dialog overlay */}
      {rejectingStudentId && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl max-w-md w-full text-slate-100">
            <h3 className="font-extrabold text-lg mb-2 text-white">Reject Profile Request</h3>
            <p className="text-sm text-slate-400 mb-4">
              Please enter the comments or reasons explaining why this student profile is rejected. This reason will be visible to the student to correct.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Please upload a clear marksheet copy for verification."
              rows={4}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setRejectingStudentId(null)}
                className="px-4 py-2 text-sm font-semibold hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={submittingReject || !rejectionReason.trim()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-md"
              >
                {submittingReject ? 'Submitting...' : 'Reject Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
