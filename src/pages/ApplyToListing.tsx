import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface Listing {
  id: string;
  title: string;
  address: string;
  city: string;
  price: number;
  landlord_id: string;
  max_occupants: number;
  current_occupants: number;
}

const ApplyToListing = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    age: '',
    sex: '',
    placeOfResidence: '',
    school: '',
    aboutMe: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      // Check auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to apply for housing.',
          variant: 'destructive',
        });
        navigate('/auth');
        return;
      }
      setUser(user);

      // Fetch listing
      if (!id) return;
      
      const { data: listingData, error } = await supabase
        .from('listings')
        .select('id, title, address, city, price, landlord_id, max_occupants, current_occupants')
        .eq('id', id)
        .eq('status', 'approved')
        .single();

      if (error || !listingData) {
        toast({
          title: 'Error',
          description: 'Listing not found.',
          variant: 'destructive',
        });
        navigate('/listings');
        return;
      }

      setListing(listingData);

      // Pre-fill from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email, phone, university')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setFormData(prev => ({
          ...prev,
          fullName: profile.full_name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          school: profile.university || '',
        }));
      }

      setLoading(false);
    };

    fetchData();
  }, [id, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!listing || !user) return;

    // Check if housing is full
    if (listing.current_occupants >= listing.max_occupants) {
      toast({
        title: 'Housing Full',
        description: 'This housing has reached maximum occupancy.',
        variant: 'destructive',
      });
      return;
    }

    // Validate form
    if (!formData.fullName || !formData.email || !formData.phone || 
        !formData.age || !formData.sex || !formData.placeOfResidence || !formData.school) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      // Check for existing application
      const { data: existingApp } = await supabase
        .from('applications')
        .select('id')
        .eq('listing_id', listing.id)
        .eq('student_id', user.id)
        .maybeSingle();

      if (existingApp) {
        toast({
          title: 'Already Applied',
          description: 'You have already submitted an application for this listing.',
          variant: 'destructive',
        });
        setSubmitting(false);
        return;
      }

      // Submit application
      const { error } = await supabase
        .from('applications')
        .insert({
          listing_id: listing.id,
          student_id: user.id,
          landlord_id: listing.landlord_id,
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          age: parseInt(formData.age),
          sex: formData.sex,
          place_of_residence: formData.placeOfResidence,
          school: formData.school,
          about_me: formData.aboutMe || null,
        });

      if (error) throw error;

      toast({
        title: 'Application Submitted!',
        description: 'Your application has been sent to the landlord for review.',
      });

      navigate('/listings');
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit application. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!listing) {
    return null;
  }

  const isFull = listing.current_occupants >= listing.max_occupants;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(`/listings/${id}`)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Listing
        </Button>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Apply for Housing</CardTitle>
              <CardDescription>
                {listing.title} - {listing.address}, {listing.city}
                <br />
                <span className="text-primary font-semibold">R{listing.price}/month</span>
                {' • '}
                <span className={isFull ? 'text-destructive' : 'text-muted-foreground'}>
                  {listing.current_occupants}/{listing.max_occupants} occupants
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isFull ? (
                <div className="text-center py-8">
                  <p className="text-destructive font-medium">
                    This housing has reached maximum occupancy.
                  </p>
                  <p className="text-muted-foreground mt-2">
                    Please check other available listings.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age">Age *</Label>
                      <Input
                        id="age"
                        type="number"
                        min="16"
                        max="100"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sex">Sex *</Label>
                      <Select
                        value={formData.sex}
                        onValueChange={(value) => setFormData({ ...formData, sex: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select sex" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="placeOfResidence">Current Place of Residence *</Label>
                      <Input
                        id="placeOfResidence"
                        value={formData.placeOfResidence}
                        onChange={(e) => setFormData({ ...formData, placeOfResidence: e.target.value })}
                        placeholder="City, Province"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="school">School/University *</Label>
                    <Input
                      id="school"
                      value={formData.school}
                      onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="aboutMe">About Me</Label>
                    <Textarea
                      id="aboutMe"
                      value={formData.aboutMe}
                      onChange={(e) => setFormData({ ...formData, aboutMe: e.target.value })}
                      placeholder="Tell the landlord a bit about yourself, your lifestyle, and why you're looking for housing..."
                      rows={4}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Application'
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ApplyToListing;
