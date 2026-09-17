"use client";

import { useCallback, useEffect, useState } from "react";
import { format, isValid, parseISO } from "date-fns";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Brush,
  UserPlus,
  AlertCircle,
  ExternalLink,
  Video,
} from "lucide-react";

import type { RootState } from "../../../store/store";
import MainLayout from "../../../components/dashboard/layout/MainLayout";
import { Button } from "../../../components/dashboard/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/dashboard/ui/card";
import { Badge } from "../../../components/dashboard/ui/badge";
import {
  fetchAdminMeetings,
  fetchCalcomConfig,
  formatMeetingTimeRange,
  formatMeetingTypeLabel,
  getCalcomEventType,
  getMeetingDisplayTitle,
  getAdminStatusBadgeClass,
  getMeetingJoinLabel,
  getMeetingSlot,
  getCalcomBookingPageUrl,
  isCalcomMeeting,
  type MeetingListItem,
} from "../../../lib/meetings-api";

const safeFormatDate = (dateStr: string) => {
  if (!dateStr) return "N/A";
  const parsed = parseISO(dateStr);
  if (isValid(parsed)) return format(parsed, "MMM dd, yyyy");
  const standardDate = new Date(dateStr);
  return isValid(standardDate) ? format(standardDate, "MMM dd, yyyy") : dateStr;
};

export default function AdminMeetings() {
  const navigate = useNavigate();
  const { token } = useSelector((state: RootState) => state.auth);

  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);
  const [calPublicUrl, setCalPublicUrl] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  const fetchData = useCallback(async () => {
    if (!token) return;

    try {
      setIsFetching(true);
      const [meetingsList, config] = await Promise.all([
        fetchAdminMeetings(token),
        fetchCalcomConfig(token).catch(() => null),
      ]);

      setMeetings(meetingsList);

      const eventType = config ? getCalcomEventType(config) : null;
      if (eventType?.cal_link) {
        setCalPublicUrl(getCalcomBookingPageUrl(eventType.cal_link, config?.username));
      } else {
        setCalPublicUrl(null);
      }
    } catch {
      toast.error("Failed to load meetings");
    } finally {
      setIsFetching(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchData();
    else setIsFetching(false);
  }, [token, fetchData]);

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
        <div>
          <h1 className="text-xl font-bold mb-1 tracking-[0.2em] uppercase">MEETINGS</h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Client bookings sync from Cal.com. Assign designers and open join links here — scheduling
            and changes happen in Cal.com.
          </p>
        </div>
        {calPublicUrl && (
          <Button variant="outline" className="shrink-0" asChild>
            <a href={calPublicUrl} target="_blank" rel="noopener noreferrer">
              <Video className="mr-2 h-4 w-4" />
              Open Cal.com
              <ExternalLink className="ml-2 h-3.5 w-3.5 opacity-60" />
            </a>
          </Button>
        )}
      </div>

      <div className="mb-6 rounded-lg border border-[#C4FE01]/30 bg-[#C4FE01]/5 px-4 py-3 text-sm text-muted-foreground">
        <span className="font-semibold text-[#C4FE01]">Cal.com integration.</span> No manual
        availability or call requests on this screen — clients book from the in-app calendar embed.
      </div>

      {isFetching ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="h-[320px] animate-pulse bg-card border-border/40" />
          ))}
        </div>
      ) : meetings.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-border/50 rounded-xl space-y-3">
          <p className="text-muted-foreground text-sm font-medium">No synced meetings yet.</p>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            When clients book via Cal.com, meetings appear here automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meetings.map((m) => {
            const isUnassigned = !m.designer_id;
            const isCalcom = isCalcomMeeting(m);
            const slot = getMeetingSlot(m);

            return (
              <Card
                key={m._id}
                className="bg-card border-border/40 hover:border-[#C4FE01]/40 transition-all rounded-md overflow-hidden flex flex-col"
              >
                <CardHeader className="p-6 pb-4">
                  <div className="flex justify-between items-center mb-4 gap-2">
                    {formatMeetingTypeLabel(m.meeting_type) ? (
                      <Badge className="uppercase text-[9px] tracking-widest font-black py-1 px-3 rounded-md bg-secondary text-muted-foreground border-none capitalize">
                        {formatMeetingTypeLabel(m.meeting_type)}
                      </Badge>
                    ) : (
                      <span />
                    )}
                    <div className="flex items-center gap-1.5">
                      {isCalcom && (
                        <Badge
                          variant="outline"
                          className="text-[8px] uppercase border-[#C4FE01]/40 text-[#C4FE01]"
                        >
                          Cal.com
                        </Badge>
                      )}
                      <Badge className={`text-[9px] uppercase ${getAdminStatusBadgeClass(m.status)}`}>
                        {m.status}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-lg font-bold line-clamp-2 min-h-[3rem] tracking-tight">
                    {getMeetingDisplayTitle(m)}
                  </CardTitle>
                </CardHeader>

                <CardContent className="px-6 pb-4 space-y-4 flex-grow">
                  <div className="flex items-center gap-4 py-3 border-y border-border/20 text-[11px] font-bold uppercase tracking-tighter">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-3.5 w-3.5 text-[#C4FE01]" />
                      {safeFormatDate(m.date)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-[#C4FE01]" />
                      {slot ? `${slot.start_time}–${slot.end_time}` : formatMeetingTimeRange(m)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 rounded-md bg-secondary/20">
                      <User className="h-4 w-4 opacity-30" />
                      <div className="truncate">
                        <p className="text-[8px] font-black text-muted-foreground uppercase">Client</p>
                        <p className="text-xs font-bold truncate">{m.client_id?.name || "Member"}</p>
                      </div>
                    </div>

                    <div
                      className={`flex items-center gap-3 p-3 rounded-md border ${
                        isUnassigned
                          ? "bg-orange-500/5 border-orange-500/20"
                          : "bg-secondary/20 border-transparent"
                      }`}
                    >
                      {isUnassigned ? (
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                      ) : (
                        <Brush className="h-4 w-4 text-[#C4FE01]" />
                      )}
                      <div className="flex-1 truncate">
                        <p className="text-[8px] font-black text-muted-foreground uppercase">Designer</p>
                        <p
                          className={`text-xs font-bold truncate ${isUnassigned ? "text-orange-500 italic" : ""}`}
                        >
                          {m.designer_id?.name || "Unassigned"}
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => navigate(`/admin/meetings/${m._id}/assign-designer`)}
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>

                <div className="p-4 bg-secondary/10 space-y-2 border-t border-border/30">
                  <a
                    href={m.meeting_link || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className={`block ${!m.meeting_link ? "pointer-events-none" : ""}`}
                  >
                    <Button
                      variant="outline"
                      disabled={!m.meeting_link}
                      className="w-full text-[10px] font-black uppercase h-10"
                    >
                      {getMeetingJoinLabel(m)} <ExternalLink className="ml-2 h-3 w-3" />
                    </Button>
                  </a>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </MainLayout>
  );
}
