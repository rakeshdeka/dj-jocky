import axios from 'axios';

export const apiBaseUrl = import.meta.env.VITE_API_URL;

export type CountryPricing = {
  country: string;
  currency: string;
  price: number;
};

export type PlanFeature = {
  label: string;
  value?: string;
};

export type AdminPlan = {
  _id: string;
  name: string;
  slug?: string;
  tier?: string;
  is_custom_tier?: boolean;
  description?: string;
  price: number;
  currency?: string;
  country_pricing?: CountryPricing[];
  billing_interval?: string;
  duration: number;
  max_active_requests?: number | null;
  services?: string[] | { _id?: string; id?: string; name?: string }[];
  inherits_from?: string[];
  features?: PlanFeature[];
  custom_pricing?: boolean;
  requires_consultation?: boolean;
  consultation_label?: string;
  consultation_url?: string;
  is_active?: boolean;
  sort_order?: number;
};

export type AdminPlanPayload = {
  name: string;
  slug: string;
  tier: string;
  is_custom_tier: boolean;
  description: string;
  price: number;
  currency: string;
  country_pricing: CountryPricing[];
  billing_interval: string;
  duration: number;
  max_active_requests: number | null;
  services: string[];
  inherits_from: string[];
  features: PlanFeature[];
  custom_pricing: boolean;
  requires_consultation: boolean;
  consultation_label: string;
  consultation_url: string;
  is_active: boolean;
  sort_order: number;
};

export type AssignSubscriptionPayload = {
  client_id: string;
  subscription_plan_id: string;
  amount: number;
  duration_days: number;
  expiry_date: string;
};

export type PlanFormState = {
  name: string;
  slug: string;
  tier: string;
  is_custom_tier: boolean;
  description: string;
  price: string;
  currency: string;
  country_pricing: CountryPricing[];
  billing_interval: string;
  duration: string;
  max_active_requests: string;
  services: string[];
  inherits_from: string[];
  features: PlanFeature[];
  custom_pricing: boolean;
  requires_consultation: boolean;
  consultation_label: string;
  consultation_url: string;
  is_active: boolean;
  sort_order: string;
};

export type AdminPlansQuery = {
  page?: number;
  limit?: number;
};

export type PaginatedAdminPlans = {
  items: AdminPlan[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const getAuthConfig = (token: string) => ({
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  withCredentials: true,
});

const parseList = (data: any): AdminPlan[] => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.plans)) return data.plans;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

export const slugifyPlan = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export const emptyPlanFeature = (): PlanFeature => ({ label: '', value: '' });

export const emptyCountryPricing = (): CountryPricing => ({
  country: 'IN',
  currency: 'INR',
  price: 0,
});

export const emptyPlanForm = (): PlanFormState => ({
  name: '',
  slug: '',
  tier: '',
  is_custom_tier: false,
  description: '',
  price: '0',
  currency: 'USD',
  country_pricing: [],
  billing_interval: 'monthly',
  duration: '30',
  max_active_requests: '',
  services: [],
  inherits_from: [],
  features: [emptyPlanFeature()],
  custom_pricing: false,
  requires_consultation: false,
  consultation_label: '',
  consultation_url: '',
  is_active: true,
  sort_order: '0',
});

const normalizeServiceIds = (services: AdminPlan['services']): string[] => {
  if (!Array.isArray(services)) return [];
  return services
    .map((item) => {
      if (typeof item === 'string') return item;
      return item._id || item.id || '';
    })
    .filter(Boolean);
};

export const mapPlanToForm = (plan: AdminPlan): PlanFormState => ({
  name: plan.name || '',
  slug: plan.slug || slugifyPlan(plan.name || ''),
  tier: plan.tier || '',
  is_custom_tier: Boolean(plan.is_custom_tier),
  description: plan.description || '',
  price: plan.price != null ? String(plan.price) : '0',
  currency: plan.currency || 'USD',
  country_pricing: Array.isArray(plan.country_pricing) ? plan.country_pricing : [],
  billing_interval: plan.billing_interval || 'monthly',
  duration: plan.duration != null ? String(plan.duration) : '30',
  max_active_requests:
    plan.max_active_requests == null ? '' : String(plan.max_active_requests),
  services: normalizeServiceIds(plan.services),
  inherits_from: Array.isArray(plan.inherits_from) ? plan.inherits_from : [],
  features:
    Array.isArray(plan.features) && plan.features.length > 0
      ? plan.features.map((feature) => ({
          label: feature.label || '',
          value: feature.value || '',
        }))
      : [emptyPlanFeature()],
  custom_pricing: Boolean(plan.custom_pricing),
  requires_consultation: Boolean(plan.requires_consultation),
  consultation_label: plan.consultation_label || '',
  consultation_url: plan.consultation_url || '',
  is_active: plan.is_active !== false,
  sort_order: plan.sort_order != null ? String(plan.sort_order) : '0',
});

export const buildPlanPayload = (form: PlanFormState): AdminPlanPayload => ({
  name: form.name.trim(),
  slug: form.slug.trim() || slugifyPlan(form.name),
  tier: form.tier.trim(),
  is_custom_tier: form.is_custom_tier,
  description: form.description.trim(),
  price: Number(form.price) || 0,
  currency: form.currency.trim() || 'USD',
  country_pricing: form.country_pricing
    .filter((entry) => entry.country.trim() && entry.currency.trim())
    .map((entry) => ({
      country: entry.country.trim().toUpperCase(),
      currency: entry.currency.trim().toUpperCase(),
      price: Number(entry.price) || 0,
    })),
  billing_interval: form.billing_interval || 'monthly',
  duration: Number(form.duration) || 30,
  max_active_requests: form.max_active_requests.trim()
    ? Number(form.max_active_requests)
    : null,
  services: form.services,
  inherits_from: form.inherits_from,
  features: form.features
    .map((feature) => {
      const label = feature.label.trim();
      const value = feature.value?.trim();
      return value ? { label, value } : { label };
    })
    .filter((feature) => feature.label),
  custom_pricing: form.custom_pricing,
  requires_consultation: form.requires_consultation,
  consultation_label: form.consultation_label.trim(),
  consultation_url: form.consultation_url.trim(),
  is_active: form.is_active,
  sort_order: Number(form.sort_order) || 0,
});

export const validatePlanForm = (form: PlanFormState): string | null => {
  if (!form.name.trim()) return 'Plan name is required';
  if (!form.slug.trim() && !form.name.trim()) return 'Slug is required';
  if (!Number.isFinite(Number(form.duration)) || Number(form.duration) <= 0) {
    return 'Enter a valid duration';
  }
  if (!Number.isFinite(Number(form.price)) || Number(form.price) < 0) {
    return 'Enter a valid price';
  }
  if (
    form.max_active_requests.trim() &&
    (!Number.isFinite(Number(form.max_active_requests)) ||
      Number(form.max_active_requests) < 0)
  ) {
    return 'Enter a valid max active requests value';
  }
  return null;
};

export const isCustomPlan = (plan: AdminPlan) =>
  Boolean(plan.custom_pricing || plan.requires_consultation || plan.is_custom_tier);

const DEFAULT_PLAN_PAGE_LIMIT = 20;

const getApiErrorMessage = (data: any, fallback: string) =>
  data?.error?.message || data?.message || fallback;

const parsePagination = (
  data: any,
  items: AdminPlan[],
  query: AdminPlansQuery,
): PaginatedAdminPlans => {
  const pagination = data.pagination || data.meta || {};
  const page = Number(pagination.page ?? data.page ?? query.page ?? 1);
  const limit = Number(pagination.limit ?? data.limit ?? query.limit ?? DEFAULT_PLAN_PAGE_LIMIT);
  const total = Number(pagination.total ?? data.total ?? items.length);
  const totalPages = Number(
    pagination.pages ??
      pagination.totalPages ??
      data.totalPages ??
      Math.max(1, Math.ceil(total / Math.max(limit, 1))),
  );

  return { items, page, limit, total, totalPages };
};

export const fetchAdminPlans = async (
  token: string,
  query: AdminPlansQuery = {},
): Promise<PaginatedAdminPlans> => {
  const page = query.page ?? 1;
  const limit = Math.min(query.limit ?? DEFAULT_PLAN_PAGE_LIMIT, DEFAULT_PLAN_PAGE_LIMIT);

  const res = await axios.get(`${apiBaseUrl}/admin/plans`, {
    ...getAuthConfig(token),
    params: { page, limit },
  });
  const data = res.data;
  if (data.success === false) {
    throw new Error(getApiErrorMessage(data, 'Failed to load plans'));
  }

  return parsePagination(data, parseList(data), { page, limit });
};

export const fetchAdminPlansDropdown = async (token: string): Promise<AdminPlan[]> => {
  const firstPage = await fetchAdminPlans(token, { page: 1, limit: DEFAULT_PLAN_PAGE_LIMIT });
  if (firstPage.totalPages <= 1) return firstPage.items;

  const allItems = [...firstPage.items];
  for (let currentPage = 2; currentPage <= firstPage.totalPages; currentPage += 1) {
    const nextPage = await fetchAdminPlans(token, {
      page: currentPage,
      limit: DEFAULT_PLAN_PAGE_LIMIT,
    });
    allItems.push(...nextPage.items);
  }
  return allItems;
};

export const fetchAdminPlan = async (token: string, planId: string) => {
  const res = await axios.get(`${apiBaseUrl}/admin/plans/${planId}`, getAuthConfig(token));
  const data = res.data;
  if (data.success === false) throw new Error(getApiErrorMessage(data, 'Failed to load plan'));
  return (data.item || data.plan || data.data) as AdminPlan;
};

export const createAdminPlan = async (token: string, payload: AdminPlanPayload) => {
  const res = await axios.post(`${apiBaseUrl}/admin/plans`, payload, getAuthConfig(token));
  const data = res.data;
  if (data.success === false) throw new Error(getApiErrorMessage(data, 'Failed to create plan'));
  return data;
};

export const updateAdminPlan = async (
  token: string,
  planId: string,
  payload: AdminPlanPayload,
) => {
  const res = await axios.patch(`${apiBaseUrl}/admin/plans/${planId}`, payload, getAuthConfig(token));
  const data = res.data;
  if (data.success === false) throw new Error(getApiErrorMessage(data, 'Failed to update plan'));
  return data;
};

export const deleteAdminPlan = async (token: string, planId: string) => {
  const res = await axios.delete(`${apiBaseUrl}/admin/plans/${planId}`, getAuthConfig(token));
  const data = res.data;
  if (data.success === false) throw new Error(getApiErrorMessage(data, 'Failed to delete plan'));
  return data;
};

export const assignAdminSubscription = async (
  token: string,
  payload: AssignSubscriptionPayload,
) => {
  const res = await axios.post(
    `${apiBaseUrl}/admin/subscriptions/assign`,
    payload,
    getAuthConfig(token),
  );
  const data = res.data;
  if (data.success === false) throw new Error(getApiErrorMessage(data, 'Failed to assign subscription'));
  return data;
};

export const fetchAdminClientsDropdown = async (token: string) => {
  const res = await axios.get(`${apiBaseUrl}/admin/clients/dropdown`, getAuthConfig(token));
  const list = Array.isArray(res.data) ? res.data : res.data?.items ?? [];
  return list
    .map((item: any) => ({
      id: String(item._id || item.id || ''),
      name: item.name || item.email || 'Unnamed',
    }))
    .filter((item: { id: string }) => item.id);
};

export const formatPlanPrice = (plan: AdminPlan) => {
  const currency = plan.currency || 'USD';
  const price = Number(plan.price) || 0;
  if (plan.custom_pricing) return 'Custom pricing';
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
