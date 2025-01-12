'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { showToast } = useToast();

  async function onSubmit(e) {
    e.preventDefault();
    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      if (res.ok) {
        showToast('Password reset successfully!', 'success');
        router.push('/signin');
      } else {
        showToast('Failed to reset password', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="p-6 w-96">
        <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
          />
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
          />
          <Button type="submit" className="w-full">
            Reset Password
          </Button>
        </form>
      </Card>
    </div>
  );
}
