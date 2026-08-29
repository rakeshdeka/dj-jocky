"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Button } from "../../../components/dashboard/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../../../components/dashboard/ui/card"
import {
  CalendarIcon,
  PlusCircle,
  Clock,
  Video,
  Inbox,
  LayoutGrid,
  Loader2
} from "lucide-react"
import { ScrollArea } from "../../../components/dashboard/ui/scroll-area"
import { NewMeetingDialog } from "../../../components/dashboard/ui/new-meeting-dialog"
import MainLayout from "../../../components/dashboard/layout/MainLayout"
import axios from "axios"
import { useSelector } from "react-redux"
import { RootState } from "../../../store/store"

const MeetingsPage = () => {
  const [meetingsData, setMeetingsData] = useState<any[]>([])
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const { token } = useSelector((state: RootState) => state.auth)
  const apiUrl = import.meta.env.VITE_API_URL

  const fetchMeetings = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${apiUrl}/meetings/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const items = res.data.items || []
      setMeetingsData(items)
      if (items.length > 0) setSelectedMeeting(items[0])
    } catch (error) {
      console.error("Fetch meetings error", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) fetchMeetings()
  }, [token])

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-sm font-bold mb-1 tracking-[0.2em]">MEETINGS</h1>
          <p className="text-muted-foreground text-sm">Review and join your upcoming project consultations.</p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="bg-[#C4FE01] text-black hover:bg-[#C4FE01]/90 font-bold rounded-full px-6"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Schedule Meeting
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LIST VIEW */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Upcoming</span>
            <span className="text-[10px] font-bold bg-secondary px-2 py-0.5 rounded-full">{meetingsData.length}</span>
          </div>

          <ScrollArea className="h-[600px] pr-4">
            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center gap-2 border border-dashed border-border/40 rounded-md">
                <Loader2 className="h-6 w-6 animate-spin text-[#C4FE01]" />
                <p className="text-xs text-muted-foreground animate-pulse tracking-wider uppercase text-[10px] font-bold">
                  Fetching meetings...
                </p>
              </div>
            ) : meetingsData.length > 0 ? (
              meetingsData.map((m) => (
                <div
                  key={m._id}
                  onClick={() => setSelectedMeeting(m)}
                  className={`p-5 rounded-md border transition-all cursor-pointer mb-3 group ${
                    selectedMeeting?._id === m._id
                      ? "border-[#C4FE01] bg-[#C4FE01]/5"
                      : "border-transparent bg-secondary/20 hover:bg-secondary/40"
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-sm group-hover:text-[#C4FE01] transition-colors">{m.agenda}</h3>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-medium">
                    <div className="flex items-center gap-1.5">
                      <CalendarIcon className="h-3 w-3" />
                      {format(new Date(m.date), "MMM dd")}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      {m.time}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-md">
                <Inbox className="h-8 w-8 mb-3 text-muted-foreground/60" />
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">No Sessions Booked</p>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* DETAIL VIEW */}
        <div className="lg:col-span-7">
          {selectedMeeting ? (
            <Card className="bg-card border-border rounded-md overflow-hidden sticky top-24">
              <CardHeader className="bg-secondary/20 border-b border-border/50 p-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-md bg-[#C4FE01] text-black">
                    <Video className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[#C4FE01] uppercase tracking-widest">Confirmed Meeting</p>
                    <CardTitle className="text-2xl mt-1">{selectedMeeting.agenda}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black uppercase text-muted-foreground block mb-2 tracking-tighter">Date</label>
                    <p className="text-sm font-bold">{format(new Date(selectedMeeting.date), "EEEE, MMMM dd")}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-muted-foreground block mb-2 tracking-tighter">Time</label>
                    <p className="text-sm font-bold">{selectedMeeting.time}</p>
                  </div>
                </div>

                <div className="p-4 rounded-md border border-dashed border-border bg-muted/30">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    This is a <span className="text-white font-bold">{selectedMeeting.meeting_type}</span> session related to your selected project service. Please ensure you are in a quiet environment before joining.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="p-8 pt-0 flex gap-4">
                <a
                  href={selectedMeeting.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button className="w-full bg-[#C4FE01] text-black hover:bg-[#C4FE01]/80 font-black rounded-md h-12">
                    Join Discord Session
                  </Button>
                </a>
              </CardFooter>
            </Card>
          ) : (
            <div className="h-[600px] flex flex-col items-center justify-center border border-dashed border-border rounded-md p-10 text-center">
              <LayoutGrid className="h-10 w-10 mb-4 text-muted-foreground/60" />
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Select a session to view details</p>
            </div>
          )}
        </div>
      </div>

      <NewMeetingDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onMeetingCreated={fetchMeetings}
      />
    </MainLayout>
  )
}

export default MeetingsPage