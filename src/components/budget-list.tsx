import { useTranslation } from "react-i18next";
import { BudgetCard } from "./budget-card";
import { useSupplierRequests } from "@/hooks/useMaterialQuoted";

export function BudgetList() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useSupplierRequests();

  if (isLoading) return <div>{t("common.loading")}</div>;
  if (isError) return <div>{t("errors.errorLoading")}</div>;

  const budgets =
    data?.map((item) => ({
      id: item.material_list_id,
      title: item.project_name ?? t("budget.noName"),
      status: t("budget.newRequest"),
      statusColor: "bg-blue-200 text-blue-800",
      professional: item.architect_name ?? t("budget.unknown"),
      date: "2025-08-14",
      projectId: item.project_id,
    })) ?? [];

  return (
    <div className="space-y-4">
      {budgets.map((budget) => (
        <BudgetCard key={budget.id} budget={budget} />
      ))}
    </div>
  );
}
