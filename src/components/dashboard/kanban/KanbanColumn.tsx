import React, { type ReactNode } from "react"

interface KanbanColumnProps {
  title: string
  count: number
  children: ReactNode
  onDrop: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  accentColor: string
  isDropTarget?: boolean
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  count,
  children,
  onDrop,
  onDragOver,
  accentColor,
  isDropTarget = false,
}) => {
  const hasChildren = React.Children.count(children) > 0

  return (
    <div className="w-[min(272px,82vw)] shrink-0 flex flex-col max-h-full">
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className={`h-2 w-2 rounded-full shrink-0 ${accentColor}`} />
        <h3 className="font-medium text-sm truncate flex-1">{title}</h3>
        <span className="text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full tabular-nums">
          {count}
        </span>
      </div>

      <div
        className={`flex-1 overflow-y-auto rounded-xl border p-2 space-y-2 min-h-[140px] transition-colors ${
          isDropTarget
            ? "border-primary/30 bg-primary/5"
            : "border-border/50 bg-muted/20"
        }`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        data-column-id={title.toLowerCase().replace(/\s+/g, "-")}
      >
        {hasChildren ? (
          children
        ) : (
          <div className="flex h-full min-h-[120px] items-center justify-center rounded-lg border border-dashed border-border/60 px-3">
            <p className="text-[11px] text-muted-foreground text-center">No briefs here</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default KanbanColumn
