import React from 'react'
import { MoreHorizontal, Edit2, Trash2, FileText, Loader2, MessageSquare, ClipboardCheck } from 'lucide-react'
import { useNavigate } from "react-router-dom"
import DesignerBriefActions from '../designer/DesignerBriefActions'
import { Button } from '../ui/button'
import { canEditBrief, canReviewBrief, formatBriefStatus, type BriefStatus } from '../../../lib/briefs-api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"

interface BriefCardProps {
  id: string
  category: string
  title: string
  status: string
  imageSrc?: string
  isDeleting?: boolean
  onDelete: () => void
  onViewFiles: (id: string, title: string) => void
  role: "client" | "designer"
  onUploadDelivery: (id: string, title: string) => void
  onStartWork?: (id: string) => void
  onSubmitWork?: (id: string, title: string) => void
  onUploadFinal?: (id: string, title: string) => void
  isUpdatingStatus?: boolean
  onReviewDelivery?: (id: string, title: string) => void
  onViewBrief?: (id: string) => void
}

const BriefCard: React.FC<BriefCardProps> = ({
  id,
  category,
  title,
  status,
  imageSrc,
  isDeleting = false,
  onDelete,
  onViewFiles,
  role,
  onUploadDelivery,
  onStartWork,
  onSubmitWork,
  onUploadFinal,
  isUpdatingStatus = false,
  onReviewDelivery,
  onViewBrief,
}) => {
  const navigate = useNavigate()
  const needsReview = role === 'client' && canReviewBrief(status as BriefStatus)
  const detailPath = role === 'client' ? `/client/briefs/${id}` : `/designer/briefs/${id}`

  const openBriefDetail = () => {
    if (onViewBrief) {
      onViewBrief(id)
      return
    }
    navigate(detailPath)
  }

  return (
    <div className={`bg-card rounded-md overflow-hidden shadow-sm group hover:border-[#C4FE01] transition-all ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="relative">

        <button
          type="button"
          onClick={openBriefDetail}
          className="aspect-video bg-muted/30 flex items-center justify-center overflow-hidden w-full cursor-pointer"
        >
          {imageSrc ? (
            <img src={imageSrc} className="w-full h-full object-cover" alt={title} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#C4FE01]/20 to-[#C4FE01]/5">
              <span className="text-5xl font-bold text-[#C4FE01]">
                {title?.charAt(0)}
              </span>
            </div>
          )}
        </button>

        <div className="absolute top-3 left-3 bg-background/80 px-2 py-1 rounded text-[10px] font-bold uppercase">
          {formatBriefStatus(status, role)}
        </div>

        <div className="absolute top-3 right-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-8 h-8 rounded-full bg-background/80 flex items-center justify-center">
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MoreHorizontal className="w-4 h-4" />
                )}
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">

              {role === "client" && (
                <>
                  <DropdownMenuItem onClick={openBriefDetail}>
                    <FileText className="mr-2 h-4 w-4" /> View Details
                  </DropdownMenuItem>

                  {needsReview && onReviewDelivery && (
                    <DropdownMenuItem onClick={() => onReviewDelivery(id, title)}>
                      <ClipboardCheck className="mr-2 h-4 w-4" /> Review Delivery
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem onClick={() => onViewFiles(id, title)}>
                    <FileText className="mr-2 h-4 w-4" /> View Files
                  </DropdownMenuItem>

                  {canEditBrief(status as BriefStatus) && (
                    <DropdownMenuItem onClick={() => navigate(`/client/edit-brief/${id}`)}>
                      <Edit2 className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={onDelete}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </>
              )}

              {role === "designer" && (
                <>
                  <DropdownMenuItem onClick={openBriefDetail}>
                    <FileText className="mr-2 h-4 w-4" /> View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onViewFiles(id, title)}>
                    <FileText className="mr-2 h-4 w-4" /> View Files
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(`/designer/briefs/${id}/messages`)}>
                    <MessageSquare className="mr-2 h-4 w-4" /> Messages
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onUploadDelivery(id, title)}>
                    📤 Add Delivery Files
                  </DropdownMenuItem>
                </>
              )}

            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <button type="button" onClick={openBriefDetail} className="text-left w-full">
          <span className="text-[10px] text-[#C4FE01] font-bold uppercase">{category}</span>
          <h3 className="font-medium truncate hover:text-[#C4FE01] transition-colors">{title}</h3>
        </button>

        {needsReview && onReviewDelivery ? (
          <Button
            size="sm"
            className="w-full bg-[#C4FE01] hover:bg-[#b2e600] text-black"
            onClick={() => onReviewDelivery(id, title)}
          >
            <ClipboardCheck className="h-4 w-4 mr-2" />
            Review Delivery
          </Button>
        ) : role === 'designer' && (onStartWork || onSubmitWork || onUploadFinal) ? (
          <DesignerBriefActions
            status={status}
            isUpdating={isUpdatingStatus}
            onStartWork={onStartWork ? () => onStartWork(id) : undefined}
            onSubmitWork={onSubmitWork ? () => onSubmitWork(id, title) : undefined}
            onUploadFinal={onUploadFinal ? () => onUploadFinal(id, title) : undefined}
            className="w-full"
          />
        ) : null}
      </div>
    </div>
  )
}

export default BriefCard;
