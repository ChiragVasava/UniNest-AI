'use client';

import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { applicationAPI, offerAPI, resumeAPI } from '@/lib/api';

type StudentSummary = {
  applications: number;
  shortlisted: number;
  offers: number;
  resumes: number;
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

export default function StudentDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<StudentSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [summaryError, setSummaryError] = useState('');

  useEffect(() => {
    let active = true;

    const loadSummary = async () => {
      try {
        const [applicationsResponse, offersResponse, resumesResponse] = await Promise.all([
          applicationAPI.getMyApplications(),
          offerAPI.getMyOffers(),
          resumeAPI.getMyResumes(),
        ]);

        if (!active) return;

        const applications = applicationsResponse.data?.data?.applications || [];
        const offers = offersResponse.data?.data?.offers || [];
        const resumes = resumesResponse.data?.data?.resumes || [];

        setSummary({
          applications: applications.length,
          shortlisted: applications.filter((application: { status?: string }) => application.status === 'SHORTLISTED').length,
          offers: offers.length,
          resumes: resumes.length,
        });
        setSummaryError('');
      } catch (err: unknown) {
        if (!active) return;
        setSummaryError(
          axios.isAxiosError(err)
            ? err.response?.data?.message || err.message
            : err instanceof Error
              ? err.message
              : 'Failed to load live student stats.'
        );
      } finally {
        if (active) {
          setLoadingSummary(false);
        }
      }
    };

    void loadSummary();
    const refreshTimer = window.setInterval(() => {
      void loadSummary();
    }, 60000);

    return () => {
      active = false;
      window.clearInterval(refreshTimer);
    };
  }, []);

  const summaryTone = useMemo(() => {
    if (!summary) return 'Loading live counts...';
    return `${summary.shortlisted} shortlisted, ${summary.offers} offers available`;
  }, [summary]);

  const dashboardCards: DashboardCard[] = [
    {
      id: 'profile',
      title: 'My Profile',
      description: 'View and update your professional profile',
      icon: '👤',
      href: '/student/profile',
      color: 'blue',
    },
    {
      id: 'drives',
      title: 'Browse Drives',
      description: 'Explore job placement opportunities',
      icon: '🏢',
      href: '/student/drives',
      color: 'green',
    },
    {
      id: 'applications',
      title: 'My Applications',
      description: 'Track your application status',
      icon: '📋',
      href: '/student/applications',
      color: 'purple',
    },
    {
      id: 'resumes',
      title: 'My Resumes',
      description: 'Upload and manage your resumes',
      icon: '📄',
      href: '/student/resumes',
      color: 'orange',
    },
    {
      id: 'offers',
      title: 'My Offers',
      description: 'View and manage job offers',
      icon: '🎁',
      href: '/student/offers',
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
            Welcome back, {user?.email?.split('@')[0]}! 👋
          </h1>
          <p className="text-lg text-slate-600 mt-3">
            Your gateway to exciting career opportunities
          </p>
        </div>

        {/* Quick Stats */}
        <div className="mb-12 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              {loadingSummary && !summary ? 'Fetching live student metrics...' : 'Live metrics for your account'}
            </p>
            <p className="text-sm font-medium text-slate-900">{summaryTone}</p>
          </div>
          {summaryError && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {summaryError}
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardContent className="py-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary-600">{summary?.applications ?? '—'}</p>
                  <p className="text-sm text-slate-600 mt-2">Applications</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-success-600">{summary?.shortlisted ?? '—'}</p>
                  <p className="text-sm text-slate-600 mt-2">Shortlisted</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-warning-600">{summary?.offers ?? '—'}</p>
                  <p className="text-sm text-slate-600 mt-2">Offers</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-indigo-600">{summary?.resumes ?? '—'}</p>
                  <p className="text-sm text-slate-600 mt-2">Resumes</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Quick Access
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
            Getting Started? 🚀
          </h3>
          <p className="text-slate-700 mb-4">
            Complete your profile first, then start exploring job opportunities from top companies!
          </p>
          <div className="flex gap-4">
            <Link href="/student/profile" className="inline-block">
              <Button variant="primary" className="px-4 py-2 bg-black text-white">
                Complete Profile →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
