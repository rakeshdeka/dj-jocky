import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Plus, Loader2, Pencil, Trash2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

import type { RootState } from '../../../store/store';
import MainLayout from '../../../components/dashboard/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/dashboard/ui/card';
import { Button } from '../../../components/dashboard/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/dashboard/ui/alert-dialog';
import {
  deletePortfolio,
  fetchPortfolios,
  getPortfolioSlugOrId,
  type PortfolioItem,
} from '../../../lib/portfolio-api';

const AdminPortfolio: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.auth);

  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PortfolioItem | null>(null);

  const loadPortfolios = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const items = await fetchPortfolios(token);
      setPortfolios(items);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadPortfolios();
  }, [loadPortfolios]);

  const handleDelete = async () => {
    if (!token || !deleteTarget) return;

    const slugOrId = getPortfolioSlugOrId(deleteTarget);
    if (!slugOrId) return;

    try {
      setDeletingId(slugOrId);
      await deletePortfolio(token, slugOrId);
      toast.success('Portfolio deleted');
      setDeleteTarget(null);
      await loadPortfolios();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <MainLayout>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-sm font-bold mb-1 tracking-[0.2em]">PORTFOLIO</h1>
          <p className="text-muted-foreground text-xs">
            Manage work gallery projects shown on the public work page
          </p>
        </div>
        <Button asChild size="sm" className="text-xs h-8">
          <Link to="/admin/portfolio/new">
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Project
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="py-16 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#C4FE01]" />
        </div>
      ) : portfolios.length === 0 ? (
        <Card className="border border-dashed">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No portfolio projects yet. Add your first project.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {portfolios.map((item) => {
            const itemKey = getPortfolioSlugOrId(item);

            return (
              <Card key={item._id} className="overflow-hidden">
                <div className="aspect-[16/10] bg-muted/30 overflow-hidden">
                  {item.hero ? (
                    <img src={item.hero} alt={item.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm font-semibold">{item.title}</CardTitle>
                  <p className="text-[11px] text-muted-foreground">
                    {item.category} • {item.client} • {item.year}
                  </p>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{item.summary}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="text-xs h-8" asChild>
                      <Link to={`/admin/portfolio/${itemKey}/edit`}>
                        <Pencil className="h-3.5 w-3.5 mr-1" />
                        Edit
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-8 text-destructive"
                      onClick={() => setDeleteTarget(item)}
                      disabled={deletingId === itemKey}
                    >
                      {deletingId === itemKey ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete portfolio project?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove &quot;{deleteTarget?.title}&quot; from the work gallery.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default AdminPortfolio;
