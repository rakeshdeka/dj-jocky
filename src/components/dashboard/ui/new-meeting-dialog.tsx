"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, Sparkles, Layers, Globe } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Calendar } from "../ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { toast } from "sonner"
import axios from "axios"
import { useSelector } from "react-redux"
import { RootState } from "../../../store/store"
import { cn } from "../../../lib/utils"

export function NewMeetingDialog({ open, onOpenChange, onMeetingCreated }: any) {
  const { token } = useSelector((state: RootState) => state.auth)
  const apiUrl = import.meta.env.VITE_API_URL

  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    agenda: "",
    date: new Date(),
    time: "",
    meeting_type: "service" // Default selection
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      const payload = {
        date: format(formData.date, "yyyy-MM-dd"),
        time: formData.time,
        meeting_type: formData.meeting_type,
        agenda: formData.agenda
      }

      await axios.post(`${apiUrl}/meetings`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      toast.success("Meeting scheduled successfully")
      onMeetingCreated()
      onOpenChange(false)
      
      // Reset form state
      setFormData({
        agenda: "",
        date: new Date(),
        time: "",
        meeting_type: "service"
      })
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Booking failed")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] border-none bg-card shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#C4FE01]" />
            New Session
          </DialogTitle>
          <DialogDescription className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-60">
            Select context and schedule your consultation
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          
          {/* MEETING TYPE SELECTOR */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Meeting Type</Label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-secondary/20 rounded-2xl">
              <Button 
                type="button"
                className={cn(
                  "h-12 text-[10px] font-black uppercase rounded-xl transition-all duration-200", 
                  formData.meeting_type === "service" 
                    ? "bg-[#C4FE01] text-black shadow-lg" 
                    : "bg-transparent text-muted-foreground hover:text-white"
                )}
                onClick={() => setFormData({...formData, meeting_type: "service"})}
              >
                <Layers className="mr-2 h-4 w-4" /> Service
              </Button>
              <Button 
                type="button"
                className={cn(
                  "h-12 text-[10px] font-black uppercase rounded-xl transition-all duration-200", 
                  formData.meeting_type === "platform_query" 
                    ? "bg-[#C4FE01] text-black shadow-lg" 
                    : "bg-transparent text-muted-foreground hover:text-white"
                )}
                onClick={() => setFormData({...formData, meeting_type: "platform_query"})}
              >
                <Globe className="mr-2 h-4 w-4" /> Platform Query
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Agenda</Label>
            <Textarea
              value={formData.agenda}
              onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
              className="bg-secondary/30 border-none min-h-[100px] text-sm rounded-xl resize-none focus-visible:ring-1 focus-visible:ring-[#C4FE01]"
              placeholder="What would you like to discuss?"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start h-12 bg-secondary/30 border-none text-sm rounded-xl">
                    <CalendarIcon className="mr-2 h-4 w-4 text-[#C4FE01]" />
                    {format(formData.date, "MMM dd, yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-none">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(d) => d && setFormData({ ...formData, date: d })}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Time</Label>
              <Input
                type="time"
                className="bg-secondary/30 border-none h-12 text-sm rounded-xl focus-visible:ring-[#C4FE01]"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isCreating} 
            className="w-full h-14 bg-[#C4FE01] text-black hover:bg-[#C4FE01]/90 font-black uppercase text-xs tracking-[0.2em] rounded-2xl shadow-xl shadow-[#C4FE01]/10 transition-transform active:scale-95"
          >
            {isCreating ? "Scheduling..." : "Book Session"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}