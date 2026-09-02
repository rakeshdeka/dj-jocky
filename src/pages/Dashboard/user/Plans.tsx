import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import MainLayout from '../../../components/dashboard/layout/MainLayout';
import { Button } from '../../../components/dashboard/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../../components/dashboard/ui/card';
import { Badge } from '../../../components/dashboard/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/dashboard/ui/select';
import { CheckCircle2, ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import type { RootState } from '../../../store/store';
import {
  canCheckoutPlan,
  fetchActiveSubscription,
  fetchClientPlans,
  fetchCountries,
  formatPlanPrice,
  getPlanActionLabel,
  getPlanServiceNames,
  type ActiveSubscriptionResponse,
  type ClientPlan,
  type CountryOption,
} from '../../../lib/plans-api';
import { checkoutSubscription } from '../../../lib/razorpay-checkout';

export default function Plans() {
  const { token } = useSelector((state: RootState) => state.auth);

  const [plans, setPlans] = useState<ClientPlan[]>([]);
  const [activeSubscription, setActiveSubscription] = useState<ActiveSubscriptionResponse | null>(null);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [country, setCountry] = useState('IN');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const [plansList, activeData] = await Promise.all([
        fetchClientPlans(token, { all: true, country }),
        fetchActiveSubscription(token),
      ]);
      setPlans(plansList);
      setActiveSubscription(activeData);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to load subscription data');
    } finally {
      setIsLoading(false);
    }
  }, [token, country]);

  useEffect(() => {
    fetchCountries()
      .then((list) => {
        setCountries(list.filter((item) => item.is_active !== false));
        if (list.some((item) => item.code === 'IN')) setCountry('IN');
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (token) fetchData();
    else setIsLoading(false);
  }, [token, fetchData]);

  const activePlan = activeSubscription?.plan || activeSubscription?.activePlan;
  const expiryDate = activeSubscription?.subscription?.expiry_date
    ? new Date(activeSubscription.subscription.expiry_date).toLocaleDateString()
    : null;

  const handlePlanAction = async (plan: ClientPlan) => {
    if (!token) {
      toast.error('Please log in to continue');
      return;
    }

    if (plan.is_subscribed) return;

    if (plan.checkout_available === false || plan.custom_pricing || plan.requires_consultation) {
      if (plan.consultation_url) {
        window.open(plan.consultation_url, '_blank', 'noopener,noreferrer');
        return;
      }
      toast.info(plan.consultation_label || 'Please contact us for this plan');
      return;
    }

    if (!canCheckoutPlan(plan)) return;

    setIsProcessing(plan._id);
    await checkoutSubscription(token, plan._id, plan.name, {
      onSuccess: async () => {
        toast.success(plan.subscription_action === 'switch' ? 'Plan switched successfully' : 'Subscription activated');
        await fetchData();
        setIsProcessing(null);
      },
      onDismiss: () => setIsProcessing(null),
      onError: (message) => {
        toast.error(message);
        setIsProcessing(null);
      },
    });
  };

  return (
    <MainLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-xs font-bold mb-1 tracking-[0.2em] uppercase">Membership Plans</h1>
          <p className="text-muted-foreground text-xs">
            Subscribe or switch plans. Plan changes use the same checkout flow.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {countries.length > 0 && (
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="h-8 w-[140px] text-xs">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((item) => (
                  <SelectItem key={item._id} value={item.code} className="text-xs">
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button variant="outline" size="sm" className="h-8" onClick={fetchData} disabled={isLoading}>
            <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {activePlan && (
        <Card className="mb-6 border-[#C4FE01]/30 bg-[#C4FE01]/5">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Current plan</p>
              <p className="text-sm font-bold">{activePlan.name}</p>
              {expiryDate && (
                <p className="text-xs text-muted-foreground mt-1">
                  {activeSubscription?.subscription?.auto_renew ? 'Renews' : 'Expires'} on {expiryDate}
                </p>
              )}
            </div>
            <Button asChild variant="outline" size="sm" className="text-xs h-8">
              <Link to="/client/settings/subscription">Manage subscription</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[460px] rounded-md bg-muted/40 animate-pulse border border-border/40" />
          ))}
        </div>
      ) : plans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-10 font-sans">
          {plans.map((plan, index) => {
            const isCurrent = Boolean(plan.is_subscribed);
            const actionLabel = getPlanActionLabel(plan);
            const serviceNames = getPlanServiceNames(plan);
            const checkoutDisabled =
              isProcessing !== null || isCurrent || (!canCheckoutPlan(plan) && !plan.consultation_url);

            return (
              <motion.div
                key={plan._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.08 }}
                whileHover={!isCurrent ? { y: -4 } : {}}
              >
                <Card
                  className={cn(
                    'h-full overflow-hidden relative transition-all duration-300 flex flex-col justify-between border',
                    isCurrent
                      ? 'border-[#C4FE01] bg-accent/5 shadow-[0_0_15px_rgba(196,254,1,0.12)]'
                      : 'border-border',
                  )}
                >
                  {isCurrent && <div className="absolute top-0 right-0 left-0 h-1 bg-[#C4FE01]" />}

                  <CardHeader className="p-5 pb-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <CardTitle className="text-base sm:text-lg uppercase tracking-tight font-bold truncate">
                          {plan.name}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {plan.duration} days • {plan.billing_interval || 'billing cycle'}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {isCurrent && (
                          <Badge className="bg-[#C4FE01] text-black hover:bg-[#C4FE01] font-bold text-[10px] px-2 py-0.5">
                            CURRENT
                          </Badge>
                        )}
                        {plan.subscription_action === 'switch' && !isCurrent && (
                          <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                            Switch available
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="px-5 py-2 flex-grow space-y-4">
                    <div>
                      <p className="text-2xl sm:text-3xl font-bold tracking-tight">{formatPlanPrice(plan)}</p>
                      {isCurrent && expiryDate && (
                        <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1 uppercase tracking-wider font-semibold">
                          <CheckCircle2 className="h-3 w-3 text-[#C4FE01]" /> Active until {expiryDate}
                        </p>
                      )}
                    </div>

                    {plan.features && plan.features.length > 0 && (
                      <div className="space-y-2">
                        {plan.features.map((feature, featureIndex) => (
                          <div key={`${plan._id}-feature-${featureIndex}`} className="flex items-start gap-2 text-xs">
                            <CheckCircle2 className="h-3.5 w-3.5 text-[#C4FE01] shrink-0 mt-0.5" />
                            <span>
                              <span className="font-medium">{feature.label}</span>
                              {feature.value ? (
                                <span className="text-muted-foreground"> — {feature.value}</span>
                              ) : null}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {plan.max_active_requests != null && (
                      <p className="text-xs text-muted-foreground">
                        {plan.max_active_requests} active request{plan.max_active_requests === 1 ? '' : 's'}
                      </p>
                    )}

                    {serviceNames.length > 0 && (
                      <div className="pt-3 border-t border-border/40">
                        <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2 tracking-widest">
                          Included services
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {serviceNames.slice(0, 5).map((name) => (
                            <span
                              key={name}
                              className="text-[9px] bg-muted px-2 py-0.5 rounded-full border border-border/50 font-medium"
                            >
                              {name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="p-5 pt-3">
                    <Button
                      className={cn(
                        'w-full font-bold h-9 flex items-center justify-center gap-2 uppercase tracking-wider text-[11px]',
                        isCurrent
                          ? 'bg-muted text-muted-foreground cursor-default hover:bg-muted'
                          : plan.checkout_available === false
                            ? 'bg-secondary text-foreground hover:bg-secondary/80'
                            : 'bg-[#C4FE01] text-black hover:bg-[#b2e600]',
                      )}
                      onClick={() => handlePlanAction(plan)}
                      disabled={checkoutDisabled && !plan.consultation_url}
                    >
                      {isProcessing === plan._id && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      {!canCheckoutPlan(plan) && plan.consultation_url && (
                        <ExternalLink className="h-3.5 w-3.5" />
                      )}
                      {isProcessing === plan._id ? 'Processing...' : actionLabel}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center border border-dashed border-border/50 rounded-lg">
          <p className="text-muted-foreground text-xs font-medium">No plans available for this country.</p>
        </div>
      )}
    </MainLayout>
  );
}
