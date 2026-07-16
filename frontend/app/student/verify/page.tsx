'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI, studentAPI } from '@/lib/api';
import axios from 'axios';
import { ErrorAlert, SuccessAlert, LoadingSpinner } from '@/components/common/Alerts';
import { Button } from '@/components/ui/Button';

export default function StudentVerifyPage() {
  const [phone, setPhone] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [step, setStep] = useState(1); // 1 = input phone & send OTP, 2 = input OTPs & verify
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Load student profile to pre-fill email/phone and check if already verified
    const loadProfile = async () => {
      try {
        const profileRes = await studentAPI.getProfile();
        const profile = profileRes.data.data;
        
        if (profile.verificationStatus === 'VERIFIED') {
          router.push('/student/dashboard');
          return;
        }

        if (profile.phone) {
          setPhone(profile.phone);
        }

        // We can fetch email from current local user
        const localUserStr = localStorage.getItem('user');
        if (localUserStr) {
          const user = JSON.parse(localUserStr);
          setEmail(user.email);
        }
      } catch (err) {
        setError('Failed to load profile. Please make sure you are logged in.');
      }
    };
    loadProfile();
  }, [router]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await authAPI.sendOtp(phone);
      setSuccess(res.data.message || 'Verification codes sent to your email and phone!');
      setStep(2);
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : err instanceof Error
        ? err.message
        : String(err);
      setError(msg || 'Failed to send verification codes.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await authAPI.verifyOtp(emailOtp, phoneOtp);
      setSuccess(res.data.message || 'Account verified successfully!');
      
      // Update local storage user profile state
      const localUserStr = localStorage.getItem('user');
      if (localUserStr) {
        const user = JSON.parse(localUserStr);
        user.verificationStatus = 'VERIFIED';
        localStorage.setItem('user', JSON.stringify(user));
      }

      setTimeout(() => {
        router.push('/student/dashboard');
      }, 1500);
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : err instanceof Error
        ? err.message
        : String(err);
      setError(msg || 'Incorrect OTP codes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12 text-black">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Verify Your Account</h1>
          <p className="text-sm text-gray-600 mt-2">
            To complete your university onboarding, please verify your email and phone.
          </p>
        </div>

        {error && <ErrorAlert message={error} />}
        {success && <SuccessAlert message={success} />}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-5 mt-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Mobile Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +919876543210"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                required
              />
            </div>

            <Button type="submit" isLoading={loading} className="w-full bg-blue-600 text-white hover:bg-blue-700 py-3 rounded-xl font-bold shadow-md">
              Send Verification OTPs
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-5 mt-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email OTP Code</label>
              <input
                type="text"
                value={emailOtp}
                onChange={(e) => setEmailOtp(e.target.value)}
                placeholder="6-digit email code"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-center tracking-widest font-mono text-lg text-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">SMS Mobile OTP Code</label>
              <input
                type="text"
                value={phoneOtp}
                onChange={(e) => setPhoneOtp(e.target.value)}
                placeholder="6-digit phone code"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-center tracking-widest font-mono text-lg text-black"
                required
              />
              <p className="text-xs text-gray-500 mt-1.5 text-center">
                Check the backend terminal console log if you are in development mode!
              </p>
            </div>

            <Button type="submit" isLoading={loading} className="w-full bg-green-600 text-white hover:bg-green-700 py-3 rounded-xl font-bold shadow-md">
              Verify & Activate Account
            </Button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-center text-sm font-semibold text-blue-600 hover:underline mt-2"
            >
              Change Phone Number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
