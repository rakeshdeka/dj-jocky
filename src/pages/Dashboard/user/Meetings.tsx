"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import {
  CalendarIcon,
  PlusCircle,
  Clock,
  Video,
  Inbox,
  LayoutGrid,
  Loader2,
} from "lucide-react";

import { Button } from "../../../components/dashboard/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../../../components/dashboard/ui/card";
import { Badge } from "../../../components/dashboard/ui/badge";
import { ScrollArea } from "../../../components/dashboard/ui/scroll-area";
import MainLayout from "../../../components/dashboard/layout/MainLayout";
import { RootState } from "../../../store/store";
import {
  fetchMyMeetings,
  formatMeetingTimeRange,
  formatMeetingTypeLabel,
  getClientStatusBadgeClass,
  getMeetingDisplayTitle,
  getMeetingJoinLabel,
  getMeetingSlot,
  isCalcomMeeting,
  type MeetingListItem,
} from "../../../lib/meetings-api";

const MeetingsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useSelector((state: RootState) => state.auth);

  const [meetingsData, setMeetingsData] = useState<MeetingListItem[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingListItem | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMeetings = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const items = await fetchMyMeetings(token);
      setMeetingsData(items);
      setSelectedMeeting((prev) => {
        if (prev) return items.find((m) => m._id === prev._id) || items[0] || null;
        return items[0] || null;
      });
    } catch {
      toast.error("Failed to load meetings");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings, location.pathname]);

  const canJoin = Boolean(
    selectedMeeting?.meeting_link &&
      (selectedMeeting.client_status === "confirmed" ||
        selectedMeeting.status === "scheduled" ||
        isCalcomMeeting(selectedMeeting)),
  );

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-sm font-bold mb-1 tracking-[0.2em]">MEETINGS</h1>
          <p className="text-muted-foreground text-sm">
            Book calls, track status, and join when your meeting link is ready.
          </p>
        </div>
        <Button
          asChild
          className="bg-[#C4FE01] text-black hover:bg-[#C4FE01]/90 font-bold rounded-full px-6"
        >
          <Link to="/client/meetings/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Book a Call
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              My Calls
            </span>
            <span className="text-[10px] font-bold bg-secondary px-2 py-0.5 rounded-full">
              {meetingsData.length}
            </span>
          </div>

          <ScrollArea className="h-[600px] pr-4">
            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center gap-2 border border-dashed border-border/40 rounded-md">
                <Loader2 className="h-6 w-6 animate-spin text-[#C4FE01]" />
                <p className="text-xs text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                  Fetching meetings...
                </p>
              </div>
            ) : meetingsData.length > 0 ? (
              meetingsData.map((m) => {
                const slot = getMeetingSlot(m);
                const timeLabel = slot
                  ? `${slot.start_time} – ${slot.end_time}`
                  : formatMeetingTimeRange(m);

                return (
                  <div
                    key={m._id}
                    onClick={() => setSelectedMeeting(m)}
                    className={`p-5 rounded-md border transition-all cursor-pointer mb-3 group ${
                      selectedMeeting?._id === m._id
                        ? "border-[#C4FE01] bg-[#C4FE01]/5"
                        : "border-transparent bg-secondary/20 hover:bg-secondary/40"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <h3 className="font-bold text-sm group-hover:text-[#C4FE01] transition-colors line-clamp-2">
                        {getMeetingDisplayTitle(m)}
                      </h3>
                      <Badge
                        variant="outline"
                        className={`text-[9px] shrink-0 uppercase ${getClientStatusBadgeClass(m.client_status)}`}
                      >
                        {m.client_status_label || m.client_status || m.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-medium">
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon className="h-3 w-3" />
                        {format(new Date(m.date), "MMM dd")}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {timeLabel}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-md">
                <Inbox className="h-8 w-8 mb-3 text-muted-foreground/60" />
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  No call requests yet
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => navigate("/client/meetings/new")}
                >
                  Request your first call
                </Button>
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="lg:col-span-7">
          {selectedMeeting ? (
            <Card className="bg-card border-border rounded-md overflow-hidden sticky top-24">
              <CardHeader className="bg-secondary/20 border-b border-border/50 p-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-md bg-[#C4FE01] text-black shrink-0">
                    <Video className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <Badge
                      variant="outline"
                      className={`text-[9px] uppercase mb-2 ${getClientStatusBadgeClass(selectedMeeting.client_status)}`}
                    >
                      {selectedMeeting.client_status_label || selectedMeeting.status}
                    </Badge>
                    <CardTitle className="text-2xl mt-1">{getMeetingDisplayTitle(selectedMeeting)}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black uppercase text-muted-foreground block mb-2 tracking-tighter">
                      Date
                    </label>
                    <p className="text-sm font-bold">
                      {format(new Date(selectedMeeting.date), "EEEE, MMMM dd")}
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-muted-foreground block mb-2 tracking-tighter">
                      Time
                    </label>
                    <p className="text-sm font-bold">
                      {(() => {
                        const slot = getMeetingSlot(selectedMeeting);
                        return slot
                          ? `${slot.start_time} – ${slot.end_time}`
                          : formatMeetingTimeRange(selectedMeeting);
                      })()}
                    </p>
                  </div>
                </div>

                {selectedMeeting.client_message && (
                  <div className="p-4 rounded-md border border-[#C4FE01]/20 bg-[#C4FE01]/5">
                    <p className="text-xs text-foreground leading-relaxed">
                      {selectedMeeting.client_message}
                    </p>
                  </div>
                )}

                <div className="p-4 rounded-md border border-dashed border-border bg-muted/30">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {formatMeetingTypeLabel(selectedMeeting.meeting_type)
                      ? `${formatMeetingTypeLabel(selectedMeeting.meeting_type)} call. `
                      : ""}
                    {isCalcomMeeting(selectedMeeting)
                      ? selectedMeeting.meeting_link
                        ? "Your Cal.com booking is confirmed — join using the link below."
                        : "Your booking is being processed. The join link will appear here shortly."
                      : selectedMeeting.client_status === "confirmed"
                        ? "Your call is confirmed — join using the meeting link below."
                        : selectedMeeting.client_status === "request_sent"
                          ? "Your request has been sent. We'll confirm your call shortly."
                          : "Check back here for updates on your call."}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="p-8 pt-0 flex gap-4">
                {canJoin ? (
                  <a
                    href={selectedMeeting.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button className="w-full bg-[#C4FE01] text-black hover:bg-[#C4FE01]/80 font-black rounded-md h-12">
                      {getMeetingJoinLabel(selectedMeeting)}
                    </Button>
                  </a>
                ) : (
                  <Button disabled className="w-full font-black rounded-md h-12 flex-1">
                    {selectedMeeting.client_status === "request_sent"
                      ? "Awaiting confirmation"
                      : "Meeting link unavailable"}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ) : (
            <div className="h-[600px] flex flex-col items-center justify-center border border-dashed border-border rounded-md p-10 text-center">
              <LayoutGrid className="h-10 w-10 mb-4 text-muted-foreground/60" />
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Select a call to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default MeetingsPage;