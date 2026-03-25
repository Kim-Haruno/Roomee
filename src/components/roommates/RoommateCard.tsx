import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, MapPin, DollarSign, Calendar, Moon, Sun, Volume2, Sparkles, PawPrint, Cigarette } from 'lucide-react';
import { format } from 'date-fns';
import type { RoommateProfile } from '@/hooks/useRoommates';

interface RoommateCardProps {
  profile: RoommateProfile;
  onMessage: (userId: string) => void;
}

const preferenceLabels: Record<string, Record<string, string>> = {
  smoking: {
    no: 'Non-smoker',
    yes: 'Smoker',
    outside_only: 'Outside only',
    no_preference: 'No preference',
  },
  pets: {
    no_pets: 'No pets',
    has_pets: 'Has pets',
    pets_welcome: 'Pets welcome',
    no_preference: 'No preference',
  },
  noise_level: {
    quiet: 'Quiet',
    moderate: 'Moderate',
    social: 'Social',
    no_preference: 'No preference',
  },
  cleanliness: {
    very_tidy: 'Very tidy',
    tidy: 'Tidy',
    relaxed: 'Relaxed',
    no_preference: 'No preference',
  },
  sleep_schedule: {
    early_bird: 'Early bird',
    night_owl: 'Night owl',
    flexible: 'Flexible',
    no_preference: 'No preference',
  },
  guests: {
    rarely: 'Rarely',
    sometimes: 'Sometimes',
    often: 'Often',
    no_preference: 'No preference',
  },
};

export const RoommateCard = ({ profile, onMessage }: RoommateCardProps) => {
  // Use whatever identifier is available; avoid generic 'Anonymous' label
  const name =
    profile.user?.full_name ||
    profile.user?.email ||
    'User';
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={profile.user?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{name}</h3>
            {profile.user?.university && (
              <p className="text-sm text-muted-foreground truncate">
                {profile.user.university}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Key Info */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          {profile.preferred_city && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{profile.preferred_city}</span>
            </div>
          )}
          {(profile.budget_min || profile.budget_max) && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>
                R{(profile.budget_min || 0).toLocaleString()} - R{profile.budget_max?.toLocaleString() || '∞'}/mo
              </span>
            </div>
          )}
          {profile.move_in_date && (
            <div className="flex items-center gap-1.5 text-muted-foreground col-span-2">
              <Calendar className="h-4 w-4" />
              <span>Move-in: {format(new Date(profile.move_in_date), 'MMM d, yyyy')}</span>
            </div>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-sm text-muted-foreground line-clamp-3">{profile.bio}</p>
        )}

        {/* Lifestyle Badges */}
        <div className="flex flex-wrap gap-1.5">
          {profile.sleep_schedule && profile.sleep_schedule !== 'no_preference' && (
            <Badge variant="secondary" className="text-xs">
              {profile.sleep_schedule === 'early_bird' ? (
                <Sun className="h-3 w-3 mr-1" />
              ) : (
                <Moon className="h-3 w-3 mr-1" />
              )}
              {preferenceLabels.sleep_schedule[profile.sleep_schedule]}
            </Badge>
          )}
          {profile.noise_level && profile.noise_level !== 'no_preference' && (
            <Badge variant="secondary" className="text-xs">
              <Volume2 className="h-3 w-3 mr-1" />
              {preferenceLabels.noise_level[profile.noise_level]}
            </Badge>
          )}
          {profile.cleanliness && profile.cleanliness !== 'no_preference' && (
            <Badge variant="secondary" className="text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              {preferenceLabels.cleanliness[profile.cleanliness]}
            </Badge>
          )}
          {profile.pets && profile.pets !== 'no_preference' && (
            <Badge variant="secondary" className="text-xs">
              <PawPrint className="h-3 w-3 mr-1" />
              {preferenceLabels.pets[profile.pets]}
            </Badge>
          )}
          {profile.smoking && profile.smoking !== 'no_preference' && (
            <Badge variant="secondary" className="text-xs">
              <Cigarette className="h-3 w-3 mr-1" />
              {preferenceLabels.smoking[profile.smoking]}
            </Badge>
          )}
        </div>

        {/* Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {profile.interests.slice(0, 5).map((interest, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {interest}
              </Badge>
            ))}
            {profile.interests.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{profile.interests.length - 5} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <Button className="w-full" onClick={() => onMessage(profile.user_id)}>
          <MessageSquare className="h-4 w-4 mr-2" />
          Send Message
        </Button>
      </CardFooter>
    </Card>
  );
};
