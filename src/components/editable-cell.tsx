import * as React from "react"
import { Check, X } from 'lucide-react'
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface EditableCellProps {
  value?: string | number | undefined
  onSave: (value: string | number) => void
  type?: "text" | "number" | "textarea"
  className?: string
  placeholder?: string
  required?: boolean
  minValue?: number
}

export function EditableCell({ 
  value, 
  onSave, 
  type = "text",
  className = "",
  placeholder = "",
  required = false,
  minValue = 0
}: EditableCellProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [editValue, setEditValue] = React.useState(value?.toString() || "")

  // Sincronizar editValue con value cuando cambie desde afuera
  React.useEffect(() => {
    setEditValue(value?.toString() || "")
  }, [value])

  const isValid = () => {
    const currentValue = isEditing ? editValue : (value?.toString() || "")
    if (required && type === "text" && !currentValue.trim()) return false
    if (type === "number") {
      const numValue = parseFloat(currentValue) || 0
      if (required && numValue <= minValue) return false
    }
    return true
  }

  const handleSave = () => {
    if (!isValid()) {
      if (type === "text") {
        toast.error("Este campo es requerido")
      } else if (type === "number") {
        toast.error(`El valor debe ser mayor a ${minValue}`)
      }
      return
    }

    const finalValue = type === "number" ? parseFloat(editValue) || 0 : editValue
    onSave(finalValue)
    setIsEditing(false)
    toast.success("Guardado correctamente")
  }

  const handleCancel = () => {
    setEditValue(value?.toString() || "")
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-1 w-full">
        {type === "textarea" ? (
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="min-h-[60px] text-xs w-full"
            placeholder={placeholder}
            autoFocus
          />
        ) : (
          <Input
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className={`h-8 w-full ${className} ${
              !isValid() ? "border-2 border-red-500" : ""
            }`}
            placeholder={placeholder}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave()
              if (e.key === "Escape") handleCancel()
            }}
          />
        )}
        <div className="flex gap-1 flex-shrink-0">
          <Button 
            size="icon" 
            variant="ghost" 
            className={`h-6 w-6 ${
              isValid() 
                ? "hover:bg-green-100 hover:text-green-700" 
                : "opacity-50 cursor-not-allowed"
            }`}
            onClick={handleSave}
            disabled={!isValid()}
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button size="icon" variant="ghost" className="h-6 w-6 hover:bg-red-100 hover:text-red-700" onClick={handleCancel}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`cursor-pointer hover:bg-muted/50 rounded px-1 py-1 w-full h-8 flex items-center ${className} ${
        !isValid() ? "border-2 border-red-500" : ""
      }`}
      onClick={() => setIsEditing(true)}
      title="Click para editar"
    >
      {type === "textarea" ? (
        <div className="w-full truncate text-muted-foreground text-xs italic overflow-hidden">
          {value || (
            <span className="text-muted-foreground/60">{placeholder}</span>
          )}
        </div>
      ) : (
        <span className="truncate w-full block">
          {value ? value : (
            <span className="text-muted-foreground/60">{placeholder}</span>
          )}
        </span>
      )}
    </div>
  )
}
