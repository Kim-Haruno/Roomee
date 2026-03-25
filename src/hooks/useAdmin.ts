import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserApplication {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  university: string | null;
  stay_duration: string | null;
  phone: string | null;
  application_status: string;
  admin_notes: string | null;
  created_at: string;
}

export interface Listing {
  id: string;
  landlord_id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  property_type: string;
  amenities: string[];
  images: string[];
  available_from: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  landlord?: {
    full_name: string;
    email: string;
  };
}

export interface Application {
  id: string;
  listing_id: string;
  student_id: string;
  landlord_id: string;
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
  admin_notes: string | null;
  created_at: string;
  listing?: {
    title: string;
    address: string;
    city: string;
  };
  landlord?: {
    full_name: string;
    email: string;
  };
}

export interface AdminRoommateProfile {
  id: string;
  user_id: string;
  bio: string | null;
  budget_min: number | null;
  budget_max: number | null;
  preferred_city: string | null;
  move_in_date: string | null;
  smoking: string | null;
  pets: string | null;
  noise_level: string | null;
  cleanliness: string | null;
  sleep_schedule: string | null;
  guests: string | null;
  interests: string[] | null;
  is_visible: boolean | null;
  created_at: string;
  user?: {
    full_name: string;
    avatar_url: string | null;
    email: string;
    university: string | null;
  };
}

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserApplication[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [roommateProfiles, setRoommateProfiles] = useState<AdminRoommateProfile[]>([]);
  const [adminUserIds, setAdminUserIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Check if current user is admin
  const checkAdminStatus = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) throw error;
      setIsAdmin(!!data);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch admin user IDs
  const fetchAdminUserIds = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (error) throw error;
      setAdminUserIds(new Set((data || []).map((r) => r.user_id)));
    } catch (error) {
      console.error('Error fetching admin roles:', error);
    }
  }, []);

  // Fetch all user applications
  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
      await fetchAdminUserIds();
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user applications',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Fetch all listings
  const fetchListings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch landlord profiles
      const listingsWithLandlords = await Promise.all(
        (data || []).map(async (listing) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('user_id', listing.landlord_id)
            .maybeSingle();
          return { ...listing, landlord: profile || undefined };
        })
      );

      setListings(listingsWithLandlords);
    } catch (error: any) {
      console.error('Error fetching listings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load listings',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Fetch all applications
  const fetchApplications = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch listing and landlord details for each application
      const appsWithDetails = await Promise.all(
        (data || []).map(async (app) => {
          const [listingResult, landlordResult] = await Promise.all([
            supabase
              .from('listings')
              .select('title, address, city')
              .eq('id', app.listing_id)
              .maybeSingle(),
            supabase
              .from('profiles')
              .select('full_name, email')
              .eq('user_id', app.landlord_id)
              .maybeSingle(),
          ]);
          return {
            ...app,
            listing: listingResult.data || undefined,
            landlord: landlordResult.data || undefined,
          };
        })
      );

      setApplications(appsWithDetails);
    } catch (error: any) {
      console.error('Error fetching applications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load applications',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Update application admin notes
  const updateApplicationNotes = useCallback(async (
    applicationId: string,
    notes: string
  ) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ admin_notes: notes || null })
        .eq('id', applicationId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Admin notes updated',
      });
      await fetchApplications();
    } catch (error: any) {
      console.error('Error updating application notes:', error);
      toast({
        title: 'Error',
        description: 'Failed to update notes',
        variant: 'destructive',
      });
    }
  }, [fetchApplications, toast]);

  // Update user application status
  const updateUserStatus = useCallback(async (
    userId: string,
    status: string,
    notes?: string
  ) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          application_status: status,
          admin_notes: notes || null,
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `User application ${status}`,
      });
      await fetchUsers();
    } catch (error: any) {
      console.error('Error updating user status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user status',
        variant: 'destructive',
      });
    }
  }, [fetchUsers, toast]);

  // Update listing status
  const updateListingStatus = useCallback(async (
    listingId: string,
    status: string,
    notes?: string
  ) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ 
          status,
          admin_notes: notes || null,
        })
        .eq('id', listingId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Listing ${status}`,
      });
      await fetchListings();
    } catch (error: any) {
      console.error('Error updating listing status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update listing status',
        variant: 'destructive',
      });
    }
  }, [fetchListings, toast]);

  // Toggle admin role for a user
  const toggleAdminRole = useCallback(async (userId: string, makeAdmin: boolean) => {
    try {
      if (makeAdmin) {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'admin' });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');
        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: makeAdmin ? 'User is now an admin' : 'Admin role removed',
      });
      await fetchAdminUserIds();
    } catch (error: any) {
      console.error('Error toggling admin role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update admin role',
        variant: 'destructive',
      });
    }
  }, [fetchAdminUserIds, toast]);

  // Delete listing
  const deleteListing = useCallback(async (listingId: string) => {
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Listing deleted',
      });
      await fetchListings();
    } catch (error: any) {
      console.error('Error deleting listing:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete listing',
        variant: 'destructive',
      });
    }
  }, [fetchListings, toast]);

  // Fetch all roommate profiles (admin view)
  const fetchRoommateProfiles = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('roommate_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const profilesWithUsers = await Promise.all(
        (data || []).map(async (profile) => {
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url, email, university')
            .eq('user_id', profile.user_id)
            .maybeSingle();
          return { ...profile, user: userProfile || undefined };
        })
      );

      setRoommateProfiles(profilesWithUsers);
    } catch (error: any) {
      console.error('Error fetching roommate profiles:', error);
      toast({
        title: 'Error',
        description: 'Failed to load roommate profiles',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Delete roommate profile (admin)
  const deleteRoommateProfile = useCallback(async (profileId: string) => {
    try {
      const { error } = await supabase
        .from('roommate_profiles')
        .delete()
        .eq('id', profileId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Roommate profile deleted',
      });
      await fetchRoommateProfiles();
    } catch (error: any) {
      console.error('Error deleting roommate profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete roommate profile',
        variant: 'destructive',
      });
    }
  }, [fetchRoommateProfiles, toast]);

  useEffect(() => {
    checkAdminStatus();
  }, [checkAdminStatus]);

  return {
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
  };
};
