"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import axios from "axios"
import { toast } from "sonner"

import MainLayout from "../../../components/dashboard/layout/MainLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/dashboard/ui/card"
import { Button } from "../../../components/dashboard/ui/button"
import AdminStatsDisplay, { type AdminDashboardStats } from "../../../components/dashboard/admin/AdminStats"
import ProjectList from "../../../components/dashboard/admin/ProjectList"
import UserList from "../../../components/dashboard/admin/UserList"
import { Users as UsersIcon, RefreshCcw } from "lucide-react"

// Types
import { RootState } from "../../../store/store"

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate()
  const apiUrl = import.meta.env.VITE_API_URL
  const { token } = useSelector((state: RootState) => state.auth)

  // API Data States
  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [briefs, setBriefs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setIsLoading(true)
      else setIsRefreshing(true)

      const headers = { Authorization: `Bearer ${token}` }

      // Fetching all dashboard requirements in parallel
      const [statsRes, usersRes, briefsRes] = await Promise.all([
        axios.get(`${apiUrl}/admin/dashboard/stats`, { headers, withCredentials: true }),
        axios.get(`${apiUrl}/admin/users`, { params: { limit: 5 }, headers, withCredentials: true }),
        axios.get(`${apiUrl}/admin/briefs`, { params: { limit: 5 }, headers, withCredentials: true })
      ])

      const raw = statsRes.data.data || statsRes.data.stats || {}
      const users = raw.users || {}
      const briefs = raw.briefs || {}
      const revenue = raw.revenue?.total ?? raw.totalRevenue ?? 0

      setStats({
        totalUsers: raw.totalUsers ?? users.total ?? 0,
        totalClients: raw.totalClients ?? users.clients ?? 0,
        totalDesigners: raw.totalDesigners ?? users.designers ?? 0,
        pendingBriefs: raw.pendingBriefs ?? briefs.pending ?? 0,
        totalBriefs: raw.totalBriefs ?? briefs.total ?? 0,
        completedBriefs: raw.completedBriefs ?? briefs.completed ?? 0,
        totalRevenue: revenue / 100,
      })

      setUsers(usersRes.data.items || [])
      setBriefs(briefsRes.data.items || [])
    } catch (error) {
      console.error("Dashboard Sync Error:", error)
      toast.error("Failed to sync platform data")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [apiUrl, token])

  useEffect(() => {
    if (token) fetchData()
  }, [token, fetchData])

  return (
    <MainLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-sm font-bold mb-1 tracking-[0.2em]">Admin Console</h1>
          <p className="text-muted-foreground text-sm">
            Real-time overview of users, revenue, and project pipeline.
          </p>
        </div>
        {/* <Button 
          onClick={() => fetchData(true)} 
          disabled={isLoading || isRefreshing}
          variant="outline" 
          size="sm" 
          className="gap-2 border-border bg-secondary/20 hover:bg-[#c5fb00] hover:text-black transition-all"
        >
          <RefreshCcw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-[#c5fb00]" : ""}`} />
          {isRefreshing ? "Syncing..." : "Refresh"}
        </Button> */}
      </div>

      {/* Stats Section with inline component loading */}
      <AdminStatsDisplay stats={stats} isLoading={isLoading} />
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Management Section */}
        <Card className="bg-secondary/30 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">Recent Users</CardTitle>
              <CardDescription className="text-xs">Latest platform registrations</CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-[#c5fb00] hover:bg-[#c5fb00]/10" 
              onClick={() => navigate('/admin/users')}
            >
              <UsersIcon className="h-4 w-4 mr-1" />
              Manage All
            </Button>
          </CardHeader>
          <CardContent>
            <UserList users={users} isLoading={isLoading} />
          </CardContent>
        </Card>
        
        {/* Project Pipeline Section */}
        <Card className="bg-secondary/30 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">Project Briefs</CardTitle>
              <CardDescription className="text-xs">Latest design submissions</CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-[#c5fb00] hover:bg-[#c5fb00]/10"
              onClick={() => navigate('/admin/projects')}
            >
              View Queue
            </Button>
          </CardHeader>
          <CardContent>
            <ProjectList projects={briefs} isLoading={isLoading} />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

export default AdminDashboard