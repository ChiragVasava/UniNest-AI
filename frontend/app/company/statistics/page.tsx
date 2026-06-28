'use client';

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { companyAPI } from '@/lib/api';
import { ErrorAlert } from '@/components/common/Alerts';

type SortBy = 'name' | 'joinedAt' | 'role' | 'salary' | 'department';
type SortOrder = 'asc' | 'desc';

interface CompanyStats {
  company: {
    id: string;
    companyName: string;
    registrationId?: string;
    sector: string;
    website?: string;
    logo?: string;
    contactPerson?: string;
    contactEmail?: string;
    contactPhone?: string;
    address?: string;
    isProfileComplete: boolean;
    isApproved: boolean;
    createdAt: string;
    updatedAt: string;
  };
  summary: {
    totalProjects: number;
    activeProjects: number;
    totalApplications: number;
    totalOffers: number;
    pendingOffers: number;
    acceptedOffers: number;
    rejectedOffers: number;
    counteredOffers: number;
    employeeStrength: number;
    newHires: number;
    workingEmployees: number;
  };
  roleBreakdown: Array<{ role: string; count: number }>;
  departmentBreakdown: Array<{ department: string; count: number }>;
  projects: Array<{
    id: string;
    title: string;
    description?: string | null;
    salary?: number | null;
    interviewFormat: string;
    isActive: boolean;
    createdAt: string;
  }>;
  employees: Array<{
    id: string;
    name: string;
    rollNumber: string;
    role: string;
    department: string;
    location: string;
    salary: number;
    joinDate: string;
    tenureDays: number;
    status: 'newly_hired' | 'working';
    driveTitle: string;
    description?: string;
  }>;
}

function formatDate(value?: string) {
  if (!value) return 'Not specified';
  return new Date(value).toLocaleDateString();
}

function formatCurrency(value?: number) {
  if (typeof value !== 'number') return 'Not specified';
  return `₹${value.toLocaleString()}`;
}

export default function CompanyStatisticsPage() {
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  useEffect(() => {
    let active = true;

    const loadStats = async () => {
      try {
        setLoading(true);
        const response = await companyAPI.getMyStatistics(sortBy, sortOrder);
        if (!active) return;
        setStats(response.data?.data || null);
      } catch (err: unknown) {
        if (!active) return;
        setError(
          axios.isAxiosError(err)
            ? err.response?.data?.message || err.message
            : err instanceof Error
              ? err.message
              : 'Failed to load company dashboard.'
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadStats();

    return () => {
      active = false;
    };
  }, [sortBy, sortOrder]);

  const employeeTone = useMemo(() => {
    if (!stats?.employees?.length) return 'No employees yet';
    return `${stats.summary.newHires} new hires, ${stats.summary.workingEmployees} working`;
  }, [stats]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <section className="rounded-3xl bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 p-8 text-white shadow-2xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Company Dashboard</p>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                {stats?.company.companyName || 'Company Statistics'}
              </h1>
              <p className="max-w-2xl text-slate-300">
                Track projects, accepted offers, employee strength, and the current hiring pipeline in one place.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
              <p className="text-sm text-slate-300">Employee Mix</p>
              <p className="text-2xl font-semibold">{employeeTone}</p>
            </div>
          </div>
        </section>

        {error && <ErrorAlert message={error} />}

        {loading && !stats ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
            Loading company dashboard...
          </div>
        ) : null}

        {stats && (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                { label: 'Projects', value: stats.summary.totalProjects },
                { label: 'Active Projects', value: stats.summary.activeProjects },
                { label: 'Applications', value: stats.summary.totalApplications },
                { label: 'Employee Strength', value: stats.summary.employeeStrength },
              ].map((item) => (
                <Card key={item.label}>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-slate-500">{item.label}</p>
                    <p className="text-3xl font-semibold text-slate-950">{item.value}</p>
                  </CardContent>
                </Card>
              ))}
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <Card>
                <CardContent className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-wide text-slate-500">Company Information</p>
                      <h2 className="text-2xl font-semibold text-slate-950">{stats.company.companyName}</h2>
                    </div>
                    <StatusBadge status={stats.company.isApproved ? 'verified' : 'unverified'} />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <InfoLine label="Sector" value={stats.company.sector} />
                    <InfoLine label="Contact Person" value={stats.company.contactPerson} />
                    <InfoLine label="Contact Email" value={stats.company.contactEmail} />
                    <InfoLine label="Contact Phone" value={stats.company.contactPhone} />
                    <InfoLine label="Website" value={stats.company.website} />
                    <InfoLine label="Address" value={stats.company.address} />
                    <InfoLine label="Registration ID" value={stats.company.registrationId} />
                    <InfoLine label="Created" value={formatDate(stats.company.createdAt)} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-4">
                  <p className="text-sm uppercase tracking-wide text-slate-500">Hiring Snapshot</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <MiniStat label="Total Offers" value={stats.summary.totalOffers} />
                    <MiniStat label="Accepted" value={stats.summary.acceptedOffers} />
                    <MiniStat label="Pending" value={stats.summary.pendingOffers} />
                    <MiniStat label="Rejected" value={stats.summary.rejectedOffers} />
                    <MiniStat label="Countered" value={stats.summary.counteredOffers} />
                    <MiniStat label="New Hires" value={stats.summary.newHires} />
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
              <Card>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-wide text-slate-500">Employee Strength</p>
                      <h2 className="text-xl font-semibold text-slate-950">Sortable hired employees</h2>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortBy)}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                      >
                        <option value="name">Alphabetical</option>
                        <option value="joinedAt">Join Date</option>
                        <option value="role">Role</option>
                        <option value="salary">Salary</option>
                        <option value="department">Department</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => setSortOrder((current) => (current === 'asc' ? 'desc' : 'asc'))}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700"
                      >
                        {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {stats.employees.length === 0 && (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-slate-600">
                        No accepted offers yet.
                      </div>
                    )}

                    {stats.employees.map((employee) => (
                      <div key={employee.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-semibold text-slate-950">{employee.name}</h3>
                              <StatusBadge status={employee.status === 'newly_hired' ? 'verified' : 'active'} />
                            </div>
                            <p className="text-sm text-slate-600">{employee.rollNumber}</p>
                            <p className="mt-1 text-sm text-slate-700">
                              {employee.role} • {employee.department} • {employee.location}
                            </p>
                            <p className="mt-1 text-sm text-slate-600">Joined: {formatDate(employee.joinDate)}</p>
                            <p className="text-sm text-slate-600">{employee.tenureDays} day(s) in role</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-slate-500">Salary</p>
                            <p className="text-lg font-semibold text-slate-950">{formatCurrency(employee.salary)}</p>
                            <p className="text-xs uppercase tracking-wide text-slate-500">{employee.driveTitle}</p>
                          </div>
                        </div>
                        {employee.description && (
                          <p className="mt-3 text-sm leading-6 text-slate-700">{employee.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm uppercase tracking-wide text-slate-500">Role Breakdown</p>
                      <h2 className="text-xl font-semibold text-slate-950">Employee roles</h2>
                    </div>
                    <div className="space-y-3">
                      {stats.roleBreakdown.length === 0 && <p className="text-slate-600">No role data yet.</p>}
                      {stats.roleBreakdown.map((entry) => (
                        <div key={entry.role} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                          <span className="font-medium text-slate-900">{entry.role}</span>
                          <span className="text-sm text-slate-600">{entry.count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm uppercase tracking-wide text-slate-500">Projects</p>
                      <h2 className="text-xl font-semibold text-slate-950">Drive portfolio</h2>
                    </div>
                    <div className="space-y-3">
                      {stats.projects.length === 0 && <p className="text-slate-600">No projects found.</p>}
                      {stats.projects.map((project) => (
                        <div key={project.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-semibold text-slate-950">{project.title}</h3>
                              <p className="text-sm text-slate-600">{project.description || 'No description provided.'}</p>
                            </div>
                            <StatusBadge status={project.isActive ? 'active' : 'inactive'} />
                          </div>
                          <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-600">
                            <span>{formatCurrency(project.salary || undefined)}</span>
                            <span>{project.interviewFormat}</span>
                            <span>{formatDate(project.createdAt)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm uppercase tracking-wide text-slate-500">Department Mix</p>
                      <h2 className="text-xl font-semibold text-slate-950">Employees by department</h2>
                    </div>
                    <div className="space-y-3">
                      {stats.departmentBreakdown.length === 0 && <p className="text-slate-600">No department data yet.</p>}
                      {stats.departmentBreakdown.map((entry) => (
                        <div key={entry.department} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                          <span className="font-medium text-slate-900">{entry.department}</span>
                          <span className="text-sm text-slate-600">{entry.count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-950">{value || 'Not specified'}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}