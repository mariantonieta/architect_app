import { SidebarTrigger } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/hooks/useUser";

export function SiteHeader() {
  const { data: user, isLoading } = useUser();
  const navigate = useNavigate();

  if (isLoading || !user) return null;

  const userName = user.first_name || "Usuario";
  const userRole = user.role || "Rol desconocido";

  return (
    <header className="mb-4 bg-white px-6 py-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-gray-900">
                Hello, <span className="text-primary">{userName}</span>
              </h1>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                {userRole}
              </span>
            </div>
         
          </div>
        </div>
      </div>
    </header>
  );
}
