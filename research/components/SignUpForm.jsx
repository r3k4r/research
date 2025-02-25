'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { z } from 'zod'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Eye, EyeOff } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

const cities = ['Sulaimaniyah', 'Hawler', 'Duhok', 'Kerkuk']

const signUpSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  city: z.enum(cities, { required_error: "Please select a city" }),
  phoneNumber: z.string().regex(/^\d{11}$/, "Phone number must be 11 digits"),
  gender: z.enum(['male', 'female'], { required_error: "Please select a gender" }),
})

export default function SignUpForm() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    city: '',
    phoneNumber: '',
    gender: '',
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

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateStep = () => {
    let schemaToValidate
    switch(step) {
      case 1:
        schemaToValidate = signUpSchema.pick({ name: true, email: true, password: true })
        break
      case 2:
        schemaToValidate = signUpSchema.pick({ city: true, phoneNumber: true, gender: true })
        break
      default:
        return true
    }

    try {
      schemaToValidate.parse(formData)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(error.flatten().fieldErrors)
      }
      return false
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateStep()) return

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        showToast('Account created successfully!', 'success')
        // Redirect to email verification page
        router.push(`/verify-email?email=${formData.email}`)
      } else {
        const data = await response.json()
        showToast(data.error, 'error')
      }
    } catch (error) {
      showToast('An error occurred during signup', 'error')
    }
  }

  const nextStep = () => {
    if (validateStep()) {
      setStep(prev => prev + 1)
    }
  }

  const prevStep = () => setStep(prev => prev - 1)

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={errors.name ? "border-red-500 focus:ring-red-500" : ""}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1 transition-all duration-300 ease-in-out">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
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
          </>
        )
      case 2:
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Select name="city" onValueChange={(value) => handleSelectChange('city', value)}>
                <SelectTrigger className={errors.city ? "border-red-500 focus:ring-red-500" : ""}>
                  <SelectValue placeholder="Select a city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.city && <p className="text-red-500 text-sm mt-1 transition-all duration-300 ease-in-out">{errors.city}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
                  +964
                </span>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={`rounded-l-none ${errors.phoneNumber ? "border-red-500 focus:ring-red-500" : ""}`}
                  placeholder="XXXXXXXXXXX"
                  maxLength={11}
                />
              </div>
              {errors.phoneNumber && <p className="text-red-500 text-sm mt-1 transition-all duration-300 ease-in-out">{errors.phoneNumber}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select name="gender" onValueChange={(value) => handleSelectChange('gender', value)}>
                <SelectTrigger className={errors.gender ? "border-red-500 focus:ring-red-500" : ""}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && <p className="text-red-500 text-sm mt-1 transition-all duration-300 ease-in-out">{errors.gender}</p>}
            </div>
          </>
        )
      default:
        return null
    }
  }

  return (
    <>
      {ToastComponent}
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className='flex flex-col items-start gap-2 justify-start'>
              <CardTitle>Sign Up for Second Serve</CardTitle>
              <CardDescription>Lets create your account in 2 easy steps</CardDescription>
            </div>
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              Logo
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-8">
            {[1, 2].map((num) => (
              <div key={num} className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold transition-all duration-300 ${
                  step >= num 
                    ? 'bg-black text-white scale-110' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > num ? '✓' : num}
                </div>
                <span className="mt-2 text-sm text-gray-600">
                  {num === 1 ? 'Account' : 'Details'}
                </span>
              </div>
            ))}
          </div>
          <Progress value={(step / 2) * 100} className="mb-8" />
          <form onSubmit={handleSubmit} className="space-y-4">
            {renderStep()}
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          {step > 1 && (
            <Button type="button" onClick={prevStep} variant="outline">
              Previous
            </Button>
          )}
          {step < 2 ? (
            <Button type="button" onClick={nextStep}>
              Next
            </Button>
          ) : (
            <Button type="submit" onClick={handleSubmit}>
              Submit
            </Button>
          )}
        </CardFooter>
        <div className="px-6 pb-6">
          <Button variant="outline" onClick={() => signIn('google', { callbackUrl: '/' })} className="w-full mb-4">
            Continue with Google
          </Button>
          <div className="text-center">
            Already have an account? <Link href="/signin" className="text-blue-500 hover:underline">Sign in</Link>
          </div>
        </div>
      </Card>
    </>
  )
}

