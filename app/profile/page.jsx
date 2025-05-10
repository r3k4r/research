'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  AlertTriangle,
  Loader2,
  User,
  Mail,
  Phone,
  MapPin,
  Edit,
  Save,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const UserProfile = () => {
  const router = useRouter();
  const { data: session, update } = useSession();
  const { showToast, ToastComponent } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [emailVerificationNeeded, setEmailVerificationNeeded] = useState(false);
  const [sendingPasswordReset, setSendingPasswordReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailChanged, setEmailChanged] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    location: '',
    phoneNumber: '',
    gender: '',
    image: '',
    password: '',
    confirmPassword: ''
  });

  // Stores the original form data to detect changes
  const [originalData, setOriginalData] = useState({});
  
  const dataFetched = useRef(false);

  // Add cities array for the dropdown
  const cities = ['Sulaimaniyah', 'Hawler', 'Duhok', 'Kerkuk'];

  useEffect(() => {
    const fetchProfile = async () => {
      if (dataFetched.current || !session?.user) {
        return;
      }
      
      try {
        setLoading(true);
        const response = await fetch('/api/profile');
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        
        const data = await response.json();
        setCurrentUser(data);
        
        setFormData({
          name: data.name || '',
          email: data.user.email || '',
          location: data.location || '',
          phoneNumber: data.phoneNumber || '',
          gender: data.gender || '',
          image: data.image || '',
          password: '',
          confirmPassword: ''
        });

        // Store original data for comparison
        setOriginalData({
          name: data.name || '',
          email: data.user.email || '',
          location: data.location || '',
          phoneNumber: data.phoneNumber || '',
          gender: data.gender || '',
          image: data.image || '',
        });
        
        setEmailVerificationNeeded(!data.user.emailVerified);
        
        dataFetched.current = true;
      } catch (error) {
        console.error('Error fetching profile:', error);
        showToast('Failed to load profile. Please try again.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session, showToast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Track if email has changed
    if (name === 'email' && value !== originalData.email) {
      setEmailChanged(true);
    } else if (name === 'email' && value === originalData.email) {
      setEmailChanged(false);
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Password validation
    if (formData.password) {
      if (formData.password !== formData.confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
      }
      
      // Password strength validation
      const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        showToast('Password must be at least 8 characters with one uppercase, one number, and one special character', 'error');
        return;
      }
    }
    
    try {
      setSaving(true);
      
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: emailChanged ? formData.email : undefined,
          location: formData.location,
          phoneNumber: formData.phoneNumber,
          gender: formData.gender,
          image: formData.image,
          password: formData.password || undefined
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profile');
      }
      
      showToast('Profile updated successfully', 'success');
      
      // Check if verification is needed
      if (result.verificationNeeded) {
        setEmailVerificationNeeded(true);
        
        // Send them to verification page if email was changed
        if (emailChanged) {
          router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
          return;
        }
      }
      
      // Update the session with the new name if it changed
      if (session && formData.name !== originalData.name) {
        await update({
          ...session,
          user: {
            ...session.user,
            name: formData.name,
          },
        });
      }
      
      // Exit edit mode after successful update
      setEditMode(false);
      
      // Update original data with the new values
      setOriginalData({
        ...originalData,
        name: formData.name,
        email: emailChanged ? formData.email : originalData.email,
        location: formData.location,
        phoneNumber: formData.phoneNumber,
        gender: formData.gender,
        image: formData.image,
      });
      
      // Clear passwords
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
      
      // Reset email changed flag
      setEmailChanged(false);
      
    } catch (error) {
      console.error('Error saving profile:', error);
      showToast(error.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSendVerification = async () => {
    try {
      setSendingVerification(true);
      const response = await fetch('/api/profile/send-verification', {
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
      
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
      
    } catch (error) {
      console.error('Error sending verification:', error);
      showToast(error.message || 'Failed to send verification email', 'error');
    } finally {
      setSendingVerification(false);
    }
  };

  const handleSendPasswordReset = async () => {
    try {
      setSendingPasswordReset(true);
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send password reset email');
      }
      
      showToast('Password reset email sent. Please check your inbox.', 'success');
      
    } catch (error) {
      console.error('Error sending password reset:', error);
      showToast(error.message || 'Failed to send password reset email', 'error');
    } finally {
      setSendingPasswordReset(false);
    }
  };

  const toggleEditMode = () => {
    if (editMode) {
      // Discard changes when exiting edit mode
      setFormData({
        ...originalData,
        password: '',
        confirmPassword: ''
      });
      setEmailChanged(false);
    }
    setEditMode(!editMode);
  };
  
  // Get user initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-6 space-y-8 px-4">
      {ToastComponent}
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <Button 
          variant={editMode ? "outline" : "default"}
          onClick={toggleEditMode}
        >
          {editMode ? (
            <>Cancel</>
          ) : (
            <>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </>
          )}
        </Button>
      </div>
      
      {/* Email verification warning */}
      {emailVerificationNeeded && (
        <Card className="border-yellow-300 bg-yellow-50/50">
          <CardContent className="pt-6 pb-6">
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
                    disabled={sendingVerification}
                    className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                  >
                    {sendingVerification ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send verification email'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Warning for email change */}
      {emailChanged && (
        <Card className="border-amber-300 bg-amber-50/50 mb-4">
          <CardContent className="py-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="ml-3">
                <p className="text-sm text-amber-700 font-medium">
                  You are changing your email address
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  After saving, you will need to verify your new email address before you can use it to sign in.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture Section */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-background shadow-lg bg-muted">
              {formData.image ? (
                <Image
                  src={formData.image}
                  alt="Profile Picture"
                  fill
                  className="object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className={`absolute inset-0 flex items-center justify-center text-3xl font-semibold bg-gray-200 text-gray-700 ${formData.image ? 'hidden' : ''}`}
              >
                {getInitials(formData.name)}
              </div>
            </div>

            {editMode && (
              <div className="mt-4 w-full max-w-xs">
                <Label htmlFor="image-url" className="text-sm mb-1 block">
                  Profile Picture URL
                </Label>
                <Input
                  id="image-url"
                  name="image"
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  value={formData.image || ''}
                  onChange={handleChange}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave blank to use initials avatar
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Personal Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!editMode || saving}
                  className={!editMode ? "bg-muted" : ""}
                />
              </div>
              
              {/* Email - Editable in edit mode */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                  {emailVerificationNeeded && !emailChanged && (
                    <span className="ml-1 text-yellow-600 text-xs">
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
                  disabled={!editMode || saving}
                  className={emailChanged ? "border-amber-300 focus:border-amber-500" : !editMode ? "bg-muted" : ""}
                />
                {editMode && (
                  <p className="text-xs text-muted-foreground">
                    Changing your email will require verification
                  </p>
                )}
              </div>
              
              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />Phone Number
                </Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="text"
                  value={formData.phoneNumber || ''}
                  onChange={handleChange}
                  disabled={!editMode || saving}
                  className={!editMode ? "bg-muted" : ""}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              
              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />City
                </Label>
                {editMode ? (
                  <Select
                    value={formData.location || ''}
                    onValueChange={(value) => handleSelectChange('location', value)}
                    disabled={saving}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="location"
                    type="text"
                    value={formData.location || 'Not specified'}
                    disabled={true}
                    className="bg-muted"
                  />
                )}
              </div>
              
              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender" className="flex items-center gap-2">
                  <User className="h-4 w-4" />Gender
                </Label>
                {editMode ? (
                  <Select
                    value={formData.gender || ''}
                    onValueChange={(value) => handleSelectChange('gender', value)}
                    disabled={saving}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="gender"
                    type="text"
                    value={formData.gender || 'Not specified'}
                    disabled={true}
                    className="bg-muted"
                  />
                )}
              </div>

              {/* Password field - only shows in edit mode */}
              {editMode && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Key className="h-4 w-4" />Password (leave blank to keep current)
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      disabled={saving}
                      placeholder="New password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      tabIndex="-1"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Must have 8+ characters with uppercase, number, and special character
                  </p>
                </div>
              )}

              {/* Confirm Password field - only shows in edit mode */}
              {editMode && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={saving}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          
          {/* Security Options - only visible when not in edit mode */}
          {!editMode && (
            <>
              <CardHeader className="border-t">
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage your account security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Password Reset */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="flex items-center gap-2">
                      <Key className="h-4 w-4" />Password
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSendPasswordReset}
                      disabled={sendingPasswordReset}
                    >
                      {sendingPasswordReset ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Reset Password'
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You'll receive an email with instructions to reset your password.
                  </p>
                </div>
                
                {/* Email Verification - only show if email is not verified and not changing email */}
                {emailVerificationNeeded && !emailChanged && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />Verify Email
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleSendVerification}
                        disabled={sendingVerification}
                      >
                        {sendingVerification ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          'Verify Email'
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Verify your email address to ensure account security.
                    </p>
                  </div>
                )}
              </CardContent>
            </>
          )}
          
          {/* Save Button - Only show in edit mode */}
          {editMode && (
            <CardFooter className="flex justify-end border-t pt-6">
              <Button
                type="submit"
                disabled={saving || 
                  (
                    formData.name === originalData.name && 
                    formData.email === originalData.email &&
                    formData.phoneNumber === originalData.phoneNumber && 
                    formData.location === originalData.location &&
                    formData.gender === originalData.gender &&
                    formData.image === originalData.image &&
                    !formData.password
                  )
                }
                className="flex items-center"
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {saving ? 'Saving...' : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          )}
        </Card>
      </form>
    </div>
  );
};

export default UserProfile;