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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Check, X, MessageSquare, Eye, ShieldCheck, ShieldOff } from 'lucide-react';
import type { UserApplication } from '@/hooks/useAdmin';

interface UserApplicationsTableProps {
  users: UserApplication[];
  adminUserIds: Set<string>;
  currentUserEmail: string | null;
  onUpdateStatus: (userId: string, status: string, notes?: string) => void;
  onToggleAdmin: (userId: string, makeAdmin: boolean) => void;
}

const SUPER_ADMIN_EMAIL = 'mcneal0745516650@gmail.com';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  approved: 'bg-green-500/10 text-green-600 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-600 border-red-500/20',
  more_info_needed: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
};

export const UserApplicationsTable = ({
  users,
  adminUserIds,
  currentUserEmail,
  onUpdateStatus,
  onToggleAdmin,
}: UserApplicationsTableProps) => {
  const [selectedUser, setSelectedUser] = useState<UserApplication | null>(null);
  const [dialogAction, setDialogAction] = useState<string>('');
  const [notes, setNotes] = useState('');

  const handleAction = (user: UserApplication, action: string) => {
    setSelectedUser(user);
    setDialogAction(action);
    setNotes(user.admin_notes || '');
  };

  const confirmAction = () => {
    if (selectedUser) {
      onUpdateStatus(selectedUser.user_id, dialogAction, notes);
      setSelectedUser(null);
      setDialogAction('');
      setNotes('');
    }
  };

  const getActionTitle = () => {
    switch (dialogAction) {
      case 'approved':
        return 'Approve Application';
      case 'rejected':
        return 'Reject Application';
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
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No applications found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {user.full_name}
                      {adminUserIds.has(user.user_id) && (
                        <Badge variant="default" className="text-xs">Admin</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="capitalize">{user.role}</TableCell>
                  <TableCell>
                    {user.role === 'student' && user.university && (
                      <span className="text-sm text-muted-foreground">
                        {user.university} • {user.stay_duration}
                      </span>
                    )}
                    {user.role === 'landlord' && (
                      <span className="text-sm text-muted-foreground">
                        Property Landlord
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[user.application_status]}>
                      {user.application_status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(user.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleAction(user, 'view')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {user.application_status !== 'approved' && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => handleAction(user, 'approved')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      {user.application_status !== 'rejected' && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleAction(user, 'rejected')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-blue-600 hover:text-blue-700"
                        onClick={() => handleAction(user, 'more_info_needed')}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      {currentUserEmail === SUPER_ADMIN_EMAIL && (
                        adminUserIds.has(user.user_id) ? (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-orange-600 hover:text-orange-700"
                            title="Remove admin role"
                            onClick={() => onToggleAdmin(user.user_id, false)}
                          >
                            <ShieldOff className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-purple-600 hover:text-purple-700"
                            title="Make admin"
                            onClick={() => onToggleAdmin(user.user_id, true)}
                          >
                            <ShieldCheck className="h-4 w-4" />
                          </Button>
                        )
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getActionTitle()}</DialogTitle>
            <DialogDescription>
              {selectedUser?.full_name} ({selectedUser?.email})
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Role:</span>{' '}
                  <span className="capitalize">{selectedUser.role}</span>
                </div>
                <div>
                  <span className="font-medium">Phone:</span>{' '}
                  {selectedUser.phone || 'N/A'}
                </div>
                {selectedUser.role === 'student' && (
                  <>
                    <div>
                      <span className="font-medium">University:</span>{' '}
                      {selectedUser.university || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Stay Duration:</span>{' '}
                      {selectedUser.stay_duration || 'N/A'}
                    </div>
                  </>
                )}
              </div>

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
            <Button variant="outline" onClick={() => setSelectedUser(null)}>
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
    </>
  );
};
