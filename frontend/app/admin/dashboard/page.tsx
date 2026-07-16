'use client';

import React, { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import axios from 'axios';
import { ErrorAlert, SuccessAlert } from '@/components/common/Alerts';

interface University {
  id: string;
  name: string;
  code: string;
  address: string | null;
  website: string | null;
  isApproved: boolean;
  subscriptionPlan: string;
  _count?: {
    students: number;
    facultyAdmins: number;
  };
}

interface Metrics {
  totalUniversities: number;
  totalCompanies: number;
  totalStudents: number;
  totalDrives: number;
  placedStudentsCount: number;
  placementRate: number;
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');

  // Alerts
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [metricsRes, uniRes] = await Promise.all([
        adminAPI.getMetrics(),
        adminAPI.getUniversities(),
      ]);
      setMetrics(metricsRes.data.data);
      setUniversities(uniRes.data.data || []);
    } catch (err) {
      setError('Failed to fetch SaaS stats or tenants list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await adminAPI.createUniversity({
        email,
        password,
        name,
        code,
        address,
        website,
      });

      setSuccess(`University tenant '${name}' created successfully!`);
      // Reset form
      setEmail('');
      setPassword('');
      setName('');
      setCode('');
      setAddress('');
      setWebsite('');
      
      fetchDashboardData();
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.message : '';
      setError(msg || 'Failed to create university tenant.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleApprove = async (id: string, currentStatus: boolean) => {
    setError('');
    setSuccess('');
    try {
      if (currentStatus) {
        await adminAPI.suspendUniversity(id);
        setSuccess('University tenant suspended.');
      } else {
        await adminAPI.approveUniversity(id);
        setSuccess('University tenant approved.');
      }
      fetchDashboardData();
    } catch (err) {
      setError('Failed to change tenant approval status.');
    }
  };

  const handleUpdateBilling = async (id: string, plan: string) => {
    setError('');
    setSuccess('');
    try {
      await adminAPI.updateBillingPlan(id, plan);
      setSuccess(`Subscription tier set to ${plan} successfully.`);
      fetchDashboardData();
    } catch (err) {
      setError('Failed to update tenant billing tier.');
    }
  };

  return (
    <div className="space-y-8 text-slate-100">
      {/* Messaging alerts */}
      {error && <ErrorAlert message={error} />}
      {success && <SuccessAlert message={success} />}

      {/* Metrics widgets */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold block uppercase">Total Universities</span>
            <span className="text-3xl font-black text-white block mt-1">{metrics.totalUniversities}</span>
          </div>
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold block uppercase">Recruiter Partnerships</span>
            <span className="text-3xl font-black text-white block mt-1">{metrics.totalCompanies}</span>
          </div>
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold block uppercase">Students Onboarded</span>
            <span className="text-3xl font-black text-white block mt-1">{metrics.totalStudents}</span>
          </div>
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold block uppercase">Global Placement Rate</span>
            <span className="text-3xl font-black text-green-400 block mt-1">
              {metrics.placementRate}% <span className="text-xs text-slate-500 font-medium">({metrics.placedStudentsCount} Placed)</span>
            </span>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Onboard New University */}
        <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 space-y-6">
          <div>
            <h3 className="font-extrabold text-xl text-white">Create University Tenant</h3>
            <p className="text-xs text-slate-400 mt-1">Register and deploy a new institution placement node</p>
          </div>

          <form onSubmit={handleCreateTenant} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">University Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Maharaja Sayajirao University"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Unique Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. MSU"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Website URL</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.edu"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="placement@university.edu"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Temp Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Address Location</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="City, State"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition"
            >
              {submitting ? 'Deploying Tenant Node...' : 'Provision University Node'}
            </button>
          </form>
        </div>

        {/* List of Active University Nodes */}
        <div className="lg:col-span-2 bg-slate-950 p-8 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-xl text-white">Institution Tenants</h3>
              <p className="text-xs text-slate-400 mt-1">Manage tenant health status and SaaS billing parameters</p>
            </div>
            <button
              onClick={fetchDashboardData}
              className="text-xs font-semibold px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition"
            >
              🔄 Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading tenant logs...</div>
          ) : universities.length === 0 ? (
            <div className="text-center py-12 text-slate-500 italic">No university nodes deployed yet.</div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {universities.map((uni) => (
                <div
                  key={uni.id}
                  className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-white">{uni.name}</span>
                      <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20 font-mono font-bold">
                        {uni.code}
                      </span>
                    </div>

                    <div className="flex gap-4 text-xs text-slate-400">
                      <span>👤 Admins: {uni._count?.facultyAdmins || 0}</span>
                      <span>👨‍🎓 Students: {uni._count?.students || 0}</span>
                      <span>🌐 {uni.website || 'No website link'}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Subscription tier dropdown selector */}
                    <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-850 px-2 py-1 rounded-lg">
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Plan</span>
                      <select
                        value={uni.subscriptionPlan}
                        onChange={(e) => handleUpdateBilling(uni.id, e.target.value)}
                        className="bg-transparent text-xs text-slate-300 font-bold focus:outline-none cursor-pointer"
                      >
                        <option value="FREE" className="bg-slate-900 text-slate-300">Free Trial</option>
                        <option value="PREMIUM" className="bg-slate-900 text-slate-300">Premium</option>
                        <option value="ENTERPRISE" className="bg-slate-900 text-slate-300">Enterprise</option>
                      </select>
                    </div>

                    {/* Toggle suspend state button */}
                    <button
                      onClick={() => handleToggleApprove(uni.id, uni.isApproved)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition ${
                        uni.isApproved
                          ? 'bg-red-950/20 text-red-400 hover:bg-red-900/30 border-red-900/40'
                          : 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/20'
                      }`}
                    >
                      {uni.isApproved ? 'Suspend' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
