import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Login, NotFound, Home, Register, Account } from "./pages";
import { AUTH_STORAGE } from "./lib/constants";
import { AuthValidationMiddleware } from "./middleware/auth-validation";
import GoogleAuthRedirect from "./components/google-redirect";
import { GoogleCompleteRegistration } from "./components/google-complete-registration";
import { ResetPasswordRequest } from "./components/reset-password-request";
import { ResetPasswordForm } from "./components/reset-password-form";
import { Project } from "./pages/project";
import { Layout } from "./components/layout";


export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="auth/google/callback" element={<GoogleAuthRedirect />} />
        <Route path="auth/google/complete-registration" element={<GoogleCompleteRegistration />} />
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
            <Route path="/dashboard" element={<Home />} />
            <Route path="/account" element={<Account />} />
            <Route path="/projects/:id" element={<Project />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
