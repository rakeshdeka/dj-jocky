"use client"

import type React from "react"
import { useState } from "react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/dashboard/ui/tabs"
import { Button } from "../../../components/dashboard/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/dashboard/ui/card"
import { Badge } from "../../../components/dashboard/ui/badge"
import { Separator } from "../../../components/dashboard/ui/separator"
import { ScrollArea } from "../../../components/dashboard/ui/scroll-area"
import {
  Calendar,
  Clock,
  Download,
  FileText,
  MessageSquare,
  Paperclip,
} from "lucide-react"

export interface Project {
  id: string
  name: string
  category: string
  client: string
  imageSrc: string
  status: string
  progress: number
  lastUpdate: string
  hasNewMessages: boolean
  deadline: string
  isUrgent: boolean
  type: string
  priority: string
}

interface DesignerProjectViewProps {
  project: Project
}

const DesignerProjectView: React.FC<DesignerProjectViewProps> = ({ project }) => {
  const [activeTab, setActiveTab] = useState("overview")

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500">
            Pending
          </Badge>
        )
      case "in-progress":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500">
            In Progress
          </Badge>
        )
      case "awaiting-feedback":
        return (
          <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500">
            Awaiting Feedback
          </Badge>
        )
      case "revision-needed":
        return (
          <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500">
            Revision Needed
          </Badge>
        )
      case "finalized":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500">
            Finalized
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500">
            {status}
          </Badge>
        )
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const getDaysRemaining = (deadline: string) => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays
  }

  return (
    <Card className="bg-secondary/30 border-border w-auto h-full font-sans">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{project.name}</CardTitle>
            <CardDescription>Client: {project.client}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {renderStatusBadge(project.status)}
            {project.isUrgent && (
              <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500 animate-pulse">
                Urgent
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Project Type</h3>
                <p>{project.type}</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Priority</h3>
                <p className="capitalize">{project.priority}</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Deadline</h3>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(project.deadline)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Time Remaining</h3>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {getDaysRemaining(project.deadline) > 0 ? (
                    <span>{getDaysRemaining(project.deadline)} days left</span>
                  ) : (
                    <span className="text-red-500">Overdue</span>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div className="w-full">
              <h3 className="text-sm font-medium mb-2">Project Brief</h3>
              <p className="text-sm text-muted-foreground">
                This is a {project.category} project for {project.client}. The project requires attention to detail and
                adherence to brand guidelines. The client has requested a modern design that appeals to their target
                audience while maintaining their brand identity.
              </p>
            </div>

            <div className="w-full">
              <h3 className="text-sm font-medium mb-2">Client Notes</h3>
              <div className="bg-muted/50 p-3 rounded-md text-sm">
                <p>
                  Please make sure to follow the brand guidelines strictly. The client is very particular about their
                  brand colors and typography.
                </p>
              </div>
            </div>

            <div className="mt-4 w-full">
              <h3 className="text-sm font-medium mb-2">Preview</h3>
              <div className="bg-muted/50 p-3 rounded-md">
                <img
                  src={project.imageSrc || "/placeholder.svg"}
                  alt={project.name}
                  className="w-full h-48 object-cover rounded-md"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="files" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Project Files</h3>
              <Button size="sm">
                <Paperclip className="h-4 w-4 mr-1" />
                Upload File
              </Button>
            </div>

            <ScrollArea className="h-[300px]">
              <div className="space-y-2 w-full">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="p-3 rounded-md border border-border bg-background/50 hover:bg-background/80 transition-colors flex justify-between items-center w-full"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">
                          {project.name}_File_{i}.pdf
                        </h4>
                        <p className="text-xs text-muted-foreground">Uploaded on {new Date().toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default DesignerProjectView
