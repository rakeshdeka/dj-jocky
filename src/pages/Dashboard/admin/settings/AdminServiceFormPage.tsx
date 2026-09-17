import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Plus, X } from 'lucide-react';

import type { RootState } from '../../../../store/store';
import {
  apiBaseUrl,
  buildServiceFormData,
  emptyServiceSection,
  fetchCategories,
  initialServiceForm,
  mapServiceToForm,
  SectionImagePosition,
  ServiceSectionForm,
  toMessageText,
  validateServiceForm,
} from '../../../../lib/admin-settings-shared';
import { Button } from '../../../../components/dashboard/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../../components/dashboard/ui/card';
import { Checkbox } from '../../../../components/dashboard/ui/checkbox';
import { Input } from '../../../../components/dashboard/ui/input';
import { Label } from '../../../../components/dashboard/ui/label';
import { Textarea } from '../../../../components/dashboard/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/dashboard/ui/select';

export default function AdminServiceFormPage() {
  const navigate = useNavigate();
  const { serviceId } = useParams<{ serviceId?: string }>();
  const isEditing = Boolean(serviceId);
  const { token } = useSelector((state: RootState) => state.auth);

  const [categories, setCategories] = useState<any[]>([]);
  const [serviceForm, setServiceForm] = useState({ ...initialServiceForm, sections: [emptyServiceSection()] });
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const serviceImageInputRef = useRef<HTMLInputElement>(null);
  const heroImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token) return;
    fetchCategories(token).then(setCategories).catch(() => toast.error('Failed to load categories'));
  }, [token]);

  useEffect(() => {
    if (!token || !serviceId) return;

    const loadService = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${apiBaseUrl}/admin/services/${serviceId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok || data.success === false) {
          throw new Error(toMessageText(data.message ?? data.error, 'Failed to load service'));
        }
        const serviceData = data.item || data.service || data.data;
        setServiceForm(mapServiceToForm(serviceData));
      } catch (err: any) {
        toast.error(toMessageText(err?.message ?? err, 'Failed to load service'));
        navigate('/admin/settings/services');
      } finally {
        setIsLoading(false);
      }
    };

    loadService();
  }, [token, serviceId, navigate]);

  const updateServiceSection = (
    index: number,
    field: keyof ServiceSectionForm,
    value: string | File | null,
  ) => {
    setServiceForm((prev) => ({
      ...prev,
      sections: prev.sections.map((section, i) =>
        i === index ? { ...section, [field]: value } : section,
      ),
    }));
  };

  const addServiceSection = () => {
    setServiceForm((prev) => ({
      ...prev,
      sections: [...prev.sections, emptyServiceSection()],
    }));
  };

  const removeServiceSection = (index: number) => {
    setServiceForm((prev) => ({
      ...prev,
      sections: prev.sections.length > 1 ? prev.sections.filter((_, i) => i !== index) : prev.sections,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return toast.error('Login required');

    const validationError = validateServiceForm(serviceForm);
    if (validationError) return toast.error(validationError);

    try {
      setIsSubmitting(true);
      const url = isEditing
        ? `${apiBaseUrl}/admin/services/${serviceId}`
        : `${apiBaseUrl}/admin/services`;
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: buildServiceFormData(serviceForm),
      });

      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(toMessageText(data.message ?? data.error, `Failed to ${isEditing ? 'update' : 'create'} service`));
      }

      toast.success(toMessageText(data.message, isEditing ? 'Service updated' : 'Service added'));
      navigate('/admin/settings/services');
    } catch (err: any) {
      toast.error(toMessageText(err?.message ?? err, `Failed to ${isEditing ? 'update' : 'create'} service`));
    } finally {
      setIsSubmitting(false);
    }
  };

  const disabled = isSubmitting || isLoading;

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" asChild>
        <Link to="/admin/settings/services">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Services
        </Link>
      </Button>

      <div className="mb-6">
        <h1 className="text-sm font-bold mb-1 tracking-[0.2em]">
          {isEditing ? 'Edit Service' : 'Add Service'}
        </h1>
        <p className="text-muted-foreground text-xs">
          Multipart upload. hero, sections, and features are sent as JSON strings.
        </p>
      </div>

      <Card className="max-w-3xl">
        <form onSubmit={handleSubmit}>
          <CardHeader className="py-3">
            <CardTitle className="text-base">{isEditing ? 'Edit Service' : 'New Service'}</CardTitle>
            <CardDescription className="text-[11px]">
              {isEditing ? 'Update service details and images' : 'Create a new service offering'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-1">
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Basic</p>
              <div className="space-y-1">
                <Label className="text-xs">Title *</Label>
                <Input
                  placeholder="e.g. Brand Identity"
                  value={serviceForm.title}
                  onChange={(e) => setServiceForm((prev) => ({ ...prev, title: e.target.value }))}
                  disabled={disabled}
                  className="text-xs h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Slug</Label>
                <Input
                  placeholder="brand-identity (auto-generated if empty)"
                  value={serviceForm.slug}
                  onChange={(e) => setServiceForm((prev) => ({ ...prev, slug: e.target.value }))}
                  disabled={disabled}
                  className="text-xs h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Category *</Label>
                <Select
                  value={serviceForm.categoryId || undefined}
                  onValueChange={(value) => setServiceForm((prev) => ({ ...prev, categoryId: value }))}
                  disabled={disabled}
                >
                  <SelectTrigger className="text-xs h-8">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id} className="text-xs">
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Short Description</Label>
                <Textarea
                  placeholder="Brief summary for cards and detail page intro"
                  value={serviceForm.shortDescription}
                  onChange={(e) => setServiceForm((prev) => ({ ...prev, shortDescription: e.target.value }))}
                  disabled={disabled}
                  className="text-xs min-h-[72px]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Description</Label>
                <Textarea
                  placeholder="Optional long description"
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm((prev) => ({ ...prev, description: e.target.value }))}
                  disabled={disabled}
                  className="text-xs min-h-[88px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Price *</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="99"
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm((prev) => ({ ...prev, price: e.target.value }))}
                    disabled={disabled}
                    className="text-xs h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Currency</Label>
                  <Input
                    placeholder="USD"
                    value={serviceForm.currency}
                    onChange={(e) => setServiceForm((prev) => ({ ...prev, currency: e.target.value }))}
                    disabled={disabled}
                    className="text-xs h-8"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Delivery Time</Label>
                <Input
                  placeholder="e.g. 3-5 business days"
                  value={serviceForm.deliveryTime}
                  onChange={(e) => setServiceForm((prev) => ({ ...prev, deliveryTime: e.target.value }))}
                  disabled={disabled}
                  className="text-xs h-8"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="available-individually"
                  checked={serviceForm.availableIndividually}
                  onCheckedChange={(checked) =>
                    setServiceForm((prev) => ({ ...prev, availableIndividually: checked === true }))
                  }
                  disabled={disabled}
                />
                <Label htmlFor="available-individually" className="text-xs cursor-pointer">
                  Available for individual purchase
                </Label>
                <p className="text-[10px] text-muted-foreground pl-6">
                  When enabled, this service appears in subscription plans and the individual shop.
                </p>
              </div>
            </div>

            <div className="space-y-3 border-t pt-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Images</p>
              <div className="space-y-1">
                <Label className="text-xs">Card Thumbnail (image)</Label>
                <Input
                  ref={serviceImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setServiceForm((prev) => ({ ...prev, image: e.target.files?.[0] || null }))}
                  disabled={disabled}
                  className="text-xs h-8 cursor-pointer file:mr-3 file:rounded file:border-0 file:bg-muted file:px-2 file:py-1 file:text-xs"
                />
                {serviceForm.image ? (
                  <p className="text-[11px] text-muted-foreground">{serviceForm.image.name}</p>
                ) : serviceForm.existingImageUrl ? (
                  <p className="text-[11px] text-muted-foreground truncate">Current: {serviceForm.existingImageUrl}</p>
                ) : null}
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Hero Image (heroImage)</Label>
                <Input
                  ref={heroImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setServiceForm((prev) => ({ ...prev, heroImage: e.target.files?.[0] || null }))}
                  disabled={disabled}
                  className="text-xs h-8 cursor-pointer file:mr-3 file:rounded file:border-0 file:bg-muted file:px-2 file:py-1 file:text-xs"
                />
                {serviceForm.heroImage ? (
                  <p className="text-[11px] text-muted-foreground">{serviceForm.heroImage.name}</p>
                ) : serviceForm.existingHeroImageUrl ? (
                  <p className="text-[11px] text-muted-foreground truncate">Current: {serviceForm.existingHeroImageUrl}</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-3 border-t pt-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Hero</p>
              <div className="space-y-1">
                <Label className="text-xs">Hero Title</Label>
                <Input
                  placeholder="Defaults to service title"
                  value={serviceForm.heroTitle}
                  onChange={(e) => setServiceForm((prev) => ({ ...prev, heroTitle: e.target.value }))}
                  disabled={disabled}
                  className="text-xs h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Hero Subtitle</Label>
                <Input
                  placeholder="Defaults to short description"
                  value={serviceForm.heroSubtitle}
                  onChange={(e) => setServiceForm((prev) => ({ ...prev, heroSubtitle: e.target.value }))}
                  disabled={disabled}
                  className="text-xs h-8"
                />
              </div>
            </div>

            <div className="space-y-3 border-t pt-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Sections</p>
                <Button type="button" variant="outline" size="sm" className="h-7 text-[10px]" onClick={addServiceSection} disabled={disabled}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add Section
                </Button>
              </div>
              {serviceForm.sections.map((section, index) => (
                <div key={index} className="space-y-2 rounded-md border p-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Section {index + 1}</Label>
                    {serviceForm.sections.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeServiceSection(index)} disabled={disabled}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  <Input
                    placeholder="Section title"
                    value={section.title}
                    onChange={(e) => updateServiceSection(index, 'title', e.target.value)}
                    disabled={disabled}
                    className="text-xs h-8"
                  />
                  <Textarea
                    placeholder="Section description"
                    value={section.description}
                    onChange={(e) => updateServiceSection(index, 'description', e.target.value)}
                    disabled={disabled}
                    className="text-xs min-h-[64px]"
                  />
                  <div className="space-y-1">
                    <Label className="text-xs">Image Position</Label>
                    <Select
                      value={section.imagePosition}
                      onValueChange={(value: SectionImagePosition) => updateServiceSection(index, 'imagePosition', value)}
                      disabled={disabled}
                    >
                      <SelectTrigger className="text-xs h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left" className="text-xs">Left</SelectItem>
                        <SelectItem value="right" className="text-xs">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => updateServiceSection(index, 'image', e.target.files?.[0] || null)}
                    disabled={disabled}
                    className="text-xs h-8 cursor-pointer file:mr-3 file:rounded file:border-0 file:bg-muted file:px-2 file:py-1 file:text-xs"
                  />
                  {section.image ? (
                    <p className="text-[11px] text-muted-foreground">{section.image.name}</p>
                  ) : section.existingImageUrl ? (
                    <p className="text-[11px] text-muted-foreground truncate">Current: {section.existingImageUrl}</p>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t pt-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Features</p>
              <Textarea
                placeholder="One feature per line"
                value={serviceForm.featuresText}
                onChange={(e) => setServiceForm((prev) => ({ ...prev, featuresText: e.target.value }))}
                disabled={disabled}
                className="text-xs min-h-[88px]"
              />
            </div>

            {isLoading && (
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Loading service details...
              </div>
            )}
          </CardContent>

          <CardFooter className="py-3 flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => navigate('/admin/settings/services')} disabled={disabled}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="flex-1 text-xs h-8" disabled={disabled}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditing ? 'Update Service' : 'Create Service'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
