'use client';

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const { showToast, ToastComponent } = useToast();

  async function onSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        showToast('Password reset email sent!', 'success');
      } else {
        showToast('Failed to send password reset email', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
    }
  }

  return (
    <>
    {ToastComponent}
    <div className="flex items-center justify-center min-h-screen">
      <Card className="p-6 w-96">
        <h1 className="text-2xl font-bold mb-4">Forgot Password</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
          <Button type="submit" className="w-full">
            Send Reset Email
          </Button>
        </form>
      </Card>
    </div>
    </>
  );
}
