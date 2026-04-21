'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, User, ShieldCheck, LogOut, Settings, Bell, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">SecureAuth</span>
            </div>

            <div className="flex items-center space-x-6">
              <button className="text-gray-400 hover:text-white transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
              </button>
              <div className="flex items-center space-x-3 bg-slate-900/50 p-1 pr-3 rounded-full border border-slate-800">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-0.5">
                  <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-300 hidden sm:inline">{user.email}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[calc(100vh-64px)] py-10">
        <div className="flex flex-col items-center text-center max-w-3xl">
          <div className="relative mb-12">
            <div className="absolute -inset-8 bg-blue-600/20 blur-3xl rounded-full animate-pulse" />
            <div className="relative p-8 bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl">
              <ShieldCheck className="w-20 h-20 text-blue-500" />
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight leading-tight lowercase text-center">
            welcome back, <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent italic text-xl md:text-3xl">
              {user.email?.split('@')[0].toLowerCase()}
            </span>
          </h1>

          <div className="flex justify-center w-full">
            <button
              onClick={logout}
              className="px-8 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-gray-300 hover:text-white rounded-xl font-medium transition-all border border-slate-800 flex items-center justify-center space-x-2 active:scale-95 lowercase text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>sign out</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
