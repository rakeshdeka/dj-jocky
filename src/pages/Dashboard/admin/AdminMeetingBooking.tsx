"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

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
import { Textarea } from "../../../components/dashboard/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/dashboard/ui/select";
import {
  createMeeting,
  fetchClientsDropdown,
  fetchDesignersDropdown,
  type UserDropdownItem,
} from "../../../lib/meetings-api";

const EMPTY_FORM = {
  date: "",
  time: "",
  meeting_type: "service",
  agenda: "",
  client_id: "",
  designer_id: "",
};

export default function AdminMeetingBooking() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || "";
  const { token } = useSelector((state: RootState) => state.auth);

  const [clients, setClients] = useState<UserDropdownItem[]>([]);
  const [designers, setDesigners] = useState<UserDropdownItem[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadOptions = useCallback(async () => {
    if (!token) return;

    try {
      setIsLoadingOptions(true);
      const [clientsList, designersList] = await Promise.all([
        fetchClientsDropdown(apiUrl, token),
        fetchDesignersDropdown(apiUrl, token),
      ]);
      setClients(clientsList);
      setDesigners(designersList);
    } catch {
      toast.error("Failed to load booking options");
    } finally {
      setIsLoadingOptions(false);
    }
  }, [apiUrl, token]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.client_id || !form.date || !form.time || !form.agenda.trim()) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!token) {
      toast.error("You must be signed in to schedule a meeting");
      return;
    }

    const payload = {
      date: form.date,
      time: form.time,
      meeting_type: form.meeting_type,
      agenda: form.agenda.trim(),
      client_id: form.client_id,
      ...(form.designer_id && form.designer_id !== "none"
        ? { designer_id: form.designer_id }
        : {}),
    };

    try {
      setIsSubmitting(true);
      const result = await createMeeting(apiUrl, token, payload);
      toast.success(result?.message || "Meeting scheduled successfully");
      navigate("/admin/meetings");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Error creating meeting");
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
          <Link to="/admin/meetings">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Meetings
          </Link>
        </Button>

        <h1 className="text-xl font-bold mb-1 tracking-[0.2em] uppercase">Manual Booking</h1>
        <p className="text-sm text-muted-foreground">
          Schedule a client session and optionally assign a designer.
        </p>
      </div>

      <Card className="max-w-2xl bg-card border-border/40">
        <CardHeader>
          <CardTitle className="text-lg font-black uppercase tracking-tight">Session Details</CardTitle>
          <CardDescription>All fields except designer are required.</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Date
                </Label>
                <Input
                  type="date"
                  required
                  disabled={isLoadingOptions || isSubmitting}
                  className="bg-secondary/30 border-none h-12 rounded-md text-sm"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Time
                </Label>
                <Input
                  type="time"
                  required
                  disabled={isLoadingOptions || isSubmitting}
                  className="bg-secondary/30 border-none h-12 rounded-md text-sm"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Meeting Type
              </Label>
              <Select
                value={form.meeting_type}
                disabled={isLoadingOptions || isSubmitting}
                onValueChange={(val) => setForm({ ...form, meeting_type: val })}
              >
                <SelectTrigger className="h-12 bg-secondary/30 border-none rounded-md px-4">
                  <SelectValue placeholder="Select meeting type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="service" className="text-xs font-bold py-2 uppercase">
                    Service
                  </SelectItem>
                  <SelectItem value="platform_query" className="text-xs font-bold py-2 uppercase">
                    Platform Query
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Client
              </Label>
              <Select
                value={form.client_id}
                disabled={isLoadingOptions || isSubmitting}
                onValueChange={(val) => setForm({ ...form, client_id: val })}
              >
                <SelectTrigger className="h-12 bg-secondary/30 border-none rounded-md px-4">
                  <SelectValue placeholder={isLoadingOptions ? "Loading clients..." : "Select client account"} />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-xs font-bold py-2 uppercase">
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Initial Designer
              </Label>
              <Select
                value={form.designer_id}
                disabled={isLoadingOptions || isSubmitting}
                onValueChange={(val) => setForm({ ...form, designer_id: val })}
              >
                <SelectTrigger className="h-12 bg-secondary/30 border-none rounded-md px-4">
                  <SelectValue placeholder={isLoadingOptions ? "Loading designers..." : "Assign designer (optional)"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-xs opacity-50 py-2 italic">
                    Leave Unassigned
                  </SelectItem>
                  {designers.map((d) => (
                    <SelectItem key={d.id} value={d.id} className="text-xs font-bold py-2 uppercase">
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Agenda
              </Label>
              <Textarea
                required
                placeholder="Primary focus of session..."
                disabled={isLoadingOptions || isSubmitting}
                className="bg-secondary/30 border-none rounded-md min-h-[120px] text-sm focus-visible:ring-1 focus-visible:ring-[#C4FE01]"
                value={form.agenda}
                onChange={(e) => setForm({ ...form, agenda: e.target.value })}
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
              disabled={isLoadingOptions || isSubmitting}
              className="w-full sm:flex-1 bg-[#C4FE01] text-black font-black h-12 rounded-md uppercase text-xs tracking-[0.2em] shadow-lg shadow-[#C4FE01]/10"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isSubmitting ? "Scheduling..." : "Finalize Session"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </MainLayout>
  );
}
