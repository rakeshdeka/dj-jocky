"use client"

import  React from "react"
import { useState } from "react"
import MainLayout from '../../../components/dashboard/layout/MainLayout';
import ConversationList from "../../../components/dashboard/messaging/ConversationList"
import ConversationView from "../../../components/dashboard/messaging/ConversationView"
import { Badge } from "../../../components/dashboard/ui/badge"
import { Button } from "../../../components/dashboard/ui/button"
import { Plus, Search, Filter, SlidersHorizontal, CalendarClock } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/dashboard/ui/popover"
import { Dialog, DialogContent } from "../../../components/dashboard/ui/dialog"
import { useToast } from "../../../hooks/use-toast"
import  { Meeting } from "../../../types/meeting"
import MeetingRequestForm from "../../../components/dashboard/meetings/MeetingRequestForm"
import { useNavigate } from "react-router-dom"
import { Tabs, TabsList, TabsTrigger } from "../../../components/dashboard/ui/tabs"

// Define conversation interfaces
export interface Message {
  id: string
  senderId: string
  senderName: string
  content: string
  timestamp: string
  read: boolean
  attachments?: string[]
  status?: "Awaiting Feedback" | "Revision Needed" | "Finalized" | "In Progress"
}

export interface Conversation {
  id: string
  projectId: string
  projectName: string
  projectType: "Branding" | "Web Design" | "Pitch Deck" | "Illustrations" | "Marketing"
  lastMessage: Message
  messages: Message[]
  unreadCount: number
  userType: "client" | "designer" // Added userType to identify conversation type
}

// Sample data for conversations
const sampleConversations: Conversation[] = [
  {
    id: "1",
    projectId: "1",
    projectName: "Branding Project",
    projectType: "Branding",
    lastMessage: {
      id: "m1",
      senderId: "designer1",
      senderName: "Dhrubo",
      content: "Hi Dhrubo, Great seeing you at the match...",
      timestamp: "Thu 5/5",
      read: false,
      status: "In Progress",
    },
    messages: [
      {
        id: "m1",
        senderId: "designer1",
        senderName: "Dhrubo",
        content:
          "Hi Dhrubo, Great seeing you at the match yesterday! Here are the latest brand concept designs as discussed.",
        timestamp: "Thu 5/5",
        read: false,
        attachments: ["branding_concept_v1.pdf"],
        status: "In Progress",
      },
    ],
    unreadCount: 1,
    userType: "designer",
  },
  {
    id: "2",
    projectId: "2",
    projectName: "Web Design Project",
    projectType: "Web Design",
    lastMessage: {
      id: "m2",
      senderId: "client1",
      senderName: "Alex",
      content: "The website mockups look great! Can we adjust the color scheme to be more aligned with our brand?",
      timestamp: "Thu 5/5",
      read: true,
      status: "Awaiting Feedback",
    },
    messages: [
      {
        id: "m2",
        senderId: "Design Logo",
        senderName: "Alex",
        content: "The website mockups look great! Can we adjust the color scheme to be more aligned with our brand?",
        timestamp: "Thu 5/5",
        read: true,
        status: "Awaiting Feedback",
      },
    ],
    unreadCount: 0,
    userType: "client",
  },
  {
    id: "3",
    projectId: "3",
    projectName: "Mobile App UI",
    projectType: "Pitch Deck",
    lastMessage: {
      id: "m3",
      senderId: "designer2",
      senderName: "Sarah",
      content:
        "I've made the requested revisions to the pitch deck. Please review and let me know if any further changes are needed.",
      timestamp: "Thu 5/5",
      read: true,
      status: "Revision Needed",
    },
    messages: [
      {
        id: "m3",
        senderId: "Designer Logo",
        senderName: "Sarah",
        content:
          "I've made the requested revisions to the pitch deck. Please review and let me know if any further changes are needed.",
        timestamp: "Thu 5/5",
        read: true,
        attachments: ["pitch_deck_v2.pdf"],
        status: "Revision Needed",
      },
    ],
    unreadCount: 0,
    userType: "designer",
  },
  {
    id: "4",
    projectId: "4",
    projectName: "Design Mobile App",
    projectType: "Illustrations",
    lastMessage: {
      id: "m4",
      senderId: "client2",
      senderName: "Maria",
      content: "The illustrations are perfect! Approved and ready for final delivery.",
      timestamp: "Thu 5/5",
      read: true,
      status: "Finalized",
    },
    messages: [
      {
        id: "m4",
        senderId: "client2",
        senderName: "Maria",
        content: "The illustrations are perfect! Approved and ready for final delivery.",
        timestamp: "Thu 5/5",
        read: true,
        status: "Finalized",
      },
    ],
    unreadCount: 0,
    userType: "client",
  },
  {
    id: "5",
    projectId: "5",
    projectName: "Design website",
    projectType: "Marketing",
    lastMessage: {
      id: "m5",
      senderId: "designer3",
      senderName: "Carlos",
      content: "Here are the social media banner designs as requested. Let me know your thoughts!",
      timestamp: "Thu 5/5",
      read: false,
      status: "Awaiting Feedback",
    },
    messages: [
      {
        id: "m5",
        senderId: "designer3",
        senderName: "Carlos",
        content: "Here are the social media banner designs as requested. Let me know your thoughts!",
        timestamp: "Thu 5/5",
        read: false,
        attachments: ["social_banners.zip"],
        status: "Awaiting Feedback",
      },
    ],
    unreadCount: 1,
    userType: "designer",
  },
]

const filterOptions = [
  { id: "all", label: "All Conversations" },
  { id: "unread", label: "Unread" },
  { id: "awaiting", label: "Awaiting Feedback" },
  { id: "revision", label: "Needs Revision" },
  { id: "finalized", label: "Finalized" },
  { id: "attachments", label: "With Attachments" },
]

const projectTypeFilters = [
  { id: "all", label: "All Types" },
  { id: "branding", label: "Branding" },
  { id: "web", label: "Web Design" },
  { id: "pitch", label: "Pitch Deck" },
  { id: "illustrations", label: "Illustrations" },
  { id: "marketing", label: "Marketing" },
]

const AdminProjectsMessage = () => {
  const [conversations, setConversations] = useState<Conversation[]>(sampleConversations)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileViewOpen, setMobileViewOpen] = useState(false)
  const [filterType, setFilterType] = useState("all")
  const [projectFilter, setProjectFilter] = useState("all")
  const [view, setView] = useState<"list" | "grid">("list")
  const [showMeetingRequestDialog, setShowMeetingRequestDialog] = useState(false)
  const [activeTab, setActiveTab] = useState<"all" | "client" | "designer">("all")

  const { toast } = useToast()
  const navigate = useNavigate()

  // Calculate unread counts for each tab
  const totalUnreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)
  const clientUnreadCount = conversations
    .filter((conv) => conv.userType === "client")
    .reduce((sum, conv) => sum + conv.unreadCount, 0)
  const designerUnreadCount = conversations
    .filter((conv) => conv.userType === "designer")
    .reduce((sum, conv) => sum + conv.unreadCount, 0)

  let filteredConversations = conversations

  // Filter by tab selection (client/designer)
  if (activeTab === "client") {
    filteredConversations = filteredConversations.filter((conv) => conv.userType === "client")
  } else if (activeTab === "designer") {
    filteredConversations = filteredConversations.filter((conv) => conv.userType === "designer")
  }

  if (searchQuery) {
    filteredConversations = filteredConversations.filter(
      (conv) =>
        conv.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }

  if (filterType !== "all") {
    filteredConversations = filteredConversations.filter((conv) => {
      switch (filterType) {
        case "unread":
          return conv.unreadCount > 0
        case "awaiting":
          return conv.lastMessage.status === "Awaiting Feedback"
        case "revision":
          return conv.lastMessage.status === "Revision Needed"
        case "finalized":
          return conv.lastMessage.status === "Finalized"
        case "attachments":
          return conv.messages.some((msg) => msg.attachments && msg.attachments.length > 0)
        default:
          return true
      }
    })
  }

  if (projectFilter !== "all") {
    filteredConversations = filteredConversations.filter((conv) => {
      switch (projectFilter) {
        case "branding":
          return conv.projectType === "Branding"
        case "web":
          return conv.projectType === "Web Design"
        case "pitch":
          return conv.projectType === "Pitch Deck"
        case "illustrations":
          return conv.projectType === "Illustrations"
        case "marketing":
          return conv.projectType === "Marketing"
        default:
          return true
      }
    })
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleSelectConversation = (conversation: Conversation) => {
    const updatedConversations = conversations.map((conv) => {
      if (conv.id === conversation.id) {
        return {
          ...conv,
          unreadCount: 0,
          messages: conv.messages.map((msg) => ({ ...msg, read: true })),
        }
      }
      return conv
    })

    setConversations(updatedConversations)
    setSelectedConversation(conversation)
    setMobileViewOpen(true)
  }

  const handleSendMessage = (conversationId: string, messageContent: string, status?: Message["status"]) => {
    const newMessage: Message = {
      id: `m${Date.now()}`,
      senderId: "currentUser",
      senderName: "You",
      content: messageContent,
      timestamp: new Date().toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric" }),
      read: true,
      status,
    }

    const updatedConversations = conversations.map((conv) => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          lastMessage: newMessage,
          messages: [...conv.messages, newMessage],
        }
      }
      return conv
    })

    setConversations(updatedConversations)

    if (selectedConversation && selectedConversation.id === conversationId) {
      setSelectedConversation({
        ...selectedConversation,
        lastMessage: newMessage,
        messages: [...selectedConversation.messages, newMessage],
      })
    }

    toast({
      title: "Message Sent",
      description: "Your message has been sent successfully",
    })
  }

  const handleBackToList = () => {
    setMobileViewOpen(false)
  }

  const handleCreateBrief = () => {
    navigate("/create-brief")
  }

  const handleRequestMeeting = () => {
    if (selectedConversation) {
      setShowMeetingRequestDialog(true)
    } else {
      toast({
        title: "Select a conversation",
        description: "Please select a conversation to request a meeting",
        variant: "destructive",
      })
    }
  }

  const handleSubmitMeetingRequest = (meetingData: Omit<Meeting, "id" | "status" | "createdAt">) => {
    const newMeeting: Meeting = {
      ...meetingData,
      id: `meeting-${Date.now()}`,
      status: "pending",
      createdAt: new Date().toISOString(),
    }

    setShowMeetingRequestDialog(false)

    toast({
      title: "Meeting Requested",
      description: "Your meeting request has been submitted and is pending approval",
    })

    setTimeout(() => {
      navigate("/meetings")
    }, 1500)
  }

  return (
    <MainLayout>
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Progress Messages</h1>
          {totalUnreadCount > 0 && (
            <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">
              {totalUnreadCount} new
            </Badge>
          )}
        </div>
      </div>

      {/* Tabs for Client and Designer Messages */}
      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "all" | "client" | "designer")}
        className="mb-4"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" className="relative">
            All
            {totalUnreadCount > 0 && (
              <Badge variant="default" className="ml-2 bg-blue-600 hover:bg-blue-700 absolute -top-2 -right-2 text-xs">
                {totalUnreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="client" className="relative">
            Client Messages
            {clientUnreadCount > 0 && (
              <Badge variant="default" className="ml-2 bg-blue-600 hover:bg-blue-700 absolute -top-2 -right-2 text-xs">
                {clientUnreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="designer" className="relative">
            Designer Messages
            {designerUnreadCount > 0 && (
              <Badge variant="default" className="ml-2 bg-blue-600 hover:bg-blue-700 absolute -top-2 -right-2 text-xs">
                {designerUnreadCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex items-center justify-between mb-4 gap-2">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-md"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filter</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0">
              <div className="p-2 border-b">
                <h4 className="font-medium text-sm">Filter Conversations</h4>
              </div>
              <div className="p-2">
                <h5 className="font-medium text-xs text-muted-foreground mb-1">Status</h5>
                <div className="space-y-1">
                  {filterOptions.map((option) => (
                    <label
                      key={option.id}
                      className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted p-1 rounded"
                    >
                      <input
                        type="radio"
                        name="filter"
                        value={option.id}
                        checked={filterType === option.id}
                        onChange={() => setFilterType(option.id)}
                        className="form-radio"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>

                <h5 className="font-medium text-xs text-muted-foreground mb-1 mt-3">Project Type</h5>
                <div className="space-y-1">
                  {projectTypeFilters.map((option) => (
                    <label
                      key={option.id}
                      className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted p-1 rounded"
                    >
                      <input
                        type="radio"
                        name="projectFilter"
                        value={option.id}
                        checked={projectFilter === option.id}
                        onChange={() => setProjectFilter(option.id)}
                        className="form-radio"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Sort</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col h-[calc(100vh-280px)] md:flex-row gap-6 overflow-hidden">
        <div
          className={`w-full md:w-2/5 lg:w-1/3 overflow-hidden transition-all ${mobileViewOpen ? "hidden md:block" : "block"}`}
        >
          <div className="space-y-1 overflow-y-auto h-full">
            <ConversationList
              conversations={filteredConversations}
              onSelectConversation={handleSelectConversation}
              selectedId={selectedConversation?.id}
            />

            {filteredConversations.length === 0 && (
              <div className="text-center mt-8 px-4">
                <p className="text-muted-foreground mb-3">No conversations match your filters</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setFilterType("all")
                    setProjectFilter("all")
                    setActiveTab("all")
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>

        <div
          className={`w-full md:w-3/5 lg:w-2/3 h-full flex flex-col overflow-hidden transition-all ${mobileViewOpen ? "block" : "hidden md:block"}`}
        >
          {selectedConversation ? (
            <ConversationView
              conversation={selectedConversation}
              onSendMessage={handleSendMessage}
              onBack={handleBackToList}
              onRequestMeeting={handleRequestMeeting}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <div className="max-w-md space-y-4 p-6">
                <h3 className="text-xl font-medium">Select a conversation</h3>
                <p>Choose a conversation from the list to view and respond to messages.</p>
                <div className="flex flex-col justify-center sm:flex-row gap-2 mt-4">
                  <Button variant="outline" onClick={handleCreateBrief}>
                    <Plus className="mr-2 h-4 w-4" /> Create New Brief
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/meetings")}>
                    <CalendarClock className="mr-2 h-4 w-4" /> View Meetings
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedConversation && (
        <Dialog open={showMeetingRequestDialog} onOpenChange={setShowMeetingRequestDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <MeetingRequestForm
              conversation={selectedConversation}
              onRequestMeeting={handleSubmitMeetingRequest}
              onCancel={() => setShowMeetingRequestDialog(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </MainLayout>
  )
}

export default AdminProjectsMessage;
