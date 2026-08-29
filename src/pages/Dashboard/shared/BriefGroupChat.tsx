"use client"

import { useCallback, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useSelector } from "react-redux"
import axios from "axios"
import MainLayout from "../../../components/dashboard/layout/MainLayout"
import ConversationView, {
  type BriefDetails,
  type StatusProgress,
} from "../../../components/dashboard/messaging/ConversationView"
import { Button } from "../../../components/dashboard/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { RootState } from "../../../store/store"

interface ChatMessage {
  _id: string
  message: string
  sender_id: {
    _id: string
    name: string
    role?: string
    email?: string
  }
  attachments?: Array<string | Record<string, string>>
  file?: string | Record<string, string>
  files?: Array<string | Record<string, string>>
  createdAt: string
}

type BriefGroupChatProps = {
  backPath: string
  backLabel: string
  showScheduleMeet?: boolean
  canCompose?: boolean
  meetingsPath?: string
}

const BriefGroupChat = ({
  backPath,
  backLabel,
  showScheduleMeet = false,
  canCompose = true,
  meetingsPath,
}: BriefGroupChatProps) => {
  const { briefId } = useParams<{ briefId: string }>()
  const navigate = useNavigate()
  const apiUrl = import.meta.env.VITE_API_URL
  const { token, user } = useSelector((state: RootState) => state.auth)

  const [projectTitle, setProjectTitle] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [briefDetails, setBriefDetails] = useState<BriefDetails | null>(null)
  const [statusProgress, setStatusProgress] = useState<StatusProgress | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSendingMessage, setIsSendingMessage] = useState(false)

  const fetchMessages = useCallback(async () => {
    if (!briefId || !token) return

    try {
      setIsLoading(true)
      const res = await axios.get(`${apiUrl}/chat/brief-groups/${briefId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = res.data
      setMessages(data.items || [])
      setBriefDetails(data.brief || null)
      setStatusProgress(data.status_progress || null)
      setProjectTitle(data.brief?.title || "Project Messages")
    } catch {
      toast.error("Could not load conversation")
      setBriefDetails(null)
      setStatusProgress(null)
    } finally {
      setIsLoading(false)
    }
  }, [apiUrl, briefId, token])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  const handleSendMessage = async (id: string, content: string, files?: File[]) => {
    if (!canCompose) return
    if (!content.trim() && (!files || files.length === 0)) return

    if (content.length > 2000) {
      toast.error("Message cannot exceed 2000 characters")
      return
    }

    if (files && files.length > 10) {
      toast.error("You can attach up to 10 files")
      return
    }

    try {
      setIsSendingMessage(true)
      const formData = new FormData()

      if (content.trim()) {
        formData.append("message", content.trim())
      }

      if (files?.length === 1) {
        formData.append("file", files[0])
      } else if (files && files.length > 1) {
        files.forEach((file) => formData.append("files", file))
      }

      const res = await axios.post(`${apiUrl}/chat/brief-groups/${id}/messages`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      })

      if (res.data.success) {
        await fetchMessages()
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Message failed to send")
    } finally {
      setIsSendingMessage(false)
    }
  }

  const formatMessageTime = (createdAt: string) =>
    new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  const getMessageAttachments = (message: ChatMessage) => [
    ...(message.attachments || []),
    ...(message.file ? [message.file] : []),
    ...(message.files || []),
  ]

  const handleScheduleMeet = () => {
    if (meetingsPath) {
      navigate(meetingsPath)
    }
  }

  if (!briefId) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-muted-foreground text-sm">Invalid project.</p>
          <Button variant="outline" onClick={() => navigate(backPath)}>
            Back to {backLabel}
          </Button>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="mb-4 flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={() => navigate(backPath)}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {backLabel}
        </Button>
        <div>
          <h1 className="text-sm font-bold tracking-[0.2em] uppercase">Messages</h1>
          <p className="text-xs text-muted-foreground truncate max-w-[60vw]">{projectTitle}</p>
        </div>
      </div>

      <div className="h-[calc(100vh-220px)] min-h-[520px] rounded-md border border-border overflow-hidden bg-card/20">
        {isLoading && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-[#c5fb00]" />
            <p className="text-xs text-muted-foreground">Loading conversation...</p>
          </div>
        ) : (
          <ConversationView
            conversation={{
              id: briefId,
              projectName: projectTitle,
              messages: messages.map((m) => ({
                id: m._id,
                senderId: m.sender_id._id,
                senderName: m.sender_id.name,
                content: m.message,
                attachments: getMessageAttachments(m),
                timestamp: formatMessageTime(m.createdAt),
                isMe: m.sender_id._id === user?.id,
                read: true,
              })),
            }}
            briefDetails={briefDetails}
            statusProgress={statusProgress}
            isLoading={isLoading}
            isSending={isSendingMessage}
            showProgressBar={false}
            showScheduleMeet={showScheduleMeet}
            canCompose={canCompose}
            onSendMessage={handleSendMessage}
            onBack={() => navigate(backPath)}
            onRequestMeeting={showScheduleMeet ? handleScheduleMeet : undefined}
          />
        )}
      </div>
    </MainLayout>
  )
}

export default BriefGroupChat
