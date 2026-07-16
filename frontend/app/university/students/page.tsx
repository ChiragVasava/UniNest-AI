'use client';

import React, { useState } from 'react';
import { universityAPI } from '@/lib/api';
import axios from 'axios';
import { ErrorAlert, SuccessAlert } from '@/components/common/Alerts';

export default function UniversityStudentsPage() {
  // Manual onboarding form state
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('CSE');
  const [batch, setBatch] = useState(new Date().getFullYear().toString());
  const [cgpa, setCgpa] = useState('0');

  // Bulk onboarding file state
  const [file, setFile] = useState<File | null>(null);
  const [bulkResult, setBulkResult] = useState<any>(null);

  // Status alerts
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await universityAPI.manualOnboard({
        email,
        firstName,
        lastName,
        rollNumber,
        phone,
        department,
        batch: parseInt(batch),
        cgpa: parseFloat(cgpa),
      });

      setSuccess('Student onboarded successfully! Temporary credentials emailed.');
      // Reset form
      setEmail('');
      setFirstName('');
      setLastName('');
      setRollNumber('');
      setPhone('');
      setCgpa('0');
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : err instanceof Error
        ? err.message
        : String(err);
      setError(msg || 'Failed to onboard student.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setBulkResult(null);
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setError('');
    setSuccess('');
    setLoading(true);
    setBulkResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await universityAPI.bulkOnboard(formData);
      setSuccess('Bulk student onboarding process complete!');
      setBulkResult(res.data.data);
      setFile(null);
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : err instanceof Error
        ? err.message
        : String(err);
      setError(msg || 'Failed to parse CSV file.');
    } finally {
      setLoading(false);
    }
  };

  const downloadSampleCsv = () => {
    const csvContent = 
      "First Name,Last Name,Email,Roll Number,Phone,Department,Batch,CGPA\n" +
      "John,Doe,john.doe@college.edu,MSU-2026-CSE-001,+919999999999,CSE,2026,8.5\n" +
      "Alice,Smith,alice.s@college.edu,MSU-2026-CSE-002,+918888888888,CSE,2026,9.1";
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'uninest_student_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-slate-100">
      {/* Top Banner Message */}
      <div className="lg:col-span-2">
        {error && <ErrorAlert message={error} />}
        {success && <SuccessAlert message={success} />}
      </div>

      {/* Manual Student Onboarding Form */}
      <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 space-y-6">
        <div>
          <h3 className="font-extrabold text-xl text-white">Manual Student Entry</h3>
          <p className="text-xs text-slate-400 mt-1">Add a student individually and trigger login invitation</p>
        </div>

        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student.email@domain.edu"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Roll / PRN Number</label>
              <input
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="e.g. 2026-CSE-42"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +919876543210"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Branch / Dept</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="ME">Mech</option>
                <option value="CE">Civil</option>
                <option value="EE">Electrical</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Batch Year</label>
              <input
                type="number"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Starting CGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition"
          >
            {loading ? 'Processing Onboarding...' : 'Onboard Student'}
          </button>
        </form>
      </div>

      {/* CSV Bulk Student Onboarding Dropzone */}
      <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 flex flex-col justify-between">
        <div className="space-y-6">
          <div>
            <h3 className="font-extrabold text-xl text-white">Bulk CSV Upload</h3>
            <p className="text-xs text-slate-400 mt-1">Import hundreds of student accounts at once using a CSV format</p>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
            <div className="text-xs text-slate-400">
              <span className="font-semibold text-slate-200 block mb-0.5">Required CSV Columns:</span>
              First Name, Last Name, Email, Roll Number, Phone, Department, Batch, CGPA
            </div>
            <button
              onClick={downloadSampleCsv}
              className="text-xs font-bold bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg border border-slate-700 transition"
            >
              📥 Template
            </button>
          </div>

          <form onSubmit={handleBulkSubmit} className="space-y-4">
            <div className="border-2 border-dashed border-slate-800 hover:border-blue-500/40 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-900/20 transition cursor-pointer relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
                required
              />
              <span className="text-3xl mb-2">📁</span>
              <span className="text-sm font-semibold text-slate-300">
                {file ? file.name : 'Choose CSV file to upload'}
              </span>
              <span className="text-xs text-slate-500 mt-1">Max file size: 5MB</span>
            </div>

            <button
              type="submit"
              disabled={loading || !file}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition"
            >
              {loading ? 'Uploading CSV...' : 'Process Bulk Upload'}
            </button>
          </form>
        </div>

        {/* Bulk Onboarding Processing Results Summary */}
        {bulkResult && (
          <div className="mt-6 border-t border-slate-800 pt-6 space-y-3">
            <h4 className="font-bold text-sm text-slate-200">Import Summary Results</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-900 p-3 rounded-xl text-center border border-slate-800/40">
                <span className="text-xs text-slate-400 block">Processed</span>
                <span className="text-lg font-black text-white">{bulkResult.totalProcessed}</span>
              </div>
              <div className="bg-green-950/20 p-3 rounded-xl text-center border border-green-900/20">
                <span className="text-xs text-green-400 block">Created</span>
                <span className="text-lg font-black text-green-400">{bulkResult.successCount}</span>
              </div>
              <div className="bg-red-950/20 p-3 rounded-xl text-center border border-red-900/20">
                <span className="text-xs text-red-400 block">Failed</span>
                <span className="text-lg font-black text-red-400">{bulkResult.failedCount}</span>
              </div>
            </div>

            {/* Error logs display */}
            {bulkResult.errors && bulkResult.errors.length > 0 && (
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1.5 max-h-32 overflow-y-auto">
                <span className="font-bold text-red-400 block mb-1">Import Warnings:</span>
                {bulkResult.errors.map((err: any, idx: number) => (
                  <div key={idx}>
                    Row {err.row}: <span className="text-slate-300 font-medium">{err.error}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
