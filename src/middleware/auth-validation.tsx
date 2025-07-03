import { Navigate, Outlet } from "react-router-dom";

interface AuthValidationMiddlewareProps {
  to: string;
  storageKey: string;
}

export function AuthValidationMiddleware({
  to,
  storageKey,
}: AuthValidationMiddlewareProps) {
  const token = localStorage.getItem(storageKey);

  if (!token) {
    return <Navigate to={to} replace />;
  }

  return <Outlet />;
}
