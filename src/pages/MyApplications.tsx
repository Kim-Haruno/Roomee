import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Home, Calendar, MapPin, Clock } from 'lucide-react';

interface Application {
  id: string;
  listing_id: string;
  full_name: string;
  status: string;
  landlord_notes: string | null;
  created_at: string;
  listing?: {
    title: string;
    address: string;
    city: string;
    price: number;
  };
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const statusDescriptions: Record<string, string> = {
  pending: 'Your application is being reviewed by the landlord.',
  approved: 'Congratulations! Your application has been approved.',
  rejected: 'Unfortunately, your application was not accepted.',
};

const MyApplications = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Fetch student's applications
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch listing details for each application
      const appsWithListings = await Promise.all(
        (data || []).map(async (app) => {
          const { data: listing } = await supabase
            .from('listings')
            .select('title, address, city, price')
            .eq('id', app.listing_id)
            .maybeSingle();
          return { ...app, listing: listing || undefined };
        })
      );

      setApplications(appsWithListings);
    } catch (error: any) {
      console.error('Error fetching applications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your applications.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [navigate, toast]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 mt-16">
          <h1 className="text-3xl font-bold mb-8">My Applications</h1>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 mt-16">
        <h1 className="text-3xl font-bold mb-8">My Applications</h1>

        {applications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Home className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">You haven't submitted any applications yet.</p>
              <Button onClick={() => navigate('/listings')}>
                Browse Listings
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {applications.map((app) => (
              <Card key={app.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {app.listing?.title || 'Unknown Listing'}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {app.listing?.address}, {app.listing?.city}
                      </CardDescription>
                    </div>
                    <Badge className={statusColors[app.status] || ''}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {app.listing?.price && (
                      <p className="text-lg font-semibold text-primary">
                        ${app.listing.price.toLocaleString()}/month
                      </p>
                    )}
                    
                    <p className="text-sm text-muted-foreground">
                      {statusDescriptions[app.status]}
                    </p>

                    {app.status !== 'pending' && app.landlord_notes && (
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Landlord's Note:</p>
                        <p className="text-sm">{app.landlord_notes}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Applied on {new Date(app.created_at).toLocaleDateString()}
                      </span>
                      <Link to={`/listings/${app.listing_id}`}>
                        <Button variant="outline" size="sm">
                          View Listing
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MyApplications;
