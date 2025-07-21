import { useCurrentUser } from "@/hooks/useCurrentUser";

import { HomeArchitect } from "../home/architect";
import { HomeCustomer } from "../home/customer";
import HomeSupplier from "./supplier";

export function RoleDashboard() {
  const { user, isLoading, role } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user || !role) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
        Error loading user
          </h1>
          <p className="text-gray-600">
            Unable to determine your user role.
          </p>
        </div>
      </div>
    );
  }

  switch (role) {
    case "architect":
      return <HomeArchitect />;
    case "customer":
      return <HomeCustomer />;
    case "supplier":
      return <HomeSupplier  />
      
  
    default:
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Rol no reconocido
            </h1>
            <p className="text-gray-600">
              Tu rol "{role}" no está configurado en el sistema.
            </p>
          </div>
        </div>
      );
  }
}
