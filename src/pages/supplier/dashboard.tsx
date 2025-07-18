import { useCurrentUser } from "@/hooks/useCurrentUser";
import { RoleInfo } from "@/components/role-info";

export function SupplierDashboard() {
  const { user } = useCurrentUser();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard del Proveedor
        </h1>
        <p className="text-gray-600 mt-2">
          Bienvenido, {user?.first_name} {user?.last_name}
        </p>
        {user?.company && (
          <p className="text-gray-500 text-sm">
            {user.company}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Tarjeta de Catálogo */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Mi Catálogo</h2>
          <p className="text-gray-600 mb-4">
            Gestiona tu catálogo de productos y materiales
          </p>
          <a
            href="/supplier/catalog"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Gestionar Catálogo
          </a>
        </div>

        {/* Tarjeta de Pedidos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Pedidos Recibidos</h2>
          <p className="text-gray-600 mb-4">
            Revisa y gestiona los pedidos de los arquitectos
          </p>
          <a
            href="/supplier/orders"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Ver Pedidos
          </a>
        </div>

        {/* Tarjeta de Cotizaciones */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Cotizaciones</h2>
          <p className="text-gray-600 mb-4">
            Envía cotizaciones personalizadas a arquitectos
          </p>
          <a
            href="/supplier/quotes"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Gestionar Cotizaciones
          </a>
        </div>

        {/* Tarjeta de Inventario */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Inventario</h2>
          <p className="text-gray-600 mb-4">
            Controla el stock de tus productos
          </p>
          <a
            href="/supplier/inventory"
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            Ver Inventario
          </a>
        </div>

        {/* Tarjeta de Facturas */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Facturas y Pagos</h2>
          <p className="text-gray-600 mb-4">
            Gestiona tus facturas y seguimiento de pagos
          </p>
          <a
            href="/supplier/invoices"
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Ver Facturas
          </a>
        </div>

        {/* Tarjeta de Perfil */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Perfil de Empresa</h2>
          <p className="text-gray-600 mb-4">
            Actualiza la información de tu empresa
          </p>
          <a
            href="/account"
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Actualizar Perfil
          </a>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Pedidos Este Mes
          </h3>
          <p className="text-3xl font-bold text-blue-600">24</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Productos en Catálogo
          </h3>
          <p className="text-3xl font-bold text-green-600">156</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Cotizaciones Pendientes
          </h3>
          <p className="text-3xl font-bold text-orange-600">8</p>
        </div>
      </div>

      {/* Información de contacto */}
      <div className="mt-8 bg-green-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-900 mb-2">
          Conecta con más Arquitectos
        </h3>
        <p className="text-green-700 mb-4">
          Amplía tu red de contactos y aumenta tus ventas conectándote con más profesionales.
        </p>
        <a
          href="/supplier/network"
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Explorar Red
        </a>
      </div>
    </div>
  );
}
