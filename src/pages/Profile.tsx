/**
 * ============================================
 * USER PROFILE PAGE
 * ============================================
 * 
 * Displays and allows editing of user profile information.
 * Shows application status for account verification.
 * 
 * Features:
 * - Avatar upload
 * - Edit personal info (name, phone, institution)
 * - View application/verification status
 * - Admin notes display
 * 
 * To customize:
 * - Edit institution lists in src/config/appConfig.ts
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AvatarUpload } from '@/components/uploads/AvatarUpload';
import { InstitutionSelect } from '@/components/InstitutionSelect';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

// ============================================
// STATUS CONFIGURATION
// ============================================
// Maps application status to visual indicators
// Edit these to change status labels, colors, or icons

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  pending: { icon: Clock, color: 'text-yellow-600', label: 'Pending Review' },
  approved: { icon: CheckCircle, color: 'text-green-600', label: 'Approved' },
  rejected: { icon: XCircle, color: 'text-red-600', label: 'Rejected' },
  more_info_needed: { icon: AlertCircle, color: 'text-blue-600', label: 'More Info Needed' },
};

// ============================================
// MAIN PROFILE COMPONENT
// ============================================

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // User data
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  
  // Form data - editable fields
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    university: '', // Stores institution name
    stay_duration: '',
    avatar_url: '',
  });

  // ========================================
  // FETCH PROFILE ON MOUNT
  // ========================================
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Check if user is logged in
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/auth');
          return;
        }
        setUser(session.user);

        // Fetch profile data from database
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (error) throw error;

        // Populate form with existing data
        if (data) {
          setProfile(data);
          setFormData({
            full_name: data.full_name || '',
            phone: data.phone || '',
            university: data.university || '',
            stay_duration: data.stay_duration || '',
            avatar_url: data.avatar_url || '',
          });
        }
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to load profile',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, toast]);

  // ========================================
  // SAVE PROFILE CHANGES
  // ========================================
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          university: formData.university,
          stay_duration: formData.stay_duration,
          avatar_url: formData.avatar_url,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });

      // Refresh profile data
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) setProfile(data);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // HANDLE AVATAR UPLOAD
  // ========================================
  const handleAvatarUpload = (url: string) => {
    setFormData({ ...formData, avatar_url: url });
  };

  // ========================================
  // LOADING STATE
  // ========================================
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 mt-16 max-w-2xl">
          <Skeleton className="h-10 w-48 mb-8" />
          <Skeleton className="h-96" />
        </div>
        <Footer />
      </div>
    );
  }

  // Get status display info
  const status = statusConfig[profile?.application_status] || statusConfig.pending;
  const StatusIcon = status.icon;

  // ========================================
  // RENDER COMPONENT
  // ========================================
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 mt-16 max-w-2xl">
        {/* Page Title */}
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <User className="h-8 w-8 text-primary" />
          My Profile
        </h1>

        {/* Profile Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile Info</TabsTrigger>
            <TabsTrigger value="status">Application Status</TabsTrigger>
          </TabsList>

          {/* ========================
              PROFILE INFO TAB
              ======================== */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and profile photo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Upload Component */}
                <AvatarUpload
                  currentUrl={formData.avatar_url}
                  name={formData.full_name}
                  onUpload={handleAvatarUpload}
                />

                <div className="grid gap-4">
                  {/* Full Name Field */}
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    />
                  </div>

                  {/* Email Field (read-only) */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>

                  {/* Phone Number Field */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  {/* Student-specific fields */}
                  {profile?.role === 'student' && (
                    <>
                      {/* Institution Selection - using InstitutionSelect component */}
                      <InstitutionSelect
                        value={formData.university}
                        onChange={(value) => setFormData({ ...formData, university: value })}
                        label="Institution"
                        placeholder="Select your institution"
                      />

                      {/* Stay Duration Field */}
                      <div className="space-y-2">
                        <Label htmlFor="stay_duration">Intended Stay Duration</Label>
                        <Input
                          id="stay_duration"
                          value={formData.stay_duration}
                          onChange={(e) => setFormData({ ...formData, stay_duration: e.target.value })}
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ========================
              APPLICATION STATUS TAB
              ======================== */}
          <TabsContent value="status">
            <Card>
              <CardHeader>
                <CardTitle>Application Status</CardTitle>
                <CardDescription>
                  Track the status of your account verification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status Badge Display */}
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted">
                  <StatusIcon className={`h-8 w-8 ${status.color}`} />
                  <div>
                    <p className="font-medium">{status.label}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      Account type: {profile?.role}
                    </p>
                  </div>
                </div>

                {/* Admin Notes (if any) */}
                {profile?.admin_notes && (
                  <div className="p-4 rounded-lg border">
                    <p className="font-medium mb-2">Admin Notes:</p>
                    <p className="text-sm text-muted-foreground">{profile.admin_notes}</p>
                  </div>
                )}

                {/* Status Message */}
                <div className="text-sm text-muted-foreground">
                  <p>
                    {profile?.application_status === 'pending' && (
                      'Your application is being reviewed. This usually takes 1-2 business days.'
                    )}
                    {profile?.application_status === 'approved' && (
                      'Your account has been verified. You can now access all features.'
                    )}
                    {profile?.application_status === 'rejected' && (
                      'Your application was not approved. Please contact support for more information.'
                    )}
                    {profile?.application_status === 'more_info_needed' && (
                      'We need additional information to verify your account. Please check the admin notes above.'
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
