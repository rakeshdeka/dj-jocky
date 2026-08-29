"use client"

import type React from "react"
import { Calendar, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"

interface TaskCardProps {
  id: string
  title: string
  category: string
  priority?: string
  completedAt?: string
  onDragStart?: (e: React.DragEvent) => void
  onClick?: () => void
  onPriorityChange?: (priority: "low" | "medium" | "high") => void
  index?: number
}

const priorityStyles: Record<string, string> = {
  low: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  high: "bg-red-500/10 text-red-400 border-red-500/20",
}

const TaskCard: React.FC<TaskCardProps> = ({
  id,
  title,
  category,
  priority,
  completedAt,
  onDragStart = () => {},
  onClick = () => {},
  onPriorityChange,
  index,
}) => {
  return (
    <div
      className="group relative rounded-lg border border-border/60 bg-card/80 p-2.5 cursor-pointer hover:border-border hover:bg-card transition-colors"
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      data-task-id={id}
      data-task-index={index}
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-medium leading-snug line-clamp-2 pr-1">{title}</h4>
          <p className="text-[11px] text-muted-foreground mt-1 truncate">{category}</p>
        </div>

        {onPriorityChange && (
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground hover:bg-muted/60 transition-opacity"
                  aria-label="Brief options"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuLabel className="text-xs">Change priority</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(["low", "medium", "high"] as const).map((level) => (
                  <DropdownMenuItem
                    key={level}
                    disabled={priority === level}
                    className="text-xs capitalize"
                    onClick={() => onPriorityChange(level)}
                  >
                    {level}
                    {priority === level ? " (current)" : ""}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        {priority ? (
          <span
            className={`text-[10px] font-medium uppercase px-1.5 py-0.5 rounded border ${
              priorityStyles[priority] || "bg-muted text-muted-foreground border-border"
            }`}
          >
            {priority}
          </span>
        ) : (
          <span />
        )}

        {completedAt && (
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {completedAt}
          </span>
        )}
      </div>
    </div>
  )
}

export default TaskCard
