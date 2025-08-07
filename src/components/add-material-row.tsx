import * as React from "react";
import { Check, X, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableCell, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { type Material } from "@/types/material";
import {
  unitOptions,
} from "@/components/material-table";
import { MaterialListItemStatus } from "@/services/materialServices";

interface AddMaterialRowProps {
  onAdd: (material: Omit<Material, "id">) => void;
  onCancel: () => void;
}

export function AddMaterialRow({ onAdd, onCancel }: AddMaterialRowProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);
  const [newMaterial, setNewMaterial] = React.useState<Material>({
    item: "",
    description: "",
    unit: "u",
    quantity: 0,
    status: MaterialListItemStatus.NO_REQUESTED,
  });

  const handleSave = () => {
    // Validar campos requeridos
    if (!newMaterial.item.trim()) {
      toast.error("El nombre del material es requerido");
      return;
    }

    if (!newMaterial.unit) {
      toast.error("La unidad es requerida");
      return;
    }

    if (newMaterial.quantity <= 0) {
      toast.error("La cantidad debe ser mayor a 0");
      return;
    }

    onAdd(newMaterial);
    toast.success("Material agregado correctamente");
  };

  // Verificar si todos los campos requeridos están completos
  const isFormValid = () => {
    return (
      newMaterial.item.trim() !== "" &&
      newMaterial.unit !== "" &&
      newMaterial.quantity > 0
    );
  };

  const updateField = (
    field: keyof typeof newMaterial,
    value: string | number
  ) => {
    setNewMaterial((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <TableRow className="bg-muted/30 border-2 border-dashed border-primary/30">
      {/* Drag handle placeholder */}
      <TableCell className="px-2 py-3">
        <div className="w-7 h-8 flex items-center justify-center">
          <Plus className="h-3 w-3 text-muted-foreground" />
        </div>
      </TableCell>

      {/* Select placeholder */}
      <TableCell className="px-2 py-3">
        <div className="flex items-center justify-center h-8">
          <div className="w-4 h-4 border border-dashed border-muted-foreground/50 rounded" />
        </div>
      </TableCell>

      {/* Item */}
      <TableCell className="px-2 py-3">
        <Input
          ref={inputRef}
          value={newMaterial.item}
          onChange={(e) => updateField("item", e.target.value)}
          placeholder="Nombre del material*"
          className={`w-full ${
            !newMaterial.item.trim()
              ? "border-red-300 focus:border-red-500"
              : ""
          }`}
          autoFocus
        />
      </TableCell>

      {/* Description */}
      <TableCell className="px-2 py-3">
        <div className="w-full h-8 flex items-center">
          <Textarea
            value={newMaterial.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="Descripción del material"
            className="min-h-[60px] text-xs resize-none w-full"
          />
        </div>
      </TableCell>

      {/* Unit */}
      <TableCell className="px-2 py-3">
        <div className="flex items-center justify-center h-8">
          <Select
            value={newMaterial.unit}
            onValueChange={(value) => updateField("unit", value)}
          >
            <SelectTrigger
              className={`h-8 w-full ${
                !newMaterial.unit ? "border-red-300 focus:border-red-500" : ""
              }`}
            >
              <SelectValue placeholder="Unidad*" />
            </SelectTrigger>
            <SelectContent>
              {unitOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </TableCell>

      {/* Quantity */}
      <TableCell className="px-2 py-3">
        <div className="w-full h-8 flex justify-end items-center">
          <Input
            type="number"
            value={newMaterial.quantity}
            onChange={(e) =>
              updateField("quantity", parseFloat(e.target.value) || 0)
            }
            placeholder="0*"
            className={`w-full text-right h-8 ${
              newMaterial.quantity <= 0
                ? "border-red-300 focus:border-red-500"
                : ""
            }`}
          />
        </div>
      </TableCell>

      {/* Status */}
      <TableCell className="px-2 py-3 items-center">
        <span className="rounded-full px-2 py-1 bg-muted text-xs font-medium text-muted-foreground items-center">
          {newMaterial.status}
        </span>
      </TableCell>

      {/* Actions */}
      <TableCell className="px-2 py-3">
        <div className="flex gap-1 justify-center items-center h-8">
          <Button
            size="icon"
            variant="ghost"
            className={`h-6 w-6 ${
              isFormValid()
                ? "hover:bg-green-100 hover:text-green-700"
                : "opacity-50 cursor-not-allowed"
            }`}
            onClick={handleSave}
            disabled={!isFormValid()}
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 hover:bg-red-100 hover:text-red-700"
            onClick={onCancel}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
