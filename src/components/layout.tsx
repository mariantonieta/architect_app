import { Outlet } from "react-router-dom";
import { AppSidebar } from "./app-sidebar";
import { SidebarProvider, SidebarInset } from "./ui/sidebar";
import { SiteHeader } from "./site-header";
import { CreateProject } from "./create-project";
import { useCreateProjectModal } from "@/hooks/useCreateProjectModal";
import { useRolePermissions } from "@/middleware/role-based-access";

export function Layout() {
  const { isOpen, closeModal, initialData } = useCreateProjectModal();
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
                open={isOpen} 
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
