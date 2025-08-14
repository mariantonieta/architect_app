import { BudgetCard } from "./budget-card";
import { useSupplierRequests } from "@/hooks/useMaterialQuoted";

export function BudgetList() {
  const { data, isLoading, isError } = useSupplierRequests();

  if (isLoading) return <div>Cargando...</div>;
  if (isError) return <div>Error al cargar los presupuestos</div>;

  const budgets =
    data?.map((item) => ({
      id: item.material_list_id,
      title: item.project_name ?? "Sin nombre",
      status: "Solicitud Nueva",
      statusColor: "bg-blue-200 text-blue-800",
      professional: item.architect_name ?? "Desconocido",
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
