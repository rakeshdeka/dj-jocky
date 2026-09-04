import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { format, isValid, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { ArrowLeft, Calendar as CalendarIcon, Check, Clock, Loader2, UserPlus } from 'lucide-react';

import MainLayout from '../../../components/dashboard/layout/MainLayout';
import { Button } from '../../../components/dashboard/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/dashboard/ui/card';
import { Input } from '../../../components/dashboard/ui/input';
import { Avatar, AvatarFallback } from '../../../components/dashboard/ui/avatar';
import { Badge } from '../../../components/dashboard/ui/badge';
import { RootState } from '../../../store/store';
import {
  assignDesignerToMeeting,
  fetchAdminMeetings,
  fetchDesignersDropdown,
  type MeetingListItem,
  type UserDropdownItem,
} from '../../../lib/meetings-api';

const safeFormatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A';
  const parsed = parseISO(dateStr);
  if (isValid(parsed)) return format(parsed, 'MMM dd, yyyy');
  const standardDate = new Date(dateStr);
  return isValid(standardDate) ? format(standardDate, 'MMM dd, yyyy') : dateStr;
};

const AdminAssignMeetingDesigner = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const { token } = useSelector((state: RootState) => state.auth);

  const [meeting, setMeeting] = useState<MeetingListItem | null>(null);
  const [designers, setDesigners] = useState<UserDropdownItem[]>([]);
  const [selectedDesignerId, setSelectedDesignerId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadPage = useCallback(async () => {
    if (!token || !meetingId) return;

    try {
      setIsLoading(true);
      setLoadError(null);

      const [meetings, designersList] = await Promise.all([
        fetchAdminMeetings(apiUrl, token),
        fetchDesignersDropdown(apiUrl, token),
      ]);

      const currentMeeting = meetings.find((item) => item._id === meetingId) || null;
      if (!currentMeeting) {
        setLoadError('Meeting not found');
        return;
      }

      setMeeting(currentMeeting);
      setDesigners(designersList);
      if (currentMeeting.designer_id?._id) {
        setSelectedDesignerId(currentMeeting.designer_id._id);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load assignment page';
      setLoadError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, meetingId, token]);

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
    if (!token || !meetingId || !selectedDesignerId) {
      toast.error('Please select a designer');
      return;
    }

    try {
      setIsSubmitting(true);
      await assignDesignerToMeeting(apiUrl, token, meetingId, selectedDesignerId);
      toast.success('Designer assigned successfully');
      navigate('/admin/meetings');
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
          <Loader2 className="h-8 w-8 animate-spin text-[#C4FE01]" />
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
            Loading designers...
          </p>
        </div>
      </MainLayout>
    );
  }

  if (loadError || !meeting) {
    return (
      <MainLayout>
        <div className="max-w-lg mx-auto py-24 text-center space-y-4">
          <p className="text-sm text-muted-foreground">{loadError || 'Meeting not found'}</p>
          <Button variant="outline" onClick={() => navigate('/admin/meetings')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Meetings
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-6">
        <Link
          to="/admin/meetings"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-[#C4FE01] transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Meetings
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-[0.2em] uppercase flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-[#C4FE01]" />
              Assign Designer
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Choose a designer for this meeting session.
            </p>
          </div>
          <Button
            onClick={handleAssign}
            disabled={!selectedDesignerId || isSubmitting}
            className="bg-[#C4FE01] text-black hover:bg-[#C4FE01]/90 font-black"
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
        <Card className="bg-card border-border/40 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-bold tracking-[0.2em] uppercase">
              Meeting Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Badge className="uppercase text-[9px] tracking-widest font-black mb-2">
                {meeting.meeting_type?.replace('_', ' ')}
              </Badge>
              <p className="font-bold text-sm">{meeting.agenda}</p>
            </div>
            <div className="flex items-center gap-4 text-[11px] uppercase tracking-tighter font-bold text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5 text-[#C4FE01]" />
                {safeFormatDate(meeting.date)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[#C4FE01]" />
                {meeting.time}
              </span>
            </div>
            <div className="p-3 rounded-lg border border-border/60 bg-secondary/10">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">
                Client
              </p>
              <p className="text-sm font-semibold">{meeting.client_id?.name || 'Member'}</p>
            </div>
            {meeting.designer_id && (
              <div className="p-3 rounded-lg border border-border/60 bg-secondary/10">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">
                  Current Designer
                </p>
                <p className="text-sm font-semibold">{meeting.designer_id.name}</p>
              </div>
            )}
            {selectedDesigner && (
              <div className="p-3 rounded-lg border border-[#C4FE01]/30 bg-[#C4FE01]/5">
                <p className="text-[10px] uppercase tracking-widest text-[#C4FE01] font-bold mb-1">
                  Selected
                </p>
                <p className="text-sm font-semibold">{selectedDesigner.name}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border/40 lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-bold tracking-[0.2em] uppercase">
              Available Designers ({designers.length})
            </CardTitle>
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-3 bg-secondary/20 border-border"
            />
          </CardHeader>
          <CardContent>
            {filteredDesigners.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-border rounded-md">
                <p className="text-sm text-muted-foreground">
                  {designers.length === 0
                    ? 'No designers available.'
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
                          ? 'border-[#C4FE01] bg-[#C4FE01]/10 ring-1 ring-[#C4FE01]/30'
                          : 'border-border/60 bg-secondary/10 hover:border-[#C4FE01]/40 hover:bg-secondary/20'
                      }`}
                    >
                      <Avatar className="h-10 w-10 border border-border shrink-0">
                        <AvatarFallback className="bg-[#C4FE01]/20 text-[#C4FE01] font-bold">
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
                        <div className="h-6 w-6 rounded-full bg-[#C4FE01] flex items-center justify-center shrink-0">
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

export default AdminAssignMeetingDesigner;
