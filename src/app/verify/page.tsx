'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verify } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your login link...');
  
  const verifiedRef = useRef(false);

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      setStatus('error');
      setMessage('Invalid or missing verification details.');
      return;
    }

    if (verifiedRef.current) return;
    verifiedRef.current = true;

    const performVerify = async () => {
      try {
        await verify(email, token);
        setStatus('success');
        setMessage('Successfully verified! Redirecting to dashboard...');
        
        // Delay for better UX before moving to dashboard
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message);
      }
    };

    performVerify();
  }, [searchParams, verify]);

  return (
    <div className="max-w-md w-full p-8 glass rounded-2xl">
      {status === 'loading' && (
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <h1 className="text-2xl font-bold">{message}</h1>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center space-y-4 animate-in zoom-in duration-300">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
          <h1 className="text-2xl font-bold text-green-400">Login Successful</h1>
          <p className="text-gray-400">{message}</p>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center space-y-4 animate-in shake duration-300">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <h1 className="text-2xl font-bold text-red-400">Verification Failed</h1>
          <p className="text-gray-400">{message}</p>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors font-medium"
          >
            Back to Login
          </button>
        </div>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 text-center">
      <Suspense fallback={
        <div className="max-w-md w-full p-8 glass rounded-2xl flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <h1 className="text-2xl font-bold">Initializing verification...</h1>
        </div>
      }>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
