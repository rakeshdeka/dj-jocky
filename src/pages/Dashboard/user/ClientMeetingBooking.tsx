"use client";

import { useState, type FormEvent } from "react";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { ArrowLeft, CalendarIcon, Globe, Layers, Loader2, Sparkles } from "lucide-react";

import MainLayout from "../../../components/dashboard/layout/MainLayout";
import { Button } from "../../../components/dashboard/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/dashboard/ui/card";
import { Input } from "../../../components/dashboard/ui/input";
import { Label } from "../../../components/dashboard/ui/label";
import { Textarea } from "../../../components/dashboard/ui/textarea";
import { Calendar } from "../../../components/dashboard/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/dashboard/ui/popover";
import { RootState } from "../../../store/store";
import { cn } from "../../../lib/utils";
import { createMeeting, isValidGoogleMeetUrl } from "../../../lib/meetings-api";

const EMPTY_FORM = {
  agenda: "",
  date: new Date(),
  time: "",
  meeting_type: "service",
  meeting_link: "",
};

export default function ClientMeetingBooking() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || "";
  const { token } = useSelector((state: RootState) => state.auth);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.agenda.trim() || !form.time || !form.meeting_link.trim()) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!isValidGoogleMeetUrl(form.meeting_link)) {
      toast.error("Meeting link must be a valid Google Meet URL (https://meet.google.com/...)");
      return;
    }

    if (!token) {
      toast.error("You must be signed in to schedule a meeting");
      return;
    }

    try {
      setIsSubmitting(true);
      await createMeeting(apiUrl, token, {
        date: format(form.date, "yyyy-MM-dd"),
        time: form.time,
        meeting_type: form.meeting_type,
        agenda: form.agenda.trim(),
        meeting_link: form.meeting_link.trim(),
      });
      toast.success("Meeting scheduled successfully");
      navigate("/client/meetings");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Booking failed";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          Schedule Meeting
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Book a consultation and share your Google Meet link.
        </p>
      </div>

      <Card className="max-w-2xl bg-card border-border/40">
        <CardHeader>
          <CardTitle className="text-lg font-black uppercase tracking-tight">New Session</CardTitle>
          <CardDescription>Select context and schedule your consultation.</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Meeting Type
              </Label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-secondary/20 rounded-2xl">
                <Button
                  type="button"
                  className={cn(
                    "h-12 text-[10px] font-black uppercase rounded-xl transition-all duration-200",
                    form.meeting_type === "service"
                      ? "bg-[#C4FE01] text-black shadow-lg"
                      : "bg-transparent text-muted-foreground hover:text-white",
                  )}
                  onClick={() => setForm({ ...form, meeting_type: "service" })}
                >
                  <Layers className="mr-2 h-4 w-4" /> Service
                </Button>
                <Button
                  type="button"
                  className={cn(
                    "h-12 text-[10px] font-black uppercase rounded-xl transition-all duration-200",
                    form.meeting_type === "platform_query"
                      ? "bg-[#C4FE01] text-black shadow-lg"
                      : "bg-transparent text-muted-foreground hover:text-white",
                  )}
                  onClick={() => setForm({ ...form, meeting_type: "platform_query" })}
                >
                  <Globe className="mr-2 h-4 w-4" /> Platform Query
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Agenda
              </Label>
              <Textarea
                value={form.agenda}
                onChange={(e) => setForm({ ...form, agenda: e.target.value })}
                className="bg-secondary/30 border-none min-h-[100px] text-sm rounded-xl resize-none focus-visible:ring-1 focus-visible:ring-[#C4FE01]"
                placeholder="What would you like to discuss?"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Google Meet Link
              </Label>
              <Input
                type="url"
                value={form.meeting_link}
                onChange={(e) => setForm({ ...form, meeting_link: e.target.value })}
                className="bg-secondary/30 border-none h-12 text-sm rounded-xl focus-visible:ring-[#C4FE01]"
                placeholder="https://meet.google.com/abc-defg-hij"
                required
                disabled={isSubmitting}
              />
              <p className="text-[10px] text-muted-foreground">
                Paste the Google Meet URL for this session.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      {format(form.date, "MMM dd, yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 border-none">
                    <Calendar
                      mode="single"
                      selected={form.date}
                      onSelect={(d) => d && setForm({ ...form, date: d })}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Time
                </Label>
                <Input
                  type="time"
                  className="bg-secondary/30 border-none h-12 text-sm rounded-xl focus-visible:ring-[#C4FE01]"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
              </div>
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
              disabled={isSubmitting}
              className="w-full sm:flex-1 bg-[#C4FE01] text-black hover:bg-[#C4FE01]/90 font-black h-12 rounded-md uppercase text-xs tracking-[0.2em]"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isSubmitting ? "Scheduling..." : "Book Session"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </MainLayout>
  );
}
