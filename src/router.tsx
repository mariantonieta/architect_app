import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Login, NotFound, Home, Register } from "./pages";
import { AUTH_STORAGE } from "./lib/constants";
import { AuthValidationMiddleware } from "./middleware/auth-validation";
import GoogleAuthRedirect from "./components/google-redirect";
import { GoogleCompleteRegistration } from "./components/google-complete-registration";
import { ResetPasswordRequest } from "./components/reset-password-request";
import { ResetPasswordForm } from "./components/reset-password-form";

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="auth/google/callback" element={<GoogleAuthRedirect />} />
        <Route path="auth/google/complete-registration" element={<GoogleCompleteRegistration />} />
      <Route path="reset-password" element={<ResetPasswordRequest/>} />
      <Route path="reset-password/form" element={<ResetPasswordForm/>} />

        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        <Route
          element={
            <AuthValidationMiddleware to="/login" storageKey={AUTH_STORAGE} />
          }
        >
          <Route index element={<Home />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
