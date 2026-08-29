import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';

import type { RootState } from '../../../../store/store';
import { apiBaseUrl, fetchCategories, getAuthHeaders } from '../../../../lib/admin-settings-shared';
import { Button } from '../../../../components/dashboard/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/dashboard/ui/card';

export default function AdminCategoriesPage() {
  const { token } = useSelector((state: RootState) => state.auth);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      setCategories(await fetchCategories(token));
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const deleteCategory = async (id: string) => {
    if (!token) return;
    try {
      setDeletingId(id);
      await fetch(`${apiBaseUrl}/admin/service-categories/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
      });
      toast.success('Category deleted');
      await loadCategories();
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-sm font-bold mb-1 tracking-[0.2em]">Categories</h1>
          <p className="text-muted-foreground text-xs">Manage service categories.</p>
        </div>
        <Button asChild size="sm" className="bg-[#C4FE01] text-black hover:bg-[#C4FE01]/90">
          <Link to="/admin/settings/categories/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base">All Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5 py-2">
          {isLoading ? (
            <div className="py-8 flex flex-col items-center justify-center border border-dashed rounded-md">
              <Loader2 className="h-5 w-5 animate-spin text-[#C4FE01] mb-1.5" />
              <p className="text-[11px] text-muted-foreground uppercase tracking-widest">Loading...</p>
            </div>
          ) : categories.length > 0 ? (
            categories.map((cat) => (
              <div key={cat._id} className="flex justify-between items-center border px-3 py-2 rounded-md">
                <span className="font-medium text-xs">{cat.name}</span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                    <Link to={`/admin/settings/categories/${cat._id}/edit`}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => deleteCategory(cat._id)}
                    disabled={deletingId === cat._id}
                  >
                    {deletingId === cat._id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-destructive" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    )}
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">No categories found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
