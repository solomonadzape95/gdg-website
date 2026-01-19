'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { SignUpForm, LoginForm } from '@/components/auth';

function AuthContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'signup';

  return (
    <AnimatePresence mode="wait">
      {mode === 'login' ? (
        <LoginForm key="login" />
      ) : (
        <SignUpForm key="signup" />
      )}
    </AnimatePresence>
  );
}

export default function Auth() {
  return (
    <Suspense fallback={<div className="w-full h-full flex items-center justify-center">Loading...</div>}>
      <AuthContent />
    </Suspense>
  );
}