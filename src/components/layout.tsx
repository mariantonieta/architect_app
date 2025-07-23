import { Outlet } from "react-router-dom";
import { AppSidebar } from "./app-sidebar";
import { SidebarProvider, SidebarInset } from "./ui/sidebar";
import { SiteHeader } from "./site-header";
import { useRolePermissions } from "@/middleware/role-based-access";
import { useCreateProjectModal } from "@/hooks/useCreateOrEditProjectModal";
import { CreateOrEditProjectForm } from "./create-or-edit-project-form";

export function Layout() {
  // const { open, closeModal, initialData } = useProjectModal();
  const { isOpen, toggleModal } = useCreateProjectModal();
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
              <CreateOrEditProjectForm
                open={isOpen}
                onOpenChange={toggleModal}
              />
            )}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
