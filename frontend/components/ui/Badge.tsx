'use client';

import React from 'react';

interface BadgeProps {
  variant?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'slate';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
}

export function Badge({
  variant = 'secondary',
  size = 'sm',
  children,
  className = '',
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  const variantClasses = {
    primary: 'bg-primary-100 text-primary-700',
    secondary: 'bg-slate-100 text-slate-700',
    success: 'bg-success-100 text-success-700',
    warning: 'bg-warning-100 text-warning-700',
    danger: 'bg-danger-100 text-danger-700',
    slate: 'bg-slate-200 text-slate-800',
  };

  return (
    <span
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

interface StatusBadgeProps {
  status:
    | 'APPLIED'
    | 'SHORTLISTED'
    | 'INTERVIEW_SCHEDULED'
    | 'INTERVIEWED'
    | 'OFFER_SENT'
    | 'HIRED'
    | 'REJECTED'
    | 'ACCEPTED_OFFER'
    | 'PENDING'
    | 'ACCEPTED'
    | 'COUNTERED'
    | 'EXPIRED'
    | 'active'
    | 'inactive'
    | 'verified'
    | 'unverified';
  children?: React.ReactNode;
}

const statusConfig = {
  APPLIED: { variant: 'primary' as const, label: 'Applied' },
  SHORTLISTED: { variant: 'success' as const, label: 'Shortlisted' },
  INTERVIEW_SCHEDULED: { variant: 'warning' as const, label: 'Interview Scheduled' },
  INTERVIEWED: { variant: 'secondary' as const, label: 'Interviewed' },
  OFFER_SENT: { variant: 'primary' as const, label: 'Offer Sent' },
  HIRED: { variant: 'success' as const, label: 'Hired' },
  REJECTED: { variant: 'danger' as const, label: 'Rejected' },
  ACCEPTED_OFFER: { variant: 'success' as const, label: 'Accepted' },
  PENDING: { variant: 'warning' as const, label: 'Pending' },
  ACCEPTED: { variant: 'success' as const, label: 'Accepted' },
  COUNTERED: { variant: 'warning' as const, label: 'Countered' },
  EXPIRED: { variant: 'danger' as const, label: 'Expired' },
  active: { variant: 'success' as const, label: 'Active' },
  inactive: { variant: 'slate' as const, label: 'Inactive' },
  verified: { variant: 'success' as const, label: 'Verified' },
  unverified: { variant: 'warning' as const, label: 'Unverified' },
};

export function StatusBadge({ status, children }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} size="sm">
      {children || config.label}
    </Badge>
  );
}
