'use client';

import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Unauthorized</h1>
        <p className="mt-3 text-slate-600">
          You do not have permission to access this page.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/">
            <Button className="bg-black text-white">Go Home</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline">Back to Login</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}