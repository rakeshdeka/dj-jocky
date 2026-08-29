
import React from 'react';
import MainLayout from '../../../components/dashboard/layout/MainLayout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../../../components/dashboard/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/dashboard/ui/avatar';
import { Button } from '../../../components/dashboard/ui/button';
import { Input } from '../../../components/dashboard/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../../components/dashboard/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../../../components/dashboard/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/dashboard/ui/dialog";
import { Label } from '../../../components/dashboard/ui/label';
import { 
  MoreHorizontal, 
  UserPlus, 
  Mail, 
  Calendar, 
  Shield, 
  Edit, 
  Trash2,
  AlertCircle 
} from 'lucide-react';
import { toast } from 'sonner';

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  avatarUrl?: string;
  joinedDate: string;
  lastActive: string;
};

type MemberRole = 'Admin' | 'Editor' | 'Viewer';

const Team = () => {
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>([
    {
      id: '1',
      name: 'Dhrubajyoti Nath',
      email: 'dhrubajyoti@designjockey.com',
      role: 'Admin',
      avatarUrl: 'https://github.com/shadcn.png',
      joinedDate: '12 Jan 2023',
      lastActive: '2 hours ago'
    },
    {
      id: '2',
      name: 'Alex Johnson',
      email: 'alex@designjockey.com',
      role: 'Editor',
      avatarUrl: '/lovable-uploads/007043e4-8292-4315-b217-efdd46a28380.png',
      joinedDate: '18 Feb 2023',
      lastActive: '1 day ago'
    },
    {
      id: '3',
      name: 'Sarah Williams',
      email: 'sarah@designjockey.com',
      role: 'Viewer',
      joinedDate: '23 Mar 2023',
      lastActive: '3 days ago'
    }
  ]);

  const [isInviteDialogOpen, setIsInviteDialogOpen] = React.useState(false);
  const [newInvite, setNewInvite] = React.useState<{ email: string; role: MemberRole }>({ 
    email: '', 
    role: 'Viewer' 
  });
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
  const [memberToDelete, setMemberToDelete] = React.useState<string | null>(null);

  const handleInvite = () => {
    // In a real app, you would send an API request to invite the user
    toast.success(`Invitation sent to ${newInvite.email}`);
    setIsInviteDialogOpen(false);
    setNewInvite({ email: '', role: 'Viewer' });
  };

  const handleDeleteMember = () => {
    if (memberToDelete) {
      setTeamMembers(teamMembers.filter(member => member.id !== memberToDelete));
      toast.success("Team member removed successfully");
      setIsDeleteConfirmOpen(false);
      setMemberToDelete(null);
    }
  };

  const confirmDelete = (id: string) => {
    setMemberToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Team Profile</h1>
        <p className="text-muted-foreground">
          Manage your team members and their access permissions
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Team Members</h2>
          <Button onClick={() => setIsInviteDialogOpen(true)} className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            <span>Invite Member</span>
          </Button>
        </div>

        <Card className="bg-secondary/30 border-border">
          <CardContent className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden md:table-cell">Joined</TableHead>
                  <TableHead className="hidden md:table-cell">Last Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-border">
                        {member.avatarUrl ? (
                          <AvatarImage src={member.avatarUrl} alt={member.name} />
                        ) : (
                          <AvatarFallback className="bg-primary/20 text-primary-foreground">
                            {member.name.charAt(0)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex flex-col">
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        member.role === 'Admin' 
                          ? 'bg-blue-500/10 text-blue-500' 
                          : member.role === 'Editor'
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-orange-500/10 text-orange-500'
                      }`}>
                        {member.role}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {member.joinedDate}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {member.lastActive}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-sm border-border">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                            <Edit className="h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                            <Mail className="h-4 w-4" />
                            <span>Send Message</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                            <Shield className="h-4 w-4" />
                            <span>Change Role</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="flex items-center gap-2 cursor-pointer text-destructive hover:text-destructive"
                            onSelect={() => confirmDelete(member.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Remove</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-secondary/30 border-border">
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>Recent actions taken by team members</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 p-4 rounded-lg bg-background/50 border border-border">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">Dhrubajyoti Nath</p>
                  <span className="text-sm text-muted-foreground">created a new project</span>
                </div>
                <p className="text-sm text-muted-foreground">2 hours ago</p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-lg bg-background/50 border border-border">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">Alex Johnson</p>
                  <span className="text-sm text-muted-foreground">updated the website brief</span>
                </div>
                <p className="text-sm text-muted-foreground">1 day ago</p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-lg bg-background/50 border border-border">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">Sarah Williams</p>
                  <span className="text-sm text-muted-foreground">commented on a design</span>
                </div>
                <p className="text-sm text-muted-foreground">3 days ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invite Member Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to add a new member to your team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@example.com"
                value={newInvite.email}
                onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select 
                id="role" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newInvite.role}
                onChange={(e) => setNewInvite({ ...newInvite, role: e.target.value as 'Admin' | 'Editor' | 'Viewer' })}
              >
                <option value="Admin">Admin</option>
                <option value="Editor">Editor</option>
                <option value="Viewer">Viewer</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={!newInvite.email}>
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <span>Confirm Removal</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this team member? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteMember}
            >
              Remove Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Team;
