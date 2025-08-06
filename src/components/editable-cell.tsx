import * as React from "react"
import { Check, X } from 'lucide-react'
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface EditableCellProps {
  value: string | number
  onSave: (value: string | number) => void
  type?: "text" | "number" | "textarea"
  className?: string
  placeholder?: string
}

export function EditableCell({ 
  value, 
  onSave, 
  type = "text",
  className = "",
  placeholder = ""
}: EditableCellProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [editValue, setEditValue] = React.useState(value.toString())

  const handleSave = () => {
    const finalValue = type === "number" ? parseFloat(editValue) || 0 : editValue
    onSave(finalValue)
    setIsEditing(false)
    toast.success("Guardado correctamente")
  }

  const handleCancel = () => {
    setEditValue(value.toString())
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        {type === "textarea" ? (
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="min-h-[60px] text-xs"
            placeholder={placeholder}
            autoFocus
          />
        ) : (
          <Input
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className={`h-8 ${className}`}
            placeholder={placeholder}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave()
              if (e.key === "Escape") handleCancel()
            }}
          />
        )}
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleSave}>
            <Check className="h-3 w-3" />
          </Button>
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleCancel}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`cursor-pointer hover:bg-muted/50 rounded px-2 py-1 ${className}`}
      onClick={() => setIsEditing(true)}
      title="Click para editar"
    >
      {type === "textarea" ? (
        <div className="max-w-60 truncate text-muted-foreground text-xs italic">
          {value}
        </div>
      ) : (
        value
      )}
    </div>
  )
}
