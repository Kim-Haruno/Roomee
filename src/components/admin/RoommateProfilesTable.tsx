import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Eye, Trash2, MapPin, DollarSign, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface RoommateProfileAdmin {
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

interface RoommateProfilesTableProps {
  profiles: RoommateProfileAdmin[];
  onDelete: (id: string) => void;
}

const preferenceLabels: Record<string, Record<string, string>> = {
  smoking: { no: 'Non-smoker', yes: 'Smoker', outside_only: 'Outside only', no_preference: 'No preference' },
  pets: { no_pets: 'No pets', has_pets: 'Has pets', pets_welcome: 'Pets welcome', no_preference: 'No preference' },
  noise_level: { quiet: 'Quiet', moderate: 'Moderate', social: 'Social', no_preference: 'No preference' },
  cleanliness: { very_tidy: 'Very tidy', tidy: 'Tidy', relaxed: 'Relaxed', no_preference: 'No preference' },
  sleep_schedule: { early_bird: 'Early bird', night_owl: 'Night owl', flexible: 'Flexible', no_preference: 'No preference' },
  guests: { rarely: 'Rarely', sometimes: 'Sometimes', often: 'Often', no_preference: 'No preference' },
};

export const RoommateProfilesTable = ({ profiles, onDelete }: RoommateProfilesTableProps) => {
  const [selectedProfile, setSelectedProfile] = useState<RoommateProfileAdmin | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const getLabel = (category: string, value: string | null) => {
    if (!value) return '—';
    return preferenceLabels[category]?.[value] || value;
  };

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Visible</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No roommate profiles found
                </TableCell>
              </TableRow>
            ) : (
              profiles.map((profile) => {
                const name = profile.user?.full_name || 'Unknown';
                const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
                return (
                  <TableRow key={profile.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={profile.user?.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{name}</p>
                          <p className="text-xs text-muted-foreground">{profile.user?.email || '—'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{profile.preferred_city || '—'}</TableCell>
                    <TableCell>
                      {profile.budget_min || profile.budget_max
                        ? `R${(profile.budget_min || 0).toLocaleString()} - R${profile.budget_max?.toLocaleString() || '∞'}`
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={profile.is_visible ? 'default' : 'secondary'}>
                        {profile.is_visible ? 'Visible' : 'Hidden'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(profile.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedProfile(profile)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(profile.id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Dialog */}
      <Dialog open={!!selectedProfile} onOpenChange={() => setSelectedProfile(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Roommate Profile Details</DialogTitle>
          </DialogHeader>
          {selectedProfile && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedProfile.user?.avatar_url || undefined} />
                  <AvatarFallback>{(selectedProfile.user?.full_name || 'U')[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selectedProfile.user?.full_name || 'Unknown'}</p>
                  <p className="text-sm text-muted-foreground">{selectedProfile.user?.email}</p>
                  {selectedProfile.user?.university && (
                    <p className="text-sm text-muted-foreground">{selectedProfile.user.university}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> {selectedProfile.preferred_city || 'Not set'}</div>
                <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-muted-foreground" /> R{(selectedProfile.budget_min || 0).toLocaleString()} - R{selectedProfile.budget_max?.toLocaleString() || '∞'}</div>
                {selectedProfile.move_in_date && (
                  <div className="flex items-center gap-2 col-span-2"><Calendar className="h-4 w-4 text-muted-foreground" /> Move-in: {format(new Date(selectedProfile.move_in_date), 'MMM d, yyyy')}</div>
                )}
              </div>

              {selectedProfile.bio && (
                <div>
                  <p className="text-sm font-medium mb-1">Bio</p>
                  <p className="text-sm text-muted-foreground">{selectedProfile.bio}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium mb-2">Lifestyle Preferences</p>
                <div className="flex flex-wrap gap-2">
                  {(['smoking', 'pets', 'noise_level', 'cleanliness', 'sleep_schedule', 'guests'] as const).map((key) => {
                    const val = selectedProfile[key as keyof typeof selectedProfile] as string | null;
                    if (!val) return null;
                    return (
                      <Badge key={key} variant="secondary" className="text-xs">
                        {key.replace('_', ' ')}: {getLabel(key, val)}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {selectedProfile.interests && selectedProfile.interests.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Interests</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedProfile.interests.map((interest, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{interest}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Roommate Profile</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this roommate profile. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (deleteId) { onDelete(deleteId); setDeleteId(null); } }}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
