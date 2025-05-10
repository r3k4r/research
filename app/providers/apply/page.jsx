"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  phone: z.string().min(10, { message: 'Valid phone number is required' }),
  businessName: z.string().min(2, { message: 'Business name is required' }),
  businessType: z.string().min(2, { message: 'Business type is required' }),
  businessYears: z.string().min(1, { message: 'Years in business is required' }),
  foodTypes: z.string().min(10, { message: 'Please describe the types of food you typically offer' }),
  reason: z.string().min(20, { message: 'Please provide your reason for joining' })
});

const ProviderApplyForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast, ToastComponent } = useToast();
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      businessName: '',
      businessType: '',
      businessYears: '',
      foodTypes: '',
      reason: ''
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/providers/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit application');
      }
      
      showToast("Thank you for your application! We will review it and get back to you soon.", "success");
      
      form.reset();
    } catch (error) {
      showToast(error.message || "There was a problem submitting your application. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      {ToastComponent}
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Food Provider Application</h1>
          <p className="text-muted-foreground">
            Join our network of restaurants, bakeries, and stores fighting food waste while offering great deals. Fill out the form below to apply.
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Tell us about your business</CardTitle>
            <CardDescription>
              Please provide accurate information to expedite your application process.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Person's Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Email</FormLabel>
                        <FormControl>
                          <Input placeholder="your@business.com" type="email" {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Delicious Foods Inc." {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="businessType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select business type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="restaurant">Restaurant</SelectItem>
                            <SelectItem value="bakery">Bakery</SelectItem>
                            <SelectItem value="cafe">Café</SelectItem>
                            <SelectItem value="grocery">Grocery Store</SelectItem>
                            <SelectItem value="supermarket">Supermarket</SelectItem>
                            <SelectItem value="deli">Delicatessen</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="businessYears"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years in Business</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select years in business" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0-1">Less than 1 year</SelectItem>
                            <SelectItem value="1-3">1-3 years</SelectItem>
                            <SelectItem value="3-5">3-5 years</SelectItem>
                            <SelectItem value="5-10">5-10 years</SelectItem>
                            <SelectItem value="10+">10+ years</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="foodTypes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Types of Food Offered</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the types of food your business typically offers..." 
                          className="min-h-[100px]" 
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Why do you want to join our food waste reduction platform?</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us why you'd like to join our network and how you think it will benefit your business..." 
                          className="min-h-[120px]" 
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full md:w-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProviderApplyForm;