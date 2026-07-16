'use client';

import React, { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import axios from 'axios';
import { ErrorAlert } from '@/components/common/Alerts';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  rollNumber: string;
  phone: string;
  department: string;
  batch: number;
  cgpa: number;
  isProfileVerified: boolean;
  user: { email: string };
  university: { name: string; code: string } | null;
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters state
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [minCgpa, setMinCgpa] = useState('');
  const [batch, setBatch] = useState('');
  const [isVerified, setIsVerified] = useState('');

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError('');
      const params: Record<string, unknown> = {};
      if (search) params.search = search;
      if (department) params.department = department;
      if (minCgpa) params.minCgpa = minCgpa;
      if (batch) params.batch = batch;
      if (isVerified) params.isVerified = isVerified;

      const res = await adminAPI.globalSearchStudents(params);
      setStudents(res.data.data || []);
    } catch (err) {
      setError('Failed to fetch student logs. Make sure you are logged in as admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [department, isVerified]); // Auto-search on select changes

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top messaging alerts */}
      {error && <ErrorAlert message={error} />}

      {/* Filter Toolbar */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="font-extrabold text-md text-white mb-2">Search Filters</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Text Search input */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-400 mb-1">Student Name or Roll Number</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="e.g. John Doe, 2026-CSE-42"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Branch / Dept</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
            >
              <option value="">All Branches</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="ME">Mechanical</option>
              <option value="CE">Civil</option>
              <option value="EE">Electrical</option>
            </select>
          </div>

          {/* Min CGPA */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Min CGPA</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={minCgpa}
              onChange={(e) => setMinCgpa(e.target.value)}
              placeholder="e.g. 8.0"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Batch Year */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Graduation Batch</label>
            <input
              type="number"
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              placeholder="e.g. 2026"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          {/* Verification toggle filter */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Verified Only:</span>
            <select
              value={isVerified}
              onChange={(e) => setIsVerified(e.target.value)}
              className="bg-transparent text-xs text-slate-300 font-bold focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-slate-900">All</option>
              <option value="true" className="bg-slate-900">Verified</option>
              <option value="false" className="bg-slate-900">Unverified</option>
            </select>
          </div>

          <button
            onClick={handleSearch}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-md transition"
          >
            Apply Search Filters
          </button>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-800">
          <h3 className="font-extrabold text-lg text-white">Global Student Directory</h3>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Searching records...</div>
        ) : students.length === 0 ? (
          <div className="text-center py-12 text-slate-500 italic">No matching student profiles found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-left text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-950/60">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Institution</th>
                  <th className="px-6 py-4">Roll Number</th>
                  <th className="px-6 py-4">Branch/Batch</th>
                  <th className="px-6 py-4">CGPA</th>
                  <th className="px-6 py-4 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-900/40 transition text-sm">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-bold text-slate-200">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-xs text-slate-400">{student.user?.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {student.university ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-300 font-medium">{student.university.name}</span>
                          <span className="text-[10px] bg-slate-850 px-1.5 py-0.5 rounded text-slate-400 font-mono">
                            {student.university.code}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono">{student.rollNumber}</td>
                    <td className="px-6 py-4">
                      {student.department} / {student.batch}
                    </td>
                    <td className="px-6 py-4 font-bold">{student.cgpa}</td>
                    <td className="px-6 py-4 text-right">
                      {student.isProfileVerified ? (
                        <span className="text-xs font-bold px-2.5 py-1 bg-green-500/10 text-green-400 rounded-full border border-green-500/20">
                          ✓ Verified
                        </span>
                      ) : (
                        <span className="text-xs font-bold px-2.5 py-1 bg-red-500/10 text-red-400 rounded-full border border-red-500/20">
                          ✕ Unverified
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
