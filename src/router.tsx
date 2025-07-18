import { BrowserRouter, Route, Routes } from "react-router-dom";
import { 
  Login, 
  NotFound, 
  Register, 
  Account, 
  RoleDashboard,
  ArchitectDashboard,
  CustomerDashboard,
  SupplierDashboard
} from "./pages";
import { AUTH_STORAGE } from "./lib/constants";
import { AuthValidationMiddleware } from "./middleware/auth-validation";
import { RoleBasedAccess } from "./middleware/role-based-access";
import GoogleAuthRedirect from "./components/google-redirect";
import { GoogleCompleteRegistration } from "./components/google-complete-registration";
import { ResetPasswordRequest } from "./components/reset-password-request";
import { ResetPasswordForm } from "./components/reset-password-form";
import { Layout } from "./components/layout";
import { ProjectId, Projects } from "./pages/project";

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="auth/google/callback" element={<GoogleAuthRedirect />} />
        <Route
          path="auth/google/complete-registration"
          element={<GoogleCompleteRegistration />}
        />
        <Route path="reset-password" element={<ResetPasswordRequest />} />
        <Route path="reset-password/form" element={<ResetPasswordForm />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        <Route
          element={
            <AuthValidationMiddleware to="/login" storageKey={AUTH_STORAGE} />
          }
        >
          <Route element={<Layout />}>
            {/* Dashboard principal que detecta el rol y muestra el dashboard apropiado */}
            <Route index element={<RoleDashboard />} />
            
            {/* Rutas específicas para Arquitectos */}
            {/* <Route 
              path="/architect" 
              element={
                <RoleBasedAccess allowedRoles={["architect"]}>
                  <ArchitectDashboard />
                </RoleBasedAccess>
              } 
            />
            <Route 
              path="/architect/clients" 
              element={
                <RoleBasedAccess allowedRoles={["architect"]}>
                  <div className="container mx-auto px-4 py-8">
                    <h1 className="text-2xl font-bold mb-6">Gestión de Clientes</h1>
                    <p>Aquí puedes gestionar la información de tus clientes.</p>
                  </div>
                </RoleBasedAccess>
              } 
            />
            <Route 
              path="/architect/suppliers" 
              element={
                <RoleBasedAccess allowedRoles={["architect"]}>
                  <div className="container mx-auto px-4 py-8">
                    <h1 className="text-2xl font-bold mb-6">Gestión de Proveedores</h1>
                    <p>Aquí puedes conectar con proveedores de materiales.</p>
                  </div>
                </RoleBasedAccess>
              } 
            />
            <Route 
              path="/architect/documents" 
              element={
                <RoleBasedAccess allowedRoles={["architect"]}>
                  <div className="container mx-auto px-4 py-8">
                    <h1 className="text-2xl font-bold mb-6">Gestión de Documentos</h1>
                    <p>Administra planos, renders y documentos de tus proyectos.</p>
                  </div>
                </RoleBasedAccess>
              } 
            />
            <Route 
              path="/architect/budgets" 
              element={
                <RoleBasedAccess allowedRoles={["architect"]}>
                  <div className="container mx-auto px-4 py-8">
                    <h1 className="text-2xl font-bold mb-6">Gestión de Presupuestos</h1>
                    <p>Crea y gestiona presupuestos de proyectos.</p>
                  </div>
                </RoleBasedAccess>
              } 
            /> */}
            
            {/* Rutas específicas para Clientes */}
            {/* <Route 
              path="/customer" 
              element={
                <RoleBasedAccess allowedRoles={["customer"]}>
                  <CustomerDashboard />
                </RoleBasedAccess>
              } 
            />
            <Route 
              path="/customer/projects" 
              element={
                <RoleBasedAccess allowedRoles={["customer"]}>
                  <div className="container mx-auto px-4 py-8">
                    <h1 className="text-2xl font-bold mb-6">Mis Proyectos</h1>
                    <p>Revisa el progreso de tus proyectos arquitectónicos.</p>
                  </div>
                </RoleBasedAccess>
              } 
            />
            <Route 
              path="/customer/request-quote" 
              element={
                <RoleBasedAccess allowedRoles={["customer"]}>
                  <div className="container mx-auto px-4 py-8">
                    <h1 className="text-2xl font-bold mb-6">Solicitar Presupuesto</h1>
                    <p>Solicita un presupuesto para tu nuevo proyecto.</p>
                  </div>
                </RoleBasedAccess>
              } 
            />
            <Route 
              path="/customer/documents" 
              element={
                <RoleBasedAccess allowedRoles={["customer"]}>
                  <div className="container mx-auto px-4 py-8">
                    <h1 className="text-2xl font-bold mb-6">Mis Documentos</h1>
                    <p>Accede a planos, renders y documentos de tus proyectos.</p>
                  </div>
                </RoleBasedAccess>
              } 
            />
            <Route 
              path="/customer/payments" 
              element={
                <RoleBasedAccess allowedRoles={["customer"]}>
                  <div className="container mx-auto px-4 py-8">
                    <h1 className="text-2xl font-bold mb-6">Pagos y Facturas</h1>
                    <p>Gestiona tus pagos y consulta facturas.</p>
                  </div>
                </RoleBasedAccess>
              } 
            />
            <Route 
              path="/customer/messages" 
              element={
                <RoleBasedAccess allowedRoles={["customer"]}>
                  <div className="container mx-auto px-4 py-8">
                    <h1 className="text-2xl font-bold mb-6">Mensajes</h1>
                    <p>Comunícate con tu arquitecto.</p>
                  </div>
                </RoleBasedAccess>
              } 
            />
            <Route 
              path="/customer/support" 
              element={
                <RoleBasedAccess allowedRoles={["customer"]}>
                  <div className="container mx-auto px-4 py-8">
                    <h1 className="text-2xl font-bold mb-6">Soporte al Cliente</h1>
                    <p>Nuestro equipo está disponible para ayudarte.</p>
                  </div>
                </RoleBasedAccess>
              } 
            /> */}
            
            {/* Rutas específicas para Proveedores */}
            {/* <Route 
              path="/supplier" 
              element={
                <RoleBasedAccess allowedRoles={["supplier"]}>
                  <SupplierDashboard />
                </RoleBasedAccess>
              } 
            />
            <Route 
              path="/supplier/catalog" 
              element={
                <RoleBasedAccess allowedRoles={["supplier"]}>
                  <div className="container mx-auto px-4 py-8">
                    <h1 className="text-2xl font-bold mb-6">Mi Catálogo</h1>
                    <p>Gestiona tu catálogo de productos y materiales.</p>
                  </div>
                </RoleBasedAccess>
              } 
            />
            <Route 
              path="/supplier/orders" 
              element={
                <RoleBasedAccess allowedRoles={["supplier"]}>
                  <div className="container mx-auto px-4 py-8">
                    <h1 className="text-2xl font-bold mb-6">Pedidos Recibidos</h1>
                    <p>Revisa y gestiona los pedidos de los arquitectos.</p>
                  </div>
                </RoleBasedAccess>
              } 
            />
            <Route 
              path="/supplier/quotes" 
              element={
                <RoleBasedAccess allowedRoles={["supplier"]}>
                  <div className="container mx-auto px-4 py-8">
                    <h1 className="text-2xl font-bold mb-6">Cotizaciones</h1>
                    <p>Envía cotizaciones personalizadas a arquitectos.</p>
                  </div>
                </RoleBasedAccess>
              } 
            />
            <Route 
              path="/supplier/inventory" 
              element={
                <RoleBasedAccess allowedRoles={["supplier"]}>
                  <div className="container mx-auto px-4 py-8">
                    <h1 className="text-2xl font-bold mb-6">Inventario</h1>
                    <p>Controla el stock de tus productos.</p>
                  </div>
                </RoleBasedAccess>
              } 
            />
            <Route 
              path="/supplier/invoices" 
              element={
                <RoleBasedAccess allowedRoles={["supplier"]}>
                  <div className="container mx-auto px-4 py-8">
                    <h1 className="text-2xl font-bold mb-6">Facturas y Pagos</h1>
                    <p>Gestiona tus facturas y seguimiento de pagos.</p>
                  </div>
                </RoleBasedAccess>
              } 
            />
            <Route 
              path="/supplier/network" 
              element={
                <RoleBasedAccess allowedRoles={["supplier"]}>
                  <div className="container mx-auto px-4 py-8">
                    <h1 className="text-2xl font-bold mb-6">Red de Contactos</h1>
                    <p>Amplía tu red de contactos y aumenta tus ventas.</p>
                  </div>
                </RoleBasedAccess>
              } 
            /> */}
            
            {/* Rutas compartidas */}
            <Route path="/account" element={<Account />} />
            
            {/* Proyectos - solo para arquitectos */}
            <Route 
              path="/projects" 
              element={
                <RoleBasedAccess allowedRoles={["architect"]}>
                  <Projects />
                </RoleBasedAccess>
              } 
            />
            <Route 
              path="/projects/:id" 
              element={
                <RoleBasedAccess allowedRoles={["architect"]}>
                  <ProjectId />
                </RoleBasedAccess>
              } 
            />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
