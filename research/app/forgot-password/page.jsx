'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { useToast } from '@/components/ui/toast'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const router = useRouter()
  const { showToast, ToastComponent } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        showToast('Password reset email sent. Check your inbox.', 'success')
        setTimeout(() => router.push('/signin'), 2000)
      } else {
        const data = await response.json()
        showToast(data.error, 'error')
      }
    } catch (error) {
      showToast('An error occurred. Please try again.', 'error')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {ToastComponent}
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>Enter your email to reset your password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full mt-4">Reset Password</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

