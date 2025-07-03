import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Login, NotFound, Home, Register } from "./pages";
import { AUTH_STORAGE } from "./lib/constants";
import { AuthValidationMiddleware } from "./middleware/auth-validation";
import GoogleAuthRedirect from "./components/GoogleRedirect";

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="auth/google/callback" element={<GoogleAuthRedirect />} />
        {/* Rutas públicas */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        {/* Rutas protegidas con middleware */}
        <Route
          element={
            <AuthValidationMiddleware to="/login" storageKey={AUTH_STORAGE} />
          }
        >
          <Route index element={<Home />} />
          {/* Más rutas protegidas aquí */}
        </Route>

        {/* Ruta para cuando no coincide ninguna */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
