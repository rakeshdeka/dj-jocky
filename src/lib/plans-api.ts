import axios from 'axios';
import { toMessageText } from './admin-settings-shared';

export const apiBaseUrl = import.meta.env.VITE_API_URL;

export type PlanFeature = {
  label: string;
  value?: string;
};

export type ClientPlan = {
  _id: string;
  name: string;
  slug?: string;
  tier?: string;
  description?: string;
  price: number;
  currency?: string;
  duration: number;
  billing_interval?: string;
  max_active_requests?: number | null;
  features?: PlanFeature[];
  services?: Array<string | { _id?: string; id?: string; name?: string }>;
  subscription_action?: 'subscribe' | 'switch' | 'current' | string;
  is_subscribed?: boolean;
  checkout_available?: boolean;
  custom_pricing?: boolean;
  requires_consultation?: boolean;
  consultation_label?: string;
  consultation_url?: string;
  is_active?: boolean;
};

export type ActiveSubscriptionResponse = {
  subscription?: {
    _id?: string;
    status?: string;
    expiry_date?: string;
    auto_renew?: boolean;
    cancel_at_period_end?: boolean;
  };
  plan?: ClientPlan;
  activePlan?: ClientPlan;
  included_services?: Array<{ _id?: string; name?: string }>;
  individual_services?: Array<{ _id?: string; name?: string }>;
  limits?: Record<string, unknown>;
};

export type CountryOption = {
  _id: string;
  code: string;
  name: string;
  is_active?: boolean;
};

export type CurrencyOption = {
  _id: string;
  code: string;
  name: string;
  symbol?: string;
  is_active?: boolean;
};

export type FetchPlansQuery = {
  all?: boolean;
  country?: string;
};

const getAuthConfig = (token?: string | null) => ({
  headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  withCredentials: true,
});

const parsePlans = (data: Record<string, unknown>): ClientPlan[] => {
  if (Array.isArray(data.items)) return data.items as ClientPlan[];
  if (Array.isArray(data.plans)) return data.plans as ClientPlan[];
  if (Array.isArray(data.data)) return data.data as ClientPlan[];
  return [];
};

const getApiError = (data: unknown, fallback: string) =>
  toMessageText((data as Record<string, unknown>)?.error ?? (data as Record<string, unknown>)?.message, fallback);

export const fetchClientPlans = async (
  token?: string | null,
  query: FetchPlansQuery = {},
): Promise<ClientPlan[]> => {
  const params: Record<string, string | boolean> = {};
  if (query.all) params.all = true;
  if (query.country) params.country = query.country.toUpperCase();

  const res = await axios.get(`${apiBaseUrl}/plans`, {
    ...getAuthConfig(token),
    params,
  });
  const data = res.data;
  if (data.success === false) throw new Error(getApiError(data, 'Failed to load plans'));
  return parsePlans(data);
};

export const fetchClientPlan = async (
  idOrSlug: string,
  token?: string | null,
): Promise<ClientPlan> => {
  const res = await axios.get(`${apiBaseUrl}/plans/${idOrSlug}`, getAuthConfig(token));
  const data = res.data;
  if (data.success === false) throw new Error(getApiError(data, 'Failed to load plan'));
  return (data.plan || data.item || data.data) as ClientPlan;
};

export const fetchActiveSubscription = async (
  token: string,
): Promise<ActiveSubscriptionResponse> => {
  const res = await axios.get(`${apiBaseUrl}/plans/active`, getAuthConfig(token));
  const data = res.data;
  if (data.success === false) throw new Error(getApiError(data, 'Failed to load subscription'));
  return data as ActiveSubscriptionResponse;
};

export const cancelSubscription = async (
  token: string,
  options: { cancel_at_period_end?: boolean } = { cancel_at_period_end: true },
) => {
  const res = await axios.post(`${apiBaseUrl}/subscriptions/cancel`, options, getAuthConfig(token));
  const data = res.data;
  if (data.success === false) throw new Error(getApiError(data, 'Failed to cancel subscription'));
  return data;
};

export const fetchCountries = async (): Promise<CountryOption[]> => {
  const res = await axios.get(`${apiBaseUrl}/countries`);
  const data = res.data;
  if (data.success === false) throw new Error(getApiError(data, 'Failed to load countries'));
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.countries)) return data.countries;
  if (Array.isArray(data.data)) return data.data;
  return [];
};

export const fetchCurrencies = async (): Promise<CurrencyOption[]> => {
  const res = await axios.get(`${apiBaseUrl}/currencies`);
  const data = res.data;
  if (data.success === false) throw new Error(getApiError(data, 'Failed to load currencies'));
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.currencies)) return data.currencies;
  if (Array.isArray(data.data)) return data.data;
  return [];
};

export const getPlanServiceNames = (plan: ClientPlan): string[] => {
  if (!Array.isArray(plan.services)) return [];
  return plan.services
    .map((service) => {
      if (typeof service === 'string') return service;
      return service.name || '';
    })
    .filter(Boolean);
};

export const formatPlanPrice = (plan: ClientPlan) => {
  const currency = plan.currency || 'INR';
  const price = Number(plan.price) || 0;
  if (plan.custom_pricing || plan.requires_consultation) return 'Custom pricing';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `${currency} ${price.toLocaleString()}`;
  }
};

export const getPlanActionLabel = (plan: ClientPlan) => {
  if (plan.is_subscribed) return 'Current Plan';
  if (plan.checkout_available === false) {
    return plan.consultation_label || 'Contact Sales';
  }
  if (plan.subscription_action === 'switch') return 'Switch to this plan';
  return 'Subscribe Now';
};

export const canCheckoutPlan = (plan: ClientPlan) =>
  !plan.is_subscribed && plan.checkout_available !== false && !plan.custom_pricing && !plan.requires_consultation;
