export const apiBaseUrl = import.meta.env.VITE_API_URL;

export type SectionImagePosition = 'left' | 'right';

export type ServiceSectionForm = {
  type: 'image_text';
  title: string;
  description: string;
  imagePosition: SectionImagePosition;
  image: File | null;
  existingImageUrl?: string;
};

export const emptyServiceSection = (): ServiceSectionForm => ({
  type: 'image_text',
  title: '',
  description: '',
  imagePosition: 'left',
  image: null,
  existingImageUrl: '',
});

export const initialServiceForm = {
  title: '',
  slug: '',
  categoryId: '',
  shortDescription: '',
  description: '',
  price: '',
  currency: 'USD',
  deliveryTime: '',
  availableIndividually: false,
  image: null as File | null,
  heroImage: null as File | null,
  existingImageUrl: '',
  existingHeroImageUrl: '',
  heroTitle: '',
  heroSubtitle: '',
  featuresText: '',
  sections: [emptyServiceSection()],
};

export const toMessageText = (value: unknown, fallback: string): string => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    return value.map((item) => toMessageText(item, '')).filter(Boolean).join(', ') || fallback;
  }
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (record.message !== undefined) return toMessageText(record.message, fallback);
    if (record.error !== undefined) return toMessageText(record.error, fallback);
  }
  return fallback;
};

export const appendJsonStringField = (formData: FormData, key: string, value: unknown) => {
  formData.append(key, JSON.stringify(value));
};

export const parseJsonField = <T,>(value: unknown, fallback: T): T => {
  if (value == null || value === '') return fallback;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
};

export const getServiceId = (service: { _id?: string }) => service._id || '';

export const getAuthHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export const mapServiceToForm = (service: any) => {
  const hero = parseJsonField<Record<string, unknown>>(service.hero, {});
  const rawSections = parseJsonField<any[]>(service.sections, []);
  const features = parseJsonField<string[]>(service.features, []);

  const sections =
    Array.isArray(rawSections) && rawSections.length > 0
      ? rawSections.map((section: any) => ({
          type: 'image_text' as const,
          title: section.title || '',
          description: section.description || section.content || '',
          imagePosition: section.imagePosition === 'right' ? ('right' as const) : ('left' as const),
          image: null,
          existingImageUrl: section.image || '',
        }))
      : [emptyServiceSection()];

  return {
    title: service.title || service.name || '',
    slug: service.slug || '',
    categoryId: service.category_id?._id || service.category_id || '',
    shortDescription: service.shortDescription || '',
    description: service.description || '',
    price: service.price != null ? String(service.price) : '',
    currency: service.currency || 'USD',
    deliveryTime: service.deliveryTime || '',
    availableIndividually: Boolean(service.available_individually),
    image: null,
    heroImage: null,
    existingImageUrl: service.image_url || '',
    existingHeroImageUrl: typeof hero.image === 'string' ? hero.image : '',
    heroTitle: typeof hero.title === 'string' ? hero.title : '',
    heroSubtitle: typeof hero.subtitle === 'string' ? hero.subtitle : '',
    featuresText: Array.isArray(features) ? features.join('\n') : '',
    sections,
  };
};

export type ServiceFormState = typeof initialServiceForm;

export const buildServiceFormData = (serviceForm: ServiceFormState) => {
  const title = serviceForm.title.trim();
  const priceValue = Number(serviceForm.price);

  const hero: Record<string, unknown> = {
    title: serviceForm.heroTitle.trim() || title,
    subtitle: serviceForm.heroSubtitle.trim() || serviceForm.shortDescription.trim(),
  };

  if (!serviceForm.heroImage && serviceForm.existingHeroImageUrl.trim()) {
    hero.image = serviceForm.existingHeroImageUrl.trim();
  }

  const sections = serviceForm.sections.map((section) => {
    const sectionData: Record<string, string> = {
      type: section.type,
      title: section.title.trim(),
      description: section.description.trim(),
      imagePosition: section.imagePosition,
    };

    if (!section.image && section.existingImageUrl?.trim()) {
      sectionData.image = section.existingImageUrl.trim();
    }

    return sectionData;
  });

  const features = serviceForm.featuresText
    .split('\n')
    .map((feature) => feature.trim())
    .filter(Boolean);

  const formData = new FormData();

  formData.append('title', title);
  formData.append('category_id', serviceForm.categoryId);
  formData.append('price', String(priceValue));

  if (serviceForm.slug.trim()) formData.append('slug', serviceForm.slug.trim());
  if (serviceForm.shortDescription.trim()) {
    formData.append('shortDescription', serviceForm.shortDescription.trim());
  }
  if (serviceForm.description.trim()) {
    formData.append('description', serviceForm.description.trim());
  }
  if (serviceForm.currency.trim()) {
    formData.append('currency', serviceForm.currency.trim());
  }
  if (serviceForm.deliveryTime.trim()) {
    formData.append('deliveryTime', serviceForm.deliveryTime.trim());
  }

  appendJsonStringField(formData, 'hero', hero);
  appendJsonStringField(formData, 'sections', sections);
  appendJsonStringField(formData, 'features', features);

  formData.append('available_individually', serviceForm.availableIndividually ? 'true' : 'false');

  if (serviceForm.image) formData.append('image', serviceForm.image);
  if (serviceForm.heroImage) formData.append('heroImage', serviceForm.heroImage);

  serviceForm.sections.forEach((section) => {
    if (section.image) formData.append('sectionImages', section.image);
  });

  return formData;
};

export const validateServiceForm = (serviceForm: ServiceFormState) => {
  const title = serviceForm.title.trim();
  const priceValue = Number(serviceForm.price);

  if (!title || !serviceForm.categoryId) {
    return 'Title and category are required';
  }

  if (!Number.isFinite(priceValue) || priceValue < 0) {
    return 'Enter a valid price';
  }

  return null;
};

export const fetchCategories = async (token: string) => {
  const res = await fetch(`${apiBaseUrl}/admin/service-categories`, {
    headers: getAuthHeaders(token),
  });
  const data = await res.json();
  if (data.success) return data.items || [];
  return [];
};

export const updateCategory = async (token: string, id: string, name: string) => {
  const res = await fetch(`${apiBaseUrl}/admin/service-categories/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ name }),
  });
  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.message || 'Failed to update category');
  }
  return data;
};

export const fetchServices = async (token: string) => fetchAdminServicesDropdown(token);

export type AdminServiceItem = {
  _id: string;
  title?: string;
  name?: string;
  slug?: string;
  shortDescription?: string;
  price?: number;
  currency?: string;
  deliveryTime?: string;
  image_url?: string;
  category_id?: { _id?: string; name?: string } | string;
  available_individually?: boolean;
};

export type AdminServicesQuery = {
  page?: number;
  limit?: number;
};

export type PaginatedAdminServices = {
  items: AdminServiceItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const DEFAULT_SERVICE_PAGE_LIMIT = 20;

export const fetchAdminServices = async (
  token: string,
  query: AdminServicesQuery = {},
): Promise<PaginatedAdminServices> => {
  const page = query.page ?? 1;
  const limit = Math.min(query.limit ?? DEFAULT_SERVICE_PAGE_LIMIT, DEFAULT_SERVICE_PAGE_LIMIT);

  const res = await fetch(`${apiBaseUrl}/admin/services?page=${page}&limit=${limit}`, {
    headers: getAuthHeaders(token),
  });
  const data = await res.json();

  if (!res.ok || data.success === false) {
    throw new Error(data.message || 'Failed to load services');
  }

  const items: AdminServiceItem[] = data.items || [];
  const pagination = data.pagination || {};
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

export const fetchAdminServicesDropdown = async (token: string): Promise<AdminServiceItem[]> => {
  const firstPage = await fetchAdminServices(token, { page: 1, limit: DEFAULT_SERVICE_PAGE_LIMIT });
  if (firstPage.totalPages <= 1) return firstPage.items;

  const allItems = [...firstPage.items];
  for (let currentPage = 2; currentPage <= firstPage.totalPages; currentPage += 1) {
    const nextPage = await fetchAdminServices(token, {
      page: currentPage,
      limit: DEFAULT_SERVICE_PAGE_LIMIT,
    });
    allItems.push(...nextPage.items);
  }
  return allItems;
};

export const fetchPlans = async (token: string) => {
  const res = await fetch(`${apiBaseUrl}/plans`, { headers: getAuthHeaders(token) });
  const data = await res.json();
  if (data.success) return data.plans || [];
  return [];
};
