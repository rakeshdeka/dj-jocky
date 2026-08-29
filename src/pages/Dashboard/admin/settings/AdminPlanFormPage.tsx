import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Plus, X } from 'lucide-react';

import type { RootState } from '../../../../store/store';
import { fetchAdminServicesDropdown } from '../../../../lib/admin-settings-shared';
import {
  buildPlanPayload,
  createAdminPlan,
  emptyCountryPricing,
  emptyPlanFeature,
  emptyPlanForm,
  fetchAdminPlan,
  fetchAdminPlansDropdown,
  mapPlanToForm,
  slugifyPlan,
  updateAdminPlan,
  validatePlanForm,
  type PlanFormState,
} from '../../../../lib/admin-plans-api';
import { Button } from '../../../../components/dashboard/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/dashboard/ui/card';
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

export default function AdminPlanFormPage() {
  const navigate = useNavigate();
  const { planId } = useParams<{ planId?: string }>();
  const isEditing = Boolean(planId);
  const { token } = useSelector((state: RootState) => state.auth);

  const [form, setForm] = useState<PlanFormState>(emptyPlanForm());
  const [services, setServices] = useState<any[]>([]);
  const [allPlans, setAllPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;

    Promise.all([fetchAdminServicesDropdown(token), fetchAdminPlansDropdown(token)])
      .then(([serviceList, planList]) => {
        setServices(serviceList);
        setAllPlans(planList.filter((plan) => plan._id !== planId));
      })
      .catch(() => toast.error('Failed to load form options'))
      .finally(() => setIsLoadingOptions(false));
  }, [token, planId]);

  useEffect(() => {
    if (!token || !planId) return;

    fetchAdminPlan(token, planId)
      .then((plan) => setForm(mapPlanToForm(plan)))
      .catch((err: any) => {
        toast.error(err?.message || 'Failed to load plan');
        navigate('/admin/settings/plans');
      })
      .finally(() => setIsLoading(false));
  }, [token, planId, navigate]);

  const updateField = <K extends keyof PlanFormState>(key: K, value: PlanFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArrayValue = (key: 'services' | 'inherits_from', value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((entry) => entry !== value)
        : [...prev[key], value],
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return toast.error('Login required');

    const validationError = validatePlanForm(form);
    if (validationError) return toast.error(validationError);

    const payload = buildPlanPayload(form);

    try {
      setIsSubmitting(true);
      if (isEditing && planId) {
        await updateAdminPlan(token, planId, payload);
        toast.success('Plan updated successfully');
      } else {
        await createAdminPlan(token, payload);
        toast.success('Plan created successfully');
      }
      navigate('/admin/settings/plans');
    } catch (err: any) {
      toast.error(err?.message || `Failed to ${isEditing ? 'update' : 'create'} plan`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const disabled = isSubmitting || isLoading || isLoadingOptions;

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" asChild>
        <Link to="/admin/settings/plans">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Plans
        </Link>
      </Button>

      <div className="mb-6">
        <h1 className="text-sm font-bold mb-1 tracking-[0.2em]">
          {isEditing ? 'Edit Plan' : 'Add Plan'}
        </h1>
        <p className="text-muted-foreground text-xs">
          Configure pricing, features, services, and custom consultation options.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base">Basic Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 py-2">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      name,
                      slug: prev.slug || slugifyPlan(name),
                    }));
                  }}
                  disabled={disabled}
                  className="text-xs h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Slug *</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => updateField('slug', e.target.value)}
                  disabled={disabled}
                  className="text-xs h-8"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Tier Label</Label>
                <Input
                  value={form.tier}
                  onChange={(e) => updateField('tier', e.target.value)}
                  placeholder="Custom Enterprise"
                  disabled={disabled}
                  className="text-xs h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Sort Order</Label>
                <Input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => updateField('sort_order', e.target.value)}
                  disabled={disabled}
                  className="text-xs h-8"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                disabled={disabled}
                className="text-xs min-h-[72px]"
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <Checkbox
                  checked={form.is_active}
                  onCheckedChange={(checked) => updateField('is_active', checked === true)}
                  disabled={disabled}
                />
                Active plan
              </label>
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <Checkbox
                  checked={form.is_custom_tier}
                  onCheckedChange={(checked) => updateField('is_custom_tier', checked === true)}
                  disabled={disabled}
                />
                Custom tier
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base">Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 py-2">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Base Price</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => updateField('price', e.target.value)}
                  disabled={disabled}
                  className="text-xs h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Currency</Label>
                <Input
                  value={form.currency}
                  onChange={(e) => updateField('currency', e.target.value.toUpperCase())}
                  disabled={disabled}
                  className="text-xs h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Billing Interval</Label>
                <Select
                  value={form.billing_interval}
                  onValueChange={(value) => updateField('billing_interval', value)}
                  disabled={disabled}
                >
                  <SelectTrigger className="text-xs h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly" className="text-xs">Monthly</SelectItem>
                    <SelectItem value="yearly" className="text-xs">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Duration (days)</Label>
                <Input
                  type="number"
                  min="1"
                  value={form.duration}
                  onChange={(e) => updateField('duration', e.target.value)}
                  disabled={disabled}
                  className="text-xs h-8"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <Checkbox
                checked={form.custom_pricing}
                onCheckedChange={(checked) => updateField('custom_pricing', checked === true)}
                disabled={disabled}
              />
              Custom pricing
            </label>

            <div className="space-y-2 border-t pt-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Country Pricing</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-[10px]"
                  onClick={() =>
                    updateField('country_pricing', [...form.country_pricing, emptyCountryPricing()])
                  }
                  disabled={disabled}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Country
                </Button>
              </div>
              {form.country_pricing.length === 0 ? (
                <p className="text-[11px] text-muted-foreground italic">No country-specific pricing added.</p>
              ) : (
                form.country_pricing.map((entry, index) => (
                  <div key={`country-${index}`} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end">
                    <Input
                      placeholder="IN"
                      value={entry.country}
                      onChange={(e) => {
                        const next = [...form.country_pricing];
                        next[index] = { ...next[index], country: e.target.value.toUpperCase() };
                        updateField('country_pricing', next);
                      }}
                      disabled={disabled}
                      className="text-xs h-8"
                    />
                    <Input
                      placeholder="INR"
                      value={entry.currency}
                      onChange={(e) => {
                        const next = [...form.country_pricing];
                        next[index] = { ...next[index], currency: e.target.value.toUpperCase() };
                        updateField('country_pricing', next);
                      }}
                      disabled={disabled}
                      className="text-xs h-8"
                    />
                    <Input
                      type="number"
                      min="0"
                      value={entry.price}
                      onChange={(e) => {
                        const next = [...form.country_pricing];
                        next[index] = { ...next[index], price: Number(e.target.value) || 0 };
                        updateField('country_pricing', next);
                      }}
                      disabled={disabled}
                      className="text-xs h-8"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        updateField(
                          'country_pricing',
                          form.country_pricing.filter((_, i) => i !== index),
                        )
                      }
                      disabled={disabled}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base">Limits & Consultation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 py-2">
            <div className="space-y-1 max-w-xs">
              <Label className="text-xs">Max Active Requests</Label>
              <Input
                type="number"
                min="0"
                placeholder="Leave empty for unlimited"
                value={form.max_active_requests}
                onChange={(e) => updateField('max_active_requests', e.target.value)}
                disabled={disabled}
                className="text-xs h-8"
              />
            </div>

            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <Checkbox
                checked={form.requires_consultation}
                onCheckedChange={(checked) => updateField('requires_consultation', checked === true)}
                disabled={disabled}
              />
              Requires consultation
            </label>

            {form.requires_consultation && (
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Consultation Label</Label>
                  <Input
                    value={form.consultation_label}
                    onChange={(e) => updateField('consultation_label', e.target.value)}
                    disabled={disabled}
                    className="text-xs h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Consultation URL</Label>
                  <Input
                    value={form.consultation_url}
                    onChange={(e) => updateField('consultation_url', e.target.value)}
                    disabled={disabled}
                    className="text-xs h-8"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base">Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 py-2">
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-[10px]"
                onClick={() => updateField('features', [...form.features, emptyPlanFeature()])}
                disabled={disabled}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Feature
              </Button>
            </div>
            {form.features.map((feature, index) => (
              <div key={`feature-${index}`} className="grid sm:grid-cols-[1fr_1fr_auto] gap-2">
                <Input
                  placeholder="Label"
                  value={feature.label}
                  onChange={(e) => {
                    const next = [...form.features];
                    next[index] = { ...next[index], label: e.target.value };
                    updateField('features', next);
                  }}
                  disabled={disabled}
                  className="text-xs h-8"
                />
                <Input
                  placeholder="Value (optional)"
                  value={feature.value ?? ''}
                  onChange={(e) => {
                    const next = [...form.features];
                    next[index] = { ...next[index], value: e.target.value };
                    updateField('features', next);
                  }}
                  disabled={disabled}
                  className="text-xs h-8"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    updateField(
                      'features',
                      form.features.length > 1
                        ? form.features.filter((_, i) => i !== index)
                        : form.features,
                    )
                  }
                  disabled={disabled}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base">Services & Inheritance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 py-2">
            <div className="space-y-1">
              <Label className="text-xs">Included Services</Label>
              <div className="border rounded-md p-2 max-h-40 overflow-y-auto space-y-1 bg-muted/20">
                {isLoadingOptions ? (
                  <div className="py-3 flex items-center justify-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[#C4FE01]" />
                    <span className="text-[11px] text-muted-foreground">Loading services...</span>
                  </div>
                ) : (
                  services.map((service) => (
                    <label key={service._id} className="flex items-center gap-2 text-xs cursor-pointer">
                      <Checkbox
                        checked={form.services.includes(service._id)}
                        onCheckedChange={() => toggleArrayValue('services', service._id)}
                        disabled={disabled}
                      />
                      {service.title || service.name}
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Inherits From Plans</Label>
              <div className="border rounded-md p-2 max-h-32 overflow-y-auto space-y-1 bg-muted/20">
                {allPlans.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground italic">No other plans available.</p>
                ) : (
                  allPlans.map((plan) => (
                    <label key={plan._id} className="flex items-center gap-2 text-xs cursor-pointer">
                      <Checkbox
                        checked={form.inherits_from.includes(plan._id)}
                        onCheckedChange={() => toggleArrayValue('inherits_from', plan._id)}
                        disabled={disabled}
                      />
                      {plan.name}
                    </label>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading plan details...
          </div>
        )}

        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => navigate('/admin/settings/plans')} disabled={disabled}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={disabled}>
            {isSubmitting && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
            {isEditing ? 'Update Plan' : 'Create Plan'}
          </Button>
        </div>
      </form>
    </div>
  );
}
