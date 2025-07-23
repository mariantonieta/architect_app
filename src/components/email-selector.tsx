import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { useState } from "react"

interface EmailSelectorProps {
  value: string[]
  onChange: (emails: string[]) => void
  placeholder?: string
  onEmailAdd?: (email: string) => void  // Nueva prop opcional
}

export function EmailSelector({ value = [], onChange, placeholder, onEmailAdd }: EmailSelectorProps) {
  const safeValue = Array.isArray(value) ? value : []

  const [input, setInput] = useState("")

  const addEmail = () => {
    const trimmed = input.trim()
    if (trimmed && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      if (!safeValue.includes(trimmed)) {
        if (onEmailAdd) onEmailAdd(trimmed)  // Llamamos al callback si existe
        onChange([...safeValue, trimmed])
      }
      setInput("")
    }
  }

  const removeEmail = (email: string) => {
    onChange(safeValue.filter((e) => e !== email))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addEmail()
    }
  }

  return (
    <div className="flex flex-wrap gap-1 border rounded p-2 min-h-[3rem]">
      {safeValue.map((email) => (
        <Badge key={email} className="flex items-center space-x-1">
          {email}
          <X className="h-4 w-4 ml-1 cursor-pointer" onClick={() => removeEmail(email)} />
        </Badge>
      ))}
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="border-none shadow-none focus:outline-none w-auto flex-1"
      />
    </div>
  )
}
