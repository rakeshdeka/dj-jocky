"use client";

import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { Loader2, Pencil, Plus, Shield, Trash2, UserCog } from "lucide-react";

import MainLayout from "../../../components/dashboard/layout/MainLayout";
import AdminPermissionsEditor from "../../../components/dashboard/admin/AdminPermissionsEditor";
import { Button } from "../../../components/dashboard/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/dashboard/ui/card";
import { Input } from "../../../components/dashboard/ui/input";
import { Label } from "../../../components/dashboard/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/dashboard/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/dashboard/ui/alert-dialog";
import { Badge } from "../../../components/dashboard/ui/badge";
import { RootState } from "../../../store/store";
import {
  countGrantedPermissions,
  createSubAdmin,
  deleteSubAdmin,
  EMPTY_ADMIN_PERMISSIONS,
  fetchSubAdmins,
  normalizePermissions,
  toAdminAccessErrorMessage,
  type SubAdminUser,
  updateSubAdmin,
} from "../../../lib/admin-access-api";
import { Navigate } from "react-router-dom";

type FormState = {
  name: string;
  email: string;
  password: string;
  admin_permissions: ReturnType<typeof normalizePermissions>;
};

const emptyForm = (): FormState => ({
  name: "",
  email: "",
  password: "",
  admin_permissions: { ...EMPTY_ADMIN_PERMISSIONS, settings: { ...EMPTY_ADMIN_PERMISSIONS.settings } },
});

export default function AdminSubAdmins() {
  const { token } = useSelector((state: RootState) => state.auth);
  const { isSuperAdmin, isLoaded } = useSelector((state: RootState) => state.adminAccess);

  const [items, setItems] = useState<SubAdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SubAdminUser | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SubAdminUser | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setItems(await fetchSubAdmins(token));
    } catch (error: unknown) {
      toast.error(toAdminAccessErrorMessage(error, "Failed to load sub-admins"));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isSuperAdmin) load();
  }, [isSuperAdmin, load]);

  if (isLoaded && !isSuperAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (user: SubAdminUser) => {
    setEditing(user);
    setForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      admin_permissions: normalizePermissions(user.admin_permissions),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!token) return;

    const name = form.name.trim();
    const email = form.email.trim();

    if (!name || !email) {
      toast.error("Name and email are required");
      return;
    }

    if (!editing && !form.password.trim()) {
      toast.error("Password is required for new sub-admins");
      return;
    }

    if (countGrantedPermissions(form.admin_permissions) === 0) {
      toast.error("Select at least one permission");
      return;
    }

    try {
      setSaving(true);
      if (editing) {
        await updateSubAdmin(token, editing._id, {
          name,
          email,
          ...(form.password.trim() ? { password: form.password.trim() } : {}),
          admin_permissions: form.admin_permissions,
        });
        toast.success("Sub-admin updated");
      } else {
        await createSubAdmin(token, {
          name,
          email,
          password: form.password.trim(),
          admin_permissions: form.admin_permissions,
        });
        toast.success("Sub-admin created — share login credentials");
      }
      setDialogOpen(false);
      await load();
    } catch (error: unknown) {
      toast.error(toAdminAccessErrorMessage(error, "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !deleteTarget) return;
    try {
      await deleteSubAdmin(token, deleteTarget._id);
      toast.success("Sub-admin removed");
      setDeleteTarget(null);
      await load();
    } catch (error: unknown) {
      toast.error(toAdminAccessErrorMessage(error, "Delete failed"));
    }
  };

  return (
    <MainLayout>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-sm font-bold mb-1 tracking-[0.2em] flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#C4FE01]" />
            SUB-ADMINS
          </h1>
          <p className="text-muted-foreground text-sm max-w-xl">
            Super admins only. Create sub-admin accounts with limited panel permissions. Sub-admins
            sign in at the same admin login page.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-[#C4FE01] text-black hover:bg-[#C4FE01]/90">
          <Plus className="h-4 w-4" />
          Add sub-admin
        </Button>
      </div>

      <Card className="bg-secondary/20 border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            Team access
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-16 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#C4FE01]" />
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No sub-admins yet. Add one to delegate part of the admin panel.
            </p>
          ) : (
            <div className="space-y-3">
              {items.map((user) => (
                <div
                  key={user._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border/50 bg-card/40"
                >
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <Badge variant="outline" className="mt-2 text-[10px] uppercase">
                      {countGrantedPermissions(normalizePermissions(user.admin_permissions))} permissions
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(user)}>
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-400"
                      onClick={() => setDeleteTarget(user)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit sub-admin" : "New sub-admin"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Jane Ops"
              />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="ops@yourcompany.com"
              />
            </div>
            <div className="grid gap-2">
              <Label>{editing ? "New password (optional)" : "Password"}</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder={editing ? "Leave blank to keep current" : "SecurePass1"}
              />
            </div>

            <AdminPermissionsEditor
              value={form.admin_permissions}
              onChange={(admin_permissions) => setForm((f) => ({ ...f, admin_permissions }))}
            />
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[#C4FE01] text-black">
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editing ? "Save changes" : "Create sub-admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove sub-admin?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.email} will lose admin panel access immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
