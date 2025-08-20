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
import { useQuotedItemsBySupplier } from "@/hooks/useSupplierRequest";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function MaterialListArchitectView() {
  const { id: projectId } = useParams<{ id: string }>();
  const {
    data: materialList,
    isLoading: isMaterialListLoading,
    refetch: refetchMaterialList,
  } = useMaterialListByProject(projectId);
  const { t } = useTranslation();

  const {
    data: suppliers,
    isLoading: isQuotedLoading,
    refetch: refetchSuppliers,
  } = useQuotedItemsBySupplier(materialList?.id ?? "");

  if (isMaterialListLoading || isQuotedLoading) {
    return <div>{t("common.loading")}</div>;
  }

  if (!materialList) {
    return <div>{t("material.noList", "No hay lista de materiales")}</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4">{materialList.name}</h2>

      <Accordion type="single" collapsible className="w-full">
        {suppliers?.map((supplier, index) => {
          const letter = String.fromCharCode(65 + index);
          return (
            <AccordionItem
              key={supplier.supplier_id}
              value={supplier.supplier_id}
            >
              <AccordionTrigger>
                <div className="flex flex-col items-start text-left">
                  <span className="font-semibold">
                    {t("budget.budgetSupplier")} {letter}
                  </span>

                  <span className="text-sm text-muted-foreground">
                    {supplier.supplier_name} ({supplier.supplier_email})
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("materials.material")}</TableHead>
                      <TableHead>{t("materials.description")}</TableHead>
                      <TableHead>{t("materials.unit")}</TableHead>
                      <TableHead>{t("materials.quantity")}</TableHead>
                      <TableHead>{t("materials.price")}</TableHead>
                      <TableHead>{t("materials.subtotal")}</TableHead>
                      <TableHead>{t("materials.comment")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supplier.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.unity}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.price ?? "-"}</TableCell>
                        <TableCell>
                          {item.price
                            ? (item.price * item.quantity).toFixed(2)
                            : "-"}
                        </TableCell>
                        <TableCell>{item.comment ?? "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
