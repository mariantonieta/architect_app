import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Login, NotFound, Home } from "./pages";
import { AUTH_STORAGE } from "./lib/constants";
import { AuthValidationMiddleware } from "./middleware/auth-validation";

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <AuthValidationMiddleware to="/login" storageKey={AUTH_STORAGE} />
          }
        >
          <Route index element={<Home />} />
        </Route>

        <Route path="login" element={<Login />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}


