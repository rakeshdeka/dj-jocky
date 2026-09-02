import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, CreditCard, Loader2 } from 'lucide-react';
import type { RootState } from '../../../store/store';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  fetchMyPayments,
  formatPaymentAmount,
  type PaymentRecord,
} from '../../../lib/payments-api';

const PaymentHistory = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [subscriptionStatusFilter, setSubscriptionStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const loadPayments = useCallback(async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const result = await fetchMyPayments(token, {
        page,
        limit: 10,
        type: typeFilter === 'all' ? undefined : typeFilter,
        status: statusFilter === 'all' ? undefined : statusFilter,
        subscription_status:
          subscriptionStatusFilter === 'all' ? undefined : subscriptionStatusFilter,
      });
      setPayments(result.items);
      setTotalPages(result.totalPages);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to load payment history');
    } finally {
      setIsLoading(false);
    }
  }, [token, page, typeFilter, statusFilter, subscriptionStatusFilter]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  useEffect(() => {
    setPage(1);
  }, [typeFilter, statusFilter, subscriptionStatusFilter]);

  const getStatusVariant = (status?: string) => {
    const normalized = (status || '').toLowerCase();
    if (normalized === 'paid' || normalized === 'captured' || normalized === 'active') return 'default';
    if (normalized === 'failed' || normalized === 'cancelled' || normalized === 'canceled') return 'destructive';
    return 'secondary';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-[#C4FE01]/20 flex items-center justify-center">
          <CreditCard className="h-5 w-5 text-[#C4FE01]" />
        </div>
        <div>
          <h3 className="font-medium text-lg">Payment History</h3>
          <p className="text-sm text-muted-foreground">Razorpay transactions and subscription payments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="subscription">Subscription</SelectItem>
            <SelectItem value="service">Service</SelectItem>
            <SelectItem value="cart">Cart</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="captured">Captured</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>

        <Select value={subscriptionStatusFilter} onValueChange={setSubscriptionStatusFilter}>
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="Subscription status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All subscription statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="canceled">Canceled</SelectItem>
            <SelectItem value="past_due">Past due</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading payments...
            </div>
          ) : payments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell className="text-xs">
                      {payment.createdAt
                        ? new Date(payment.createdAt).toLocaleDateString()
                        : '—'}
                    </TableCell>
                    <TableCell className="text-xs capitalize">{payment.type || '—'}</TableCell>
                    <TableCell className="text-xs">
                      {payment.plan?.name ||
                        payment.services?.map((service) => service.name).filter(Boolean).join(', ') ||
                        '—'}
                    </TableCell>
                    <TableCell className="text-xs font-medium">{formatPaymentAmount(payment)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(payment.status)} className="text-[10px] capitalize">
                        {payment.status || 'unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[10px] font-mono text-muted-foreground">
                      {payment.razorpay_payment_id || '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-16 text-center text-sm text-muted-foreground">No payments found.</div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page >= totalPages || isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
