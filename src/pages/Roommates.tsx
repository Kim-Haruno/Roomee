import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { RoommateCard } from '@/components/roommates/RoommateCard';
import { RoommateProfileForm } from '@/components/roommates/RoommateProfileForm';
import { useRoommates, type RoommateFilters } from '@/hooks/useRoommates';
import { useChat } from '@/hooks/useChat';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Search, Filter, Plus, Edit, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const Roommates = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [profileFormOpen, setProfileFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filters, setFilters] = useState<RoommateFilters>({});
  const [searchCity, setSearchCity] = useState('');

  const {
    profiles,
    myProfile,
    loading,
    fetchProfiles,
    createOrUpdateProfile,
    deleteMyProfile,
  } = useRoommates();

  const { startConversation } = useChat();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkAuth();
  }, []);

  const handleSearch = () => {
    fetchProfiles({ ...filters, city: searchCity || undefined });
  };

  const handleMessage = async (userId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    const conversationId = await startConversation(userId);
    if (conversationId) {
      navigate('/messages');
    }
  };

  const handleDeleteProfile = async () => {
    await deleteMyProfile();
    setDeleteDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8 text-primary" />
              Find Roommates
            </h1>
            <p className="text-muted-foreground mt-1">
              Connect with compatible students looking for roommates
            </p>
          </div>
          <div className="flex gap-2">
            {user && (
              myProfile ? (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setProfileFormOpen(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit My Profile
                  </Button>
                  <Button variant="outline" onClick={() => setDeleteDialogOpen(true)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setProfileFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Roommate Profile
                </Button>
              )
            )}
          </div>
        </div>

        {/* Search & Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by city..."
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button onClick={handleSearch}>Search</Button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label>Min Budget</Label>
                  <Input
                    type="number"
                    placeholder="R0"
                    value={filters.budgetMin || ''}
                    onChange={(e) =>
                      setFilters({ ...filters, budgetMin: e.target.value ? parseInt(e.target.value) : undefined })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Budget</Label>
                  <Input
                    type="number"
                    placeholder="R50 000"
                    value={filters.budgetMax || ''}
                    onChange={(e) =>
                      setFilters({ ...filters, budgetMax: e.target.value ? parseInt(e.target.value) : undefined })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Smoking</Label>
                  <Select
                    value={filters.smoking || 'all'}
                    onValueChange={(v) => setFilters({ ...filters, smoking: v === 'all' ? undefined : v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any</SelectItem>
                      <SelectItem value="no">Non-smoker</SelectItem>
                      <SelectItem value="yes">Smoker</SelectItem>
                      <SelectItem value="outside_only">Outside only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Pets</Label>
                  <Select
                    value={filters.pets || 'all'}
                    onValueChange={(v) => setFilters({ ...filters, pets: v === 'all' ? undefined : v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any</SelectItem>
                      <SelectItem value="no_pets">No pets</SelectItem>
                      <SelectItem value="has_pets">Has pets</SelectItem>
                      <SelectItem value="pets_welcome">Pets welcome</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Noise Level</Label>
                  <Select
                    value={filters.noiseLevel || 'all'}
                    onValueChange={(v) => setFilters({ ...filters, noiseLevel: v === 'all' ? undefined : v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any</SelectItem>
                      <SelectItem value="quiet">Quiet</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cleanliness</Label>
                  <Select
                    value={filters.cleanliness || 'all'}
                    onValueChange={(v) => setFilters({ ...filters, cleanliness: v === 'all' ? undefined : v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any</SelectItem>
                      <SelectItem value="very_tidy">Very tidy</SelectItem>
                      <SelectItem value="tidy">Tidy</SelectItem>
                      <SelectItem value="relaxed">Relaxed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Sleep Schedule</Label>
                  <Select
                    value={filters.sleepSchedule || 'all'}
                    onValueChange={(v) => setFilters({ ...filters, sleepSchedule: v === 'all' ? undefined : v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any</SelectItem>
                      <SelectItem value="early_bird">Early bird</SelectItem>
                      <SelectItem value="night_owl">Night owl</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setFilters({});
                      setSearchCity('');
                      fetchProfiles();
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        ) : profiles.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No roommates found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or be the first to create a profile!
              </p>
              {user && !myProfile && (
                <Button onClick={() => setProfileFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your Profile
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <RoommateCard
                key={profile.id}
                profile={profile}
                onMessage={handleMessage}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* Profile Form */}
      <RoommateProfileForm
        open={profileFormOpen}
        onOpenChange={setProfileFormOpen}
        profile={myProfile}
        onSave={createOrUpdateProfile}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Roommate Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your roommate profile? This will remove your listing from search results.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProfile} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Roommates;
