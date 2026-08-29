
import React from 'react';
import MainLayout from '../../../components/dashboard/layout/MainLayout';
import { Card, CardContent } from '../../../components/dashboard/ui/card';
import { Input } from '../../../components/dashboard/ui/input';
import { Button } from '../../../components/dashboard/ui/button';
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
  Download, 
  Filter, 
  MoreHorizontal, 
  Search, 
  FileText, 
  CreditCard,
  PlusCircle,
} from 'lucide-react';
import { toast } from 'sonner';

type Invoice = {
  id: string;
  invoiceNumber: string;
  date: string;
  amount: string;
  status: 'Paid' | 'Pending' | 'Failed';
  subscription: string;
};

const Invoices = () => {
  const [invoices, setInvoices] = React.useState<Invoice[]>([
    {
      id: '1',
      invoiceNumber: 'INV-0001',
      date: '01 Jun 2023',
      amount: '$933.00',
      status: 'Paid',
      subscription: 'Core Plan',
    },
    {
      id: '2',
      invoiceNumber: 'INV-0002',
      date: '01 Jul 2023',
      amount: '$933.00',
      status: 'Paid',
      subscription: 'Core Plan',
    },
    {
      id: '3',
      invoiceNumber: 'INV-0003',
      date: '01 Aug 2023',
      amount: '$933.00',
      status: 'Paid',
      subscription: 'Core Plan',
    },
    {
      id: '4',
      invoiceNumber: 'INV-0004',
      date: '01 Sep 2023',
      amount: '$933.00',
      status: 'Paid',
      subscription: 'Core Plan',
    },
    {
      id: '5',
      invoiceNumber: 'INV-0005',
      date: '01 Oct 2023',
      amount: '$933.00',
      status: 'Paid',
      subscription: 'Core Plan',
    },
    {
      id: '6',
      invoiceNumber: 'INV-0006',
      date: '01 Nov 2023',
      amount: '$933.00',
      status: 'Pending',
      subscription: 'Core Plan',
    },
  ]);

  const [isAddPaymentMethodOpen, setIsAddPaymentMethodOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleDownload = (invoiceId: string) => {
    // In a real app, you would generate or fetch a PDF from the server
    toast.success(`Invoice ${invoiceId} downloaded`);
  };

  const handleAddPaymentMethod = () => {
    // In a real app, you would integrate with a payment processor
    toast.success('New payment method added successfully');
    setIsAddPaymentMethodOpen(false);
  };

  const filteredInvoices = invoices.filter(invoice => 
    invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.subscription.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Invoices & Billing</h1>
        <p className="text-muted-foreground">
          View and manage your billing history and payment methods
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search invoices..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
            <Button variant="outline" className="flex items-center gap-2" onClick={() => setIsAddPaymentMethodOpen(true)}>
              <CreditCard className="h-4 w-4" />
              <span>Add Payment Method</span>
            </Button>
          </div>
        </div>

        <Card className="bg-secondary/30 border-border">
          <CardContent className="p-6">
            <div className="rounded-lg border border-border bg-background/50 p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Current Method</h3>
                    <p className="text-sm text-muted-foreground">Visa ending in 4242</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Subscription</h3>
                    <p className="text-sm text-muted-foreground">Core Plan - $933.00/month</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <PlusCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Next Invoice</h3>
                    <p className="text-sm text-muted-foreground">December 1, 2023</p>
                  </div>
                </div>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.invoiceNumber}</TableCell>
                    <TableCell>{invoice.date}</TableCell>
                    <TableCell>{invoice.amount}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        invoice.status === 'Paid' 
                          ? 'bg-green-500/10 text-green-500' 
                          : invoice.status === 'Pending'
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'bg-red-500/10 text-red-500'
                      }`}>
                        {invoice.status}
                      </span>
                    </TableCell>
                    <TableCell>{invoice.subscription}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-sm border-border">
                          <DropdownMenuItem 
                            className="flex items-center gap-2 cursor-pointer"
                            onSelect={() => handleDownload(invoice.invoiceNumber)}
                          >
                            <Download className="h-4 w-4" />
                            <span>Download PDF</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                            <FileText className="h-4 w-4" />
                            <span>View Details</span>
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
      </div>

      {/* Add Payment Method Dialog */}
      <Dialog open={isAddPaymentMethodOpen} onOpenChange={setIsAddPaymentMethodOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
            <DialogDescription>
              Enter your card details to add a new payment method.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input id="cardNumber" type="text" placeholder="4242 4242 4242 4242" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input id="expiryDate" type="text" placeholder="MM/YY" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input id="cvc" type="text" placeholder="123" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardName">Name on Card</Label>
              <Input id="cardName" type="text" placeholder="John Doe" />
            </div>
            <div className="rounded-md bg-blue-500/10 p-4 text-sm text-blue-500">
              <p>A temporary charge of $0.50 will be made to verify your card. This amount will be refunded immediately.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddPaymentMethodOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPaymentMethod}>
              Add Card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Invoices;
