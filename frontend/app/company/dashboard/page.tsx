'use client';

import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { companyAPI } from '@/lib/api';

type DashboardSummary = {
  totalProjects: number;
  activeProjects: number;
  totalApplications: number;
  totalOffers: number;
  pendingOffers: number;
  acceptedOffers: number;
  employeeStrength: number;
  newHires: number;
  workingEmployees: number;
};

type DashboardStats = {
  company: {
    companyName: string;
  };
  summary: DashboardSummary;
};

interface DashboardCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  badge?: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo';
}

export default function CompanyDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState('');

  useEffect(() => {
    let active = true;

    const loadStats = async () => {
      try {
        const response = await companyAPI.getMyStatistics('name', 'asc');
        if (!active) return;
        setStats(response.data?.data || null);
        setStatsError('');
      } catch (err: unknown) {
        if (!active) return;
        setStatsError(
          axios.isAxiosError(err)
            ? err.response?.data?.message || err.message
            : err instanceof Error
              ? err.message
              : 'Failed to load live company stats.'
        );
      } finally {
        if (active) {
          setLoadingStats(false);
        }
      }
    };

    void loadStats();
    const refreshTimer = window.setInterval(() => {
      void loadStats();
    }, 60000);

    return () => {
      active = false;
      window.clearInterval(refreshTimer);
    };
  }, []);

  const employeeTone = useMemo(() => {
    if (!stats) return 'Loading live counts...';
    if (!stats.summary.employeeStrength) return 'No hires yet';
    return `${stats.summary.newHires} new hires, ${stats.summary.workingEmployees} working`;
  }, [stats]);

  const dashboardCards: DashboardCard[] = [
    {
      id: 'profile',
      title: 'Company Profile',
      description: 'Manage your company information and details',
      icon: '🏢',
      href: '/company/profile',
      color: 'blue',
    },
    {
      id: 'drives',
      title: 'My Drives',
      description: 'Create and manage recruitment drives',
      icon: '📅',
      href: '/company/drives',
      color: 'green',
    },
    {
      id: 'applications',
      title: 'Applications',
      description: 'Review student applications',
      icon: '📋',
      href: '/company/applications',
      color: 'purple',
    },
    {
      id: 'offers',
      title: 'Send Offers',
      description: 'Generate and send job offers',
      icon: '💼',
      href: '/company/offers',
      color: 'orange',
    },
    {
      id: 'statistics',
      title: 'Statistics',
      description: 'View recruitment analytics',
      icon: '📊',
      href: '/company/statistics',
      color: 'indigo',
    },
  ];

  const colorClasses = {
    blue: 'bg-primary-50 border-primary-200 hover:border-primary-300',
    green: 'bg-success-50 border-success-200 hover:border-success-300',
    purple: 'bg-purple-50 border-purple-200 hover:border-purple-300',
    orange: 'bg-warning-50 border-warning-200 hover:border-warning-300',
    red: 'bg-danger-50 border-danger-200 hover:border-danger-300',
    indigo: 'bg-indigo-50 border-indigo-200 hover:border-indigo-300',
  };

  const iconColorClasses = {
    blue: 'text-primary-600',
    green: 'text-success-600',
    purple: 'text-purple-600',
    orange: 'text-warning-600',
    red: 'text-danger-600',
    indigo: 'text-indigo-600',
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900">
            Welcome to UniNest, {user?.email?.split('@')[0]}! 👋
          </h1>
          <p className="text-lg text-slate-600 mt-3">
            Recruit the best talent from India&apos;s leading institutes
          </p>
        </div>

        {/* Quick Stats */}
        <div className="mb-12 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              {loadingStats && !stats ? 'Fetching live company metrics...' : `Live metrics for ${stats?.company.companyName || 'your company'}`}
            </p>
            <p className="text-sm font-medium text-slate-900">{employeeTone}</p>
          </div>
          {statsError && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {statsError}
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardContent className="py-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary-600">{stats?.summary.activeProjects ?? '—'}</p>
                  <p className="text-sm text-slate-600 mt-2">Active Drives</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-success-600">{stats?.summary.totalApplications ?? '—'}</p>
                  <p className="text-sm text-slate-600 mt-2">Applications</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-warning-600">{stats?.summary.pendingOffers ?? '—'}</p>
                  <p className="text-sm text-slate-600 mt-2">Pending Offers</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-indigo-600">{stats?.summary.employeeStrength ?? '—'}</p>
                  <p className="text-sm text-slate-600 mt-2">Hired</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Recruitment Hub
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardCards.map((card) => (
              <Link key={card.id} href={card.href}>
                <Card
                  className={`h-full cursor-pointer border-2 transition-all duration-300 hover:shadow-lg ${colorClasses[card.color]}`}
                  hoverable
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`text-4xl ${iconColorClasses[card.color]}`}>
                        {card.icon}
                      </div>
                      {card.badge && (
                        <Badge variant="primary" size="sm">
                          {card.badge}
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {card.title}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {card.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-12 bg-primary-50 border border-primary-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Ready to hire? 🚀
          </h3>
          <p className="text-slate-700 mb-4">
            Set up your company profile and create a recruitment drive to start connecting with talented students!
          </p>
          <div className="flex gap-4">
            <Link href="/company/profile" className="inline-block">
              <Button variant="primary" className="px-4 py-2 bg-black text-white">
                Setup Company Profile →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
