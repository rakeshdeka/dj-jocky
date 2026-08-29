
import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Package, CheckCircle, AlertCircle, Zap, Clock, Calendar } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '../ui/dialog';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
// import { Switch } from '../ui/switch';
import { toast } from 'sonner';

type PlanType = 'starter' | 'core' | 'growth';

const SubscriptionDetails = () => {
  const [currentPlan, setCurrentPlan] = useState<PlanType>('core');
  const [hasWebsiteAddon, setHasWebsiteAddon] = useState(true);
  const [isChangeDialogOpen, setIsChangeDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(currentPlan);
  const [isPauseDialogOpen, setIsPauseDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  
  const plans = {
    starter: {
      name: 'Starter',
      price: 833,
      updateTime: '48-hour',
      pausePerMonth: 1,
      features: [
        'Unlimited briefs',
        'Unlimited brands',
        'Unlimited file requests',
        'Easy payments',
        'Pause/cancel anytime'
      ]
    },
    core: {
      name: 'Core',
      price: 933,
      updateTime: '24-hour',
      pausePerMonth: 2,
      features: [
        'Unlimited briefs',
        'Unlimited brands',
        'Unlimited file requests',
        'Easy payments',
        'Pause/cancel anytime',
        'Priority support'
      ]
    },
    growth: {
      name: 'Growth',
      price: 1033,
      updateTime: '4-hour',
      pausePerMonth: 2,
      features: [
        'Unlimited briefs',
        'Unlimited brands',
        'Unlimited file requests',
        'Easy payments',
        'Pause/cancel anytime',
        'Priority support',
        'Advanced analytics',
        'Team collaboration'
      ]
    }
  };
  
  const websiteAddon = {
    name: 'Website Development',
    price: 625,
    features: [
      'Professional web design',
      'Mobile optimization',
      'SEO best practices',
      'Regular updates',
      'Technical support'
    ]
  };
  
  const nextBillingDate = new Date();
  nextBillingDate.setDate(nextBillingDate.getDate() + 15);
  
  const handleChangePlan = () => {
    setCurrentPlan(selectedPlan);
    setIsChangeDialogOpen(false);
    toast.success(`Your subscription has been updated to ${plans[selectedPlan].name}`);
  };
  
  const handleToggleAddon = () => {
    setHasWebsiteAddon(!hasWebsiteAddon);
    toast.success(hasWebsiteAddon 
      ? 'Website Development add-on removed' 
      : 'Website Development add-on added to your subscription'
    );
  };
  
  const handlePauseSubscription = () => {
    setIsPauseDialogOpen(false);
    toast.success('Your subscription has been paused');
  };
  
  const handleCancelSubscription = () => {
    setIsCancelDialogOpen(false);
    toast.success('Your subscription has been canceled');
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  return (
    <div>
      <div className="space-y-8">
        <h2 className="text-2xl font-semibold border-b border-border pb-4">Subscription Details</h2>
        
        <div className="">
          <Card className="bg-secondary/30 border-border col-span-1 md:col-span-2">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#C4FE01]/20 flex items-center justify-center">
                    <Package className="h-5 w-5 text-[#C4FE01]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-lg">{plans[currentPlan].name} Plan</h3>
                      <Badge variant="outline" className="bg-[#C4FE01]/10 text-[#C4FE01] border-[#C4FE01]/30">
                        Active
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      ${plans[currentPlan].price}/month
                    </p>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedPlan(currentPlan);
                    setIsChangeDialogOpen(true);
                  }}
                >
                  Change Plan
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 bg-background/20 p-3 rounded-lg">
                  <Clock className="h-5 w-5 text-[#C4FE01]" />
                  <div>
                    <p className="text-sm font-medium">{plans[currentPlan].updateTime} Updates</p>
                    <p className="text-xs text-muted-foreground">Turnaround time</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 bg-background/20 p-3 rounded-lg">
                  <Calendar className="h-5 w-5 text-[#C4FE01]" />
                  <div>
                    <p className="text-sm font-medium">{plans[currentPlan].pausePerMonth} Pauses/Month</p>
                    <p className="text-xs text-muted-foreground">Subscription flexibility</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">What's Included:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {plans[currentPlan].features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Next Billing Date</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(nextBillingDate)}
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsPauseDialogOpen(true)}
                    >
                      Pause Subscription
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={() => setIsCancelDialogOpen(true)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Change Plan Dialog */}
      <Dialog open={isChangeDialogOpen} onOpenChange={setIsChangeDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Change Subscription Plan</DialogTitle>
            <DialogDescription>
              Select the plan that works best for your needs
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <RadioGroup value={selectedPlan} onValueChange={(value) => setSelectedPlan(value as PlanType)}>
              {(Object.keys(plans) as PlanType[]).map((plan) => (
                <div 
                  key={plan} 
                  className={`p-4 rounded-lg border mb-4 cursor-pointer transition-all ${
                    selectedPlan === plan 
                      ? 'bg-primary/10 border-primary' 
                      : 'bg-background/50 border-border hover:border-primary/30'
                  }`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <div className="flex items-start">
                    <RadioGroupItem value={plan} id={`plan-${plan}`} className="mt-1" />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`plan-${plan}`} className="font-medium text-lg">
                          {plans[plan].name}
                        </Label>
                        <span className="font-bold">${plans[plan].price}/month</span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          <span className="text-sm">{plans[plan].updateTime} Updates</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span className="text-sm">{plans[plan].pausePerMonth} Pauses/Month</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChangeDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleChangePlan}
              disabled={selectedPlan === currentPlan}
            >
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Pause Subscription Dialog */}
      <Dialog open={isPauseDialogOpen} onOpenChange={setIsPauseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pause Subscription</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <p>
              Are you sure you want to pause your subscription? You have {plans[currentPlan].pausePerMonth} pause(s) available this month.
            </p>
            
            <div className="flex items-center p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
              <p className="text-sm">
                While paused, you won't be able to submit new briefs or request changes. Your subscription will automatically resume after 30 days.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPauseDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="default" onClick={handlePauseSubscription}>
              Pause Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Cancel Subscription Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <p>
              Are you sure you want to cancel your subscription? This will take effect at the end of your current billing period.
            </p>
            
            <div className="flex items-center p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
              <AlertCircle className="h-5 w-5 text-destructive mr-2 flex-shrink-0" />
              <p className="text-sm">
                After cancellation, you'll lose access to all DesignJockey services on {formatDate(nextBillingDate)}. Any pending work will be completed before then.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              Keep Subscription
            </Button>
            <Button variant="destructive" onClick={handleCancelSubscription}>
              Cancel Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionDetails;
