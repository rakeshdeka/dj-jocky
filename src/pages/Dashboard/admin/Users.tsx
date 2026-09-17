import React, { useCallback, useEffect, useState } from 'react';
import MainLayout from '../../../components/dashboard/layout/MainLayout';
import { Card, CardContent, CardHeader } from '../../../components/dashboard/ui/card';
import { Button } from '../../../components/dashboard/ui/button';
import { Input } from '../../../components/dashboard/ui/input';
import { Label } from '../../../components/dashboard/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/dashboard/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/dashboard/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/dashboard/ui/alert-dialog';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Eye, Filter, Loader2, Pencil, Plus, Search as SearchIcon, Trash2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { RootState } from '../../../store/store';

type UserRole = 'admin' | 'client' | 'designer';
type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  joinedAt: string;
  avatar?: string;
  phone?: string;
  company?: string;
  bio?: string;
  isSuspended?: boolean;
}

interface EditForm {
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  company: string;
  bio: string;
}

const apiBaseUrl = import.meta.env.VITE_API_URL;

const normalizeRole = (role?: string): UserRole => {
  const value = (role || '').toLowerCase().trim();
  if (value.includes('admin')) return 'admin';
  if (value.includes('designer')) return 'designer';
  return 'client';
};

const normalizeStatus = (user: any): UserStatus => {
  if (user?.isSuspended || user?.suspended || user?.status === 'suspended') {
    return 'suspended';
  }
  if (user?.status === 'inactive') return 'inactive';
  if (user?.status === 'pending') return 'pending';
  return 'active';
};

const mapUserFromApi = (user: any): User => ({
  id: user._id || user.id,
  name: user.name || 'Unnamed user',
  email: user.email || '',
  role: normalizeRole(user.role),
  status: normalizeStatus(user),
  joinedAt: user.createdAt || user.joinedAt || new Date().toISOString(),
  avatar: user.profilePicture || user.profilePictureUrl || user.avatar || '',
  phone: user.phone || '',
  company: user.company || '',
  bio: user.bio || '',
  isSuspended: normalizeStatus(user) === 'suspended',
});

const emptyEditForm = (): EditForm => ({
  name: '',
  email: '',
  role: 'client',
  phone: '',
  company: '',
  bio: '',
});

const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const { isSuperAdmin } = useSelector((state: RootState) => state.adminAccess);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [viewUser, setViewUser] = useState<User | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<EditForm>(emptyEditForm());
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  const getAuthHeaders = useCallback(
    () => ({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }),
    [token],
  );

  const fetchUsers = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const res = await axios.get(`${apiBaseUrl}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const items = res.data.items || res.data.users || [];
      setUsers(items.map(mapUserFromApi));
    } catch (error: any) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 401) {
        navigate('/login');
        return;
      }
      toast.error(error.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, navigate, token]);

  const fetchUserDetails = async (id: string): Promise<User> => {
    const res = await axios.get(`${apiBaseUrl}/admin/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const user = res.data.item || res.data.user || res.data.data || res.data;
    return mapUserFromApi(user);
  };

  useEffect(() => {
    if (!token) {
      toast.error('Login required');
      return;
    }
    fetchUsers();
  }, [fetchUsers, token]);

  const handleViewUser = async (user: User) => {
    try {
      setActionLoading(`view-${user.id}`);
      const details = await fetchUserDetails(user.id);
      setViewUser(details);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load user details');
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenEdit = async (user: User) => {
    try {
      setActionLoading(`edit-${user.id}`);
      const details = await fetchUserDetails(user.id);
      setEditUser(details);
      setEditForm({
        name: details.name,
        email: details.email,
        role: details.role,
        phone: details.phone || '',
        company: details.company || '',
        bio: details.bio || '',
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load user for editing');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateUser = async () => {
    if (!editUser) return;

    const name = editForm.name.trim();
    const email = editForm.email.trim();

    if (!name || !email) {
      toast.error('Name and email are required');
      return;
    }

    try {
      setActionLoading(`save-${editUser.id}`);
      const res = await axios.patch(
        `${apiBaseUrl}/admin/users/${editUser.id}`,
        {
          name,
          email,
          role: editForm.role,
          phone: editForm.phone.trim() || undefined,
          company: editForm.company.trim() || undefined,
          bio: editForm.bio.trim() || undefined,
        },
        { headers: getAuthHeaders() },
      );

      toast.success(res.data?.message || 'User updated successfully');
      setEditUser(null);
      await fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspendToggle = async (user: User) => {
    const isSuspended = user.status === 'suspended' || user.isSuspended;
    const endpoint = isSuspended ? 'unsuspend' : 'suspend';

    try {
      setActionLoading(`${endpoint}-${user.id}`);
      const res = await axios.patch(
        `${apiBaseUrl}/admin/users/${user.id}/${endpoint}`,
        {},
        { headers: getAuthHeaders() },
      );

      toast.success(
        res.data?.message ||
          (isSuspended ? 'User unsuspended successfully' : 'User suspended successfully'),
      );
      await fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update user status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUser) return;

    try {
      setActionLoading(`delete-${deleteUser.id}`);
      const res = await axios.delete(`${apiBaseUrl}/admin/users/${deleteUser.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(res.data?.message || 'User deleted successfully');
      setDeleteUser(null);
      await fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const statusClass = (status: UserStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-500';
      case 'suspended':
        return 'bg-red-500/10 text-red-500';
      case 'inactive':
        return 'bg-gray-500/10 text-gray-500';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <MainLayout>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-sm font-bold mb-1 tracking-[0.2em]">USERS</h1>
          <p className="text-muted-foreground text-sm">
            {isSuperAdmin
              ? 'View and manage all users on the platform'
              : 'Manage client and designer accounts (sub-admin scope)'}
          </p>
        </div>
        <Button onClick={() => navigate('/admin/users/add')} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Add Internal User
        </Button>
      </div>

      <Card className="bg-secondary/30 border-border mb-8">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4" />
        </CardHeader>

        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[130px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Role</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="designer">Designer</SelectItem>
                  {isSuperAdmin && <SelectItem value="admin">Admin</SelectItem>}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Status</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-[#c5fb00]" />
                <p className="text-xs text-muted-foreground animate-pulse tracking-wider uppercase text-[10px] font-bold">
                  Fetching users...
                </p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-border rounded-md">
                <p className="text-muted-foreground text-sm italic">No users found.</p>
              </div>
            ) : (
              <table className="w-full font-sans">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 text-muted-foreground text-[10px] uppercase font-semibold">User ID</th>
                    <th className="pb-3 text-muted-foreground text-[10px] uppercase font-semibold">Name</th>
                    <th className="pb-3 text-muted-foreground text-[10px] uppercase font-semibold">Email</th>
                    <th className="pb-3 text-muted-foreground text-[10px] uppercase font-semibold">Role</th>
                    <th className="pb-3 text-muted-foreground text-[10px] uppercase font-semibold">Status</th>
                    <th className="pb-3 text-muted-foreground text-[10px] uppercase font-semibold">Joined</th>
                    <th className="pb-3 text-muted-foreground text-[10px] uppercase font-semibold">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => {
                    const isSuspended = user.status === 'suspended' || user.isSuspended;

                    return (
                      <tr key={user.id} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                        <td className="py-3 text-sm font-mono text-xs">{user.id}</td>

                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-secondary border border-border flex items-center justify-center text-xs font-bold overflow-hidden shrink-0">
                              {user.avatar ? (
                                <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                              ) : (
                                user.name.substring(0, 2).toUpperCase()
                              )}
                            </div>
                            <span className="font-medium text-sm">{user.name}</span>
                          </div>
                        </td>

                        <td className="py-3 text-sm">{user.email}</td>

                        <td className="py-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter ${
                              user.role === 'admin'
                                ? 'bg-purple-500/10 text-purple-500'
                                : user.role === 'designer'
                                  ? 'bg-green-500/10 text-green-500'
                                  : 'bg-blue-500/10 text-blue-500'
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>

                        <td className="py-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${statusClass(user.status)}`}>
                            {user.status}
                          </span>
                        </td>

                        <td className="py-3 text-xs text-muted-foreground">
                          {new Date(user.joinedAt).toLocaleDateString()}
                        </td>

                        <td className="py-3">
                          <div className="flex flex-wrap gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => handleViewUser(user)}
                              disabled={Boolean(actionLoading)}
                            >
                              {actionLoading === `view-${user.id}` ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <>
                                  <Eye className="h-3.5 w-3.5 mr-1" />
                                  View
                                </>
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => handleOpenEdit(user)}
                              disabled={Boolean(actionLoading)}
                            >
                              {actionLoading === `edit-${user.id}` ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <>
                                  <Pencil className="h-3.5 w-3.5 mr-1" />
                                  Edit
                                </>
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`h-7 text-xs ${
                                isSuspended
                                  ? 'text-green-500 hover:text-green-600 hover:bg-green-500/10'
                                  : 'text-orange-500 hover:text-orange-600 hover:bg-orange-500/10'
                              }`}
                              onClick={() => handleSuspendToggle(user)}
                              disabled={Boolean(actionLoading)}
                            >
                              {actionLoading === `suspend-${user.id}` || actionLoading === `unsuspend-${user.id}` ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                isSuspended ? 'Unsuspend' : 'Suspend'
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10"
                              onClick={() => setDeleteUser(user)}
                              disabled={Boolean(actionLoading)}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={Boolean(viewUser)} onOpenChange={(open) => !open && setViewUser(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Full user profile details</DialogDescription>
          </DialogHeader>
          {viewUser && (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-secondary border border-border flex items-center justify-center text-sm font-bold overflow-hidden">
                  {viewUser.avatar ? (
                    <img src={viewUser.avatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    viewUser.name.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div>
                  <p className="font-semibold">{viewUser.name}</p>
                  <p className="text-xs text-muted-foreground">{viewUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-muted-foreground uppercase text-[10px] font-bold">User ID</p>
                  <p className="font-mono break-all">{viewUser.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground uppercase text-[10px] font-bold">Role</p>
                  <p className="capitalize">{viewUser.role}</p>
                </div>
                <div>
                  <p className="text-muted-foreground uppercase text-[10px] font-bold">Status</p>
                  <p className="capitalize">{viewUser.status}</p>
                </div>
                <div>
                  <p className="text-muted-foreground uppercase text-[10px] font-bold">Joined</p>
                  <p>{new Date(viewUser.joinedAt).toLocaleDateString()}</p>
                </div>
                {viewUser.phone && (
                  <div>
                    <p className="text-muted-foreground uppercase text-[10px] font-bold">Phone</p>
                    <p>{viewUser.phone}</p>
                  </div>
                )}
                {viewUser.company && (
                  <div>
                    <p className="text-muted-foreground uppercase text-[10px] font-bold">Company</p>
                    <p>{viewUser.company}</p>
                  </div>
                )}
              </div>
              {viewUser.bio && (
                <div>
                  <p className="text-muted-foreground uppercase text-[10px] font-bold mb-1">Bio</p>
                  <p className="text-xs">{viewUser.bio}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editUser)} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Name *</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                disabled={actionLoading === `save-${editUser?.id}`}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Email *</Label>
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                disabled={actionLoading === `save-${editUser?.id}`}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Role</Label>
              <Select
                value={editForm.role}
                onValueChange={(value: UserRole) => setEditForm((prev) => ({ ...prev, role: value }))}
                disabled={actionLoading === `save-${editUser?.id}`}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="designer">Designer</SelectItem>
                  {isSuperAdmin && <SelectItem value="admin">Admin</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Phone</Label>
              <Input
                value={editForm.phone}
                onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                disabled={actionLoading === `save-${editUser?.id}`}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Company</Label>
              <Input
                value={editForm.company}
                onChange={(e) => setEditForm((prev) => ({ ...prev, company: e.target.value }))}
                disabled={actionLoading === `save-${editUser?.id}`}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Bio</Label>
              <Input
                value={editForm.bio}
                onChange={(e) => setEditForm((prev) => ({ ...prev, bio: e.target.value }))}
                disabled={actionLoading === `save-${editUser?.id}`}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser} disabled={actionLoading === `save-${editUser?.id}`}>
              {actionLoading === `save-${editUser?.id}` ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteUser)} onOpenChange={(open) => !open && setDeleteUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {deleteUser?.name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleDeleteUser();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading === `delete-${deleteUser?.id}` ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default AdminUsers;
