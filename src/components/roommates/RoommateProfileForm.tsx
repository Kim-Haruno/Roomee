import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { X, Plus, Loader2 } from 'lucide-react';
import type { RoommateProfile } from '@/hooks/useRoommates';

interface RoommateProfileFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: RoommateProfile | null;
  onSave: (data: Partial<RoommateProfile>) => Promise<void>;
}

const interestOptions = [
  'Sports', 'Music', 'Gaming', 'Reading', 'Cooking', 'Fitness', 'Movies', 'Travel',
  'Art', 'Photography', 'Dancing', 'Hiking', 'Yoga', 'Meditation', 'Tech', 'Fashion',
];

export const RoommateProfileForm = ({
  open,
  onOpenChange,
  profile,
  onSave,
}: RoommateProfileFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    budget_min: '',
    budget_max: '',
    preferred_city: '',
    move_in_date: '',
    smoking: 'no_preference',
    pets: 'no_preference',
    noise_level: 'no_preference',
    cleanliness: 'no_preference',
    sleep_schedule: 'no_preference',
    guests: 'no_preference',
    interests: [] as string[],
    is_visible: true,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        bio: profile.bio || '',
        budget_min: profile.budget_min?.toString() || '',
        budget_max: profile.budget_max?.toString() || '',
        preferred_city: profile.preferred_city || '',
        move_in_date: profile.move_in_date || '',
        smoking: profile.smoking || 'no_preference',
        pets: profile.pets || 'no_preference',
        noise_level: profile.noise_level || 'no_preference',
        cleanliness: profile.cleanliness || 'no_preference',
        sleep_schedule: profile.sleep_schedule || 'no_preference',
        guests: profile.guests || 'no_preference',
        interests: profile.interests || [],
        is_visible: profile.is_visible ?? true,
      });
    } else {
      setFormData({
        bio: '',
        budget_min: '',
        budget_max: '',
        preferred_city: '',
        move_in_date: '',
        smoking: 'no_preference',
        pets: 'no_preference',
        noise_level: 'no_preference',
        cleanliness: 'no_preference',
        sleep_schedule: 'no_preference',
        guests: 'no_preference',
        interests: [],
        is_visible: true,
      });
    }
  }, [profile, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSave({
        bio: formData.bio || null,
        budget_min: formData.budget_min ? parseInt(formData.budget_min) : null,
        budget_max: formData.budget_max ? parseInt(formData.budget_max) : null,
        preferred_city: formData.preferred_city || null,
        move_in_date: formData.move_in_date || null,
        smoking: formData.smoking,
        pets: formData.pets,
        noise_level: formData.noise_level,
        cleanliness: formData.cleanliness,
        sleep_schedule: formData.sleep_schedule,
        guests: formData.guests,
        interests: formData.interests,
        is_visible: formData.is_visible,
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{profile ? 'Edit' : 'Create'} Roommate Profile</DialogTitle>
          <DialogDescription>
            Set your preferences to find compatible roommates
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* About */}
          <div className="space-y-2">
            <Label htmlFor="bio">About You</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell potential roommates about yourself..."
              rows={3}
            />
          </div>

          {/* Budget & Location */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget_min">Min Budget (R/mo)</Label>
              <Input
                id="budget_min"
                type="number"
                value={formData.budget_min}
                onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
                placeholder="3000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget_max">Max Budget (R/mo)</Label>
              <Input
                id="budget_max"
                type="number"
                value={formData.budget_max}
                onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
                placeholder="10000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferred_city">Preferred City</Label>
              <Select
                value={formData.preferred_city}
                onValueChange={(v) => setFormData({ ...formData, preferred_city: v })}
              >
                <SelectTrigger id="preferred_city">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {/* Gauteng */}
                  <SelectItem value="Johannesburg">Gauteng — Johannesburg</SelectItem>
                  <SelectItem value="Pretoria">Gauteng — Pretoria</SelectItem>

                  {/* Western Cape */}
                  <SelectItem value="Cape Town">Western Cape — Cape Town</SelectItem>
                  <SelectItem value="Stellenbosch">Western Cape — Stellenbosch</SelectItem>

                  {/* KwaZulu-Natal */}
                  <SelectItem value="Durban">KwaZulu-Natal — Durban</SelectItem>
                  <SelectItem value="Pietermaritzburg">KwaZulu-Natal — Pietermaritzburg</SelectItem>

                  {/* Eastern Cape */}
                  <SelectItem value="Gqeberha">Eastern Cape — Gqeberha</SelectItem>
                  <SelectItem value="East London">Eastern Cape — East London</SelectItem>

                  {/* Free State */}
                  <SelectItem value="Bloemfontein">Free State — Bloemfontein</SelectItem>
                  <SelectItem value="Welkom">Free State — Welkom</SelectItem>

                  {/* Limpopo */}
                  <SelectItem value="Polokwane">Limpopo — Polokwane</SelectItem>
                  <SelectItem value="Thohoyandou">Limpopo — Thohoyandou</SelectItem>

                  {/* North West */}
                  <SelectItem value="Potchefstroom">North West — Potchefstroom</SelectItem>
                  <SelectItem value="Rustenburg">North West — Rustenburg</SelectItem>

                  {/* Mpumalanga */}
                  <SelectItem value="Mbombela">Mpumalanga — Mbombela</SelectItem>
                  <SelectItem value="Emalahleni">Mpumalanga — Emalahleni</SelectItem>

                  {/* Northern Cape */}
                  <SelectItem value="Kimberley">Northern Cape — Kimberley</SelectItem>
                  <SelectItem value="Upington">Northern Cape — Upington</SelectItem>

                  {/* Other */}
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="move_in_date">Move-in Date</Label>
            <Input
              id="move_in_date"
              type="date"
              value={formData.move_in_date}
              onChange={(e) => setFormData({ ...formData, move_in_date: e.target.value })}
            />
          </div>

          {/* Lifestyle Preferences */}
          <div className="space-y-4">
            <h4 className="font-medium">Lifestyle Preferences</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Smoking</Label>
                <Select
                  value={formData.smoking}
                  onValueChange={(v) => setFormData({ ...formData, smoking: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">Non-smoker</SelectItem>
                    <SelectItem value="yes">Smoker</SelectItem>
                    <SelectItem value="outside_only">Outside only</SelectItem>
                    <SelectItem value="no_preference">No preference</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Pets</Label>
                <Select
                  value={formData.pets}
                  onValueChange={(v) => setFormData({ ...formData, pets: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no_pets">No pets</SelectItem>
                    <SelectItem value="has_pets">I have pets</SelectItem>
                    <SelectItem value="pets_welcome">Pets welcome</SelectItem>
                    <SelectItem value="no_preference">No preference</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Noise Level</Label>
                <Select
                  value={formData.noise_level}
                  onValueChange={(v) => setFormData({ ...formData, noise_level: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quiet">Quiet</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="no_preference">No preference</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Cleanliness</Label>
                <Select
                  value={formData.cleanliness}
                  onValueChange={(v) => setFormData({ ...formData, cleanliness: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="very_tidy">Very tidy</SelectItem>
                    <SelectItem value="tidy">Tidy</SelectItem>
                    <SelectItem value="relaxed">Relaxed</SelectItem>
                    <SelectItem value="no_preference">No preference</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Sleep Schedule</Label>
                <Select
                  value={formData.sleep_schedule}
                  onValueChange={(v) => setFormData({ ...formData, sleep_schedule: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="early_bird">Early bird</SelectItem>
                    <SelectItem value="night_owl">Night owl</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                    <SelectItem value="no_preference">No preference</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Guests</Label>
                <Select
                  value={formData.guests}
                  onValueChange={(v) => setFormData({ ...formData, guests: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rarely">Rarely</SelectItem>
                    <SelectItem value="sometimes">Sometimes</SelectItem>
                    <SelectItem value="often">Often</SelectItem>
                    <SelectItem value="no_preference">No preference</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Interests */}
          <div className="space-y-2">
            <Label>Interests</Label>
            <div className="flex flex-wrap gap-2">
              {interestOptions.map((interest) => (
                <Badge
                  key={interest}
                  variant={formData.interests.includes(interest) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleInterest(interest)}
                >
                  {formData.interests.includes(interest) ? (
                    <X className="h-3 w-3 mr-1" />
                  ) : (
                    <Plus className="h-3 w-3 mr-1" />
                  )}
                  {interest}
                </Badge>
              ))}
            </div>
          </div>

          {/* Visibility */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="visibility">Profile Visibility</Label>
              <p className="text-sm text-muted-foreground">
                Make your profile visible to other users
              </p>
            </div>
            <Switch
              id="visibility"
              checked={formData.is_visible}
              onCheckedChange={(checked) => setFormData({ ...formData, is_visible: checked })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {profile ? 'Update' : 'Create'} Profile
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
