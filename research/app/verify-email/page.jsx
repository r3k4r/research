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

export default function VerifyEmail() {
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', ''])
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const { showToast, ToastComponent } = useToast()

  const handleChange = (index, value) => {
    const newCode = [...verificationCode]
    newCode[index] = value
    setVerificationCode(newCode)

    // Move to next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const code = verificationCode.join('')

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })

      if (response.ok) {
        showToast('Email verified successfully!', 'success')
        // Sign in the user after successful verification
        await signIn('credentials', { email, callbackUrl: '/' })
      } else {
        const data = await response.json()
        showToast(data.error, 'error')
      }
    } catch (error) {
      showToast('An error occurred during verification', 'error')
    }
  }

  return (
    <>
      {ToastComponent}
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>Verify Your Email</CardTitle>
          <CardDescription>Enter the 6-digit code sent to your email</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex justify-between mb-4">
              {verificationCode.map((digit, index) => (
                <Input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  className="w-12 h-12 text-center text-2xl"
                />
              ))}
            </div>
            <Button type="submit" className="w-full">Verify Email</Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <Button variant="link" onClick={() => router.push('/signin')}>Back to Sign In</Button>
        </CardFooter>
      </Card>
    </>
  )
}

