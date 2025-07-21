import { Outlet } from "react-router-dom";
import { AppSidebar } from "./app-sidebar";
import { SidebarProvider, SidebarInset } from "./ui/sidebar";
import { SiteHeader } from "./site-header";
import { useProjectModal } from "@/hooks/useFormProjectModal";
import { useRolePermissions } from "@/middleware/role-based-access";
import { CreateProject } from "./form-project";

export function Layout() {
  const { open, closeModal, initialData } = useProjectModal();
  const { isArchitect } = useRolePermissions();
  
  return (
    <SidebarProvider>
      <SidebarInset>
        <div className="flex">
          <AppSidebar />

          <main className="flex-1 p-4">
            <SiteHeader />
            <Outlet />
            {/* Solo mostrar el modal de crear proyecto para arquitectos */}
            {isArchitect && (
              <CreateProject 
                open={open} 
                onOpenChange={closeModal} 
                initialData={initialData}
              />
            )}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
