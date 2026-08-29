import type { PortfolioFormPayload, PortfolioItem } from './portfolio-api';

export type GallerySlot = {
  file: File | null;
  existingUrl: string;
};

export type PortfolioFormState = {
  title: string;
  category: string;
  client: string;
  year: number;
  summary: string;
  heroFile: File | null;
  existingHeroUrl: string;
  services: string[];
  gallerySlots: GallerySlot[];
};

export const emptyGallerySlot = (): GallerySlot => ({ file: null, existingUrl: '' });

export const emptyPortfolioForm = (): PortfolioFormState => ({
  title: '',
  category: '',
  client: '',
  year: new Date().getFullYear(),
  summary: '',
  heroFile: null,
  existingHeroUrl: '',
  services: [''],
  gallerySlots: [emptyGallerySlot()],
});

export const mapPortfolioToForm = (item: PortfolioItem): PortfolioFormState => ({
  title: item.title,
  category: item.category,
  client: item.client,
  year: item.year,
  summary: item.summary,
  heroFile: null,
  existingHeroUrl: item.hero,
  services: item.services.length > 0 ? item.services : [''],
  gallerySlots:
    item.images.length > 0
      ? item.images.map((url) => ({ file: null, existingUrl: url }))
      : [emptyGallerySlot()],
});

export const cleanList = (values: string[]) =>
  values.map((entry) => entry.trim()).filter(Boolean);

export const buildPortfolioPayload = (form: PortfolioFormState): PortfolioFormPayload => {
  const galleryImageFiles: File[] = [];
  const existingImageUrls: string[] = [];

  form.gallerySlots.forEach((slot) => {
    if (slot.file) {
      galleryImageFiles.push(slot.file);
    } else if (slot.existingUrl.trim()) {
      existingImageUrls.push(slot.existingUrl.trim());
    }
  });

  return {
    title: form.title.trim(),
    category: form.category.trim(),
    client: form.client.trim(),
    year: Number(form.year),
    summary: form.summary.trim(),
    services: cleanList(form.services),
    heroFile: form.heroFile,
    galleryImageFiles,
    existingImageUrls,
  };
};

export const validatePortfolioForm = (
  payload: PortfolioFormPayload,
  isEditing: boolean,
): string | null => {
  if (!payload.title || !payload.category || !payload.client || !payload.summary) {
    return 'Title, category, client, and summary are required';
  }

  if (!Number.isFinite(payload.year)) {
    return 'Enter a valid year';
  }

  if (!isEditing && !payload.heroFile) {
    return 'Hero image file is required';
  }

  if (!isEditing && payload.galleryImageFiles.length === 0) {
    return 'Add at least one gallery image file';
  }

  if (
    isEditing &&
    payload.galleryImageFiles.length === 0 &&
    payload.existingImageUrls.length === 0
  ) {
    return 'Keep at least one gallery image or upload a new one';
  }

  return null;
};
