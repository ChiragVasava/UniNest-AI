'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { ErrorAlert, LoadingSpinner } from '@/components/common/Alerts';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      const { token, user } = response.data.data;

      // Save to context and localStorage
      login(token, user);

      // Redirect based on role
      if (user.role === 'STUDENT') {
        router.push('/student/dashboard');
      } else if (user.role === 'COMPANY') {
        router.push('/company/dashboard');
      } else {
        router.push('/admin/dashboard');
      }
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : err instanceof Error
        ? err.message
        : String(err);
      setError(msg || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md text-black">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Login</h2>

      {error && <ErrorAlert message={error} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your password"
            required
          />
        </div>

        <Button type="submit" isLoading={loading} className="w-full bg-black text-white">
          {loading ? <LoadingSpinner /> : 'Login'}
        </Button>
      </form>

      <p className="text-center mt-4 text-gray-600">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-blue-500 hover:underline">
          Register here
        </Link>
      </p>
    </div>
  );
}