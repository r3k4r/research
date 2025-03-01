'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { useToast } from '@/components/ui/toast'

export default function TwoFactor() {
  const [twoFactorCode, setTwoFactorCode] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const password = searchParams.get('password') // Pass password via URL (encrypted in a real app)
  const { showToast, ToastComponent } = useToast()

  const handleChange = (index, value) => {
    const newCode = [...twoFactorCode]
    newCode[index] = value
    setTwoFactorCode(newCode)

    // Move to next input
    if (value && index < 5) {
      document.getElementById(`2fa-${index + 1}`).focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const code = twoFactorCode.join('')
    
    if (code.length !== 6) return
    
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/two-factor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })

      if (response.ok) {
        showToast('Two-factor authentication successful!', 'success')
        // Sign in the user after successful 2FA
        await signIn('credentials', { 
          email, 
          password, // Use the password from URL params
          twoFactorCode: code,
          callbackUrl: '/',
          redirect: true
        })
      } else {
        const data = await response.json()
        showToast(data.error, 'error')
        setIsLoading(false)
      }
    } catch (error) {
      showToast('An error occurred during two-factor authentication', 'error')
      setIsLoading(false)
    }
  }
  
  // Add resend code functionality
  const handleResendCode = async () => {
    if (!email) return
    
    try {
      // Re-trigger sign-in to generate a new 2FA code
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })
      
      if (result?.error === 'TwoFactorRequired') {
        showToast('A new verification code has been sent to your email', 'success')
      } else {
        showToast('Failed to resend code. Please try again.', 'error')
      }
    } catch (error) {
      console.error('Error resending code:', error)
      showToast('An error occurred while resending the code', 'error')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {ToastComponent}
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>Enter the 6-digit code sent to your email</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="2fa-0">Authentication Code</Label>
              
              <div className="flex justify-between mb-4 gap-2">
                {twoFactorCode.map((digit, index) => (
                  <Input
                    key={index}
                    id={`2fa-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    className="w-12 h-12 text-center text-2xl"
                    disabled={isLoading}
                  />
                ))}
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full mt-4"
              disabled={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            variant="outline" 
            onClick={handleResendCode} 
            className="w-full"
            disabled={isLoading}
          >
            Resend Code
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

