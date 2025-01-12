'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying');
  const { showToast } = useToast();

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  async function verifyEmail(token) {
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (res.ok) {
        setStatus('success');
        showToast('Email verified successfully!', 'success');
      } else {
        setStatus('error');
        showToast('Failed to verify email', 'error');
      }
    } catch (error) {
      setStatus('error');
      showToast('An error occurred', 'error');
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Email Verification</h1>
        {status === 'verifying' && <p>Verifying your email...</p>}
        {status === 'success' && <p>Your email has been verified! You can now sign in.</p>}
        {status === 'error' && <p>Failed to verify email. Please try again.</p>}
      </Card>
    </div>
  );
}
