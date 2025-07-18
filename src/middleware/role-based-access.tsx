import { Navigate, Outlet } from "react-router-dom";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface RoleBasedAccessProps {
  allowedRoles: string[];
  fallbackTo?: string;
  children?: React.ReactNode;
}

export function RoleBasedAccess({ 
  allowedRoles, 
  fallbackTo = "/", 
  children 
}: RoleBasedAccessProps) {
  const { user, isLoading, role } = useCurrentUser();

  // Mostrar loading mientras se obtiene el usuario
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Si no hay usuario o rol, redirigir al login
  if (!user || !role) {
    return <Navigate to="/login" replace />;
  }

  // Verificar si el rol del usuario está permitido
  const hasAccess = allowedRoles.includes(role);

  if (!hasAccess) {
    return <Navigate to={fallbackTo} replace />;
  }

  // Si tiene acceso, mostrar el contenido
  return children ? <>{children}</> : <Outlet />;
}

// Hook personalizado para verificar permisos de rol en componentes
export function useRolePermissions() {
  const { role } = useCurrentUser();
  
  return {
    isArchitect: role === "architect",
    isCustomer: role === "customer", 
    isSupplier: role === "supplier",
    hasRole: (requiredRole: string) => role === requiredRole,
    hasAnyRole: (requiredRoles: string[]) => requiredRoles.includes(role || ""),
  };
}
