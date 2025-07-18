import { Outlet } from "react-router-dom";
import { AppSidebar } from "./app-sidebar";
import { SidebarProvider, SidebarInset } from "./ui/sidebar";
import { SiteHeader } from "./site-header";

export function Layout() {
  return (
    <SidebarProvider>
      <SidebarInset>
        <div className="flex">
          <AppSidebar />
          
          <main className="flex-1 p-4">
                <SiteHeader />
            <Outlet  />
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
