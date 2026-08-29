import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';

import type { RootState } from '../../../../store/store';
import { createCountry, fetchCountries, updateCountry } from '../../../../lib/admin-locale-api';
import { Button } from '../../../../components/dashboard/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../../../components/dashboard/ui/card';
import { Input } from '../../../../components/dashboard/ui/input';
import { Label } from '../../../../components/dashboard/ui/label';
import { Switch } from '../../../../components/dashboard/ui/switch';

export default function AdminCountryFormPage() {
  const navigate = useNavigate();
  const { countryId } = useParams<{ countryId?: string }>();
  const isEditing = Boolean(countryId);
  const { token } = useSelector((state: RootState) => state.auth);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token || !countryId) return;

    const loadCountry = async () => {
      try {
        setIsLoading(true);
        const countries = await fetchCountries(token);
        const country = countries.find((item) => item._id === countryId);
        if (!country) {
          toast.error('Country not found');
          navigate('/admin/settings/countries');
          return;
        }
        setCode(country.code || '');
        setName(country.name || '');
        setIsActive(country.is_active ?? true);
      } catch {
        toast.error('Failed to load country');
        navigate('/admin/settings/countries');
      } finally {
        setIsLoading(false);
      }
    };

    loadCountry();
  }, [token, countryId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return toast.error('Login required');

    const trimmedCode = code.trim().toUpperCase();
    const trimmedName = name.trim();
    if (!trimmedCode) return toast.error('Enter country code');
    if (!trimmedName) return toast.error('Enter country name');

    const payload = {
      code: trimmedCode,
      name: trimmedName,
      is_active: isActive,
    };

    try {
      setIsSubmitting(true);
      if (isEditing && countryId) {
        await updateCountry(token, countryId, payload);
        toast.success('Country updated');
      } else {
        await createCountry(token, payload);
        toast.success('Country added');
      }
      navigate('/admin/settings/countries');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : `Failed to ${isEditing ? 'update' : 'add'} country`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const disabled = isSubmitting || isLoading;

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" asChild>
        <Link to="/admin/settings/countries">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Countries
        </Link>
      </Button>

      <div className="mb-6">
        <h1 className="text-sm font-bold mb-1 tracking-[0.2em]">
          {isEditing ? 'Edit Country' : 'Add Country'}
        </h1>
        <p className="text-muted-foreground text-xs">
          {isEditing ? 'Update country details.' : 'Create a new country entry.'}
        </p>
      </div>

      <Card className="max-w-lg">
        <form onSubmit={handleSubmit}>
          <CardHeader className="py-3">
            <CardTitle className="text-base">Country Details</CardTitle>
          </CardHeader>
          <CardContent className="py-2 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Code</Label>
              <Input
                placeholder="IN"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                disabled={disabled}
                className="text-xs h-8 font-mono uppercase"
                maxLength={3}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Name</Label>
              <Input
                placeholder="India"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={disabled}
                className="text-xs h-8"
              />
            </div>
            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <div>
                <Label className="text-xs">Active</Label>
                <p className="text-[11px] text-muted-foreground">Show this country in the app.</p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} disabled={disabled} />
            </div>
            {isLoading && (
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Loading country...
              </div>
            )}
          </CardContent>
          <CardFooter className="py-3 flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/settings/countries')}
              disabled={disabled}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={disabled}>
              {isSubmitting && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              {isEditing ? 'Update Country' : 'Add Country'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
