
import React from 'react';
import MainLayout from '../../../components/dashboard/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/dashboard/ui/card';
import { Button } from '../../../components/dashboard/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/dashboard/ui/table';
import { Badge } from '../../../components/dashboard/ui/badge';
import { CreditCard, Download, Eye, MoreHorizontal } from 'lucide-react';

interface Subscription {
  id: string;
  client: string;
  plan: string;
  status: 'active' | 'canceled' | 'trial' | 'past_due';
  amount: number;
  billingCycle: 'monthly' | 'yearly';
  startDate: string;
  nextBillingDate: string;
}

const mockSubscriptions: Subscription[] = [
  {
    id: 'SUB-001',
    client: 'Acme Corporation',
    plan: 'Business Pro',
    status: 'active',
    amount: 199,
    billingCycle: 'monthly',
    startDate: '2023-06-15',
    nextBillingDate: '2023-10-15'
  },
  {
    id: 'SUB-002',
    client: 'TechNova',
    plan: 'Enterprise',
    status: 'active',
    amount: 499,
    billingCycle: 'monthly',
    startDate: '2023-03-10',
    nextBillingDate: '2023-10-10'
  },
  {
    id: 'SUB-003',
    client: 'XYZ Startups',
    plan: 'Startup',
    status: 'trial',
    amount: 49,
    billingCycle: 'monthly',
    startDate: '2023-09-20',
    nextBillingDate: '2023-10-20'
  },
  {
    id: 'SUB-004',
    client: 'Global Media Inc.',
    plan: 'Business Pro',
    status: 'past_due',
    amount: 199,
    billingCycle: 'monthly',
    startDate: '2023-05-05',
    nextBillingDate: '2023-10-05'
  },
  {
    id: 'SUB-005',
    client: 'Innovate Solutions',
    plan: 'Business Lite',
    status: 'canceled',
    amount: 99,
    billingCycle: 'yearly',
    startDate: '2023-01-15',
    nextBillingDate: '2023-10-15'
  }
];

const AdminSubscriptions: React.FC = () => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
      case 'trial':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Trial</Badge>;
      case 'past_due':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Past Due</Badge>;
      case 'canceled':
        return <Badge className="bg-gray-500 hover:bg-gray-600">Canceled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Subscription Management</h1>
        <p className="text-muted-foreground">
          Manage all customer subscriptions and billing
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-secondary/30 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold">
                  {mockSubscriptions.filter(sub => sub.status === 'active').length}
                </p>
                <p className="text-sm text-muted-foreground">Current period</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-secondary/30 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold">
                  ${mockSubscriptions
                    .filter(sub => sub.status === 'active')
                    .reduce((sum, sub) => sum + sub.amount, 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">From subscriptions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-secondary/30 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Trial Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold">
                  {mockSubscriptions.filter(sub => sub.status === 'trial').length}
                </p>
                <p className="text-sm text-muted-foreground">Ending soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-secondary/30 border-border">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>All Subscriptions</CardTitle>
              <CardDescription>Manage customer subscription plans</CardDescription>
            </div>
            <Button size="sm" className="gap-1">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table className='font-sans'>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Billing Cycle</TableHead>
                <TableHead>Next Billing</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSubscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell className="font-medium">{subscription.id}</TableCell>
                  <TableCell>{subscription.client}</TableCell>
                  <TableCell>{subscription.plan}</TableCell>
                  <TableCell>${subscription.amount}</TableCell>
                  <TableCell className="capitalize">{subscription.billingCycle}</TableCell>
                  <TableCell>{new Date(subscription.nextBillingDate).toLocaleDateString()}</TableCell>
                  <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default AdminSubscriptions;
