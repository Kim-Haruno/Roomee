import { useState } from 'react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Eye, ExternalLink, User, Mail, Phone, MapPin, GraduationCap } from 'lucide-react';
import type { Application } from '@/hooks/useAdmin';

interface ApplicationsTableProps {
  applications: Application[];
  onUpdateNotes: (applicationId: string, notes: string) => void;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  approved: 'bg-green-500/10 text-green-600 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-600 border-red-500/20',
};

export const ApplicationsTable = ({
  applications,
  onUpdateNotes,
}: ApplicationsTableProps) => {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [notes, setNotes] = useState('');

  const handleView = (app: Application) => {
    setSelectedApp(app);
    setNotes(app.admin_notes || '');
  };

  const handleSaveNotes = () => {
    if (selectedApp) {
      onUpdateNotes(selectedApp.id, notes);
      setSelectedApp(null);
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Listing</TableHead>
              <TableHead>Landlord</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No applications found
                </TableCell>
              </TableRow>
            ) : (
              applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{app.full_name}</p>
                      <p className="text-xs text-muted-foreground">{app.school}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{app.listing?.title || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">
                        {app.listing?.address}, {app.listing?.city}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{app.landlord?.full_name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{app.landlord?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{app.email}</p>
                      <p className="text-muted-foreground">{app.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[app.status]}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(app.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleView(app)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Link to={`/listings/${app.listing_id}`}>
                        <Button size="icon" variant="ghost">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Application for {selectedApp?.listing?.title}
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Status</Label>
                  <Badge variant="outline" className={statusColors[selectedApp.status]}>
                    {selectedApp.status.charAt(0).toUpperCase() + selectedApp.status.slice(1)}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Applied On</Label>
                  <p>{format(new Date(selectedApp.created_at), 'PPP')}</p>
                </div>
              </div>

              {selectedApp.landlord_notes && (
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Landlord Notes</Label>
                  <p className="text-sm bg-muted p-3 rounded-md">{selectedApp.landlord_notes}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="admin-notes">Admin Notes</Label>
                <Textarea
                  id="admin-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add admin notes about this application..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedApp(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNotes}>
              Save Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
