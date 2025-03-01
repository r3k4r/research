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
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { showToast, ToastComponent } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        showToast('Password reset email sent. Check your inbox.', 'success')
        setSubmitted(true)
        setIsLoading(false)
      } else {
        const data = await response.json()
        showToast(data.error, 'error')
        setIsLoading(false)
      }
    } catch (error) {
      showToast('An error occurred. Please try again.', 'error')
      setIsLoading(false)
    }
  }
  
  // Handle resend functionality
  const handleResend = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        showToast('Password reset email sent again. Check your inbox.', 'success')
      } else {
        const data = await response.json()
        showToast(data.error, 'error')
      }
    } catch (error) {
      showToast('An error occurred. Please try again.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {ToastComponent}
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>
            {!submitted 
              ? "Enter your email to reset your password" 
              : "Check your email for password reset instructions"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!submitted ? (
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
                  disabled={isLoading}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full mt-4"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Reset Password"}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-center">
                We've sent instructions to <span className="font-bold">{email}</span>
              </p>
              <div className="flex flex-col space-y-2">
                <Button 
                  onClick={handleResend}
                  variant="outline"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Resend Email"}
                </Button>
                <Button onClick={() => router.push('/signin')}>
                  Return to Sign In
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

