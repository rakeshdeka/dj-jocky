
import React, { useState } from 'react';
import MainLayout from '../../../components/dashboard/layout/MainLayout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from '../../../components/dashboard/ui/card';
import { Button } from '../../../components/dashboard/ui/button';
import { 
  Alert,
  AlertTitle,
  AlertDescription
} from '../../../components/dashboard/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../components/dashboard/ui/dialog";
import { PauseCircle, CheckCircle, AlertCircle, Calendar, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type PauseDuration = 30 | 60 | 90;

const PauseSubscription = () => {
  const [selectedDuration, setSelectedDuration] = useState<PauseDuration | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handlePauseSubscription = () => {
    // In a real app, you would make an API call to pause the subscription
    toast.success(`Subscription paused for ${selectedDuration} days`);
    setIsConfirmDialogOpen(false);
    
    // Redirect to the profile page after a short delay
    setTimeout(() => {
      navigate('/profile');
    }, 1500);
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <Link to="/profile" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-3xl font-bold">Pause Subscription</h1>
        </div>
        <p className="text-muted-foreground mt-2">
          Temporarily pause your subscription and resume it later
        </p>
      </div>

      <div className="space-y-6">
        <Alert className="bg-amber-500/10 text-amber-500 border-amber-500/30">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Important Notice</AlertTitle>
          <AlertDescription>
            Your subscription can be paused for up to 90 days. During this time, you won't be charged and you'll lose access to the service. You can resume your subscription anytime.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className={`bg-secondary/30 border-border hover:border-primary/50 transition-all cursor-pointer ${selectedDuration === 30 ? 'border-primary' : ''}`}
            onClick={() => setSelectedDuration(30)}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span>30 Days</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Pause your subscription for 30 days. Your service will automatically resume after this period.
              </p>
            </CardContent>
            <CardFooter className="pt-3 border-t border-border">
              <div className="w-full flex justify-between items-center">
                <span className="text-sm font-medium">Next billing: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                {selectedDuration === 30 && <CheckCircle className="h-5 w-5 text-primary" />}
              </div>
            </CardFooter>
          </Card>

          <Card className={`bg-secondary/30 border-border hover:border-primary/50 transition-all cursor-pointer ${selectedDuration === 60 ? 'border-primary' : ''}`}
            onClick={() => setSelectedDuration(60)}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span>60 Days</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Pause your subscription for 60 days. Your service will automatically resume after this period.
              </p>
            </CardContent>
            <CardFooter className="pt-3 border-t border-border">
              <div className="w-full flex justify-between items-center">
                <span className="text-sm font-medium">Next billing: {new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                {selectedDuration === 60 && <CheckCircle className="h-5 w-5 text-primary" />}
              </div>
            </CardFooter>
          </Card>

          <Card className={`bg-secondary/30 border-border hover:border-primary/50 transition-all cursor-pointer ${selectedDuration === 90 ? 'border-primary' : ''}`}
            onClick={() => setSelectedDuration(90)}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span>90 Days</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Pause your subscription for 90 days. Your service will automatically resume after this period.
              </p>
            </CardContent>
            <CardFooter className="pt-3 border-t border-border">
              <div className="w-full flex justify-between items-center">
                <span className="text-sm font-medium">Next billing: {new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                {selectedDuration === 90 && <CheckCircle className="h-5 w-5 text-primary" />}
              </div>
            </CardFooter>
          </Card>
        </div>

        <Card className="bg-secondary/30 border-border">
          <CardHeader>
            <CardTitle>Current Subscription Details</CardTitle>
            <CardDescription>
              Review your current plan before pausing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-background/50 border border-border">
                <h3 className="font-medium mb-1">Core Plan</h3>
                <p className="text-muted-foreground text-sm">$933.00/month</p>
              </div>
              <div className="p-4 rounded-lg bg-background/50 border border-border">
                <h3 className="font-medium mb-1">Next Billing Date</h3>
                <p className="text-muted-foreground text-sm">December 1, 2023</p>
              </div>
            </div>
            <div className="rounded-lg bg-background/50 border border-border p-4">
              <h3 className="font-medium mb-2">What happens when you pause?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Your subscription payments will be paused immediately</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>You'll lose access to all services during the pause period</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Your subscription will automatically resume after the selected period</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>You can resume your subscription manually at any time</span>
                </li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-4">
            <Button 
              variant="outline"
              onClick={() => navigate('/profile')}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              variant="default" 
              className="w-full sm:w-auto flex items-center gap-2" 
              disabled={!selectedDuration}
              onClick={() => setIsConfirmDialogOpen(true)}
            >
              <PauseCircle className="h-4 w-4" />
              <span>Pause Subscription</span>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Subscription Pause</DialogTitle>
            <DialogDescription>
              Are you sure you want to pause your subscription for {selectedDuration} days?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert className="bg-blue-500/10 text-blue-500 border-blue-500/30">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your subscription will automatically resume on {selectedDuration ? new Date(Date.now() + selectedDuration * 24 * 60 * 60 * 1000).toLocaleDateString() : ''}.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handlePauseSubscription}
              className="flex items-center gap-2"
            >
              <PauseCircle className="h-4 w-4" />
              <span>Confirm Pause</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default PauseSubscription;
