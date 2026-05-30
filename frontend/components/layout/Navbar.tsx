'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    router.push('/login');
  };

  const dashboardLink =
    user?.role === 'STUDENT' ? '/student/dashboard' : '/company/dashboard';

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={dashboardLink} className="flex items-center gap-3 group" aria-label="UniNest home">
            <div className="w-10 h-10 min-w-10 min-h-10 bg-linear-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center transform-gpu transition-all duration-200 group-hover:scale-105 ring-1 ring-slate-100">
              <span className="text-black font-bold text-lg leading-none">U</span>
            </div>
            <div>
              <div className="font-bold text-lg text-slate-900">UniNest</div>
              <div className="text-xs text-primary-600 font-medium">Recruitment Platform</div>
            </div>
          </Link>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-slate-900">
                {user?.email?.split('@')[0]}
              </span>
              <span className="text-xs text-slate-600 capitalize">
                {user?.role}
              </span>
            </div>

            {/* Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-9 h-9 rounded-lg bg-primary-100 text-primary-600 font-semibold hover:bg-primary-200 transition-colors flex items-center justify-center"
              >
                {user?.email?.charAt(0).toUpperCase()}
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-slate-200 shadow-lg overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-900">
                      {user?.email}
                    </p>
                    <p className="text-xs text-slate-600 capitalize mt-1">
                      {user?.role}
                    </p>
                  </div>
                  <Link
                    href={
                      user?.role === 'STUDENT'
                        ? '/student/profile'
                        : '/company/profile'
                    }
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Profile Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-danger-600 hover:bg-danger-50 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
