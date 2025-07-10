import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

import data from "./data.json"
import { Projects } from "@/components/projects"

export function Home() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <div className="flex flex-col px-4 lg:px-6">
          <SiteHeader />

          <div className="@container/main flex flex-1 flex-col space-y-6 pb-6">
            <SectionCards />
            <Projects />
            <ChartAreaInteractive />
            <DataTable data={data} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
