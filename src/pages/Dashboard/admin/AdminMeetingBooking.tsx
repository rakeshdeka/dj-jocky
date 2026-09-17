"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { ArrowLeft, Clock, Loader2 } from "lucide-react";

import type { RootState } from "../../../store/store";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/dashboard/ui/select";
import { cn } from "../../../lib/utils";
import {
  createAdminMeeting,
  fetchAdminAvailabilitySlots,
  fetchCalcomConfig,
  fetchClientsDropdown,
  fetchDesignersDropdown,
  isCalcomProvider,
  type AvailabilitySlot,
  type UserDropdownItem,
} from "../../../lib/meetings-api";

export default function AdminMeetingBooking() {
  const navigate = useNavigate();
  const { token } = useSelector((state: RootState) => state.auth);

  const [clients, setClients] = useState<UserDropdownItem[]>([]);
  const [designers, setDesigners] = useState<UserDropdownItem[]>([]);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useCalcom, setUseCalcom] = useState(false);

  const [clientId, setClientId] = useState("");
  const [designerId, setDesignerId] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const loadOptions = useCallback(async () => {
    if (!token) return;

    try {
      setIsLoadingOptions(true);
      const config = await fetchCalcomConfig(token).catch(() => null);
      if (isCalcomProvider(config)) {
        setUseCalcom(true);
        setClients([]);
        setDesigners([]);
        setSlots([]);
        return;
      }
      setUseCalcom(false);
      const [clientsList, designersList, slotsList] = await Promise.all([
        fetchClientsDropdown(token),
        fetchDesignersDropdown(token),
        fetchAdminAvailabilitySlots(token),
      ]);
      setClients(clientsList);
      setDesigners(designersList);
      setSlots(slotsList);
    } catch {
      toast.error("Failed to load booking options");
    } finally {
      setIsLoadingOptions(false);
    }
  }, [token]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  const filteredSlots = slots.filter((slot) => {
    if (slot.is_booked === true || slot.is_available === false) return false;
    return true;
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!clientId || !selectedSlotId || !meetingLink.trim()) {
      toast.error("Please fill all required fields and select a slot");
      return;
    }

    if (!token) return;

    try {
      setIsSubmitting(true);
      const result = await createAdminMeeting(token, {
        client_id: clientId,
        slot_id: selectedSlotId,
        meeting_link: meetingLink.trim(),
        ...(designerId && designerId !== "none" ? { designer_id: designerId } : {}),
      });
      toast.success(result?.message || "Call scheduled successfully");
      navigate("/admin/meetings");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error scheduling call");
    } finally {
      setIsSubmitting(false);
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

        <h1 className="text-xl font-bold mb-1 tracking-[0.2em] uppercase">Schedule Call</h1>
        <p className="text-sm text-muted-foreground">
          Book directly for a client using an availability slot and Google Meet link.
        </p>
      </div>

      {useCalcom ? (
        <Card className="max-w-2xl bg-card border-[#C4FE01]/30 border-border/40">
          <CardContent className="py-12 text-center space-y-3">
            <p className="text-sm font-semibold">Cal.com is handling bookings</p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Manual admin scheduling is disabled while Cal.com is the meetings provider. Clients book
              through the app or Cal.com embed — meetings sync automatically.
            </p>
            <Button asChild variant="outline">
              <Link to="/admin/meetings">Back to Meetings</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
      <Card className="max-w-2xl bg-card border-border/40">
        <CardHeader>
          <CardTitle className="text-lg font-black uppercase tracking-tight">Session Details</CardTitle>
          <CardDescription>
            Select client, slot, and Meet link. Designer is optional.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Client
              </Label>
              <Select
                value={clientId}
                disabled={isLoadingOptions || isSubmitting}
                onValueChange={setClientId}
              >
                <SelectTrigger className="h-12 bg-secondary/30 border-none">
                  <SelectValue placeholder={isLoadingOptions ? "Loading..." : "Select client"} />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Designer (optional)
              </Label>
              <Select
                value={designerId}
                disabled={isLoadingOptions || isSubmitting}
                onValueChange={setDesignerId}
              >
                <SelectTrigger className="h-12 bg-secondary/30 border-none">
                  <SelectValue placeholder="Leave unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Leave Unassigned</SelectItem>
                  {designers.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Availability Slot
              </Label>
              {filteredSlots.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {filteredSlots.map((slot) => {
                    const isSelected = selectedSlotId === slot._id;
                    return (
                      <button
                        key={slot._id}
                        type="button"
                        onClick={() => setSelectedSlotId(slot._id)}
                        className={cn(
                          "p-3 rounded-lg border text-left text-xs",
                          isSelected
                            ? "border-[#C4FE01] bg-[#C4FE01]/10"
                            : "border-border/40 bg-secondary/20 hover:border-[#C4FE01]/40",
                        )}
                      >
                        <p className="font-bold">{format(new Date(slot.date), "EEE, MMM d")}</p>
                        <p className="text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {slot.start_time} – {slot.end_time}
                        </p>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground py-4 text-center border border-dashed rounded-lg">
                  No open slots available.{" "}
                  <Link to="/admin/meetings/availability" className="text-[#C4FE01] underline">
                    Add availability
                  </Link>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Google Meet Link
              </Label>
              <Input
                type="url"
                required
                placeholder="https://meet.google.com/abc-defg-hij"
                disabled={isLoadingOptions || isSubmitting}
                className="bg-secondary/30 border-none h-12"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
              />
            </div>

          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              disabled={isSubmitting}
              onClick={() => navigate("/admin/meetings")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoadingOptions || isSubmitting || !selectedSlotId}
              className="w-full sm:flex-1 bg-[#C4FE01] text-black font-black h-12 uppercase text-xs tracking-[0.2em]"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isSubmitting ? "Scheduling..." : "Schedule Call"}
            </Button>
          </CardFooter>
        </form>
      </Card>
      )}
    </MainLayout>
  );
}
