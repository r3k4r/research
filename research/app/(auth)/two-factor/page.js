'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export default function TwoFactorPage() {
  const [code, setCode] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const { showToast } = useToast();

  async function onSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      if (res.ok) {
        showToast('Verification successful!', 'success');
        router.push('/');
      } else {
        showToast('Invalid code', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="p-6 w-96">
        <h1 className="text-2xl font-bold mb-4">Two-Factor Authentication</h1>
        <p className="mb-4">Please enter the verification code sent to your email.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter verification code"
            maxLength={6}
          />
          <Button type="submit" className="w-full">
            Verify
          </Button>
        </form>
      </Card>
    </div>
  );
}
