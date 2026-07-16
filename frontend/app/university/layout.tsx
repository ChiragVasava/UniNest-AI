'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function UniversityLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [universityName, setUniversityName] = useState('University Admin');

  useEffect(() => {
    // Check if token exists and role is UNIVERSITY
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(userStr);
    if (user.role !== 'UNIVERSITY' && user.role !== 'ADMIN') {
      router.push('/unauthorized');
    }

    // Set name
    setUniversityName(user.email.split('@')[0].toUpperCase());
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/university/dashboard', icon: '📊' },
    { name: 'Onboard Students', path: '/university/students', icon: '👨‍🎓' },
    { name: 'Manage Hierarchy', path: '/university/hierarchy', icon: '🗂️' },
    { name: 'Recruiters & Drives', path: '/university/companies', icon: '🏢' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo / Header */}
          <div className="h-20 flex items-center px-6 border-b border-slate-800">
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 tracking-tight">
              UniNest <span className="text-xs uppercase bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full ml-1">Uni</span>
            </span>
          </div>

          {/* User Profile Summary */}
          <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-lg text-white shadow-md">
                {universityName.slice(0, 2)}
              </div>
              <div className="overflow-hidden">
                <h4 className="font-bold text-sm text-slate-200 truncate">{universityName}</h4>
                <p className="text-xs text-slate-400 truncate">Placement Controller</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-semibold ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-red-950/20 hover:border-red-900/60 transition-all duration-200 font-semibold text-sm"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="h-20 border-b border-slate-800 bg-slate-950/20 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10 shrink-0">
          <h2 className="text-xl font-bold tracking-tight text-white">
            {navItems.find((item) => pathname === item.path)?.name || 'University Portal'}
          </h2>
          
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold px-3 py-1.5 bg-green-500/10 text-green-400 rounded-full border border-green-500/20 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Live Sync Active
            </span>
          </div>
        </header>

        <div className="flex-1 p-8 bg-slate-900">
          {children}
        </div>
      </main>
    </div>
  );
}
