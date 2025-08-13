import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useMaterialListByProject } from "@/hooks/useMaterial";
import { materialListService } from "@/services/materialServices";
import { useEffect, useState } from "react";
async function getQuotedItemsByMaterialList(materialListId: string) {
  const response = await api.get(
    `/material-list-quoted-items/material-list/${materialListId}`
  );
  return response.data;
}
import api from "@/services/api";

async function bulkUpdateQuotedItems(materialListId: string, items: any[]) {
  return api.patch(
    `/material-list-quoted-items/material-list/${materialListId}`,
    {
      items,
    }
  );
}
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

export function MaterialListSupplierEdit() {
  const { id: projectId } = useParams<{ id: string }>();
  const { data: materialList, isLoading } = useMaterialListByProject(projectId);
  const { t } = useTranslation();
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    if (!materialList?.id) return;
    getQuotedItemsByMaterialList(materialList.id).then((items) => {
      setRows(items.map((item: any) => ({ ...item })));
    });
  }, [materialList?.id]);

  const columns = useMemo(
    () => [
      { key: "item", label: t("material.item", "Material") },
      { key: "description", label: t("material.description", "Descripción") },
      { key: "unit", label: t("material.unit", "Unidad") },
      { key: "quantity", label: t("material.quantity", "Cantidad") },
      { key: "price", label: t("material.price", "Precio por unidad") },
      { key: "subtotal", label: t("material.subtotal", "Subtotal") },
      {
        key: "comment",
        label: t("material.comment", "Comentarios"),
      },
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

  const handleSave = async () => {
    if (!materialList) return;
    try {
      const itemsToSend = rows.map((item) => ({
        id: item.id,
        price: item.price,
        comment: item.comment,
      }));
      console.log("PATCH bulk material-list-quoted-items:", {
        materialListId: materialList.id,
        items: itemsToSend,
      });
      await bulkUpdateQuotedItems(materialList.id, itemsToSend);
      alert("Cambios guardados correctamente");
    } catch (e) {
      alert("Error al guardar cambios");
    }
  };

  if (isLoading) return <div>{t("common.loading", "Cargando...")}</div>;
  if (!materialList)
    return <div>{t("material.noList", "No hay lista de materiales")}</div>;

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
                <Input
                  type="number"
                  value={item.price ?? ""}
                  min={0}
                  step={0.01}
                  onChange={(e) => handleChange(idx, "price", e.target.value)}
                  className="w-24"
                />
              </TableCell>
              <TableCell>
                {item.price !== undefined && item.price !== ""
                  ? (item.price * item.quantity).toFixed(2)
                  : "-"}
              </TableCell>
              <TableCell>
                <Input
                  value={item.comment ?? ""}
                  onChange={(e) => handleChange(idx, "comment", e.target.value)}
                  className="w-40"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4 flex justify-end">
        <Button onClick={handleSave} className="bg-primary">
          Guardar Cambios
        </Button>
      </div>
    </div>
  );
}
