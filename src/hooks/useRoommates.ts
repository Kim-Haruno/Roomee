import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RoommateProfile {
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
  interests: string[];
  age_range_min: number | null;
  age_range_max: number | null;
  gender_preference: string | null;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    full_name: string;
    email: string;
    avatar_url: string | null;
    university: string | null;
  };
}

export interface RoommateFilters {
  city?: string;
  budgetMin?: number;
  budgetMax?: number;
  smoking?: string;
  pets?: string;
  noiseLevel?: string;
  cleanliness?: string;
  sleepSchedule?: string;
}

export const useRoommates = () => {
  const [profiles, setProfiles] = useState<RoommateProfile[]>([]);
  const [myProfile, setMyProfile] = useState<RoommateProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchProfiles = useCallback(async (filters?: RoommateFilters) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      let query = supabase
        .from('roommate_profiles')
        .select('*')
        .eq('is_visible', true)
        .order('created_at', { ascending: false });

      if (filters?.city) {
        query = query.ilike('preferred_city', `%${filters.city}%`);
      }
      if (filters?.budgetMax) {
        query = query.lte('budget_min', filters.budgetMax);
      }
      if (filters?.budgetMin) {
        query = query.gte('budget_max', filters.budgetMin);
      }
      if (filters?.smoking && filters.smoking !== 'all') {
        query = query.or(`smoking.eq.${filters.smoking},smoking.eq.no_preference`);
      }
      if (filters?.pets && filters.pets !== 'all') {
        query = query.or(`pets.eq.${filters.pets},pets.eq.no_preference`);
      }
      if (filters?.noiseLevel && filters.noiseLevel !== 'all') {
        query = query.or(`noise_level.eq.${filters.noiseLevel},noise_level.eq.no_preference`);
      }
      if (filters?.cleanliness && filters.cleanliness !== 'all') {
        query = query.or(`cleanliness.eq.${filters.cleanliness},cleanliness.eq.no_preference`);
      }
      if (filters?.sleepSchedule && filters.sleepSchedule !== 'all') {
        query = query.or(`sleep_schedule.eq.${filters.sleepSchedule},sleep_schedule.eq.no_preference`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch user profiles for each roommate
      const profilesWithUsers = await Promise.all(
        (data || [])
          .filter((p) => p.user_id !== user?.id)
          .map(async (profile) => {
            const { data: userProfile } = await supabase
              .from('profiles')
              .select('full_name, email, avatar_url, university')
              .eq('user_id', profile.user_id)
              .maybeSingle();
            return { ...profile, user: userProfile || undefined };
          })
      );

      setProfiles(profilesWithUsers);
    } catch (error: any) {
      console.error('Error fetching roommate profiles:', error);
      toast({
        title: 'Error',
        description: 'Failed to load roommate profiles',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchMyProfile = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('roommate_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setMyProfile(data);
    } catch (error: any) {
      console.error('Error fetching my roommate profile:', error);
    }
  }, []);

  const createOrUpdateProfile = useCallback(async (profileData: Partial<RoommateProfile>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const dataToSave = {
        ...profileData,
        user_id: user.id,
      };

      if (myProfile) {
        const { error } = await supabase
          .from('roommate_profiles')
          .update(dataToSave)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('roommate_profiles')
          .insert(dataToSave);
        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: 'Roommate profile saved',
      });
      await fetchMyProfile();
    } catch (error: any) {
      console.error('Error saving roommate profile:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save profile',
        variant: 'destructive',
      });
    }
  }, [myProfile, fetchMyProfile, toast]);

  const deleteMyProfile = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('roommate_profiles')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Roommate profile deleted',
      });
      setMyProfile(null);
    } catch (error: any) {
      console.error('Error deleting roommate profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete profile',
        variant: 'destructive',
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchProfiles();
    fetchMyProfile();
  }, [fetchProfiles, fetchMyProfile]);

  return {
    profiles,
    myProfile,
    loading,
    fetchProfiles,
    fetchMyProfile,
    createOrUpdateProfile,
    deleteMyProfile,
  };
};
