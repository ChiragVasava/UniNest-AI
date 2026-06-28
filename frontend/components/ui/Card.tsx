'use client';

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
  noPadding?: boolean;
}

export function Card({
  children,
  hoverable = false,
  noPadding = false,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={`bg-white border border-slate-200 rounded-lg ${
        noPadding ? '' : 'p-6'
      } ${hoverable ? 'hover:shadow-md hover:border-slate-300 transition-all' : 'shadow-sm'} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`pb-4 border-b border-slate-200 mb-4 -m-6 px-6 py-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`pt-4 border-t border-slate-200 mt-6 -mx-6 px-6 py-4 bg-slate-50 rounded-b-lg flex gap-3 ${className}`}>
      {children}
    </div>
  );
}
