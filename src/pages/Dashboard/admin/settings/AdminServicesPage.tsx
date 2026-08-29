import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';

import type { RootState } from '../../../../store/store';
import {
  apiBaseUrl,
  fetchAdminServices,
  getServiceId,
  type AdminServiceItem,
} from '../../../../lib/admin-settings-shared';
import { Button } from '../../../../components/dashboard/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/dashboard/ui/card';

export default function AdminServicesPage() {
  const { token } = useSelector((state: RootState) => state.auth);
  const [services, setServices] = useState<AdminServiceItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadServices = useCallback(async (targetPage: number) => {
    if (!token) return;
    try {
      setIsLoading(true);
      const result = await fetchAdminServices(token, { page: targetPage, limit });
      setServices(result.items);
      setPage(result.page);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load services');
    } finally {
      setIsLoading(false);
    }
  }, [token, limit]);

  useEffect(() => {
    loadServices(page);
  }, [page, loadServices]);

  const deleteService = async (service: AdminServiceItem) => {
    const serviceId = getServiceId(service);
    if (!token || !serviceId) return;

    try {
      setDeletingId(serviceId);
      const res = await fetch(`${apiBaseUrl}/admin/services/${serviceId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        throw new Error(data.message || data.error || 'Delete failed');
      }
      toast.success(data.message || 'Service deleted');
      const nextPage = services.length === 1 && page > 1 ? page - 1 : page;
      if (nextPage !== page) {
        setPage(nextPage);
      } else {
        await loadServices(page);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const getCategoryName = (category: AdminServiceItem['category_id']) => {
    if (!category || typeof category === 'string') return 'Uncategorized';
    return category.name || 'Uncategorized';
  };

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-sm font-bold mb-1 tracking-[0.2em]">Services</h1>
          <p className="text-muted-foreground text-xs">Manage individual services and offerings.</p>
        </div>
        <Button asChild size="sm" className="bg-[#C4FE01] text-black hover:bg-[#C4FE01]/90">
          <Link to="/admin/settings/services/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base">All Services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 py-2">
          {isLoading ? (
            <div className="py-8 flex flex-col items-center justify-center border border-dashed rounded-md">
              <Loader2 className="h-5 w-5 animate-spin text-[#C4FE01] mb-1.5" />
              <p className="text-[11px] text-muted-foreground uppercase tracking-widest">Loading...</p>
            </div>
          ) : services.length > 0 ? (
            services.map((srv) => {
              const serviceId = getServiceId(srv);
              return (
                <div key={serviceId} className="flex justify-between items-center border px-3 py-2 rounded-md">
                  <div>
                    <p className="font-semibold text-xs">{srv.title || srv.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {getCategoryName(srv.category_id)} • {srv.currency || 'USD'} {srv.price ?? 0}
                      {srv.slug ? ` • ${srv.slug}` : ''}
                      {srv.available_individually ? ' • Individual' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                      <Link to={`/admin/settings/services/${serviceId}/edit`}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => deleteService(srv)}
                      disabled={deletingId === serviceId}
                    >
                      {deletingId === serviceId ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-destructive" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      )}
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">No services available.</p>
          )}
        </CardContent>
      </Card>

      {!isLoading && totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Showing page {page} of {totalPages} • {total} service{total === 1 ? '' : 's'}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8"
              disabled={page >= totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
