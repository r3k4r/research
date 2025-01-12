'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { z } from 'zod'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Eye, EyeOff } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export default function SignInForm() {  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { showToast, ToastComponent } = useToast()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      signInSchema.parse(formData)
      setErrors({})

      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        showToast('Invalid email or password', 'error')
      } else if (result?.url) {
        router.push(result.url)
      } else {
        showToast('Sign in successful!', 'success')
        setTimeout(() => router.push('/'), 2000)
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(error.flatten().fieldErrors)
      }
    }
  }

  return (
    <>
      {ToastComponent}
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sign In to Second Serve</CardTitle>
              <CardDescription>Enter your credentials to access your account</CardDescription>
            </div>
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              Logo
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                className={errors.email ? "border-red-500 focus:ring-red-500" : ""}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1 transition-all duration-300 ease-in-out">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={errors.password ? "border-red-500 focus:ring-red-500" : ""}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1 transition-all duration-300 ease-in-out">{errors.password}</p>}
            </div>
            <Button type="submit" className="w-full">Sign In</Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button variant="outline" onClick={() => signIn('google', { callbackUrl: '/' })} className="w-full">
            Sign in with Google
          </Button>
          <div className="text-center">
            Don't have an account? <Link href="/signup" className="text-blue-500 hover:underline">Sign up</Link>
          </div>
        </CardFooter>
      </Card>
    </>
  )
}

