import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import {
  Loader2,
  Pencil,
  Plus,
  Trash2,
  UserPlus,
  Sparkles,
  CalendarClock,
} from 'lucide-react';

import type { RootState } from '../../../../store/store';
import {
  assignAdminSubscription,
  deleteAdminPlan,
  fetchAdminClientsDropdown,
  fetchAdminPlans,
  formatPlanPrice,
  isCustomPlan,
  type AdminPlan,
} from '../../../../lib/admin-plans-api';
import { Button } from '../../../../components/dashboard/ui/button';
import { Badge } from '../../../../components/dashboard/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/dashboard/ui/card';
import { Input } from '../../../../components/dashboard/ui/input';
import { Label } from '../../../../components/dashboard/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../components/dashboard/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/dashboard/ui/select';

export default function AdminPlansPage() {
  const { token } = useSelector((state: RootState) => state.auth);
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [assignPlan, setAssignPlan] = useState<AdminPlan | null>(null);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignForm, setAssignForm] = useState({
    client_id: '',
    amount: '',
    duration_days: '30',
    expiry_date: '',
  });

  const loadPlans = useCallback(async (targetPage: number) => {
    if (!token) return;
    try {
      setIsLoading(true);
      const result = await fetchAdminPlans(token, { page: targetPage, limit });
      setPlans(result.items);
      setPage(result.page);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load plans');
    } finally {
      setIsLoading(false);
    }
  }, [token, limit]);

  useEffect(() => {
    loadPlans(page);
  }, [page, loadPlans]);

  const deletePlan = async (id: string) => {
    if (!token) return;
    try {
      setDeletingId(id);
      await deleteAdminPlan(token, id);
      toast.success('Plan deleted');
      const nextPage = plans.length === 1 && page > 1 ? page - 1 : page;
      if (nextPage !== page) {
        setPage(nextPage);
      } else {
        await loadPlans(page);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete plan');
    } finally {
      setDeletingId(null);
    }
  };

  const openAssignDialog = async (plan: AdminPlan) => {
    setAssignPlan(plan);
    setAssignForm({
      client_id: '',
      amount: plan.price != null ? String(plan.price) : '0',
      duration_days: plan.duration != null ? String(plan.duration) : '30',
      expiry_date: '',
    });

    if (!token) return;
    try {
      setIsLoadingClients(true);
      setClients(await fetchAdminClientsDropdown(token));
    } catch {
      toast.error('Failed to load clients');
    } finally {
      setIsLoadingClients(false);
    }
  };

  const handleAssignSubscription = async () => {
    if (!token || !assignPlan) return;
    if (!assignForm.client_id) return toast.error('Select a client');
    if (!assignForm.expiry_date) return toast.error('Select an expiry date');

    try {
      setIsAssigning(true);
      await assignAdminSubscription(token, {
        client_id: assignForm.client_id,
        subscription_plan_id: assignPlan._id,
        amount: Number(assignForm.amount) || 0,
        duration_days: Number(assignForm.duration_days) || 0,
        expiry_date: new Date(assignForm.expiry_date).toISOString(),
      });
      toast.success('Subscription assigned successfully');
      setAssignPlan(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to assign subscription');
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-sm font-bold mb-1 tracking-[0.2em]">Plans</h1>
          <p className="text-muted-foreground text-xs">
            Manage subscription tiers, pricing, and manual activations for custom plans.
          </p>
        </div>
        <Button asChild size="sm" className="bg-[#C4FE01] text-black hover:bg-[#C4FE01]/90">
          <Link to="/admin/settings/plans/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Plan
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center border border-dashed rounded-md">
          <Loader2 className="h-6 w-6 animate-spin text-[#C4FE01] mb-2" />
          <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-bold">
            Loading plans...
          </p>
        </div>
      ) : plans.length > 0 ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const custom = isCustomPlan(plan);
            const featurePreview = plan.features?.slice(0, 3) ?? [];

            return (
              <Card
                key={plan._id}
                className={`relative overflow-hidden border transition-colors hover:border-[#C4FE01]/40 ${
                  plan.is_active === false ? 'opacity-70' : ''
                }`}
              >
                <CardHeader className="pb-3 space-y-3">
                  <div className="flex items-start justify-between gap-3 pr-16">
                    <div className="min-w-0">
                      <CardTitle className="text-base tracking-tight truncate">{plan.name}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {plan.slug ? `/${plan.slug}` : 'No slug'} • {plan.tier || 'Standard tier'}
                      </CardDescription>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className="text-[10px] uppercase">
                      {formatPlanPrice(plan)}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {plan.billing_interval || 'monthly'}
                    </Badge>
                    {plan.is_active === false ? (
                      <Badge variant="outline" className="text-[10px]">Inactive</Badge>
                    ) : (
                      <Badge className="text-[10px] bg-green-500/15 text-green-600 border-green-500/20">
                        Active
                      </Badge>
                    )}
                    {custom && (
                      <Badge className="text-[10px] bg-amber-500/15 text-amber-600 border-amber-500/20">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Custom
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pb-4">
                  {plan.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{plan.description}</p>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-md bg-secondary/30 p-2">
                      <p className="text-[10px] uppercase text-muted-foreground">Duration</p>
                      <p className="font-medium">{plan.duration} days</p>
                    </div>
                    <div className="rounded-md bg-secondary/30 p-2">
                      <p className="text-[10px] uppercase text-muted-foreground">Max Requests</p>
                      <p className="font-medium">
                        {plan.max_active_requests == null ? 'Unlimited' : plan.max_active_requests}
                      </p>
                    </div>
                  </div>

                  {featurePreview.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase text-muted-foreground font-semibold">Features</p>
                      {featurePreview.map((feature, index) => (
                        <p key={`${plan._id}-feature-${index}`} className="text-xs">
                          <span className="text-muted-foreground">{feature.label}</span>
                          {feature.value ? (
                            <>
                              : <span className="font-medium">{feature.value}</span>
                            </>
                          ) : null}
                        </p>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button variant="outline" size="sm" className="text-xs h-8" asChild>
                      <Link to={`/admin/settings/plans/${plan._id}/edit`}>
                        <Pencil className="h-3.5 w-3.5 mr-1" />
                        Edit
                      </Link>
                    </Button>

                    {custom && (
                      <Button
                        size="sm"
                        className="text-xs h-8 bg-[#C4FE01] text-black hover:bg-[#C4FE01]/90"
                        onClick={() => openAssignDialog(plan)}
                      >
                        <UserPlus className="h-3.5 w-3.5 mr-1" />
                        Assign
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-8 text-destructive ml-auto"
                      onClick={() => deletePlan(plan._id)}
                      disabled={deletingId === plan._id}
                    >
                      {deletingId === plan._id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="py-8 text-center border border-dashed rounded-md">
          <p className="text-xs text-muted-foreground">No subscription plans found.</p>
        </div>
      )}

      {!isLoading && totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Showing page {page} of {totalPages} • {total} plan{total === 1 ? '' : 's'}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Dialog open={assignPlan !== null} onOpenChange={(open) => !open && setAssignPlan(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Custom Subscription</DialogTitle>
            <DialogDescription>
              Manually activate &quot;{assignPlan?.name}&quot; after a custom tier consultation.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label className="text-xs">Client</Label>
              <Select
                value={assignForm.client_id}
                onValueChange={(value) => setAssignForm((prev) => ({ ...prev, client_id: value }))}
                disabled={isAssigning || isLoadingClients}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder={isLoadingClients ? 'Loading clients...' : 'Select client'} />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id} className="text-xs">
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Amount</Label>
                <Input
                  type="number"
                  min="0"
                  value={assignForm.amount}
                  onChange={(e) => setAssignForm((prev) => ({ ...prev, amount: e.target.value }))}
                  disabled={isAssigning}
                  className="text-xs h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Duration (days)</Label>
                <Input
                  type="number"
                  min="1"
                  value={assignForm.duration_days}
                  onChange={(e) =>
                    setAssignForm((prev) => ({ ...prev, duration_days: e.target.value }))
                  }
                  disabled={isAssigning}
                  className="text-xs h-8"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1">
                <CalendarClock className="h-3.5 w-3.5" />
                Expiry Date
              </Label>
              <Input
                type="datetime-local"
                value={assignForm.expiry_date}
                onChange={(e) => setAssignForm((prev) => ({ ...prev, expiry_date: e.target.value }))}
                disabled={isAssigning}
                className="text-xs h-8"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignPlan(null)} disabled={isAssigning}>
              Cancel
            </Button>
            <Button onClick={handleAssignSubscription} disabled={isAssigning}>
              {isAssigning && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Assign Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
