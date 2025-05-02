'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  AlertCircle, 
  CheckCircle, 
  Mail, 
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter 
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';

const Settings = () => {
  const { data: session, update } = useSession();
  const { showToast, ToastComponent } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [emailVerificationNeeded, setEmailVerificationNeeded] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    businessName: '',
    description: '',
    address: '',
    phoneNumber: '',
    businessHours: '',
    logo: '',
  });

  // Fetch provider profile data
  useEffect(() => {
    const fetchSettings = async () => {
      if (!session?.user) return;
      
      try {
        setLoading(true);
        const response = await fetch('/api/provider/settings');
        
        if (!response.ok) {
          throw new Error('Failed to fetch settings');
        }
        
        const data = await response.json();
        
        setFormData({
          name: data.name || '',
          email: data.user.email || '',
          businessName: data.businessName || '',
          description: data.description || '',
          address: data.address || '',
          phoneNumber: data.phoneNumber || '',
          businessHours: data.businessHours || '',
          logo: data.logo || '',
        });
        
        setEmailVerificationNeeded(!data.user.emailVerified);
      } catch (error) {
        console.error('Error fetching settings:', error);
        showToast('Failed to load settings. Please try again.', 'error');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch settings if session is loaded
    if (session?.user) {
      fetchSettings();
    }
  }, [session]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      const response = await fetch('/api/provider/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          businessName: formData.businessName,
          description: formData.description,
          address: formData.address,
          businessHours: formData.businessHours,
          logo: formData.logo
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update settings');
      }
      
      // If email was updated and needs verification
      if (result.emailUpdated && result.verificationNeeded) {
        setEmailVerificationNeeded(true);
      }
      
      showToast('Settings updated successfully', 'success');
      
      // Update session to reflect changes without triggering a reload
      await update({
        ...session,
        user: {
          ...session.user,
          name: formData.name,
          email: formData.email,
        },
      });
      
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast(error.message || 'Failed to update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Send email verification
  const handleSendVerification = async () => {
    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification email');
      }
      
      showToast('Verification email sent. Please check your inbox.', 'success');
    } catch (error) {
      console.error('Error sending verification:', error);
      showToast(error.message || 'Failed to send verification email', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-6 space-y-8">
      {ToastComponent}
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Account Settings</h1>
      </div>
      
      {/* Email verification warning */}
      {emailVerificationNeeded && (
        <Card className="border-yellow-300 bg-yellow-50/50">
          <CardContent className="pt-6">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Your email is not verified. Please verify your email to ensure full account access.
                </p>
                <div className="mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSendVerification}
                    className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                  >
                    Send verification email
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information Section */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address
                  {emailVerificationNeeded && (
                    <span className="ml-2 text-yellow-600 text-xs">
                      (Unverified)
                    </span>
                  )}
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={emailVerificationNeeded ? "border-yellow-300" : ""}
                />
                {emailVerificationNeeded && (
                  <p className="text-xs text-muted-foreground">
                    Please verify this email address to ensure full account access.
                  </p>
                )}
              </div>
              
              {/* Phone Number - Read-only */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="text"
                  value={formData.phoneNumber}
                  readOnly
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Contact support to update your phone number
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Business Information Section */}
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>Update your business details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Business Name */}
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  name="businessName"
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={handleChange}
                />
              </div>
              
              {/* Business Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Business Address</Label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  required
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
              
              {/* Business Hours */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="businessHours">Business Hours</Label>
                <Input
                  id="businessHours"
                  name="businessHours"
                  type="text"
                  placeholder="e.g., Mon-Fri: 9am-5pm, Sat: 10am-3pm"
                  value={formData.businessHours || ''}
                  onChange={handleChange}
                />
              </div>
              
              {/* Business Description */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Business Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows="4"
                  value={formData.description || ''}
                  onChange={handleChange}
                  placeholder="Describe your business to customers"
                />
              </div>
              
              {/* Logo URL */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="logo">Logo URL</Label>
                <Input
                  id="logo"
                  name="logo"
                  type="text"
                  value={formData.logo || ''}
                  onChange={handleChange}
                  placeholder="https://example.com/logo.jpg"
                />
                {formData.logo && (
                  <div className="mt-2 flex items-center">
                    <p className="text-sm text-muted-foreground mr-2">Current logo:</p>
                    <div className="relative h-16 w-16 rounded-md overflow-hidden border">
                      <Image
                        src={formData.logo}
                        alt="Business Logo"
                        fill
                        style={{ objectFit: "cover" }}
                        onError={(e) => {
                          e.target.src = "/placeholder-image.png";
                          e.target.onerror = null;
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              type="submit"
              disabled={saving}
              className="flex items-center"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default Settings;