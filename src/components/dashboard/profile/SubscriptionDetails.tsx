import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle, Loader2, Package, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import type { RootState } from '../../../store/store';
import {
  cancelSubscription,
  fetchActiveSubscription,
  formatPlanPrice,
  getIndividuallyPurchasedServices,
  getSubscriptionServices,
  type ActiveSubscriptionResponse,
} from '../../../lib/plans-api';
import PlanServicesList from '../plans/PlanServicesList';

const SubscriptionDetails = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [data, setData] = useState<ActiveSubscriptionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const loadSubscription = useCallback(async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      setData(await fetchActiveSubscription(token));
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to load subscription');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  const plan = data?.plan || data?.activePlan;
  const subscription = data?.subscription;
  const expiryDate = subscription?.expiry_date
    ? new Date(subscription.expiry_date).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const subscriptionServices = data ? getSubscriptionServices(data) : [];
  const purchasedServices = data ? getIndividuallyPurchasedServices(data) : [];

  const handleCancelSubscription = async () => {
    if (!token) return;
    try {
      setIsCancelling(true);
      await cancelSubscription(token, { cancel_at_period_end: cancelAtPeriodEnd });
      toast.success(
        cancelAtPeriodEnd
          ? 'Subscription will cancel at the end of the billing period'
          : 'Subscription cancelled',
      );
      setIsCancelDialogOpen(false);
      await loadSubscription();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to cancel subscription');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading subscription...
      </div>
    );
  }

  if (!plan || !subscription) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold border-b border-border pb-4">Subscription Details</h2>
        <Card className="border-dashed">
          <CardContent className="p-8 text-center space-y-4">
            <Package className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">You do not have an active subscription.</p>
            <Button asChild className="bg-[#C4FE01] text-black hover:bg-[#C4FE01]/90">
              <Link to="/client/plans">Browse Plans</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
        <h2 className="text-2xl font-semibold">Subscription Details</h2>
        <Button variant="ghost" size="icon" onClick={loadSubscription}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Card className="bg-secondary/30 border-border">
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#C4FE01]/20 flex items-center justify-center">
                <Package className="h-5 w-5 text-[#C4FE01]" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium text-lg">{plan.name}</h3>
                  <Badge variant="outline" className="bg-[#C4FE01]/10 text-[#C4FE01] border-[#C4FE01]/30">
                    {subscription.status || 'Active'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{formatPlanPrice(plan)}</p>
              </div>
            </div>

            <Button asChild variant="outline">
              <Link to="/client/plans">Change / Switch Plan</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg bg-background/20 p-3">
              <p className="text-xs text-muted-foreground">Expiry</p>
              <p className="text-sm font-medium">{expiryDate || '—'}</p>
            </div>
            <div className="rounded-lg bg-background/20 p-3">
              <p className="text-xs text-muted-foreground">Auto-renew</p>
              <p className="text-sm font-medium">{subscription.auto_renew ? 'Enabled' : 'Disabled'}</p>
            </div>
            <div className="rounded-lg bg-background/20 p-3">
              <p className="text-xs text-muted-foreground">Max active requests</p>
              <p className="text-sm font-medium">
                {plan.max_active_requests == null ? 'Unlimited' : plan.max_active_requests}
              </p>
            </div>
          </div>

          {plan.features && plan.features.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Plan features</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">
                      {feature.label}
                      {feature.value ? ` — ${feature.value}` : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(subscriptionServices.length > 0 || purchasedServices.length > 0) && (
            <div className="space-y-4">
              {subscriptionServices.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="font-medium">Included in your plan</h4>
                  <PlanServicesList services={subscriptionServices} />
                </div>
              )}
              {purchasedServices.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="font-medium">Individually purchased</h4>
                  <PlanServicesList services={purchasedServices} />
                </div>
              )}
            </div>
          )}

          <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-medium">Cancel subscription</p>
              <p className="text-sm text-muted-foreground">
                Cancelling also stops Razorpay auto-renew when linked.
              </p>
            </div>
            <Button variant="destructive" onClick={() => setIsCancelDialogOpen(true)}>
              Cancel Subscription
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Choose whether to cancel immediately or at the end of your current billing period.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <div>
                <Label className="text-sm">Cancel at period end</Label>
                <p className="text-xs text-muted-foreground">Keep access until {expiryDate || 'expiry'}</p>
              </div>
              <Switch checked={cancelAtPeriodEnd} onCheckedChange={setCancelAtPeriodEnd} />
            </div>

            <div className="flex items-start gap-2 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm">
                {cancelAtPeriodEnd
                  ? 'Your subscription stays active until the current period ends.'
                  : 'Your subscription will be cancelled immediately and access may end right away.'}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)} disabled={isCancelling}>
              Keep Subscription
            </Button>
            <Button variant="destructive" onClick={handleCancelSubscription} disabled={isCancelling}>
              {isCancelling && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirm Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionDetails;
