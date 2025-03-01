'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { useToast } from '@/components/ui/toast'
import { Mail, ArrowLeft } from 'lucide-react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
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
        // Start 60s cooldown timer for resend button
        startResendCooldown()
      } else {
        const data = await response.json()
        showToast(data.error || 'Failed to send reset email', 'error')
        setIsLoading(false)
      }
    } catch (error) {
      showToast('An error occurred. Please try again.', 'error')
      setIsLoading(false)
    }
  }

  // Start a 60-second cooldown timer for resend button
  const startResendCooldown = () => {
    setResendCooldown(60)
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }
  
  // Handle resend functionality
  const handleResend = async () => {
    if (resendCooldown > 0) return
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        showToast('Password reset email sent again. Check your inbox.', 'success')
        startResendCooldown()
      } else {
        const data = await response.json()
        showToast(data.error || 'Failed to resend email', 'error')
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Forgot Password</CardTitle>
              <CardDescription>
                {!submitted 
                  ? "Enter your email to reset your password" 
                  : "Check your email for password reset instructions"}
              </CardDescription>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
              <Mail size={24} />
            </div>
          </div>
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
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative" role="alert">
                <p className="font-bold">Email Sent!</p>
                <p className="text-sm">
                  We've sent instructions to <span className="font-medium">{email}</span>.
                  Please check your inbox and spam folders.
                </p>
              </div>
              
              <div className="flex flex-col space-y-4">
                <Button 
                  onClick={handleResend}
                  variant="outline"
                  disabled={isLoading || resendCooldown > 0}
                  className="relative overflow-hidden"
                >
                  {isLoading ? "Sending..." : resendCooldown > 0 ? `Resend Email (${resendCooldown}s)` : "Resend Email"}
                  {resendCooldown > 0 && (
                    <div 
                      className="absolute bottom-0 left-0 h-1 bg-blue-500" 
                      style={{ width: `${(resendCooldown/60) * 100}%`, transition: 'width 1s linear' }}
                    ></div>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/signin')}
            className="text-gray-500 hover:text-gray-700 flex items-center"
          >
            <ArrowLeft size={16} className="mr-1" />
            Return to Sign In
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

