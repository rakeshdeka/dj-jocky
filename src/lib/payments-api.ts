import axios from 'axios';
import { toMessageText } from './admin-settings-shared';

export const apiBaseUrl = import.meta.env.VITE_API_URL;

export type PaymentRecord = {
  _id: string;
  amount?: number;
  currency?: string;
  status?: string;
  type?: 'subscription' | 'service' | 'cart' | string;
  subscription_status?: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  createdAt?: string;
  plan?: { _id?: string; name?: string };
  services?: Array<{ _id?: string; name?: string }>;
};

export type PaymentsQuery = {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  subscription_status?: string;
};

export type PaginatedPayments = {
  items: PaymentRecord[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type RazorpayOrderResponse = {
  success: boolean;
  message?: string;
  order?: {
    id: string;
    amount: number;
    currency: string;
  };
  razorpay_subscription_id?: string;
  checkout_config_id?: string;
};

export type VerifyPaymentPayload = {
  type: 'subscription' | 'service' | 'cart';
  subscription_plan_id?: string;
  service_id?: string;
  service_ids?: string[];
  razorpay_order_id?: string;
  razorpay_subscription_id?: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

const getAuthConfig = (token: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const getApiError = (data: unknown, fallback: string) =>
  toMessageText((data as Record<string, unknown>)?.error ?? (data as Record<string, unknown>)?.message, fallback);

export const fetchMyPayments = async (
  token: string,
  query: PaymentsQuery = {},
): Promise<PaginatedPayments> => {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;

  const res = await axios.get(`${apiBaseUrl}/payments/me`, {
    ...getAuthConfig(token),
    params: {
      page,
      limit,
      type: query.type || undefined,
      status: query.status || undefined,
      subscription_status: query.subscription_status || undefined,
    },
  });

  const data = res.data;
  if (data.success === false) throw new Error(getApiError(data, 'Failed to load payments'));

  const items: PaymentRecord[] = data.items || data.payments || data.data || [];
  const pagination = data.pagination || data.meta || {};
  const total = Number(pagination.total ?? data.total ?? items.length);
  const totalPages = Number(
    pagination.pages ?? pagination.totalPages ?? data.totalPages ?? Math.max(1, Math.ceil(total / limit)),
  );

  return {
    items,
    page: Number(pagination.page ?? data.page ?? page),
    limit: Number(pagination.limit ?? data.limit ?? limit),
    total,
    totalPages,
  };
};

export const createSubscriptionOrder = async (token: string, subscriptionPlanId: string) => {
  const res = await axios.post(
    `${apiBaseUrl}/payments/razorpay/create-order/subscription`,
    { subscription_plan_id: subscriptionPlanId },
    getAuthConfig(token),
  );
  const data = res.data as RazorpayOrderResponse;
  if (!data.success) throw new Error(getApiError(data, 'Order creation failed'));
  return data;
};

export const createServiceOrder = async (token: string, serviceId: string) => {
  const res = await axios.post(
    `${apiBaseUrl}/payments/razorpay/create-order/service`,
    { service_id: serviceId },
    getAuthConfig(token),
  );
  const data = res.data as RazorpayOrderResponse;
  if (!data.success) throw new Error(getApiError(data, 'Order creation failed'));
  return data;
};

export const createCartOrder = async (token: string) => {
  const res = await axios.post(
    `${apiBaseUrl}/payments/razorpay/create-order/cart`,
    {},
    getAuthConfig(token),
  );
  const data = res.data as RazorpayOrderResponse;
  if (!data.success) throw new Error(getApiError(data, 'Order creation failed'));
  return data;
};

export const verifyRazorpayPayment = async (token: string, payload: VerifyPaymentPayload) => {
  const res = await axios.post(`${apiBaseUrl}/payments/razorpay/verify`, payload, getAuthConfig(token));
  const data = res.data;
  if (!data.success) throw new Error(getApiError(data, 'Payment verification failed'));
  return data;
};

export const formatPaymentAmount = (payment: PaymentRecord) => {
  const currency = payment.currency || 'INR';
  const amount = Number(payment.amount) || 0;
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
};
