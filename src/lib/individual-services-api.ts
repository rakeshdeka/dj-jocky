import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

export type ServiceHero = {
  title?: string;
  description?: string;
  subtitle?: string;
  image?: string;
};

export type ServiceSection = {
  type?: string;
  title?: string;
  description?: string;
  image?: string;
  imagePosition?: 'left' | 'right';
};

export type IndividualService = {
  _id: string;
  title?: string;
  name: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  hero?: ServiceHero;
  sections?: ServiceSection[];
  price: number;
  currency?: string;
  deliveryTime?: string;
  features?: string[];
  image_url?: string;
  available_individually?: boolean;
  category_id?: { _id?: string; name?: string };
  has_access?: boolean;
  is_included_in_subscription?: boolean;
  is_purchased_individually?: boolean;
  can_purchase?: boolean;
};

const getAuthConfig = (token: string | null) => ({
  headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  withCredentials: true,
});

const parseService = (item: any): IndividualService | null => {
  const service = item?.service ?? item?.item ?? item?.data ?? item;
  if (!service?._id) return null;
  return service;
};

export const getServiceDisplayName = (service: Pick<IndividualService, 'title' | 'name'>) =>
  service.title?.trim() || service.name;

export const getServiceSlugOrId = (service: Pick<IndividualService, '_id' | 'slug'>) =>
  service.slug || service._id;

export const getIndividualServiceImage = (
  service: Pick<IndividualService, 'name' | 'title' | 'image_url'>,
) => {
  if (service.image_url?.trim()) return service.image_url;
  const name = getServiceDisplayName(service);
  const initial = name.trim().charAt(0).toUpperCase() || 'S';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initial)}&background=C4FE01&color=000000&size=512&bold=true&format=png`;
};

export const formatServicePrice = (service: Pick<IndividualService, 'price' | 'currency'>) => {
  const currency = service.currency || 'USD';
  if (currency === 'USD') return `$${service.price.toLocaleString()}`;
  return `${currency} ${service.price.toLocaleString()}`;
};

export const fetchIndividualServices = async (token: string | null): Promise<IndividualService[]> => {
  const res = await axios.get(`${apiUrl}/services/individual`, getAuthConfig(token));
  const items = res.data.items || res.data.services || res.data.data || [];
  return items.map(parseService).filter(Boolean) as IndividualService[];
};

export const fetchIndividualService = async (
  token: string | null,
  slugOrId: string,
): Promise<IndividualService> => {
  const res = await axios.get(`${apiUrl}/services/individual/${slugOrId}`, getAuthConfig(token));
  const service = parseService(res.data);
  if (!service) {
    throw new Error(res.data?.message || 'Service not found');
  }
  return service;
};
