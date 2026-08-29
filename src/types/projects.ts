export type ProjectStatus = "in_progress" | "review" | "completed" | "pending" | "cancelled"
export type ProjectPriority = "low" | "medium" | "high" | "urgent"

export interface Project {
  id: string
  name: string
  client: string
  clientId: string
  status: ProjectStatus
  deadline: string
  type: string
  priority: ProjectPriority
  unreadMessages: number
  lastUpdate: string
  thumbnail: string
  assignedTo?: string
}
