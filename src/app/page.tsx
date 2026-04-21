'use client';

import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { Loader2, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col">
      {/* Absolute Header for Login/Register buttons only */}
      <header className="absolute top-0 right-0 p-8 flex items-center space-x-6">
        {loading ? (
          <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
        ) : isAuthenticated ? (
          <Link 
            href="/dashboard"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all flex items-center space-x-2 shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <span>Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        ) : (
          <>
            <Link 
              href="/login"
              className="text-gray-400 hover:text-white font-medium transition-colors"
            >
              Login
            </Link>
            <Link 
              href="/login"
              className="px-8 py-3 bg-white text-black hover:bg-gray-200 rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-white/10"
            >
              Register
            </Link>
          </>
        )}
      </header>

      {/* Main content - Centered branding only */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <h1 className="text-8xl font-black tracking-tighter bg-gradient-to-b from-white to-white/20 bg-clip-text text-transparent">
          SecureAuth
        </h1>
        <p className="text-gray-500 mt-4 tracking-[0.3em] uppercase text-sm font-medium">
          The Future of Authentication
        </p>
      </main>

      {/* Decorative background blur */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-lg max-h-lg bg-blue-600/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
    </div>
  );
}
