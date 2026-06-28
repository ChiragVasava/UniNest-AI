'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/common/Alerts';

export default function Home() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated && user) {
      // Redirect to dashboard based on role
      if (user.role === 'STUDENT') {
        router.push('/student/dashboard');
      } else if (user.role === 'COMPANY') {
        router.push('/company/dashboard');
      } else {
        router.push('/admin/dashboard');
      }
    } else {
      // Redirect to login if not authenticated
      router.push('/login');
    }
  }, [isAuthenticated, user, isLoading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner />
    </div>
  );
}
