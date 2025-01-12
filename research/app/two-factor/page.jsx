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
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
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

    try {
      const response = await fetch('/api/auth/two-factor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })

      if (response.ok) {
        showToast('Two-factor authentication successful!', 'success')
        // Sign in the user after successful 2FA
        await signIn('credentials', { email, callbackUrl: '/' })
      } else {
        const data = await response.json()
        showToast(data.error, 'error')
      }
    } catch (error) {
      showToast('An error occurred during two-factor authentication', 'error')
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
            <div className="flex justify-between mb-4">
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
                />
              ))}
            </div>
            <Button type="submit" className="w-full">Verify</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

