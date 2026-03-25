import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { UserApplicationsTable } from '@/components/admin/UserApplicationsTable';
import { ListingsTable } from '@/components/admin/ListingsTable';
import { ApplicationsTable } from '@/components/admin/ApplicationsTable';
import { RoommateProfilesTable } from '@/components/admin/RoommateProfilesTable';
import { useAdmin } from '@/hooks/useAdmin';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, Users, Home, Search, BarChart3, FileText, UserSearch } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const {
    isAdmin,
    loading,
    users,
    listings,
    applications,
    roommateProfiles,
    adminUserIds,
    fetchUsers,
    fetchListings,
    fetchApplications,
    fetchRoommateProfiles,
    updateUserStatus,
    updateListingStatus,
    updateApplicationNotes,
    deleteListing,
    deleteRoommateProfile,
    toggleAdminRole,
  } = useAdmin();

  const [userFilter, setUserFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [listingFilter, setListingFilter] = useState('all');
  const [listingSearch, setListingSearch] = useState('');
  const [appFilter, setAppFilter] = useState('all');
  const [appSearch, setAppSearch] = useState('');
  const [roommateSearch, setRoommateSearch] = useState('');
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserEmail(data.user?.email ?? null);
    });
  }, []);

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/');
    }
  }, [loading, isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchListings();
      fetchApplications();
      fetchRoommateProfiles();
    }
  }, [isAdmin, fetchUsers, fetchListings, fetchApplications, fetchRoommateProfiles]);

  const filteredUsers = users.filter((user) => {
    const matchesFilter = userFilter === 'all' || user.application_status === userFilter;
    const matchesSearch =
      user.full_name.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredListings = listings.filter((listing) => {
    const matchesFilter = listingFilter === 'all' || listing.status === listingFilter;
    const matchesSearch =
      listing.title.toLowerCase().includes(listingSearch.toLowerCase()) ||
      listing.city.toLowerCase().includes(listingSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredApplications = applications.filter((app) => {
    const matchesFilter = appFilter === 'all' || app.status === appFilter;
    const matchesSearch =
      app.full_name.toLowerCase().includes(appSearch.toLowerCase()) ||
      app.email.toLowerCase().includes(appSearch.toLowerCase()) ||
      app.listing?.title?.toLowerCase().includes(appSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredRoommates = roommateProfiles.filter((p) => {
    const name = p.user?.full_name || '';
    const email = p.user?.email || '';
    const city = p.preferred_city || '';
    return (
      name.toLowerCase().includes(roommateSearch.toLowerCase()) ||
      email.toLowerCase().includes(roommateSearch.toLowerCase()) ||
      city.toLowerCase().includes(roommateSearch.toLowerCase())
    );
  });

  // Stats
  const pendingUsers = users.filter((u) => u.application_status === 'pending').length;
  const pendingListings = listings.filter((l) => l.status === 'pending').length;
  const pendingApplications = applications.filter((a) => a.status === 'pending').length;
  const totalUsers = users.length;
  const totalListings = listings.length;
  const totalApplications = applications.length;
  const totalRoommates = roommateProfiles.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 mt-16">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage user applications and property listings
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingUsers}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Listings</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingListings}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalListings}</div>
              <p className="text-xs text-muted-foreground">All properties</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingApplications}</div>
              <p className="text-xs text-muted-foreground">of {totalApplications} total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Roommate Profiles</CardTitle>
              <UserSearch className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRoommates}</div>
              <p className="text-xs text-muted-foreground">Active profiles</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              User Applications
            </TabsTrigger>
            <TabsTrigger value="listings">
              <Home className="h-4 w-4 mr-2" />
              Property Listings
            </TabsTrigger>
            <TabsTrigger value="applications">
              <FileText className="h-4 w-4 mr-2" />
              Rental Applications
            </TabsTrigger>
            <TabsTrigger value="roommates">
              <UserSearch className="h-4 w-4 mr-2" />
              Roommate Profiles
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Applications</CardTitle>
                <CardDescription>
                  Review and manage student and landlord applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={userFilter} onValueChange={setUserFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="more_info_needed">More Info Needed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={fetchUsers}>
                    Refresh
                  </Button>
                </div>
                <UserApplicationsTable
                  users={filteredUsers}
                  adminUserIds={adminUserIds}
                  currentUserEmail={currentUserEmail}
                  onUpdateStatus={updateUserStatus}
                  onToggleAdmin={toggleAdminRole}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="listings">
            <Card>
              <CardHeader>
                <CardTitle>Property Listings</CardTitle>
                <CardDescription>
                  Review and manage property listings from landlords
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by title or city..."
                      value={listingSearch}
                      onChange={(e) => setListingSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={listingFilter} onValueChange={setListingFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="more_info_needed">More Info Needed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={fetchListings}>
                    Refresh
                  </Button>
                </div>
                <ListingsTable
                  listings={filteredListings}
                  onUpdateStatus={updateListingStatus}
                  onDelete={deleteListing}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>Rental Applications</CardTitle>
                <CardDescription>
                  View all student applications for listings across the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by student, email, or listing..."
                      value={appSearch}
                      onChange={(e) => setAppSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={appFilter} onValueChange={setAppFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={fetchApplications}>
                    Refresh
                  </Button>
                </div>
                <ApplicationsTable
                  applications={filteredApplications}
                  onUpdateNotes={updateApplicationNotes}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roommates">
            <Card>
              <CardHeader>
                <CardTitle>Roommate Profiles</CardTitle>
                <CardDescription>
                  Review roommate profiles for potential scams — no approval needed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, email, or city..."
                      value={roommateSearch}
                      onChange={(e) => setRoommateSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" onClick={fetchRoommateProfiles}>
                    Refresh
                  </Button>
                </div>
                <RoommateProfilesTable
                  profiles={filteredRoommates}
                  onDelete={deleteRoommateProfile}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
