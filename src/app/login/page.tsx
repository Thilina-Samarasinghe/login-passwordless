'use client';

import { useState } from 'react';
import { Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email);
      setSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 glass rounded-2xl shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-gray-400">Sign in to your account with a magic link</p>
        </div>

        {sent ? (
          <div className="text-center animate-in fade-in zoom-in duration-500">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Check your inbox</h2>
            <p className="text-gray-400 mb-6">
              We've sent a magic link to <span className="text-white font-medium">{email}</span>.
              The link expires in 15 minutes.
            </p>
            <button
              onClick={() => setSent(false)}
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Try another email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-white placeholder-gray-500"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Send Magic Link'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
