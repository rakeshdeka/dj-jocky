import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';

import type { RootState } from '../../../../store/store';
import { deleteCountry, fetchCountries, type Country } from '../../../../lib/admin-locale-api';
import { Button } from '../../../../components/dashboard/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/dashboard/ui/card';
import { Badge } from '../../../../components/dashboard/ui/badge';

export default function AdminCountriesPage() {
  const { token } = useSelector((state: RootState) => state.auth);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadCountries = useCallback(async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      setCountries(await fetchCountries(token));
    } catch {
      toast.error('Failed to load countries');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadCountries();
  }, [loadCountries]);

  const handleDelete = async (id: string) => {
    if (!token) return;
    try {
      setDeletingId(id);
      await deleteCountry(token, id);
      toast.success('Country deleted');
      await loadCountries();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-sm font-bold mb-1 tracking-[0.2em]">Countries</h1>
          <p className="text-muted-foreground text-xs">Manage supported countries.</p>
        </div>
        <Button asChild size="sm" className="bg-[#C4FE01] text-black hover:bg-[#C4FE01]/90">
          <Link to="/admin/settings/countries/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Country
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base">All Countries</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5 py-2">
          {isLoading ? (
            <div className="py-8 flex flex-col items-center justify-center border border-dashed rounded-md">
              <Loader2 className="h-5 w-5 animate-spin text-[#C4FE01] mb-1.5" />
              <p className="text-[11px] text-muted-foreground uppercase tracking-widest">Loading...</p>
            </div>
          ) : countries.length > 0 ? (
            countries.map((country) => (
              <div key={country._id} className="flex justify-between items-center border px-3 py-2 rounded-md gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-xs font-semibold w-8 shrink-0">{country.code}</span>
                  <span className="font-medium text-xs truncate">{country.name}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Badge variant={country.is_active ? 'default' : 'secondary'} className="text-[10px]">
                    {country.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                    <Link to={`/admin/settings/countries/${country._id}/edit`}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleDelete(country._id)}
                    disabled={deletingId === country._id}
                  >
                    {deletingId === country._id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-destructive" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    )}
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">No countries found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
