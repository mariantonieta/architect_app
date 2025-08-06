import * as React from "react"
import { X } from 'lucide-react'
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface EditableSelectProps {
  value: string
  onSave: (value: string) => void
  options: { value: string; label: string }[]
  className?: string
}

export function EditableSelect({ 
  value, 
  onSave, 
  options,
  className = ""
}: EditableSelectProps) {
  const [isEditing, setIsEditing] = React.useState(false)

  const handleSave = (newValue: string) => {
    onSave(newValue)
    setIsEditing(false)
    toast.success("Guardado correctamente")
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-1 w-full">
        <Select value={value} onValueChange={handleSave}>
          <SelectTrigger className="h-8 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="icon" variant="ghost" className="h-6 w-6 flex-shrink-0" onClick={() => setIsEditing(false)}>
          <X className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  return (
    <div 
      className={`cursor-pointer hover:bg-muted/50 rounded px-1 py-1 w-full h-8 flex items-center justify-center ${className}`}
      onClick={() => setIsEditing(true)}
      title="Click para editar"
    >
      <span className="truncate">{value}</span>
    </div>
  )
}
