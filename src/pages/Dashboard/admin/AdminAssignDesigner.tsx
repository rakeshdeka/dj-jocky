import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { ArrowLeft, Check, Loader2, Search, UserPlus } from 'lucide-react';

import MainLayout from '../../../components/dashboard/layout/MainLayout';
import { Button } from '../../../components/dashboard/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/dashboard/ui/card';
import { Input } from '../../../components/dashboard/ui/input';
import { Avatar, AvatarFallback } from '../../../components/dashboard/ui/avatar';
import { RootState } from '../../../store/store';
import {
  assignDesignerToBrief,
  fetchBrief,
  formatBriefStatus,
  type Brief,
} from '../../../lib/briefs-api';
import { fetchDesignersDropdown, type UserDropdownItem } from '../../../lib/meetings-api';

const AdminAssignDesigner = () => {
  const { briefId } = useParams<{ briefId: string }>();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const { token } = useSelector((state: RootState) => state.auth);

  const [brief, setBrief] = useState<Brief | null>(null);
  const [designers, setDesigners] = useState<UserDropdownItem[]>([]);
  const [selectedDesignerId, setSelectedDesignerId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadPage = useCallback(async () => {
    if (!token || !briefId) return;

    try {
      setIsLoading(true);
      setLoadError(null);

      const [briefData, designersList] = await Promise.all([
        fetchBrief(token, briefId),
        fetchDesignersDropdown(token),
      ]);

      setBrief(briefData);
      setDesigners(designersList);

      const currentDesignerId =
        typeof briefData.designer_id === 'object'
          ? briefData.designer_id?._id
          : briefData.designer_id;
      if (currentDesignerId) {
        setSelectedDesignerId(String(currentDesignerId));
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load assignment page';
      setLoadError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, briefId, token]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  const filteredDesigners = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return designers;
    return designers.filter(
      (designer) =>
        designer.name.toLowerCase().includes(query) ||
        designer.email?.toLowerCase().includes(query),
    );
  }, [designers, searchTerm]);

  const selectedDesigner = designers.find(
    (designer) => designer.id === selectedDesignerId || designer._id === selectedDesignerId,
  );

  const handleAssign = async () => {
    if (!token || !briefId || !selectedDesignerId) {
      toast.error('Please select a designer');
      return;
    }

    try {
      setIsSubmitting(true);
      await assignDesignerToBrief(token, briefId, selectedDesignerId);
      toast.success('Designer assigned successfully');
      navigate(`/admin/projects/${briefId}`);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Assignment failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#c5fb00]" />
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
            Loading designers...
          </p>
        </div>
      </MainLayout>
    );
  }

  if (loadError || !brief) {
    return (
      <MainLayout>
        <div className="max-w-lg mx-auto py-24 text-center space-y-4">
          <p className="text-sm text-muted-foreground">{loadError || 'Brief not found'}</p>
          <Button variant="outline" onClick={() => navigate('/admin/projects')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-6">
        <Link
          to={`/admin/projects/${brief._id}`}
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-[#c5fb00] transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Project
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-sm font-bold tracking-[0.2em] uppercase flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-[#c5fb00]" />
              Assign Designer
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Choose a designer for this brief
            </p>
          </div>
          <Button
            onClick={handleAssign}
            disabled={!selectedDesignerId || isSubmitting}
            className="bg-[#c5fb00] hover:bg-[#b0e000] text-black font-bold"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Confirm Assignment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-card/20 backdrop-blur-md border-border lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-bold tracking-[0.2em] uppercase">
              Project Brief
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-video bg-muted/30 rounded-md overflow-hidden border border-border/40">
              {brief.thumbnail_url ? (
                <img
                  src={brief.thumbnail_url}
                  alt={brief.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#c5fb00]/20 to-transparent">
                  <span className="text-4xl font-bold text-[#c5fb00]/40">
                    {brief.title?.charAt(0) || 'B'}
                  </span>
                </div>
              )}
            </div>
            <div>
              <p className="font-bold text-sm">{brief.title}</p>
              <p className="text-[10px] text-muted-foreground font-mono mt-1">ID: {brief._id}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-2">
                Status: {formatBriefStatus(brief.status, 'admin')}
              </p>
            </div>
            {brief.designer_id && (
              <div className="p-3 rounded-lg border border-border/60 bg-secondary/10">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">
                  Current Designer
                </p>
                <p className="text-sm font-semibold">
                  {typeof brief.designer_id === 'object' ? brief.designer_id.name : 'Assigned'}
                </p>
              </div>
            )}
            {selectedDesigner && (
              <div className="p-3 rounded-lg border border-[#c5fb00]/30 bg-[#c5fb00]/5">
                <p className="text-[10px] uppercase tracking-widest text-[#c5fb00] font-bold mb-1">
                  Selected
                </p>
                <p className="text-sm font-semibold">{selectedDesigner.name}</p>
                {selectedDesigner.email && (
                  <p className="text-xs text-muted-foreground mt-0.5">{selectedDesigner.email}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/20 backdrop-blur-md border-border lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-bold tracking-[0.2em] uppercase">
              Available Designers ({designers.length})
            </CardTitle>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-secondary/20 border-border"
              />
            </div>
          </CardHeader>
          <CardContent>
            {filteredDesigners.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-border rounded-md">
                <p className="text-sm text-muted-foreground">
                  {designers.length === 0
                    ? 'No designers available. Add designers from the users section first.'
                    : 'No designers match your search.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[520px] overflow-y-auto pr-1">
                {filteredDesigners.map((designer) => {
                  const designerId = designer.id || designer._id;
                  const isSelected = selectedDesignerId === designerId;

                  return (
                    <button
                      key={designerId}
                      type="button"
                      onClick={() => setSelectedDesignerId(designerId)}
                      className={`flex items-center gap-3 p-4 rounded-lg border text-left transition-all ${
                        isSelected
                          ? 'border-[#c5fb00] bg-[#c5fb00]/10 ring-1 ring-[#c5fb00]/30'
                          : 'border-border/60 bg-secondary/10 hover:border-[#c5fb00]/40 hover:bg-secondary/20'
                      }`}
                    >
                      <Avatar className="h-10 w-10 border border-border shrink-0">
                        <AvatarFallback className="bg-[#c5fb00]/20 text-[#c5fb00] font-bold">
                          {designer.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm truncate">{designer.name}</p>
                        {designer.email && (
                          <p className="text-xs text-muted-foreground truncate">{designer.email}</p>
                        )}
                      </div>
                      {isSelected && (
                        <div className="h-6 w-6 rounded-full bg-[#c5fb00] flex items-center justify-center shrink-0">
                          <Check className="h-3.5 w-3.5 text-black" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AdminAssignDesigner;
