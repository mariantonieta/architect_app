import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";

import data from "./data.json";

export function Home() {
  return (
    <div className="flex flex-col px-4 lg:px-6">
      <div className="@container/main flex flex-1 flex-col space-y-6 pb-6">
        <SectionCards />
        <ChartAreaInteractive />
        <DataTable data={data} />
      </div>
    </div>
  );
}
