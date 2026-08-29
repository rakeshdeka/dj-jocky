import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, Loader2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

import type { RootState } from '../../../store/store';
import {
  createPortfolio,
  fetchPortfolio,
  updatePortfolio,
} from '../../../lib/portfolio-api';
import {
  buildPortfolioPayload,
  emptyGallerySlot,
  emptyPortfolioForm,
  mapPortfolioToForm,
  validatePortfolioForm,
  type PortfolioFormState,
} from '../../../lib/portfolio-form-shared';
import MainLayout from '../../../components/dashboard/layout/MainLayout';
import { Button } from '../../../components/dashboard/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../../components/dashboard/ui/card';
import { Input } from '../../../components/dashboard/ui/input';
import { Label } from '../../../components/dashboard/ui/label';
import { Textarea } from '../../../components/dashboard/ui/textarea';

export default function AdminPortfolioFormPage() {
  const navigate = useNavigate();
  const { slugOrId } = useParams<{ slugOrId?: string }>();
  const isEditing = Boolean(slugOrId);
  const { token } = useSelector((state: RootState) => state.auth);
  const heroInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<PortfolioFormState>(emptyPortfolioForm());
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!token || !slugOrId) return;

    const loadPortfolio = async () => {
      try {
        setIsLoading(true);
        const portfolio = await fetchPortfolio(token, slugOrId);
        setForm(mapPortfolioToForm(portfolio));
        if (heroInputRef.current) heroInputRef.current.value = '';
      } catch (error: any) {
        toast.error(error?.response?.data?.message || error?.message || 'Failed to load portfolio');
        navigate('/admin/portfolio');
      } finally {
        setIsLoading(false);
      }
    };

    loadPortfolio();
  }, [token, slugOrId, navigate]);

  const updateService = (index: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.map((entry, i) => (i === index ? value : entry)),
    }));
  };

  const addService = () => {
    setForm((prev) => ({ ...prev, services: [...prev.services, ''] }));
  };

  const removeService = (index: number) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.length > 1 ? prev.services.filter((_, i) => i !== index) : prev.services,
    }));
  };

  const updateGallerySlot = (index: number, file: File | null) => {
    setForm((prev) => ({
      ...prev,
      gallerySlots: prev.gallerySlots.map((slot, i) => (i === index ? { ...slot, file } : slot)),
    }));
  };

  const addGallerySlot = () => {
    setForm((prev) => ({
      ...prev,
      gallerySlots: [...prev.gallerySlots, emptyGallerySlot()],
    }));
  };

  const removeGallerySlot = (index: number) => {
    setForm((prev) => ({
      ...prev,
      gallerySlots:
        prev.gallerySlots.length > 1 ? prev.gallerySlots.filter((_, i) => i !== index) : prev.gallerySlots,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return toast.error('Login required');

    const payload = buildPortfolioPayload(form);
    const validationError = validatePortfolioForm(payload, isEditing);
    if (validationError) return toast.error(validationError);

    try {
      setIsSaving(true);

      if (isEditing && slugOrId) {
        await updatePortfolio(token, slugOrId, payload);
        toast.success('Portfolio updated');
      } else {
        await createPortfolio(token, payload);
        toast.success('Portfolio created');
      }

      navigate('/admin/portfolio');
    } catch (error: any) {
      const message =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Save failed';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const disabled = isSaving || isLoading;

  return (
    <MainLayout>
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" asChild>
        <Link to="/admin/portfolio">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Portfolio
        </Link>
      </Button>

      <div className="mb-6">
        <h1 className="text-sm font-bold mb-1 tracking-[0.2em]">
          {isEditing ? 'Edit Project' : 'Add Project'}
        </h1>
        <p className="text-muted-foreground text-xs">
          hero = cover file, galleryImages = new gallery files, images = JSON of kept existing URLs, services = JSON array string.
        </p>
      </div>

      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <CardHeader className="py-3">
            <CardTitle className="text-base">
              {isEditing ? 'Edit Portfolio Project' : 'New Portfolio Project'}
            </CardTitle>
          </CardHeader>

          {isLoading ? (
            <CardContent className="py-12 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#C4FE01]" />
            </CardContent>
          ) : (
            <CardContent className="space-y-4 py-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Title *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Acme Brand Refresh"
                    className="text-xs h-8"
                    disabled={disabled}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Category *</Label>
                  <Input
                    value={form.category}
                    onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                    placeholder="Branding"
                    className="text-xs h-8"
                    disabled={disabled}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Client *</Label>
                  <Input
                    value={form.client}
                    onChange={(e) => setForm((prev) => ({ ...prev, client: e.target.value }))}
                    placeholder="Acme Corp"
                    className="text-xs h-8"
                    disabled={disabled}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Year *</Label>
                  <Input
                    type="number"
                    value={form.year}
                    onChange={(e) => setForm((prev) => ({ ...prev, year: Number(e.target.value) }))}
                    className="text-xs h-8"
                    disabled={disabled}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Summary *</Label>
                <Textarea
                  value={form.summary}
                  onChange={(e) => setForm((prev) => ({ ...prev, summary: e.target.value }))}
                  placeholder="Full rebrand for Acme Corp"
                  className="text-xs min-h-[80px]"
                  disabled={disabled}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">
                  Hero Image {isEditing ? '(optional — keeps current if empty)' : '*'}
                </Label>
                <Input
                  ref={heroInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, heroFile: e.target.files?.[0] || null }))
                  }
                  disabled={disabled}
                  className="text-xs h-8 cursor-pointer file:mr-3 file:rounded file:border-0 file:bg-muted file:px-2 file:py-1 file:text-xs"
                />
                {form.heroFile ? (
                  <p className="text-[11px] text-muted-foreground">{form.heroFile.name}</p>
                ) : form.existingHeroUrl ? (
                  <>
                    <p className="text-[11px] text-muted-foreground truncate">Current: {form.existingHeroUrl}</p>
                    <img
                      src={form.existingHeroUrl}
                      alt="Current hero"
                      className="mt-2 h-24 w-full object-cover rounded-md border"
                    />
                  </>
                ) : null}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Services</Label>
                  <Button type="button" variant="outline" size="sm" className="h-7 text-[10px]" onClick={addService} disabled={disabled}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
                {form.services.map((service, index) => (
                  <div key={`service-${index}`} className="flex gap-2">
                    <Input
                      value={service}
                      onChange={(e) => updateService(index, e.target.value)}
                      placeholder="Brand Identity"
                      className="text-xs h-8"
                      disabled={disabled}
                    />
                    {form.services.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => removeService(index)}
                        disabled={disabled}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Gallery Images</Label>
                  <Button type="button" variant="outline" size="sm" className="h-7 text-[10px]" onClick={addGallerySlot} disabled={disabled}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
                {form.gallerySlots.map((slot, index) => (
                  <div key={`gallery-${index}`} className="space-y-1 rounded-md border p-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Image {index + 1}</Label>
                      {form.gallerySlots.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeGallerySlot(index)}
                          disabled={disabled}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => updateGallerySlot(index, e.target.files?.[0] || null)}
                      disabled={disabled}
                      className="text-xs h-8 cursor-pointer file:mr-3 file:rounded file:border-0 file:bg-muted file:px-2 file:py-1 file:text-xs"
                    />
                    {slot.file ? (
                      <p className="text-[11px] text-muted-foreground">{slot.file.name}</p>
                    ) : slot.existingUrl ? (
                      <>
                        <p className="text-[11px] text-muted-foreground truncate">Current: {slot.existingUrl}</p>
                        <img
                          src={slot.existingUrl}
                          alt={`Gallery ${index + 1}`}
                          className="mt-1 h-20 w-full object-cover rounded-md border"
                        />
                      </>
                    ) : null}
                  </div>
                ))}
              </div>
            </CardContent>
          )}

          <CardFooter className="py-3 flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => navigate('/admin/portfolio')} disabled={disabled}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={disabled}>
              {isSaving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                'Update Project'
              ) : (
                'Create Project'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </MainLayout>
  );
}
