/**
 * ============================================
 * AUTHENTICATION PAGE
 * ============================================
 * 
 * Handles user sign-in, sign-up, and password reset.
 * 
 * Features:
 * - Email/password authentication
 * - Role selection (student/landlord)
 * - Institution selection for students (SA universities, TVET, private colleges)
 * - Password reset via email
 * 
 * To customize:
 * - Edit APP_NAME in src/config/appConfig.ts to change branding
 * - Edit institution lists in src/config/appConfig.ts
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { InstitutionSelect } from '@/components/InstitutionSelect';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Home, Loader2, ArrowLeft } from 'lucide-react';
import { APP_NAME } from '@/config/appConfig';

// ============================================
// MAIN AUTH COMPONENT
// ============================================

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'signin');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // ========================================
  // SIGN IN FORM STATE
  // ========================================
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // ========================================
  // FORGOT PASSWORD FORM STATE
  // ========================================
  const [resetEmail, setResetEmail] = useState('');

  // ========================================
  // SIGN UP FORM STATE
  // ========================================
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<string>('');
  const [university, setUniversity] = useState(''); // Stores institution name
  const [stayDuration, setStayDuration] = useState('');
  const [phone, setPhone] = useState('');

  // ========================================
  // REDIRECT IF ALREADY LOGGED IN
  // ========================================
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    checkSession();
  }, [navigate]);

  // ========================================
  // SIGN IN HANDLER
  // ========================================
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: signInEmail,
        password: signInPassword,
      });

      if (error) throw error;

      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // FORGOT PASSWORD HANDLER
  // ========================================
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: 'Reset link sent!',
        description: 'Check your email for the password reset link.',
      });
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // SIGN UP HANDLER
  // ========================================
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password match
    if (signUpPassword !== signUpConfirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    // Validate role selection
    if (!role) {
      toast({
        title: 'Error',
        description: 'Please select your role',
        variant: 'destructive',
      });
      return;
    }

    // Validate phone number
    if (!phone.trim()) {
      toast({
        title: 'Error',
        description: 'Phone number is required',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Create account with user metadata
      const { error } = await supabase.auth.signUp({
        email: signUpEmail,
        password: signUpPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
            role: role,
            // Only include institution data for students
            university: role === 'student' ? university : null,
            stay_duration: role === 'student' ? stayDuration : null,
            phone: phone,
          },
        },
      });

      if (error) throw error;

      toast({
        title: 'Check your email!',
        description: 'We sent you a confirmation link. Please verify your email to complete registration.',
      });
      setActiveTab('signin');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // RENDER COMPONENT
  // ========================================
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Main content area - centered card */}
      <main className="container mx-auto px-4 py-8 mt-16 flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md">
          {/* Card Header with logo and title */}
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Home className="h-10 w-10 text-primary" />
            </div>
            <CardTitle>
              {/* Dynamic title based on current view */}
              {showForgotPassword ? 'Reset Password' : `Welcome to ${APP_NAME}`}
            </CardTitle>
            <CardDescription>
              {showForgotPassword
                ? 'Enter your email to receive a password reset link'
                : 'Sign in to your account or create a new one'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Conditional render: Forgot Password or Sign In/Up tabs */}
            {showForgotPassword ? (
              // ==============================
              // FORGOT PASSWORD FORM
              // ==============================
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Reset Link
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setShowForgotPassword(false)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Sign In
                </Button>
              </form>
            ) : (
              // ==============================
              // SIGN IN / SIGN UP TABS
              // ==============================
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                {/* ========================
                    SIGN IN TAB
                    ======================== */}
                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sign In
                    </Button>
                    {/* Forgot password link */}
                    <Button
                      type="button"
                      variant="link"
                      className="w-full text-muted-foreground"
                      onClick={() => setShowForgotPassword(true)}
                    >
                      Forgot your password?
                    </Button>
                  </form>
                </TabsContent>

                {/* ========================
                    SIGN UP TAB
                    ======================== */}
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label htmlFor="fullname">Full Name</Label>
                      <Input
                        id="fullname"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        required
                      />
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g., 0821234567"
                        required
                      />
                    </div>

                    {/* Role Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="role">I am a</Label>
                      <Select value={role} onValueChange={setRole}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="landlord">Landlord</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Student-specific fields - only shown when role is "student" */}
                    {role === 'student' && (
                      <>
                        {/* Institution Selection - uses InstitutionSelect component */}
                        <InstitutionSelect
                          value={university}
                          onChange={setUniversity}
                          label="Institution"
                          placeholder="Select your institution"
                          required
                        />

                        {/* Stay Duration */}
                        <div className="space-y-2">
                          <Label htmlFor="stay-duration">Intended Stay Duration</Label>
                          <Select value={stayDuration} onValueChange={setStayDuration}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1-semester">1 Semester</SelectItem>
                              <SelectItem value="2-semesters">2 Semesters</SelectItem>
                              <SelectItem value="1-year">1 Year</SelectItem>
                              <SelectItem value="2-years">2 Years</SelectItem>
                              <SelectItem value="3-years">3 Years</SelectItem>
                              <SelectItem value="4-years">4+ Years</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}

                    {/* Password */}
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        required
                      />
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={signUpConfirmPassword}
                        onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                        required
                      />
                    </div>

                    {/* Submit Button */}
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Account
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Auth;
