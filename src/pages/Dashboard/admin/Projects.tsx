"use client"

import type React from "react"
import { useState, useEffect } from "react"
import MainLayout from "../../../components/dashboard/layout/MainLayout"
import { Card, CardContent, CardHeader } from "../../../components/dashboard/ui/card"
import { Button } from "../../../components/dashboard/ui/button"
import { useNavigate } from "react-router-dom"
import { Input } from "../../../components/dashboard/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger } from "../../../components/dashboard/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/dashboard/ui/dropdown-menu"
import { Filter, MoreVertical, Plus, SearchIcon, MessageSquare, Loader2 } from "lucide-react"
import axios from "axios"
import { useSelector } from "react-redux"
import { RootState } from "../../../store/store"
import { toast } from "sonner"
import AssignProjectModal from "../../../components/dashboard/admin/modals/AssignProjectModal"

interface AdminBrief {
  _id: string
  title: string
  status: string
  priority: string
  client_id?: { name?: string }
  designer_id?: { name?: string; _id?: string }
  service_id?: { name?: string }
}

const AdminProjects: React.FC = () => {
  const apiUrl = import.meta.env.VITE_API_URL
  const { token } = useSelector((state: RootState) => state.auth)
  const navigate = useNavigate()

  const [briefs, setBriefs] = useState<AdminBrief[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter] = useState("all")

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<AdminBrief | null>(null)

  const fetchBriefs = async () => {
    try {
      setIsLoading(true)
      const res = await axios.get(`${apiUrl}/admin/briefs`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      })
      setBriefs(res.data.items || [])
    } catch {
      toast.error("Failed to load briefs")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (token) fetchBriefs()
  }, [token])

  const handleAssignProject = async (projectId: string, designerId: string) => {
    try {
      const response = await axios.patch(
        `${apiUrl}/admin/briefs/${projectId}/assign-designer`,
        { designer_id: designerId },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      if (response.data.success) {
        toast.success("Designer assigned successfully")
        fetchBriefs()
        setIsAssignModalOpen(false)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Assignment failed")
    }
  }

  const filteredProjects = briefs.filter((p) => {
    const matchesSearch =
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.client_id?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || p.status === statusFilter
    const matchesPriority = priorityFilter === "all" || p.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-sm font-bold mb-1 tracking-[0.2em]">PROJECTS</h1>
        <p className="text-muted-foreground text-sm">Operational Overview</p>
      </div>

      <Card className="bg-card/20 backdrop-blur-md border-border overflow-hidden mb-8">
        <CardHeader className="border-b border-border/40">
          <div className="flex flex-col md:flex-row justify-end items-center gap-4">
            <Button
              size="sm"
              onClick={() => navigate("/admin/projects/add")}
              className="bg-[#c5fb00] hover:bg-[#b0e000] text-black font-bold"
            >
              <Plus className="h-4 w-4 mr-2" /> Manual Entry
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-10 bg-secondary/20 border-border shadow-none focus-visible:ring-1 focus-visible:ring-[#c5fb00]/30"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] bg-secondary/20">
                <Filter className="h-4 w-4 mr-2" /> {statusFilter === "all" ? "Status" : statusFilter}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-[#c5fb00]" />
                <p className="text-xs text-muted-foreground animate-pulse tracking-wider uppercase text-[10px] font-bold">
                  Fetching projects...
                </p>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-border rounded-md">
                <p className="text-muted-foreground text-sm italic">No projects found.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-border/50 text-[10px] font-bold uppercase text-muted-foreground tracking-[0.2em]">
                    <th className="pb-4">Brief Title</th>
                    <th className="pb-4">Client Name</th>
                    <th className="pb-4">Designer</th>
                    <th className="pb-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/10">
                  {filteredProjects.map((project) => (
                    <tr key={project._id} className="group hover:bg-white/5 transition-colors">
                      <td className="py-4">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/projects/${project._id}`)}
                          className="text-left group/title"
                        >
                          <p className="text-sm font-bold tracking-tight group-hover/title:text-[#c5fb00] transition-colors">
                            {project.title}
                          </p>
                          <p className="text-[9px] text-[#c5fb00] font-bold uppercase tracking-widest">
                            {project.service_id?.name || "Service"}
                          </p>
                        </button>
                      </td>
                      <td className="py-4 text-sm font-medium">{project.client_id?.name || "N/A"}</td>
                      <td className="py-4 text-sm text-muted-foreground">
                        {project.designer_id?.name || <span className="opacity-20">Unassigned</span>}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/admin/projects/${project._id}/messages`)}
                            className="hover:text-[#c5fb00] transition-colors"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-card border-border">
                              <DropdownMenuItem onClick={() => navigate(`/admin/projects/${project._id}`)}>
                                Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedProject(project)
                                  setIsAssignModalOpen(true)
                                }}
                              >
                                {project.designer_id ? "Change Designer" : "Assign"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>

      <AssignProjectModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        project={selectedProject}
        onAssign={handleAssignProject}
      />
    </MainLayout>
  )
}

export default AdminProjects
