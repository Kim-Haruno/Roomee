import { useState } from 'react';
import { format } from 'date-fns';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Check, X, MessageSquare, Eye, Trash2 } from 'lucide-react';
import type { Listing } from '@/hooks/useAdmin';

interface ListingsTableProps {
  listings: Listing[];
  onUpdateStatus: (listingId: string, status: string, notes?: string) => void;
  onDelete: (listingId: string) => void;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  approved: 'bg-green-500/10 text-green-600 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-600 border-red-500/20',
  more_info_needed: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
};

export const ListingsTable = ({
  listings,
  onUpdateStatus,
  onDelete,
}: ListingsTableProps) => {
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [dialogAction, setDialogAction] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAction = (listing: Listing, action: string) => {
    setSelectedListing(listing);
    setDialogAction(action);
    setNotes(listing.admin_notes || '');
  };

  const confirmAction = () => {
    if (selectedListing) {
      onUpdateStatus(selectedListing.id, dialogAction, notes);
      setSelectedListing(null);
      setDialogAction('');
      setNotes('');
    }
  };

  const confirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  const getActionTitle = () => {
    switch (dialogAction) {
      case 'approved':
        return 'Approve Listing';
      case 'rejected':
        return 'Reject Listing';
      case 'more_info_needed':
        return 'Request More Info';
      default:
        return 'View Details';
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead>Landlord</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No listings found
                </TableCell>
              </TableRow>
            ) : (
              listings.map((listing) => (
                <TableRow key={listing.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {listing.title}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{listing.landlord?.full_name || 'Unknown'}</div>
                      <div className="text-muted-foreground text-xs">
                        {listing.landlord?.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{listing.city}</TableCell>
                  <TableCell>${listing.price}/mo</TableCell>
                  <TableCell className="capitalize">{listing.property_type}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[listing.status]}>
                      {listing.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(listing.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleAction(listing, 'view')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {listing.status !== 'approved' && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => handleAction(listing, 'approved')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      {listing.status !== 'rejected' && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleAction(listing, 'rejected')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-blue-600 hover:text-blue-700"
                        onClick={() => handleAction(listing, 'more_info_needed')}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(listing.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Status Dialog */}
      <Dialog open={!!selectedListing} onOpenChange={() => setSelectedListing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{getActionTitle()}</DialogTitle>
            <DialogDescription>{selectedListing?.title}</DialogDescription>
          </DialogHeader>

          {selectedListing && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Address:</span>{' '}
                  {selectedListing.address}, {selectedListing.city}
                </div>
                <div>
                  <span className="font-medium">Price:</span> ${selectedListing.price}/month
                </div>
                <div>
                  <span className="font-medium">Bedrooms:</span> {selectedListing.bedrooms}
                </div>
                <div>
                  <span className="font-medium">Bathrooms:</span> {selectedListing.bathrooms}
                </div>
                <div>
                  <span className="font-medium">Type:</span>{' '}
                  <span className="capitalize">{selectedListing.property_type}</span>
                </div>
                <div>
                  <span className="font-medium">Available:</span>{' '}
                  {format(new Date(selectedListing.available_from), 'MMM d, yyyy')}
                </div>
              </div>

              <div>
                <span className="font-medium text-sm">Description:</span>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedListing.description}
                </p>
              </div>

              {selectedListing.amenities.length > 0 && (
                <div>
                  <span className="font-medium text-sm">Amenities:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedListing.amenities.map((amenity, i) => (
                      <Badge key={i} variant="secondary">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedListing.images.length > 0 && (
                <div>
                  <span className="font-medium text-sm">Images:</span>
                  <div className="flex gap-2 mt-1 overflow-x-auto">
                    {selectedListing.images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`Property ${i + 1}`}
                        className="h-20 w-32 object-cover rounded"
                      />
                    ))}
                  </div>
                </div>
              )}

              {dialogAction !== 'view' && (
                <div className="space-y-2">
                  <Label htmlFor="notes">Admin Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes for this decision..."
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedListing(null)}>
              Cancel
            </Button>
            {dialogAction !== 'view' && (
              <Button
                onClick={confirmAction}
                variant={dialogAction === 'rejected' ? 'destructive' : 'default'}
              >
                Confirm {dialogAction.replace('_', ' ')}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Listing</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this listing? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
