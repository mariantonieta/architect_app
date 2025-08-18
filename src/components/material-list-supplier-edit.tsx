import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useMaterialListByProject } from "@/hooks/useMaterial";
import {
  useQuotedItems,
  useBulkUpdateQuotedItems,
} from "@/hooks/useMaterialQuoted";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type MaterialListSupplierEditProps = {
  readOnly?: boolean; // 👈 nueva prop
};

export function MaterialListSupplierEdit({
  readOnly = false,
}: MaterialListSupplierEditProps) {
  const { id: projectId } = useParams<{ id: string }>();
  const { data: materialList, isLoading: isMaterialListLoading } =
    useMaterialListByProject(projectId);
  const { t } = useTranslation();

  const { data: quotedItems, isLoading: isQuotedLoading } = useQuotedItems(
    materialList?.id ?? ""
  );

  const bulkUpdateMutation = useBulkUpdateQuotedItems(materialList?.id ?? "");
  const [rows, setRows] = useState<any[]>([]);

  React.useEffect(() => {
    if (quotedItems) {
      setRows(quotedItems.map((item) => ({ ...item })));
    }
  }, [quotedItems]);

  const columns = useMemo(
    () => [
      { key: "item", label: t("material.item", "Material") },
      { key: "description", label: t("material.description", "Descripción") },
      { key: "unit", label: t("material.unit", "Unidad") },
      { key: "quantity", label: t("material.quantity", "Cantidad") },
      { key: "price", label: t("material.price", "Precio por unidad") },
      { key: "subtotal", label: t("material.subtotal", "Subtotal") },
      { key: "comment", label: t("material.comment", "Comentarios") },
    ],
    [t]
  );

  const handleChange = (idx: number, field: string, value: string) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        [field]: field === "price" ? parseFloat(value) : value,
      };
      return updated;
    });
  };

  const handleSave = () => {
    if (!materialList || readOnly) return;

    const itemsToSend = rows.map((item) => ({
      id: item.id,
      price: item.price,
      comment: item.comment,
    }));

    bulkUpdateMutation.mutate({ items: itemsToSend });
  };

  if (isMaterialListLoading || isQuotedLoading) {
    return <div>{t("common.loading", "Cargando...")}</div>;
  }

  if (!materialList) {
    return <div>{t("material.noList", "No hay lista de materiales")}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <h2 className="text-xl font-bold mb-4">{materialList.name}</h2>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key}>{col.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((item, idx) => (
            <TableRow key={idx}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.description}</TableCell>
              <TableCell>{item.unity}</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>
                {readOnly ? (
                  item.price ?? "-"
                ) : (
                  <Input
                    type="number"
                    value={item.price ?? ""}
                    min={0}
                    step={0.01}
                    onChange={(e) => handleChange(idx, "price", e.target.value)}
                    className="w-24"
                  />
                )}
              </TableCell>
              <TableCell>
                {item.price !== undefined && item.price !== ""
                  ? (item.price * item.quantity).toFixed(2)
                  : "-"}
              </TableCell>
              <TableCell>
                {readOnly ? (
                  item.comment ?? "-"
                ) : (
                  <Input
                    value={item.comment ?? ""}
                    onChange={(e) =>
                      handleChange(idx, "comment", e.target.value)
                    }
                    className="w-40"
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {!readOnly && (
        <div className="mt-4 flex justify-end">
          <Button
            onClick={handleSave}
            className="bg-primary"
            disabled={bulkUpdateMutation.isPending}
          >
            {bulkUpdateMutation.isPending
              ? t("common.saving", "Guardando...")
              : t("common.saveChanges", "Guardar Cambios")}
          </Button>
        </div>
      )}
    </div>
  );
}
