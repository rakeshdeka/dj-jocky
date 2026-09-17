import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

export type ServiceDropdownStatus = 'available' | 'active';

export type ServiceAccessSource = 'individual' | 'subscription' | string;

export type DropdownService = {
  id: string;
  _id?: string;
  slug?: string;
  name: string;
  price?: number;
  access_source?: ServiceAccessSource;
  dropdown_status?: ServiceDropdownStatus;
  dropdown_label?: string;
  can_create_brief?: boolean;
  active_brief_id?: string;
  active_brief_status?: string;
  active_brief_title?: string;
};

export type ServiceDropdownCategory = {
  _id?: string;
  id?: string;
  name: string;
  services?: DropdownService[];
};

const getAuthConfig = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
  withCredentials: true,
});

const normalizeDropdownService = (service: Record<string, unknown>): DropdownService => {
  const id = String(service.id || service._id || '');
  return {
    ...service,
    id,
    _id: id,
    name: String(service.name || 'Service'),
    dropdown_status: service.dropdown_status as ServiceDropdownStatus | undefined,
    slug: typeof service.slug === 'string' ? service.slug : undefined,
    price: typeof service.price === 'number' ? service.price : undefined,
    access_source:
      typeof service.access_source === 'string' ? service.access_source : undefined,
    dropdown_label: typeof service.dropdown_label === 'string' ? service.dropdown_label : undefined,
    can_create_brief:
      typeof service.can_create_brief === 'boolean' ? service.can_create_brief : undefined,
    active_brief_id:
      typeof service.active_brief_id === 'string' ? service.active_brief_id : undefined,
    active_brief_status:
      typeof service.active_brief_status === 'string' ? service.active_brief_status : undefined,
    active_brief_title:
      typeof service.active_brief_title === 'string' ? service.active_brief_title : undefined,
  };
};

export const parseServiceDropdownCategories = (data: Record<string, unknown>): DropdownService[] => {
  const categories = (data.categories || data.items || []) as ServiceDropdownCategory[];
  return categories.flatMap((category) =>
    (category.services || []).map((service) =>
      normalizeDropdownService(service as Record<string, unknown>),
    ),
  );
};

export const fetchServiceDropdown = async (token: string): Promise<DropdownService[]> => {
  const res = await axios.get(`${apiUrl}/services/dropdown`, getAuthConfig(token));
  const data = res.data;
  if (data.success === false) {
    throw new Error(data.message || data.error?.message || 'Failed to load services');
  }
  return parseServiceDropdownCategories(data);
};

export const isDropdownServiceSelectable = (service: DropdownService) =>
  service.dropdown_status === 'available' ||
  (!service.dropdown_status && service.can_create_brief !== false);

export const getDropdownServiceLabel = (service: DropdownService) => {
  const label = service.dropdown_label?.trim();
  if (label) return `${service.name} — ${label}`;
  return service.name;
};
