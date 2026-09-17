"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { ArrowLeft, CalendarIcon, Clock, Loader2, Plus, Trash2 } from "lucide-react";

import type { RootState } from "../../../store/store";
import MainLayout from "../../../components/dashboard/layout/MainLayout";
import { Button } from "../../../components/dashboard/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/dashboard/ui/card";
import { Input } from "../../../components/dashboard/ui/input";
import { Label } from "../../../components/dashboard/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/dashboard/ui/select";
import { Badge } from "../../../components/dashboard/ui/badge";
import {
  createAvailabilitySlot,
  deleteAvailabilitySlot,
  fetchAdminAvailabilitySlots,
  fetchCalcomConfig,
  isCalcomProvider,
  type AvailabilitySlot,
  type MeetingType,
} from "../../../lib/meetings-api";

const EMPTY_FORM = {
  date: "",
  start_time: "",
  end_time: "",
  meeting_type: "platform_query" as MeetingType,
};

export default function AdminMeetingAvailability() {
  const { token } = useSelector((state: RootState) => state.auth);

  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [useCalcom, setUseCalcom] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadSlots = useCallback(async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const config = await fetchCalcomConfig(token).catch(() => null);
      if (isCalcomProvider(config)) {
        setUseCalcom(true);
        setSlots([]);
        return;
      }
      setUseCalcom(false);
      const items = await fetchAdminAvailabilitySlots(token);
      setSlots(
        [...items].sort((a, b) => {
          const dateCompare = a.date.localeCompare(b.date);
          if (dateCompare !== 0) return dateCompare;
          return a.start_time.localeCompare(b.start_time);
        }),
      );
    } catch {
      toast.error("Failed to load availability slots");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.date || !form.start_time || !form.end_time) {
      toast.error("Please fill all slot fields");
      return;
    }

    if (!token) return;

    try {
      setIsSubmitting(true);
      await createAvailabilitySlot(token, form);
      toast.success("Availability slot created");
      setForm(EMPTY_FORM);
      await loadSlots();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to create slot");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (slotId: string) => {
    if (!token) return;

    try {
      setDeletingId(slotId);
      await deleteAvailabilitySlot(token, slotId);
      toast.success("Slot deleted");
      setSlots((prev) => prev.filter((slot) => slot._id !== slotId));
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to delete slot");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <Button variant="ghost" size="sm" className="mb-4 -ml-2" asChild>
          <Link to="/admin/meetings">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Meetings
          </Link>
        </Button>

        <h1 className="text-xl font-bold mb-1 tracking-[0.2em] uppercase">AVAILABILITY</h1>
        <p className="text-sm text-muted-foreground">
          {useCalcom
            ? "Availability is managed in Cal.com when that provider is active."
            : "Create time slots clients can request for calls."}
        </p>
      </div>

      {useCalcom ? (
        <Card className="bg-card border-[#C4FE01]/30 border-border/40">
          <CardContent className="py-12 text-center space-y-3">
            <CalendarIcon className="h-10 w-10 text-[#C4FE01] mx-auto opacity-80" />
            <p className="text-sm font-semibold">Cal.com manages your availability</p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Slot-based availability is disabled. Update your schedule in the Cal.com dashboard —
              bookings sync here automatically via webhook.
            </p>
            <Button variant="outline" asChild className="mt-2">
              <a href="https://cal.com" target="_blank" rel="noopener noreferrer">
                Open Cal.com
              </a>
            </Button>
          </CardContent>
        </Card>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border/40">
          <CardHeader>
            <CardTitle className="text-base font-black uppercase tracking-tight flex items-center gap-2">
              <Plus className="h-4 w-4 text-[#C4FE01]" />
              New Slot
            </CardTitle>
            <CardDescription>Add a bookable window for client call requests.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Date
                </Label>
                <Input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="bg-secondary/30 border-none h-11"
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Start
                  </Label>
                  <Input
                    type="time"
                    required
                    value={form.start_time}
                    onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                    className="bg-secondary/30 border-none h-11"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    End
                  </Label>
                  <Input
                    type="time"
                    required
                    value={form.end_time}
                    onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                    className="bg-secondary/30 border-none h-11"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Meeting Type
                </Label>
                <Select
                  value={form.meeting_type}
                  onValueChange={(val) => setForm({ ...form, meeting_type: val as MeetingType })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="h-11 bg-secondary/30 border-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="platform_query">Platform Query</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#C4FE01] text-black font-black h-11 uppercase text-xs tracking-widest"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Add Slot
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/40">
          <CardHeader>
            <CardTitle className="text-base font-black uppercase tracking-tight">All Slots</CardTitle>
            <CardDescription>{slots.length} slot{slots.length === 1 ? "" : "s"} configured</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-16 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#C4FE01]" />
              </div>
            ) : slots.length > 0 ? (
              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {slots.map((slot) => (
                  <div
                    key={slot._id}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border/40 bg-secondary/10"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <CalendarIcon className="h-3.5 w-3.5 text-[#C4FE01]" />
                        {format(new Date(slot.date), "EEE, MMM d, yyyy")}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" />
                        {slot.start_time} – {slot.end_time}
                      </div>
                      <Badge variant="outline" className="text-[9px] mt-2 capitalize">
                        {slot.meeting_type?.replace("_", " ")}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      disabled={deletingId === slot._id}
                      onClick={() => handleDelete(slot._id)}
                    >
                      {deletingId === slot._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-16 border border-dashed border-border/40 rounded-lg">
                No slots yet. Create your first availability window.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      )}
    </MainLayout>
  );
}
