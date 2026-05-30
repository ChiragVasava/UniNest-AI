'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/common/Alerts';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'STUDENT' | 'COMPANY' | 'ADMIN'>;
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  const isAuthorized =
    isAuthenticated &&
    (!allowedRoles || (user ? allowedRoles.includes(user.role) : false));

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.push('/unauthorized');
      return;
    }

  }, [isAuthenticated, user, isLoading, allowedRoles, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return <>{children}</>;
}
