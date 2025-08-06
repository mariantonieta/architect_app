import * as React from "react"
import { Check, X, Plus } from 'lucide-react'
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TableCell, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { type Material } from "@/types/material" 
import { unitOptions, statusOptions, categoryOptions } from "@/components/material-table"

interface AddMaterialRowProps {
  onAdd: (material: Omit<Material, 'id'>) => void
  onCancel: () => void
}


export function AddMaterialRow({ onAdd, onCancel }: AddMaterialRowProps) {
 const inputRef = React.useRef<HTMLInputElement>(null)
    React.useEffect(() => {
    inputRef.current?.focus()
  }, [])
  const [newMaterial, setNewMaterial] = React.useState({
    item: "",
    description: "",
    unit: "u",
    quantity: 0,
    category: "MAMPOSTERÍA Y TABIQUERÍA",
    subcategory: "",
    metricQuantity: 0,
    updatedQuantity: 0,
    finalUnit: "m2",
    status: "Pendiente",
  })

  const handleSave = () => {
    if (!newMaterial.item.trim()) {
      toast.error("El nombre del material es requerido")
      return
    }
    
    onAdd(newMaterial)
    toast.success("Material agregado correctamente")
  }

  const updateField = (field: keyof typeof newMaterial, value: string | number) => {
    setNewMaterial(prev => ({ ...prev, [field]: value }))
  }

  return (
    <TableRow className="bg-muted/30 border-2 border-dashed border-primary/30">
      {/* Drag handle placeholder */}
      <TableCell>
        <div className="size-7 flex items-center justify-center">
          <Plus className="h-3 w-3 text-muted-foreground" />
        </div>
      </TableCell>
      
      {/* Select placeholder */}
      <TableCell>
        <div className="flex items-center justify-center">
          <div className="w-4 h-4 border border-dashed border-muted-foreground/50 rounded" />
        </div>
      </TableCell>

      <TableCell className="min-w-[180px]">
        <Input
          ref={inputRef}
          value={newMaterial.item}
          onChange={(e) => updateField("item", e.target.value)}
          placeholder="Nombre del material"
          className="w-full px-4 py-3 min-w-[100px]"
          autoFocus
        />
      </TableCell>

      {/* Description */}
      <TableCell>
        <Textarea
          value={newMaterial.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Descripción del material"
          className="min-h-[60px] text-xs"
        />
      </TableCell>

      {/* Unit */}
      <TableCell>
        <Select value={newMaterial.unit} onValueChange={(value) => updateField("unit", value)}>
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {unitOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>

      {/* Quantity */}
      <TableCell>
        <Input
          type="number"
          value={newMaterial.quantity}
          onChange={(e) => updateField("quantity", parseFloat(e.target.value) || 0)}
          placeholder="0"
          className="w-20 text-right h-8"
        />
      </TableCell>

      {/* Category */}
      <TableCell>
        <div className="space-y-1">
          <Select value={newMaterial.category} onValueChange={(value) => updateField("category", value)}>
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={newMaterial.subcategory}
            onChange={(e) => updateField("subcategory", e.target.value)}
            placeholder="Subcategoría"
            className="text-xs h-7"
          />
        </div>
      </TableCell>

      {/* Metric Quantity */}
      <TableCell>
        <Input
          type="number"
          value={newMaterial.metricQuantity}
          onChange={(e) => updateField("metricQuantity", parseFloat(e.target.value) || 0)}
          placeholder="0"
          className="w-20 text-center h-8"
        />
      </TableCell>

      {/* Updated Quantity */}
      <TableCell>
        <Input
          type="number"
          value={newMaterial.updatedQuantity}
          onChange={(e) => updateField("updatedQuantity", parseFloat(e.target.value) || 0)}
          placeholder="0"
          className="w-20 text-right h-8 font-semibold text-primary"
        />
      </TableCell>

      {/* Final Unit */}
      <TableCell>
        <Select value={newMaterial.finalUnit} onValueChange={(value) => updateField("finalUnit", value)}>
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {unitOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>

      {/* Status */}
      <TableCell>
        <Select value={newMaterial.status} onValueChange={(value) => updateField("status", value)}>
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>

      {/* Actions */}
      <TableCell>
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleSave}>
            <Check className="h-3 w-3" />
          </Button>
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onCancel}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}
