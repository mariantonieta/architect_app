import { useCurrentUser } from "@/hooks/useCurrentUser";

export function HomeCustomer() {
  const { user } = useCurrentUser();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard del Cliente
        </h1>
        <p className="text-gray-600 mt-2">
          Bienvenido, {user?.first_name} {user?.last_name}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Tarjeta de Mis Proyectos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Mis Proyectos</h2>
          <p className="text-gray-600 mb-4">
            Revisa el progreso de tus proyectos arquitectónicos
          </p>
          <a
            href="/customer/projects"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Ver Mis Proyectos
          </a>
        </div>

        {/* Tarjeta de Solicitar Presupuesto */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Solicitar Presupuesto</h2>
          <p className="text-gray-600 mb-4">
            Solicita un presupuesto para tu nuevo proyecto
          </p>
          <a
            href="/customer/request-quote"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Solicitar Presupuesto
          </a>
        </div>

        {/* Tarjeta de Documentos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Mis Documentos</h2>
          <p className="text-gray-600 mb-4">
            Accede a planos, renders y documentos de tus proyectos
          </p>
          <a
            href="/customer/documents"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Ver Documentos
          </a>
        </div>

        {/* Tarjeta de Pagos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Pagos y Facturas</h2>
          <p className="text-gray-600 mb-4">
            Gestiona tus pagos y consulta facturas
          </p>
          <a
            href="/customer/payments"
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            Ver Pagos
          </a>
        </div>

        {/* Tarjeta de Comunicación */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Comunicación</h2>
          <p className="text-gray-600 mb-4">
            Envía mensajes a tu arquitecto
          </p>
          <a
            href="/customer/messages"
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Ver Mensajes
          </a>
        </div>

        {/* Tarjeta de Perfil */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Mi Perfil</h2>
          <p className="text-gray-600 mb-4">
            Actualiza tu información personal
          </p>
          <a
            href="/account"
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Actualizar Perfil
          </a>
        </div>
      </div>

      {/* Información adicional */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          ¿Necesitas ayuda?
        </h3>
        <p className="text-blue-700 mb-4">
          Nuestro equipo está disponible para ayudarte con cualquier duda sobre tus proyectos.
        </p>
        <a
          href="/customer/support"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Contactar Soporte
        </a>
      </div>
    </div>
  );
}
