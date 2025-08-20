// hooks/useMaterialsForm.ts
import { useCallback } from "react";
import { toast } from "sonner";
import { useFieldArray, type UseFormReturn } from "react-hook-form";
import { type Material } from "../types/material";
import { type BudgetFormData } from "@/schemas/budgetFormSchema";

export function useMaterialsForm(form: UseFormReturn<BudgetFormData>) {
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "materials",
  });

  const materials = form.watch("materials");

  const validateMaterial = useCallback(
    (m: Material) => ({
      isValid: m.item?.trim() && m.unit && m.quantity > 0,
      errors: {
        item: !m.item?.trim(),
        unit: !m.unit,
        quantity: m.quantity <= 0,
      },
    }),
    []
  );

  const updateMaterial = useCallback(
    (index: number, field: keyof Material, value: any) => {
      form.setValue(`materials.${index}.${field}`, value);
      const validation = validateMaterial({
        ...materials[index],
        [field]: value,
      });
      if (!validation.isValid) {
        if (validation.errors.item)
          toast.warning("El nombre del material es requerido");
        if (validation.errors.quantity)
          toast.warning("La cantidad debe ser mayor a 0");
      }
    },
    [materials, form, validateMaterial]
  );

  const addMaterial = useCallback(
    (m: Omit<Material, "id">) => {
      const newId = Math.max(...materials.map((i) => i.id), 0) + 1;
      append({ ...m, id: newId });
    },
    [materials, append]
  );

  const deleteMaterial = useCallback(
    (index: number) => {
      remove(index);
      toast.success("Material eliminado");
    },
    [remove]
  );

  return {
    fields,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    move,
    validateMaterial,
    materials,
  };
}
