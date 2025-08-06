import { useSortable } from "@dnd-kit/sortable"
import { GripVertical } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface DragHandleProps {
  id: number
}

export function DragHandle({ id }: DragHandleProps) {
  const { attributes, listeners } = useSortable({
    id,
  })
  
  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <GripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}
