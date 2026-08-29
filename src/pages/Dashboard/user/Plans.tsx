import React, { useEffect, useState, useCallback } from 'react';
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
import { Clock, Zap, CalendarClock, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

// Global declaration for Razorpay Checkout SDK
declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export type PlanFromAPI = {
  _id: string;
  name: string;
  price: number;
  duration: number;
  max_active_requests: number;
  turnaround_time: number;
  revision_limit: number;
  services?: { id: string; name: string }[];
};

export interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export default function Plans() {
  const apiBaseUrl = import.meta.env.VITE_API_URL || "";
  const token = typeof window !== "undefined" ? localStorage.getItem('token') : null;

  const [plans, setPlans] = useState<PlanFromAPI[]>([]);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [expiryDate, setExpiryDate] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ================= FETCH SUBSCRIPTION DATA =================
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      const headers = { Authorization: `Bearer ${token}` };
      const [plansRes, activeRes] = await Promise.all([
        fetch(`${apiBaseUrl}/plans`, { headers }),
        fetch(`${apiBaseUrl}/plans/active`, { headers })
      ]);

      if (!plansRes.ok || !activeRes.ok) {
        throw new Error("Failed to retrieve subscription plans");
      }

      const plansData = await plansRes.json();
      const activeData = await activeRes.json();

      if (plansData.success || Array.isArray(plansData.plans)) {
        setPlans(plansData.plans || []);
      }

      if (activeData.success && activeData.activePlan) {
        setActivePlanId(activeData.activePlan._id);
        if (activeData.subscription?.expiry_date) {
          const parsedDate = new Date(activeData.subscription.expiry_date);
          setExpiryDate(!isNaN(parsedDate.getTime()) ? parsedDate.toLocaleDateString() : null);
        }
      }
    } catch (err) {
      toast.error('Failed to load subscription data');
    } finally {
      setIsLoading(false);
    }
  }, [apiBaseUrl, token]);

  useEffect(() => {
    if (token) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [token, fetchData]);

  // ================= RAZORPAY SDK LOADER =================
  const loadRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // ================= PAYMENT FLOW =================
  const handleDirectPayment = async (plan: PlanFromAPI) => {
    setIsProcessing(plan._id);

    try {
      const orderRes = await fetch(`${apiBaseUrl}/payments/razorpay/create-order/subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subscription_plan_id: plan._id }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error(orderData.message || "Order creation failed");

      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        toast.error("Razorpay SDK failed to load. Please check internet connectivity.");
        setIsProcessing(null);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Design Agency",
        description: `Subscription: ${plan.name}`,
        order_id: orderData.order.id,
        handler: async function (response: RazorpayResponse) {
          try {
            const verifyRes = await fetch(`${apiBaseUrl}/payments/razorpay/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                type: "subscription",
                subscription_plan_id: plan._id,
                service_id: plan.services?.[0]?.id || "", 
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              toast.success("Subscription Activated! 🎉");
              fetchData(); 
            } else {
              toast.error(verifyData.message || "Verification failed");
            }
          } catch (err) {
            toast.error("Error verifying payment");
          } finally {
            setIsProcessing(null);
          }
        },
        prefill: { email: "user@example.com" },
        theme: { color: "#C4FE01" },
        modal: { ondismiss: () => setIsProcessing(null) }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : "Something went wrong";
      toast.error(errMessage);
      setIsProcessing(null);
    }
  };

  return (
    <MainLayout>
      <div className="mb-6 animate-fade-in">
        <h1 className="text-xs font-bold mb-1 tracking-[0.2em] uppercase">MEMBERSHIP PLANS</h1>
        <p className="text-muted-foreground text-xs">Choose the right plan for your design needs</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[440px] rounded-md bg-muted/40 animate-pulse border border-border/40" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10 font-sans">
            {plans.map((plan, index) => {
              const isActive = activePlanId === plan._id;
              
              return (
                <motion.div
                  key={plan._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.08 }}
                  whileHover={!isActive ? { y: -4 } : {}}
                >
                  <Card
                    className={cn(
                      'h-full overflow-hidden relative transition-all duration-300 flex flex-col justify-between border',
                      isActive ? 'border-[#C4FE01] bg-accent/5 shadow-[0_0_15px_rgba(196,254,1,0.12)]' : 'border-border'
                    )}
                  >
                    {isActive && (
                      <div className="absolute top-0 right-0 left-0 h-1 bg-[#C4FE01]" />
                    )}
                    
                    <CardHeader className="p-5 pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base sm:text-lg uppercase tracking-tight font-bold">{plan.name}</CardTitle>
                          <CardDescription className="text-xs">Valid for {plan.duration} days</CardDescription>
                        </div>
                        {isActive ? (
                          <Badge className="bg-[#C4FE01] text-black hover:bg-[#C4FE01] font-bold text-[10px] px-2 py-0.5">
                            ACTIVE
                          </Badge>
                        ) : (
                          index === 1 && <Badge variant="secondary" className="text-[10px] px-2 py-0.5">Popular</Badge>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="px-5 py-2 flex-grow">
                      <div className="mb-5">
                        <p className="text-2xl sm:text-3xl font-bold tracking-tight">
                          ₹{plan.price.toLocaleString()}
                          <span className="text-muted-foreground text-xs font-normal">/{plan.duration}d</span>
                        </p>
                        {isActive && expiryDate && (
                          <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1 uppercase tracking-wider font-semibold">
                            <CheckCircle2 className="h-3 w-3 text-[#C4FE01]" /> Ends on {expiryDate}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-3 mb-5">
                        <div className="flex items-center gap-2.5">
                          <Clock className="h-4 w-4 text-[#C4FE01] shrink-0" />
                          <span className="text-xs">{plan.turnaround_time} Day Turnaround</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <Zap className="h-4 w-4 text-[#C4FE01] shrink-0" />
                          <span className="text-xs">{plan.max_active_requests} Active Request{plan.max_active_requests > 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <CalendarClock className="h-4 w-4 text-[#C4FE01] shrink-0" />
                          <span className="text-xs">{plan.revision_limit === 0 ? 'Unlimited' : plan.revision_limit} Revisions</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <ShieldCheck className="h-4 w-4 text-[#C4FE01] shrink-0" />
                          <span className="text-xs">Dedicated Designer</span>
                        </div>
                      </div>

                      {plan.services && plan.services.length > 0 && (
                        <div className="pt-3 border-t border-border/40">
                          <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2 tracking-widest">Scope</p>
                          <div className="flex flex-wrap gap-1.5">
                            {plan.services.slice(0, 4).map((s) => (
                              <span key={s.id || s.name} className="text-[9px] bg-muted px-2 py-0.5 rounded-full border border-border/50 font-medium">
                                {s.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="p-5 pt-3">
                      <Button
                        className={cn(
                          "w-full font-bold h-9 flex items-center justify-center gap-2 uppercase tracking-wider text-[11px]",
                          isActive 
                            ? "bg-muted text-muted-foreground cursor-default hover:bg-muted" 
                            : "bg-[#C4FE01] text-black hover:bg-[#b2e600]"
                        )}
                        onClick={() => !isActive && handleDirectPayment(plan)}
                        disabled={isProcessing !== null || isActive}
                      >
                        {isProcessing === plan._id && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        {isActive ? "Current Plan" : (isProcessing === plan._id ? "Initializing..." : "Subscribe Now")}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {plans.length === 0 && (
            <div className="py-16 text-center border border-dashed border-border/50 rounded-lg">
              <p className="text-muted-foreground text-xs font-medium">No active subscription plans available at this time.</p>
            </div>
          )}
        </>
      )}
    </MainLayout>
  );
}