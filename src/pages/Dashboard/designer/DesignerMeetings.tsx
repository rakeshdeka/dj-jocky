"use client"

import { useEffect, useState } from "react"
import { format, isPast, isToday } from "date-fns"
import MainLayout from "../../../components/dashboard/layout/MainLayout"
import { Button } from "../../../components/dashboard/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/dashboard/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/dashboard/ui/dialog"
import { toast } from "sonner"
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Video,
  ExternalLink,
  CheckCircle2,
  Loader2
} from "lucide-react"
import { Badge } from "../../../components/dashboard/ui/badge"
import { cn } from "../../../lib/utils"

interface Meeting {
  _id: string
  date: string
  time: string
  agenda: string
  meeting_type: string
  meeting_link: string
  status: string
  client_id: { _id: string; name: string; email: string }
}

export default function DesignerMeetings() {
  const apiUrl = import.meta.env.VITE_API_URL
  const token = localStorage.getItem("token")

  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)

  // Detail Modal
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  })

  const fetchMyMeetings = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${apiUrl}/meetings/me`, { headers: getHeaders() })
      const data = await res.json()
      // Sort: Today first, then future
      setMeetings(data.items || [])
    } catch (err) {
      toast.error("Failed to sync your schedule")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) fetchMyMeetings()
  }, [token])

  const handleJoin = (link: string) => {
    if (!link) return toast.error("Meeting link not available yet")
    window.open(link, "_blank")
  }

  return (
    <MainLayout>
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xs font-bold mb-1 tracking-[0.2em] uppercase">MY MEETINGS</h1>
          <p className="text-muted-foreground text-xs">
            List of scheduled sessions and briefings
          </p>
        </div>
        {!loading && (
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="font-bold text-xs tracking-wider uppercase">{meetings.length} MEETINGS</p>
            </div>
          </div>
        )}
      </div>

      {/* MEETING GRID / LOADING STATE */}
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
              const meetingDate = new Date(m.date)
              const isTodayMeeting = isToday(meetingDate)
              const isFinished = m.status === 'completed' || (isPast(meetingDate) && !isTodayMeeting)

              return (
                <Card
                  key={m._id}
                  className={cn(
                    "bg-card border-border/40 hover:border-[#C4FE01]/40 transition-all duration-300 rounded-md overflow-hidden flex flex-col justify-between group",
                    isTodayMeeting && "ring-1 ring-[#C4FE01]/30 border-[#C4FE01]/40"
                  )}
                >
                  <CardHeader className="p-5 pb-3">
                    <div className="flex justify-between items-center mb-3">
                      <Badge className={cn(
                        "uppercase text-[9px] tracking-widest font-bold py-0.5 px-2 rounded-sm border-none",
                        isTodayMeeting ? "bg-[#C4FE01] text-black" : "bg-secondary text-muted-foreground"
                      )}>
                        {isTodayMeeting ? "Happening Today" : m.meeting_type?.replace("_", " ")}
                      </Badge>
                      <div className="flex items-center gap-1.5">
                        <div className={cn(
                          "h-1.5 w-1.5 rounded-full animate-pulse",
                          isFinished ? "bg-muted opacity-50" : "bg-[#C4FE01]"
                        )} />
                        <span className="text-[9px] font-bold uppercase tracking-tight opacity-60">{m.status}</span>
                      </div>
                    </div>
                    <CardTitle 
                      className="text-base sm:text-lg font-bold line-clamp-2 min-h-[2.75rem] tracking-tight group-hover:text-[#C4FE01] transition-colors cursor-pointer" 
                      onClick={() => { setSelectedMeeting(m); setIsDetailOpen(true); }}
                    >
                      {m.agenda}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="px-5 py-2 space-y-4 flex-grow">
                    <div className="flex items-center gap-4 py-3 border-y border-border/20">
                      <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider">
                        <CalendarIcon className="h-3 w-3 text-[#C4FE01]" /> {format(new Date(m.date), "MMM dd, yyyy")}
                      </div>
                      <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider">
                        <Clock className="h-3 w-3 text-[#C4FE01]" /> {m.time}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5 p-2.5 rounded-md bg-secondary/20 border border-transparent">
                        <User className="h-3.5 w-3.5 opacity-40" />
                        <div className="truncate">
                          <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Client Representative</p>
                          <p className="text-xs font-semibold truncate">{m.client_id?.name || "Premium Member"}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>

                  <div className="p-3 bg-secondary/10 border-t border-border/30">
                    <Button
                      disabled={!m.meeting_link || isFinished}
                      onClick={() => handleJoin(m.meeting_link)}
                      className="w-full text-[10px] font-bold uppercase h-9 rounded-md bg-transparent border border-border/50 hover:bg-[#C4FE01] hover:text-black hover:border-transparent transition-all tracking-wider"
                    >
                      {isFinished ? "Session Ended" : "Join Google Meet"} <ExternalLink className="ml-1.5 h-3 w-3" />
                    </Button>
                  </div>
                </Card>
              )
            })
          ) : (
            <div className="col-span-full py-16 text-center border border-dashed border-border/30 rounded-md">
              <CheckCircle2 className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-30" />
              <p className="text-xs font-bold uppercase tracking-wider opacity-50">No sessions assigned to your profile</p>
            </div>
          )}
        </div>
      )}

      {/* SESSION DETAIL MODAL */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[420px] border border-border/40 rounded-md p-6 bg-card shadow-2xl">
          {selectedMeeting && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#C4FE01]" />
                  <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">Briefing Details</span>
                </div>
                <DialogTitle className="text-xl font-bold uppercase tracking-tight leading-snug">
                  {selectedMeeting.agenda}
                </DialogTitle>
              </DialogHeader>

              <div className="py-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-md bg-secondary/30">
                    <p className="text-[8px] font-bold uppercase text-muted-foreground mb-1">Schedule</p>
                    <p className="text-xs font-bold">{format(new Date(selectedMeeting.date), "MMM dd, yyyy")}</p>
                    <p className="text-[10px] opacity-70 font-medium">{selectedMeeting.time}</p>
                  </div>
                  <div className="p-3 rounded-md bg-secondary/30">
                    <p className="text-[8px] font-bold uppercase text-muted-foreground mb-1">Category</p>
                    <Badge className="bg-[#C4FE01] text-black border-none text-[9px] uppercase font-bold px-2 py-0.5">
                      {selectedMeeting.meeting_type?.replace("_", " ")}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Client Data</p>
                  <div className="p-3 rounded-md border border-border/40 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold">{selectedMeeting.client_id?.name || "N/A"}</p>
                      <p className="text-[10px] opacity-60">{selectedMeeting.client_id?.email || "No email available"}</p>
                    </div>
                    <User className="h-4 w-4 opacity-30" />
                  </div>
                </div>
              </div>

              <Button
                onClick={() => handleJoin(selectedMeeting.meeting_link)}
                disabled={!selectedMeeting.meeting_link}
                className="w-full bg-[#C4FE01] text-black hover:bg-[#b2e600] font-bold h-10 rounded-md uppercase text-[11px] tracking-wider"
              >
                <Video className="mr-2 h-3.5 w-3.5" /> Join Google Meet
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}