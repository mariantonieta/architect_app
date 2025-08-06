import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { type Row } from "@tanstack/react-table"
import { flexRender } from "@tanstack/react-table"
import { TableCell, TableRow } from "@/components/ui/table"
import { type Material } from "../types/material"

interface DraggableRowProps {
  row: Row<Material>
  isValid?: boolean
}

export function DraggableRow({ row, isValid = true }: DraggableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: row.original.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  
  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      className={`relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80 ${
        !isValid ? "border-l-4 border-l-red-300" : ""
      }`}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell 
          key={cell.id} 
          className="px-2 py-3"
          {...(cell.column.id === 'drag' ? { ...attributes, ...listeners } : {})}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}
