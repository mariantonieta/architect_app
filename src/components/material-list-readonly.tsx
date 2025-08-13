import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useMaterialListByProject } from "@/hooks/useMaterial";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslation } from "react-i18next";

export function MaterialListReadOnly() {
  const { id: projectId } = useParams<{ id: string }>();
  const { data: materialList, isLoading } = useMaterialListByProject(projectId);
  const { t } = useTranslation();

  const columns = useMemo(
    () => [
      { key: "item", label: t("material.item", "Material") },
      { key: "description", label: t("material.description", "Descripción") },
      { key: "unit", label: t("material.unit", "Unidad") },
      { key: "quantity", label: t("material.quantity", "Cantidad") },
      { key: "unitPrice", label: t("material.unitPrice", "Precio por unidad") },
      { key: "subtotal", label: t("material.subtotal", "Subtotal") },
      {
        key: "comment",
        label: t("material.comment", "Comentarios"),
      },
    ],
    [t]
  );

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
          {materialList.material_list_items.map((item, idx) => (
            <TableRow key={idx}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.description}</TableCell>
              <TableCell>{item.unity}</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>
                {item.unitPrice !== undefined ? item.unitPrice : "-"}
              </TableCell>
              <TableCell>
                {item.unitPrice !== undefined
                  ? (item.unitPrice * item.quantity).toFixed(2)
                  : "-"}
              </TableCell>
              <TableCell>{item.comment ?? ""}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
