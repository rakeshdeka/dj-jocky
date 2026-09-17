"use client";

import { useCallback, useEffect, useState } from "react";
import { format, isPast, isToday } from "date-fns";
import { useSelector } from "react-redux";
import MainLayout from "../../../components/dashboard/layout/MainLayout";
import { Button } from "../../../components/dashboard/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/dashboard/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/dashboard/ui/dialog";
import { toast } from "sonner";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Video,
  ExternalLink,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Badge } from "../../../components/dashboard/ui/badge";
import { cn } from "../../../lib/utils";
import type { RootState } from "../../../store/store";
import {
  fetchMyMeetings,
  formatMeetingTimeRange,
  formatMeetingTypeLabel,
  getMeetingDisplayTitle,
  getAdminStatusBadgeClass,
  getMeetingJoinLabel,
  getMeetingSlot,
  type MeetingListItem,
} from "../../../lib/meetings-api";

export default function DesignerMeetings() {
  const { token } = useSelector((state: RootState) => state.auth);

  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingListItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const loadMeetings = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setMeetings(await fetchMyMeetings(token));
    } catch {
      toast.error("Failed to sync your schedule");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadMeetings();
  }, [loadMeetings]);

  const handleJoin = (link?: string) => {
    if (!link) return toast.error("Meeting link not available yet");
    window.open(link, "_blank");
  };

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xs font-bold mb-1 tracking-[0.2em] uppercase">MY MEETINGS</h1>
          <p className="text-muted-foreground text-xs">Scheduled sessions and briefings assigned to you</p>
        </div>
        {!loading && (
          <p className="font-bold text-xs tracking-wider uppercase">{meetings.length} MEETINGS</p>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-[280px] rounded-md bg-muted/40 animate-pulse border border-border/40" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {meetings.length > 0 ? (
            meetings.map((m) => {
              const meetingDate = new Date(m.date);
              const isTodayMeeting = isToday(meetingDate);
              const isFinished = m.status === "completed" || (isPast(meetingDate) && !isTodayMeeting);
              const slot = getMeetingSlot(m);
              const timeLabel = slot
                ? `${slot.start_time} – ${slot.end_time}`
                : formatMeetingTimeRange(m);

              return (
                <Card
                  key={m._id}
                  className={cn(
                    "bg-card border-border/40 hover:border-[#C4FE01]/40 transition-all rounded-md overflow-hidden flex flex-col justify-between group",
                    isTodayMeeting && "ring-1 ring-[#C4FE01]/30 border-[#C4FE01]/40",
                  )}
                >
                  <CardHeader className="p-5 pb-3">
                    <div className="flex justify-between items-center mb-3 gap-2">
                      <Badge
                        className={cn(
                          "uppercase text-[9px] tracking-widest font-bold py-0.5 px-2 rounded-sm border-none",
                          isTodayMeeting ? "bg-[#C4FE01] text-black" : "bg-secondary text-muted-foreground",
                        )}
                      >
                        {isTodayMeeting
                          ? "Happening Today"
                          : formatMeetingTypeLabel(m.meeting_type) || "Scheduled"}
                      </Badge>
                      <Badge className={`text-[9px] uppercase ${getAdminStatusBadgeClass(m.status)}`}>
                        {m.status}
                      </Badge>
                    </div>
                    <CardTitle
                      className="text-base sm:text-lg font-bold line-clamp-2 min-h-[2.75rem] tracking-tight group-hover:text-[#C4FE01] transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedMeeting(m);
                        setIsDetailOpen(true);
                      }}
                    >
                      {getMeetingDisplayTitle(m)}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="px-5 py-2 space-y-4 flex-grow">
                    <div className="flex items-center gap-4 py-3 border-y border-border/20 text-[10px] font-bold uppercase tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon className="h-3 w-3 text-[#C4FE01]" />
                        {format(meetingDate, "MMM dd, yyyy")}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-[#C4FE01]" />
                        {timeLabel}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 p-2.5 rounded-md bg-secondary/20">
                      <User className="h-3.5 w-3.5 opacity-40" />
                      <div className="truncate">
                        <p className="text-[8px] font-bold text-muted-foreground uppercase">Client</p>
                        <p className="text-xs font-semibold truncate">
                          {m.client_id?.name || "Premium Member"}
                        </p>
                      </div>
                    </div>
                  </CardContent>

                  <div className="p-3 bg-secondary/10 border-t border-border/30">
                    <Button
                      disabled={!m.meeting_link || isFinished || m.status !== "scheduled"}
                      onClick={() => handleJoin(m.meeting_link)}
                      className="w-full text-[10px] font-bold uppercase h-9 rounded-md bg-transparent border border-border/50 hover:bg-[#C4FE01] hover:text-black hover:border-transparent tracking-wider"
                    >
                      {isFinished ? "Session Ended" : getMeetingJoinLabel(m)}{" "}
                      <ExternalLink className="ml-1.5 h-3 w-3" />
                    </Button>
                  </div>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full py-16 text-center border border-dashed border-border/30 rounded-md">
              <CheckCircle2 className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-30" />
              <p className="text-xs font-bold uppercase tracking-wider opacity-50">
                No sessions assigned to your profile
              </p>
            </div>
          )}
        </div>
      )}

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[420px] border border-border/40 rounded-md p-6 bg-card shadow-2xl">
          {selectedMeeting && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#C4FE01]" />
                  <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">
                    Briefing Details
                  </span>
                </div>
                <DialogTitle className="text-xl font-bold uppercase tracking-tight leading-snug">
                  {getMeetingDisplayTitle(selectedMeeting)}
                </DialogTitle>
              </DialogHeader>

              <div className="py-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-md bg-secondary/30">
                    <p className="text-[8px] font-bold uppercase text-muted-foreground mb-1">Schedule</p>
                    <p className="text-xs font-bold">
                      {format(new Date(selectedMeeting.date), "MMM dd, yyyy")}
                    </p>
                    <p className="text-[10px] opacity-70 font-medium">
                      {formatMeetingTimeRange(selectedMeeting)}
                    </p>
                  </div>
                  <div className="p-3 rounded-md bg-secondary/30">
                    <p className="text-[8px] font-bold uppercase text-muted-foreground mb-1">Status</p>
                    <Badge className={`text-[9px] uppercase ${getAdminStatusBadgeClass(selectedMeeting.status)}`}>
                      {selectedMeeting.status}
                    </Badge>
                  </div>
                </div>

                <div className="p-3 rounded-md border border-border/40 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold">{selectedMeeting.client_id?.name || "N/A"}</p>
                    <p className="text-[10px] opacity-60">{selectedMeeting.client_id?.email || "No email"}</p>
                  </div>
                  <User className="h-4 w-4 opacity-30" />
                </div>
              </div>

              <Button
                onClick={() => handleJoin(selectedMeeting.meeting_link)}
                disabled={!selectedMeeting.meeting_link || selectedMeeting.status !== "scheduled"}
                className="w-full bg-[#C4FE01] text-black hover:bg-[#b2e600] font-bold h-10 rounded-md uppercase text-[11px] tracking-wider"
              >
                <Video className="mr-2 h-3.5 w-3.5" /> Join Google Meet
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
