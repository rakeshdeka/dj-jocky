"use client"

import { useEffect, useState, useCallback } from "react"
import { format, isValid, parseISO } from "date-fns"
import axios from "axios"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import type { RootState } from "../../../store/store"
import MainLayout from "../../../components/dashboard/layout/MainLayout"
import { Button } from "../../../components/dashboard/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/dashboard/ui/card"
import { Label } from "../../../components/dashboard/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../../../components/dashboard/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/dashboard/ui/select"
import { toast } from "sonner"
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Brush,
  Plus,
  UserPlus,
  AlertCircle,
  ExternalLink,
  Loader2,
} from "lucide-react"
import { Badge } from "../../../components/dashboard/ui/badge"
import { fetchDesignersDropdown, type UserDropdownItem } from "../../../lib/meetings-api"

export interface Meeting {
  _id: string
  date: string
  time: string
  agenda: string
  meeting_type: string
  meeting_link: string
  status: string
  client_id: { _id: string; name: string; email: string } | null
  designer_id: { _id: string; name: string; email: string } | null
}

export default function AdminMeetings() {
  const apiUrl = import.meta.env.VITE_API_URL || ""
  const { token } = useSelector((state: RootState) => state.auth)

  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [designers, setDesigners] = useState<UserDropdownItem[]>([])
  const [isFetching, setIsFetching] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(false)

  const [isAssignOpen, setIsAssignOpen] = useState<boolean>(false)
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null)
  const [assignDesignerId, setAssignDesignerId] = useState<string>("")

  const getAuthConfig = useCallback(() => ({
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  }), [token])

  const getFetchHeaders = useCallback(() => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }), [token])

  const safeFormatDate = (dateStr: string) => {
    if (!dateStr) return "N/A"
    const parsed = parseISO(dateStr)
    if (isValid(parsed)) {
      return format(parsed, "MMM dd, yyyy")
    }
    const standardDate = new Date(dateStr)
    return isValid(standardDate) ? format(standardDate, "MMM dd, yyyy") : dateStr
  }

  const fetchData = useCallback(async () => {
    if (!token) return

    try {
      setIsFetching(true)

      const [meetRes, designersList] = await Promise.all([
        axios.get(`${apiUrl}/admin/meetings`, getAuthConfig()),
        fetchDesignersDropdown(apiUrl, token),
      ])

      setMeetings(meetRes.data.items || [])
      setDesigners(designersList)
    } catch {
      toast.error("Failed to sync dashboard data")
    } finally {
      setIsFetching(false)
    }
  }, [apiUrl, getAuthConfig, token])

  useEffect(() => {
    if (token) {
      fetchData()
    } else {
      setIsFetching(false)
    }
  }, [token, fetchData])

  const handleAssignDesigner = async () => {
    if (!assignDesignerId || !selectedMeetingId) return

    try {
      setLoading(true)
      const res = await fetch(`${apiUrl}/meetings/${selectedMeetingId}/assign-designer`, {
        method: "PATCH",
        headers: getFetchHeaders(),
        credentials: "include",
        body: JSON.stringify({ designer_id: assignDesignerId }),
      })

      if (res.ok) {
        toast.success("Designer Assigned Successfully")
        setIsAssignOpen(false)
        setAssignDesignerId("")
        setSelectedMeetingId(null)
        fetchData()
      } else {
        toast.error("Failed to update assignment")
      }
    } catch {
      toast.error("Server error. Check your connection.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-xl font-bold mb-1 tracking-[0.2em] uppercase">MEETINGS</h1>
          <p className="text-sm text-muted-foreground">List of scheduled client sessions & team handlers</p>
        </div>
        <Button
          asChild
          className="bg-[#C4FE01] text-black hover:bg-[#C4FE01]/90 font-black rounded-md px-8 h-12 uppercase text-xs tracking-widest transition-all shadow-xl shadow-[#C4FE01]/10"
        >
          <Link to="/admin/meetings/new">
            <Plus className="mr-2 h-4 w-4 stroke-[3]" /> Manual Entry
          </Link>
        </Button>
      </div>

      {isFetching ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="bg-card border-border/40 rounded-md p-6 h-[320px] flex flex-col justify-between animate-pulse">
              <div className="space-y-3">
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="h-6 w-3/4 bg-muted rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-10 bg-muted/50 rounded" />
                <div className="h-10 bg-muted/50 rounded" />
              </div>
              <div className="h-10 bg-muted/30 rounded" />
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meetings.map((m) => {
              const isUnassigned = !m.designer_id

              return (
                <Card
                  key={m._id}
                  className={`bg-card border-border/40 hover:border-[#C4FE01]/40 transition-all duration-300 rounded-md overflow-hidden flex flex-col ${
                    isUnassigned ? "ring-1 ring-orange-500/20" : ""
                  }`}
                >
                  <CardHeader className="p-6 pb-4">
                    <div className="flex justify-between items-center mb-4">
                      <Badge className="uppercase text-[9px] tracking-widest font-black py-1 px-3 rounded-md bg-secondary text-muted-foreground border-none">
                        {m.meeting_type?.replace("_", " ")}
                      </Badge>
                      <div className="flex items-center gap-1.5">
                        <div className={`h-1.5 w-1.5 rounded-full ${m.status === "pending" ? "bg-orange-500" : "bg-[#C4FE01]"}`} />
                        <span className="text-[9px] font-black uppercase tracking-tighter opacity-50">{m.status}</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg font-bold line-clamp-2 min-h-[3rem] tracking-tight">
                      {m.agenda}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="px-6 pb-6 space-y-4 flex-grow">
                    <div className="flex items-center gap-6 py-3 border-y border-border/20">
                      <div className="flex items-center gap-2 font-bold text-[11px] uppercase tracking-tighter">
                        <CalendarIcon className="h-3.5 w-3.5 text-[#C4FE01]" /> {safeFormatDate(m.date)}
                      </div>
                      <div className="flex items-center gap-2 font-bold text-[11px] uppercase tracking-tighter">
                        <Clock className="h-3.5 w-3.5 text-[#C4FE01]" /> {m.time}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-3 rounded-md bg-secondary/20 border border-transparent">
                        <User className="h-4 w-4 opacity-30" />
                        <div className="truncate">
                          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-tighter">Client</p>
                          <p className="text-xs font-bold truncate">{m.client_id?.name || "Member"}</p>
                        </div>
                      </div>

                      <div
                        className={`flex items-center gap-3 p-3 rounded-md border transition-colors ${
                          isUnassigned ? "bg-orange-500/5 border-orange-500/20" : "bg-secondary/20 border-transparent"
                        }`}
                      >
                        {isUnassigned ? (
                          <AlertCircle className="h-4 w-4 text-orange-500 animate-pulse" />
                        ) : (
                          <Brush className="h-4 w-4 text-[#C4FE01]" />
                        )}
                        <div className="flex-1 truncate">
                          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-tighter">Designer</p>
                          <p className={`text-xs font-bold truncate ${isUnassigned ? "text-orange-500 italic" : ""}`}>
                            {m.designer_id?.name || "Needs Assignment"}
                          </p>
                        </div>

                        <Button
                          size="icon"
                          variant="ghost"
                          className={`h-8 w-8 rounded-md ${
                            isUnassigned ? "bg-orange-500 text-white hover:bg-orange-600" : "hover:bg-[#C4FE01] hover:text-black"
                          }`}
                          onClick={() => {
                            setSelectedMeetingId(m._id)
                            setIsAssignOpen(true)
                          }}
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>

                  <div className="p-4 bg-secondary/10 flex gap-2">
                    <a
                      href={m.meeting_link || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className={`flex-1 ${!m.meeting_link ? "pointer-events-none opacity-50" : ""}`}
                    >
                      <Button
                        variant="outline"
                        disabled={!m.meeting_link}
                        className="w-full text-[10px] font-black uppercase h-10 rounded-md border-border/50 hover:bg-[#C4FE01] hover:text-black hover:border-transparent transition-all"
                      >
                        Join Session <ExternalLink className="ml-2 h-3 w-3" />
                      </Button>
                    </a>
                  </div>
                </Card>
              )
            })}
          </div>

          {meetings.length === 0 && (
            <div className="py-20 text-center border-2 border-dashed border-border/50 rounded-xl">
              <p className="text-muted-foreground text-sm font-medium">No scheduled meetings found.</p>
            </div>
          )}
        </>
      )}

      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent className="sm:max-w-[400px] border-none rounded-md p-8 bg-card shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black italic uppercase tracking-tighter">Assign Professional</DialogTitle>
            <DialogDescription className="text-[10px] font-bold uppercase tracking-widest opacity-60">
              Update session handler
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Team Member</Label>
            <Select value={assignDesignerId} onValueChange={setAssignDesignerId}>
              <SelectTrigger className="h-12 bg-secondary/30 border-none rounded-md text-sm px-4">
                <SelectValue placeholder="Choose designer..." />
              </SelectTrigger>
              <SelectContent>
                {designers.map((d) => (
                  <SelectItem key={d.id} value={d.id} className="font-bold py-2 uppercase text-xs cursor-pointer">
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              onClick={handleAssignDesigner}
              disabled={loading || !assignDesignerId}
              className="w-full bg-[#C4FE01] text-black hover:bg-[#C4FE01]/80 font-black h-12 rounded-md uppercase text-xs tracking-widest shadow-xl shadow-[#C4FE01]/10 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Updating..." : "Confirm Assignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}
