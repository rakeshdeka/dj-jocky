"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { addDays, format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { ArrowLeft, CalendarIcon, Clock, Loader2, Sparkles } from "lucide-react";

import MainLayout from "../../../components/dashboard/layout/MainLayout";
import CalcomEmbed from "../../../components/dashboard/meetings/CalcomEmbed";
import { Button } from "../../../components/dashboard/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/dashboard/ui/card";
import { Label } from "../../../components/dashboard/ui/label";
import { Calendar } from "../../../components/dashboard/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/dashboard/ui/popover";
import { RootState } from "../../../store/store";
import { cn } from "../../../lib/utils";
import {
  fetchAvailableSlots,
  fetchCalcomConfig,
  getCalcomEventType,
  isCalcomProvider,
  requestMeeting,
  type AvailabilitySlot,
  type CalcomConfig,
} from "../../../lib/meetings-api";

const emptyLegacyConfig = (): CalcomConfig => ({
  provider: "legacy",
  isCalcom: false,
  event_type: null,
  event_types: [],
});

export default function ClientMeetingBooking() {
  const navigate = useNavigate();
  const { token } = useSelector((state: RootState) => state.auth);

  const [calcomConfig, setCalcomConfig] = useState<CalcomConfig | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);

  const [date, setDate] = useState<Date>(new Date());
  const [legacySlots, setLegacySlots] = useState<AvailabilitySlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const useCalcom = isCalcomProvider(calcomConfig);
  const eventType = calcomConfig ? getCalcomEventType(calcomConfig) : null;

  const loadConfig = useCallback(async () => {
    if (!token) return;

    try {
      setIsLoadingConfig(true);
      const config = await fetchCalcomConfig(token);
      setCalcomConfig(config);
    } catch {
      setCalcomConfig(emptyLegacyConfig());
    } finally {
      setIsLoadingConfig(false);
    }
  }, [token]);

  const loadLegacySlots = useCallback(async () => {
    if (!token) return;

    try {
      setIsLoadingSlots(true);
      setSelectedSlotId("");

      const items = await fetchAvailableSlots(token, {
        date: format(date, "yyyy-MM-dd"),
      });
      setLegacySlots(items);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Could not load available slots");
      setLegacySlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  }, [token, date]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    if (!isLoadingConfig && !useCalcom) loadLegacySlots();
  }, [loadLegacySlots, isLoadingConfig, useCalcom]);

  const handleLegacySubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("You must be signed in to book a call");
      return;
    }

    if (!selectedSlotId) {
      toast.error("Please select a time slot");
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await requestMeeting(token, {
        slot_id: selectedSlotId,
      });
      toast.success(result.message || "Call request submitted. We'll confirm your call shortly.");

      navigate("/client/meetings");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Booking failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingConfig) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#C4FE01]" />
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
            Loading booking...
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
          asChild
        >
          <Link to="/client/meetings">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Meetings
          </Link>
        </Button>

        <h1 className="text-sm font-bold tracking-[0.2em] uppercase flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#C4FE01]" />
          {useCalcom ? "Book a Call" : "Request a Call"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {useCalcom
            ? "Pick a time on the calendar. Your booking syncs to your meetings list automatically."
            : "Pick an available slot. An admin will confirm your call and send a Google Meet link."}
        </p>
      </div>

      {useCalcom ? (
        <Card className="bg-card/40 border-border/40 overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            {eventType?.cal_link ? (
              <CalcomEmbed
                calLink={eventType.cal_link}
                username={calcomConfig?.username}
                title={eventType.title || eventType.slug?.replace(/-/g, " ") || "Book a meeting"}
              />
            ) : (
              <div className="py-16 text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  No calendar link is configured yet.
                </p>
                <p className="text-xs text-muted-foreground">Please contact support if this persists.</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="max-w-2xl bg-card border-border/40">
          <CardHeader>
            <CardTitle className="text-lg font-black uppercase tracking-tight">Call Request</CardTitle>
            <CardDescription>
              This is a request, not instant booking. You&apos;ll be notified once confirmed.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleLegacySubmit}>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start h-12 bg-secondary/30 border-none text-sm rounded-xl"
                      disabled={isSubmitting}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-[#C4FE01]" />
                      {format(date, "MMM dd, yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 border-none">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(d) => d && setDate(d)}
                      disabled={(d) =>
                        d < new Date(new Date().setHours(0, 0, 0, 0)) || d > addDays(new Date(), 60)
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Available Slots
                </Label>
                {isLoadingSlots ? (
                  <div className="flex items-center justify-center py-8 border border-dashed border-border/40 rounded-xl">
                    <Loader2 className="h-5 w-5 animate-spin text-[#C4FE01]" />
                  </div>
                ) : legacySlots.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {legacySlots.map((slot) => {
                      const isSelected = selectedSlotId === slot._id;
                      return (
                        <button
                          key={slot._id}
                          type="button"
                          onClick={() => setSelectedSlotId(slot._id)}
                          className={cn(
                            "p-3 rounded-xl border text-left transition-all",
                            isSelected
                              ? "border-[#C4FE01] bg-[#C4FE01]/10"
                              : "border-border/40 bg-secondary/20 hover:border-[#C4FE01]/40",
                          )}
                        >
                          <div className="flex items-center gap-1.5 text-xs font-bold">
                            <Clock className="h-3 w-3 text-[#C4FE01]" />
                            {slot.start_time} – {slot.end_time}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground py-6 text-center border border-dashed border-border/40 rounded-xl">
                    No slots available for this date. Try another day.
                  </p>
                )}
              </div>

            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                disabled={isSubmitting}
                onClick={() => navigate("/client/meetings")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !selectedSlotId}
                className="w-full sm:flex-1 bg-[#C4FE01] text-black hover:bg-[#C4FE01]/90 font-black h-12 rounded-md uppercase text-xs tracking-[0.2em]"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {isSubmitting ? "Submitting..." : "Submit Call Request"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </MainLayout>
  );
}
