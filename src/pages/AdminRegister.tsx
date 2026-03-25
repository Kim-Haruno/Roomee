import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield, Loader2 } from 'lucide-react';
import { APP_NAME } from '@/config/appConfig';

const AdminRegister = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (!urlToken) {
      toast({
        title: 'Access Denied',
        description: 'Missing admin registration token.',
        variant: 'destructive',
      });
      navigate('/');
    } else {
      setToken(urlToken);
    }
  }, [searchParams, navigate, toast]);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    checkSession();
  }, [navigate]);

  const handleAdminSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (!phone.trim()) {
      toast({
        title: 'Error',
        description: 'Phone number is required',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Call the edge function for server-side token validation
      const { data, error } = await supabase.functions.invoke('admin-register', {
        body: {
          token,
          email,
          password,
          fullName,
          phone,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to create admin account');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: 'Admin Account Created!',
        description: 'Your admin account has been created. You can now sign in.',
      });
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create admin account',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 mt-16 flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="h-10 w-10 text-primary" />
            </div>
            <CardTitle>Admin Registration</CardTitle>
            <CardDescription>
              Create an administrator account for {APP_NAME}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleAdminSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullname">Full Name</Label>
                <Input
                  id="fullname"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password (min 6 characters)"
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Admin Account
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default AdminRegister;
