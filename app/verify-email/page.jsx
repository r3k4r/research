'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from '@/components/ui/toast'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get('email')
  // Replace single input with array of 6 digits
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const { showToast, ToastComponent } = useToast()
  
  // Added countdown effect to show user the redirect will happen
  const [countdown, setCountdown] = useState(null)
  
  useEffect(() => {
    if (countdown !== null) {
      if (countdown <= 0) {
        router.push('/')
      } else {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
        return () => clearTimeout(timer)
      }
    }
  }, [countdown, router])

  // Handle input for each digit box
  const handleChange = (index, value) => {
    const newCode = [...verificationCode]
    newCode[index] = value
    setVerificationCode(newCode)

    // Auto-focus next input when this one is filled
    if (value && index < 5) {
      document.getElementById(`verification-${index + 1}`).focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Join the digits to form the complete code
    const code = verificationCode.join('')
    
    if (!email || !code || code.length !== 6) return
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        showToast('Email verified successfully! Redirecting...', 'success')
        setCountdown(3) 
      } else {
        showToast(data.error || 'Verification failed', 'error')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Error during verification:', error)
      showToast('An error occurred during verification', 'error')
      setIsLoading(false)
    }
  }
  
  const handleResendCode = async () => {
    if (!email) return
    
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        showToast('Verification code resent to your email', 'success')
      } else {
        showToast(data.error || 'Failed to resend code', 'error')
      }
    } catch (error) {
      console.error('Error resending code:', error)
      showToast('An error occurred while resending the code', 'error')
    }
  }

  if (!email) {
    return (
      <div className="container mx-auto px-4 h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Request</CardTitle>
            <CardDescription>No email provided for verification.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push('/signin')} className="w-full">
              Go to Sign In
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 h-screen flex items-center justify-center">
      {ToastComponent}
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a verification code to {email}. 
            Please enter the code below to verify your email address.
            {countdown !== null && (
              <div className="mt-2 text-green-600 font-semibold">
                Redirecting to login page in {countdown} seconds...
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="verification-0">Verification Code</Label>
              
              {/* New 6-box design for verification code */}
              <div className="flex justify-between mb-4 gap-2">
                {verificationCode.map((digit, index) => (
                  <Input
                    key={index}
                    id={`verification-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    className="w-12 h-12 text-center text-2xl"
                    disabled={isLoading || countdown !== null}
                  />
                ))}
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full mt-4"
              disabled={isLoading || countdown !== null}
            >
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            variant="outline" 
            onClick={handleResendCode} 
            className="w-full"
            disabled={isLoading || countdown !== null}
          >
            Resend Code
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

