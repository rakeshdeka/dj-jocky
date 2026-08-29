"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../ui/dialog"
import { Button } from "../../ui/button"
import { Label } from "../../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar"
import { Loader2, UserPlus } from "lucide-react"
import axios from "axios"
import { useSelector } from "react-redux"
import { RootState } from "../../../../store/store"

interface Designer {
  _id: string
  name: string
  role: string
  avatar?: string
}

interface AssignProjectModalProps {
  isOpen: boolean
  onClose: () => void
  project: any | null
  onAssign: (projectId: string, designerId: string) => void
}

const AssignProjectModal: React.FC<AssignProjectModalProps> = ({ isOpen, onClose, project, onAssign }) => {
  const apiUrl = import.meta.env.VITE_API_URL
  const { token } = useSelector((state: RootState) => state.auth)
  
  const [designers, setDesigners] = useState<Designer[]>([])
  const [selectedDesignerId, setSelectedDesignerId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  // Fetch available designers when modal opens
  useEffect(() => {
    const fetchDesigners = async () => {
      if (!isOpen) return
      try {
        setIsLoading(true)
        const res = await axios.get(`${apiUrl}/admin/designers/dropdown`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setDesigners(res.data.items || [])
      } catch (error) {
        console.error("Failed to load designers list", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDesigners()
  }, [isOpen, apiUrl, token])

  const handleConfirm = () => {
    if (project?._id && selectedDesignerId) {
      onAssign(project._id, selectedDesignerId)
    }
  }

  // Clear selection on modal close/open
  useEffect(() => {
    if (isOpen) setSelectedDesignerId("")
  }, [isOpen])

  if (!project) return null

  const selectedData = designers.find(d => d._id === selectedDesignerId)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-[#c5fb00]" />
            Assign Designer
          </DialogTitle>
        </DialogHeader>

        <div className="py-6 space-y-6">
          {/* Project Context Summary */}
          <div className="p-3 bg-secondary/20 border border-border rounded-lg">
            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-2">Project Brief</p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded bg-muted overflow-hidden border border-border">
                <img src={project.thumbnail_url || "/placeholder.svg"} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{project.title}</p>
                <p className="text-[10px] text-muted-foreground">ID: {project._id}</p>
              </div>
            </div>
          </div>

          {/* Designer Selection */}
          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Select Designer</Label>
            <Select value={selectedDesignerId} onValueChange={setSelectedDesignerId} disabled={isLoading}>
              <SelectTrigger className="bg-background border-border h-11">
                <SelectValue placeholder={isLoading ? "Loading designers..." : "Choose from team"} />
              </SelectTrigger>
              <SelectContent>
                {designers.length > 0 ? (
                  designers.map((designer) => (
                    <SelectItem key={designer._id} value={designer._id}>
                      <div className="flex items-center gap-2 py-1">
                        <Avatar className="h-6 w-6 border border-border">
                          <AvatarImage src={designer.avatar} />
                          <AvatarFallback>{designer.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{designer.name}</span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <p className="text-xs p-2 text-center text-muted-foreground">No designers found</p>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Selection Preview */}
          {selectedData && (
            <div className="p-3 bg-[#c5fb00]/5 border border-[#c5fb00]/20 rounded-lg animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-[#c5fb00]">
                  <AvatarImage src={selectedData.avatar} />
                  <AvatarFallback>{selectedData.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-sm text-white">{selectedData.name}</p>
                  <p className="text-[10px] uppercase tracking-tighter text-[#c5fb00] font-bold">
                    {selectedData.role || "Team Designer"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-border pt-4">
          <Button variant="ghost" onClick={onClose} className="h-9 text-xs">Cancel</Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!selectedDesignerId || isLoading}
            className="h-9 text-xs bg-[#c5fb00] text-black hover:bg-[#b0e000] font-bold px-6"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Assignment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AssignProjectModal