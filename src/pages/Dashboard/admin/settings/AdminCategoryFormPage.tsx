import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';

import type { RootState } from '../../../../store/store';
import { apiBaseUrl, fetchCategories, getAuthHeaders, updateCategory } from '../../../../lib/admin-settings-shared';
import { Button } from '../../../../components/dashboard/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../../../components/dashboard/ui/card';
import { Input } from '../../../../components/dashboard/ui/input';
import { Label } from '../../../../components/dashboard/ui/label';

export default function AdminCategoryFormPage() {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId?: string }>();
  const isEditing = Boolean(categoryId);
  const { token } = useSelector((state: RootState) => state.auth);

  const [categoryName, setCategoryName] = useState('');
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token || !categoryId) return;

    const loadCategory = async () => {
      try {
        setIsLoading(true);
        const categories = await fetchCategories(token);
        const category = categories.find((cat) => cat._id === categoryId);
        if (!category) {
          toast.error('Category not found');
          navigate('/admin/settings/categories');
          return;
        }
        setCategoryName(category.name || '');
      } catch {
        toast.error('Failed to load category');
        navigate('/admin/settings/categories');
      } finally {
        setIsLoading(false);
      }
    };

    loadCategory();
  }, [token, categoryId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return toast.error('Login required');
    if (!categoryName.trim()) return toast.error('Enter category name');

    try {
      setIsSubmitting(true);

      if (isEditing && categoryId) {
        await updateCategory(token, categoryId, categoryName.trim());
        toast.success('Category updated');
      } else {
        const res = await fetch(`${apiBaseUrl}/admin/service-categories`, {
          method: 'POST',
          headers: getAuthHeaders(token),
          body: JSON.stringify({ name: categoryName.trim() }),
        });
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.message || 'Failed to add category');
        }
        toast.success('Category added');
      }

      navigate('/admin/settings/categories');
    } catch (err: any) {
      toast.error(err?.message || `Failed to ${isEditing ? 'update' : 'add'} category`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const disabled = isSubmitting || isLoading;

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" asChild>
        <Link to="/admin/settings/categories">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Categories
        </Link>
      </Button>

      <div className="mb-6">
        <h1 className="text-sm font-bold mb-1 tracking-[0.2em]">
          {isEditing ? 'Edit Category' : 'Add Category'}
        </h1>
        <p className="text-muted-foreground text-xs">
          {isEditing ? 'Update the category name.' : 'Create a new service category.'}
        </p>
      </div>

      <Card className="max-w-lg">
        <form onSubmit={handleSubmit}>
          <CardHeader className="py-3">
            <CardTitle className="text-base">Category Details</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="space-y-2">
              <Label className="text-xs">Name</Label>
              <Input
                placeholder="Category name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                disabled={disabled}
                className="text-xs h-8"
              />
            </div>
            {isLoading && (
              <div className="flex items-center gap-2 mt-3 text-[11px] text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Loading category...
              </div>
            )}
          </CardContent>
          <CardFooter className="py-3 flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/settings/categories')}
              disabled={disabled}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={disabled}>
              {isSubmitting && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              {isEditing ? 'Update Category' : 'Add Category'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
