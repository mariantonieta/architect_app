import { useCurrentUser } from "@/hooks/useCurrentUser";
import { SupplierDashboard } from "../supplier";
import { HomeArchitect } from "../home/architect";
import { HomeCustomer } from "../home/customer";
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
            Error al cargar el usuario
          </h1>
          <p className="text-gray-600">
            No se pudo determinar tu rol de usuario.
          </p>
        </div>
      </div>
    );
  }

  // Renderizar el dashboard correspondiente al rol
  switch (role) {
    case "architect":
      return <HomeArchitect />;
    case "customer":
      return <HomeCustomer />;
    case "supplier":
      return (
        <div>
          <div className="bg-purple-50 border-l-4 border-purple-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-purple-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-purple-700">
                  <strong>Vista de Proveedor:</strong> Gestiona tu catálogo,
                  pedidos, cotizaciones e inventario.
                </p>
              </div>
            </div>
          </div>
          <SupplierDashboard />
        </div>
      );
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
