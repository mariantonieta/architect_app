import { GripVertical } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface DragHandleProps {
  id: number
}

export function DragHandle({ id }: DragHandleProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent cursor-grab active:cursor-grabbing"
    >
      <GripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}
