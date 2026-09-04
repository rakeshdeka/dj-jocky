"use client"

import type React from "react"
import { useState, useEffect } from "react"
import MainLayout from "../../../components/dashboard/layout/MainLayout"
import { Card, CardContent, CardHeader } from "../../../components/dashboard/ui/card"
import { Button } from "../../../components/dashboard/ui/button"
import { useNavigate, useLocation } from "react-router-dom"
import { Input } from "../../../components/dashboard/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger } from "../../../components/dashboard/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/dashboard/ui/dropdown-menu"
import { Filter, MoreVertical, Plus, SearchIcon, MessageSquare, Loader2, ShieldCheck } from "lucide-react"
import { useSelector } from "react-redux"
import { toast } from "sonner"
import { RootState } from "../../../store/store"
import { fetchAdminBriefs, formatBriefStatus } from "../../../lib/briefs-api"
import { Badge } from "../../../components/dashboard/ui/badge"

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
  const { token } = useSelector((state: RootState) => state.auth)
  const navigate = useNavigate()
  const location = useLocation()

  const [briefs, setBriefs] = useState<AdminBrief[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState(
    () => (location.state as { statusFilter?: string })?.statusFilter || "all",
  )
  const [priorityFilter] = useState("all")

  const fetchBriefs = async () => {
    try {
      setIsLoading(true)
      const items = await fetchAdminBriefs(token, {
        status: statusFilter === "all" ? undefined : statusFilter,
      })
      setBriefs(items as AdminBrief[])
    } catch {
      toast.error("Failed to load briefs")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (token) fetchBriefs()
  }, [token, statusFilter])

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
                <SelectItem value="pending_admin_review">Pending Admin Review</SelectItem>
                <SelectItem value="not_assigned">Not Assigned</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="revision">Revision</SelectItem>
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
                    <th className="pb-4">Status</th>
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
                      <td className="py-4">
                        {project.status === "pending_admin_review" ? (
                          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-[9px] uppercase tracking-wider">
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            Review Needed
                          </Badge>
                        ) : (
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            {formatBriefStatus(project.status, "admin")}
                          </span>
                        )}
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
                                onClick={() => navigate(`/admin/projects/${project._id}/assign-designer`)}
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
    </MainLayout>
  )
}

export default AdminProjects
