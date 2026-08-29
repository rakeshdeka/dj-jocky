import { apiBaseUrl, getAuthHeaders, toMessageText } from './admin-settings-shared';

export type Country = {
  _id: string;
  code: string;
  name: string;
  is_active: boolean;
};

export type Currency = {
  _id: string;
  code: string;
  name: string;
  symbol: string;
  is_active: boolean;
};

export type CreateCountryPayload = {
  code: string;
  name: string;
  is_active: boolean;
};

export type CreateCurrencyPayload = {
  code: string;
  name: string;
  symbol: string;
  is_active: boolean;
};

const parseItems = <T,>(data: Record<string, unknown>): T[] => {
  if (Array.isArray(data.items)) return data.items as T[];
  if (Array.isArray(data.countries)) return data.countries as T[];
  if (Array.isArray(data.currencies)) return data.currencies as T[];
  if (Array.isArray(data.data)) return data.data as T[];
  return [];
};

const requestJson = async (token: string, path: string, options?: RequestInit) => {
  const res = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(token),
      ...(options?.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(toMessageText(data.error ?? data.message, 'Request failed'));
  }
  return data;
};

export const fetchCountries = async (token: string): Promise<Country[]> => {
  const data = await requestJson(token, '/admin/countries');
  return parseItems<Country>(data);
};

export const createCountry = async (token: string, payload: CreateCountryPayload): Promise<Country> => {
  const data = await requestJson(token, '/admin/countries', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return (data.country || data.item || data.data || data) as Country;
};

export const updateCountry = async (
  token: string,
  id: string,
  payload: CreateCountryPayload,
): Promise<Country> => {
  const data = await requestJson(token, `/admin/countries/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return (data.country || data.item || data.data || data) as Country;
};

export const deleteCountry = async (token: string, id: string): Promise<void> => {
  await requestJson(token, `/admin/countries/${id}`, { method: 'DELETE' });
};

export const fetchCurrencies = async (token: string): Promise<Currency[]> => {
  const data = await requestJson(token, '/admin/currencies');
  return parseItems<Currency>(data);
};

export const createCurrency = async (token: string, payload: CreateCurrencyPayload): Promise<Currency> => {
  const data = await requestJson(token, '/admin/currencies', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return (data.currency || data.item || data.data || data) as Currency;
};

export const updateCurrency = async (
  token: string,
  id: string,
  payload: CreateCurrencyPayload,
): Promise<Currency> => {
  const data = await requestJson(token, `/admin/currencies/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return (data.currency || data.item || data.data || data) as Currency;
};

export const deleteCurrency = async (token: string, id: string): Promise<void> => {
  await requestJson(token, `/admin/currencies/${id}`, { method: 'DELETE' });
};
