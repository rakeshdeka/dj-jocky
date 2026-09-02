import React from 'react'
import { MoreHorizontal, Edit2, Trash2, FileText, Loader2, MessageSquare } from 'lucide-react'
import { useNavigate } from "react-router-dom"
import DesignerBriefActions from '../designer/DesignerBriefActions'
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
  isUpdatingStatus?: boolean
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
  isUpdatingStatus = false,
}) => {
  const navigate = useNavigate()

  return (
    <div className={`bg-card rounded-md overflow-hidden shadow-sm group hover:border-[#C4FE01] transition-all ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="relative">

        <div className="aspect-video bg-muted/30 flex items-center justify-center overflow-hidden">
          {imageSrc ? (
            <img src={imageSrc} className="w-full h-full object-cover" alt={title} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#C4FE01]/20 to-[#C4FE01]/5">
              <span className="text-5xl font-bold text-[#C4FE01]">
                {title?.charAt(0)}
              </span>
            </div>
          )}
        </div>

        <div className="absolute top-3 left-3 bg-background/80 px-2 py-1 rounded text-[10px] font-bold uppercase">
          {status}
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

              <DropdownMenuItem onClick={() => onViewFiles(id, title)}>
                <FileText className="mr-2 h-4 w-4" /> View Files
              </DropdownMenuItem>

              {role === "client" && (
                <>
                  <DropdownMenuItem onClick={() => navigate(`/client/edit-brief/${id}`)}>
                    <Edit2 className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>

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
        <div>
          <span className="text-[10px] text-[#C4FE01] font-bold uppercase">{category}</span>
          <h3 className="font-medium truncate">{title}</h3>
        </div>

        {role === 'designer' && (onStartWork || onSubmitWork) && (
          <DesignerBriefActions
            status={status}
            isUpdating={isUpdatingStatus}
            onStartWork={onStartWork ? () => onStartWork(id) : undefined}
            onSubmitWork={onSubmitWork ? () => onSubmitWork(id, title) : undefined}
            className="w-full"
          />
        )}
      </div>
    </div>
  )
}

export default BriefCard;
