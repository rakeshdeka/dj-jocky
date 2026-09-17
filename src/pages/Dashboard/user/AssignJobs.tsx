"use client"

import type React from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import MainLayout from "../../../components/dashboard/layout/MainLayout"
import TaskCard from "../../../components/dashboard/kanban/TaskCard"
import KanbanColumn from "../../../components/dashboard/kanban/KanbanColumn"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import type { RootState } from "../../../store/store"
import {
  canEditBrief,
  canReviewBrief,
  acceptBrief,
  fetchMyBriefs,
  getClientKanbanStatus,
  updateBriefPriority,
  type Brief,
  type BriefPriority,
  type BriefStatus,
} from "../../../lib/briefs-api"

const STATUS_COLUMNS: { id: BriefStatus; label: string; accentColor: string }[] = [
  { id: "assigned", label: "Assigned", accentColor: "bg-blue-500" },
  { id: "in_progress", label: "In Progress", accentColor: "bg-amber-500" },
  { id: "under_review", label: "Under Review", accentColor: "bg-purple-500" },
  { id: "revision", label: "Revision", accentColor: "bg-orange-500" },
  { id: "completed", label: "Completed", accentColor: "bg-green-500" },
]

const DROP_TARGET_STATUSES: BriefStatus[] = ["completed", "revision"]

const CLIENT_STATUS_TRANSITIONS: Partial<Record<BriefStatus, BriefStatus[]>> = {
  under_review: ["completed", "revision"],
}

const PRIORITY_EDITABLE_STATUSES: BriefStatus[] = ["assigned", "in_progress"]

const canChangePriority = (status: BriefStatus) => PRIORITY_EDITABLE_STATUSES.includes(status)

const AssignJobs = () => {
  const navigate = useNavigate()
  const { token } = useSelector((state: RootState) => state.auth)

  const [briefs, setBriefs] = useState<Brief[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [updatingBriefId, setUpdatingBriefId] = useState<string | null>(null)

  const fetchBriefs = useCallback(async () => {
    if (!token) return

    try {
      setIsLoading(true)
      const items = await fetchMyBriefs(token)
      setBriefs(items)
      console.log("[AssignJobs] Loaded briefs:", items)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load briefs")
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchBriefs()
  }, [fetchBriefs])

  const briefsByStatus = useMemo(() => {
    const grouped = STATUS_COLUMNS.reduce(
      (acc, column) => {
        acc[column.id] = []
        return acc
      },
      {} as Record<BriefStatus, Brief[]>
    )

    briefs.forEach((brief) => {
      const kanbanStatus = getClientKanbanStatus(brief.status)
      const status = STATUS_COLUMNS.some((column) => column.id === kanbanStatus)
        ? kanbanStatus
        : "assigned"
      grouped[status].push(brief)
    })

    return grouped
  }, [briefs])

  const updateBriefInState = (briefId: string, updates: Partial<Brief>) => {
    setBriefs((prev) =>
      prev.map((brief) => (brief._id === briefId ? { ...brief, ...updates } : brief))
    )
  }

  const handleDragStart = (e: React.DragEvent, briefId: string) => {
    e.dataTransfer.setData("briefId", briefId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handlePriorityChange = async (briefId: string, priority: BriefPriority) => {
    const brief = briefs.find((item) => item._id === briefId)
    if (!brief || brief.priority === priority) return

    if (!canChangePriority(brief.status)) {
      toast.error("Priority can only be changed before under review")
      return
    }

    try {
      setUpdatingBriefId(briefId)
      await updateBriefPriority(token, briefId, priority)

      updateBriefInState(briefId, { priority })
      toast.success(`Priority updated to ${priority}`)
      console.log("[AssignJobs] Priority updated:", { briefId, priority })
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update priority")
    } finally {
      setUpdatingBriefId(null)
    }
  }

  const handleStatusDrop = async (e: React.DragEvent, toStatus: BriefStatus) => {
    e.preventDefault()
    const briefId = e.dataTransfer.getData("briefId")
    const brief = briefs.find((item) => item._id === briefId)
    if (!brief || brief.status === toStatus) return

    const allowedTargets = CLIENT_STATUS_TRANSITIONS[brief.status] || []
    if (!allowedTargets.includes(toStatus)) {
      toast.error(`You cannot move a brief from ${brief.status.replace(/_/g, " ")} to ${toStatus.replace(/_/g, " ")}`)
      return
    }

    try {
      setUpdatingBriefId(briefId)

      if (toStatus === "completed") {
        await acceptBrief(token, briefId)
        updateBriefInState(briefId, { status: "awaiting_final_delivery" })
        toast.success("Preview accepted — preparing your final files")
        return
      }

      if (toStatus === "revision") {
        navigate(`/client/briefs/${briefId}`)
        return
      }

      updateBriefInState(briefId, { status: toStatus })
      toast.success(`Brief moved to ${toStatus.replace(/_/g, " ")}`)
      console.log("[AssignJobs] Status updated:", { briefId, from: brief.status, to: toStatus })
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update brief status")
    } finally {
      setUpdatingBriefId(null)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleTaskClick = (id: string) => {
    const brief = briefs.find((item) => item._id === id)
    if (!brief) return

    if (canReviewBrief(brief.status) || !canEditBrief(brief.status)) {
      navigate(`/client/briefs/${brief._id}`)
      return
    }

    navigate(`/client/edit-brief/${id}`)
  }

  const handleReviewNavigate = (briefId: string) => {
    navigate(`/client/briefs/${briefId}`)
  }

  const getCardProps = (brief: Brief) => ({
    id: brief._id,
    title: brief.title,
    category: brief.service_id?.name || "General",
    priority: brief.priority,
    completedAt:
      brief.status === "completed" && brief.delivery_date
        ? new Date(brief.delivery_date).toLocaleDateString()
        : undefined,
  })

  return (
    <MainLayout>
      <div className="mb-5">
        <h1 className="text-sm font-bold tracking-[0.2em]">ASSIGN JOBS</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Scroll horizontally to view all stages. Click under-review briefs to review delivery files, accept work, or request changes.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground text-sm">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading briefs...
        </div>
      ) : (
        <div className="overflow-x-auto pb-2 -mx-1 px-1">
          <div className="flex gap-3 min-w-max items-stretch h-[calc(100vh-220px)]">
            {STATUS_COLUMNS.map((column) => (
              <KanbanColumn
                key={column.id}
                title={column.label}
                count={briefsByStatus[column.id].length}
                onDrop={(e) => handleStatusDrop(e, column.id)}
                onDragOver={handleDragOver}
                accentColor={column.accentColor}
                isDropTarget={DROP_TARGET_STATUSES.includes(column.id)}
              >
                {briefsByStatus[column.id].map((brief, index) => (
                  <div
                    key={brief._id}
                    className={updatingBriefId === brief._id ? "opacity-50 pointer-events-none" : ""}
                  >
                    <TaskCard
                      {...getCardProps(brief)}
                      index={index}
                      draggable={canReviewBrief(brief.status)}
                      onDragStart={(e) => handleDragStart(e, brief._id)}
                      onClick={() => handleTaskClick(brief._id)}
                      onReview={
                        canReviewBrief(brief.status)
                          ? () => handleReviewNavigate(brief._id)
                          : undefined
                      }
                      onPriorityChange={
                        canChangePriority(brief.status)
                          ? (priority) => handlePriorityChange(brief._id, priority)
                          : undefined
                      }
                    />
                  </div>
                ))}
              </KanbanColumn>
            ))}
          </div>
        </div>
      )}
    </MainLayout>
  )
}

export default AssignJobs
