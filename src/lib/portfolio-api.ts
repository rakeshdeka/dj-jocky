import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

export type PortfolioItem = {
  _id: string;
  slug?: string;
  title: string;
  category: string;
  client: string;
  year: number;
  summary: string;
  hero: string;
  services: string[];
  images: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type PortfolioFormPayload = {
  title: string;
  category: string;
  client: string;
  year: number;
  summary: string;
  services: string[];
  heroFile: File | null;
  galleryImageFiles: File[];
  existingImageUrls: string[];
};

const getAuthConfig = (token: string | null) => ({
  headers: { Authorization: `Bearer ${token}` },
  withCredentials: true,
});

const getMultipartConfig = (token: string | null) => ({
  headers: { Authorization: `Bearer ${token}` },
  withCredentials: true,
});

const parseJsonField = <T,>(value: unknown, fallback: T): T => {
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

export const getPortfolioSlugOrId = (item: Pick<PortfolioItem, '_id' | 'slug'>) =>
  item.slug || item._id;

export const parsePortfolioDetail = (item: any, fallbackId = ''): PortfolioItem | null => {
  const portfolio = item?.item ?? item?.portfolio ?? item?.data ?? item;
  if (!portfolio || typeof portfolio !== 'object') return null;

  const id = portfolio._id || portfolio.slug || fallbackId;
  if (!id && !portfolio.title) return null;

  const services = parseJsonField<string[]>(portfolio.services, []);
  const images = parseJsonField<string[]>(portfolio.images, []);

  return {
    _id: portfolio._id || id,
    slug: portfolio.slug || fallbackId || undefined,
    title: portfolio.title || '',
    category: portfolio.category || '',
    client: portfolio.client || '',
    year: Number(portfolio.year) || new Date().getFullYear(),
    summary: portfolio.summary || '',
    hero: portfolio.hero || '',
    services: Array.isArray(services) ? services : [],
    images: Array.isArray(images) ? images : [],
    createdAt: portfolio.createdAt,
    updatedAt: portfolio.updatedAt,
  };
};

export const parsePortfolio = (item: any): PortfolioItem | null => {
  const portfolio = parsePortfolioDetail(item);
  if (!portfolio?._id) return null;
  return portfolio;
};

export const buildPortfolioFormData = (values: PortfolioFormPayload): FormData => {
  const formData = new FormData();

  formData.append('title', values.title);
  formData.append('category', values.category);
  formData.append('client', values.client);
  formData.append('year', String(values.year));
  formData.append('summary', values.summary);
  formData.append('services', JSON.stringify(values.services));

  if (values.heroFile) {
    formData.append('hero', values.heroFile);
  }

  values.galleryImageFiles.forEach((file) => {
    formData.append('galleryImages', file);
  });

  if (values.existingImageUrls.length > 0) {
    formData.append('images', JSON.stringify(values.existingImageUrls));
  }

  return formData;
};

export const fetchPortfolios = async (token: string | null): Promise<PortfolioItem[]> => {
  const res = await axios.get(`${apiUrl}/admin/portfolios`, getAuthConfig(token));
  const items = res.data.items || res.data.portfolios || res.data.data || [];
  return items.map(parsePortfolio).filter(Boolean) as PortfolioItem[];
};

export const fetchPublicPortfolios = async (): Promise<PortfolioItem[]> => {
  const res = await axios.get(`${apiUrl}/portfolios`);
  const items = res.data.items || res.data.portfolios || res.data.data || [];
  return items.map(parsePortfolio).filter(Boolean) as PortfolioItem[];
};

export const fetchPublicPortfolio = async (slugOrId: string): Promise<PortfolioItem> => {
  const loadDetail = async (url: string) => {
    const res = await axios.get(url);
    const portfolio = parsePortfolioDetail(res.data, slugOrId);
    if (!portfolio) {
      throw new Error(res.data?.message || 'Portfolio not found');
    }
    return portfolio;
  };

  try {
    return await loadDetail(`${apiUrl}/portfolios/${slugOrId}`);
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return loadDetail(`${apiUrl}/portfolios/slug/${slugOrId}`);
    }
    throw error;
  }
};

export const fetchPortfolio = async (
  token: string | null,
  slugOrId: string,
): Promise<PortfolioItem> => {
  const res = await axios.get(`${apiUrl}/admin/portfolios/${slugOrId}`, getAuthConfig(token));
  const portfolio = parsePortfolio(res.data);
  if (!portfolio) {
    throw new Error(res.data?.message || 'Portfolio not found');
  }
  return portfolio;
};

export const createPortfolio = async (
  token: string | null,
  values: PortfolioFormPayload,
): Promise<PortfolioItem> => {
  const res = await axios.post(
    `${apiUrl}/admin/portfolios`,
    buildPortfolioFormData(values),
    getMultipartConfig(token),
  );
  const portfolio = parsePortfolio(res.data);
  if (!portfolio) {
    throw new Error(res.data?.message || 'Failed to create portfolio');
  }
  return portfolio;
};

export const updatePortfolio = async (
  token: string | null,
  slugOrId: string,
  values: PortfolioFormPayload,
): Promise<PortfolioItem> => {
  const res = await axios.patch(
    `${apiUrl}/admin/portfolios/${slugOrId}`,
    buildPortfolioFormData(values),
    getMultipartConfig(token),
  );
  const portfolio = parsePortfolio(res.data);
  if (!portfolio) {
    throw new Error(res.data?.message || 'Failed to update portfolio');
  }
  return portfolio;
};

export const deletePortfolio = async (
  token: string | null,
  slugOrId: string,
): Promise<void> => {
  await axios.delete(`${apiUrl}/admin/portfolios/${slugOrId}`, getAuthConfig(token));
};
