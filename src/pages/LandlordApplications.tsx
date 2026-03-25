import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Check, X, Eye, Loader2, User, Mail, Phone, MapPin, GraduationCap, Calendar } from 'lucide-react';

interface Application {
  id: string;
  listing_id: string;
  student_id: string;
  full_name: string;
  email: string;
  phone: string;
  age: number;
  sex: string;
  place_of_residence: string;
  school: string;
  about_me: string | null;
  status: string;
  landlord_notes: string | null;
  created_at: string;
  listing?: {
    title: string;
    address: string;
  };
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const LandlordApplications = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchApplications = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Fetch applications for landlord's listings
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('landlord_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch listing details for each application
      const appsWithListings = await Promise.all(
        (data || []).map(async (app) => {
          const { data: listing } = await supabase
            .from('listings')
            .select('title, address')
            .eq('id', app.listing_id)
            .single();
          return { ...app, listing: listing || undefined };
        })
      );

      setApplications(appsWithListings);
    } catch (error: any) {
      console.error('Error fetching applications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load applications.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [navigate, toast]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleViewApplication = (app: Application) => {
    setSelectedApp(app);
    setNotes(app.landlord_notes || '');
    setDialogOpen(true);
  };

  const handleUpdateStatus = async (status: 'approved' | 'rejected') => {
    if (!selectedApp) return;
    
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('applications')
        .update({
          status,
          landlord_notes: notes || null,
        })
        .eq('id', selectedApp.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Application ${status}.`,
      });

      setDialogOpen(false);
      fetchApplications();
    } catch (error: any) {
      console.error('Error updating application:', error);
      toast({
        title: 'Error',
        description: 'Failed to update application.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Applications</h1>
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
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Student Applications</h1>

        {applications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No applications received yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {applications.map((app) => (
              <Card key={app.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{app.full_name}</CardTitle>
                      <CardDescription>
                        Applied for: {app.listing?.title || 'Unknown Listing'}
                      </CardDescription>
                    </div>
                    <Badge className={statusColors[app.status] || ''}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {app.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {app.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" />
                      {app.school}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(app.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewApplication(app)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    {app.status === 'pending' && (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            setSelectedApp(app);
                            setNotes('');
                            handleUpdateStatus('approved');
                          }}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedApp(app);
                            setNotes('');
                            handleUpdateStatus('rejected');
                          }}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />

      {/* Application Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Review the student's application
            </DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Full Name</Label>
                  <p className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {selectedApp.full_name}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Age & Sex</Label>
                  <p>{selectedApp.age} years old, {selectedApp.sex}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Email</Label>
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {selectedApp.email}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Phone</Label>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {selectedApp.phone}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Current Residence</Label>
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {selectedApp.place_of_residence}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">School</Label>
                  <p className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    {selectedApp.school}
                  </p>
                </div>
              </div>

              {selectedApp.about_me && (
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">About</Label>
                  <p className="text-sm bg-muted p-3 rounded-md">{selectedApp.about_me}</p>
                </div>
              )}

              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">Applied On</Label>
                <p>{new Date(selectedApp.created_at).toLocaleString()}</p>
              </div>

              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">Status</Label>
                <Badge className={statusColors[selectedApp.status] || ''}>
                  {selectedApp.status.charAt(0).toUpperCase() + selectedApp.status.slice(1)}
                </Badge>
              </div>

              {selectedApp.status === 'pending' && (
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes about this application..."
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {selectedApp?.status === 'pending' ? (
              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleUpdateStatus('rejected')}
                  disabled={processing}
                >
                  {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-1" />}
                  Reject
                </Button>
                <Button
                  onClick={() => handleUpdateStatus('approved')}
                  disabled={processing}
                >
                  {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
                  Approve
                </Button>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LandlordApplications;
