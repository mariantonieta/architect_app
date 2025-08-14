import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const tabs = [
  { id: "todas", label: "Todas" },
  { id: "solicitudes", label: "Solicitudes" },
  { id: "borradores", label: "Borradores" },
  { id: "enviadas", label: "Enviadas" },
  { id: "aprobadas", label: "Aprobadas" },
  { id: "canceladas", label: "Canceladas" },
];

export function BudgetTabs() {
  return (
    <Tabs defaultValue="todas" className="w-full">
      <TabsList className="grid w-full grid-cols-6 bg-muted/50">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
