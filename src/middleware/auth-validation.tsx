import { Navigate, Outlet } from "react-router-dom";

interface AuthValidationMiddlewareProps {
  to: string;
  storageKey: string;
}

function isTokenExpired(token: string): boolean {
  try {
    const payloadBase64 = token.split('.')[1];
    const payload = JSON.parse(atob(payloadBase64));

    if (!payload.exp) return true;

    const now = Math.floor(Date.now() / 1000)
    return payload.exp < now;
  } catch (e) {

    return true;
  }
}

export function AuthValidationMiddleware({
  to,
  storageKey,
}: AuthValidationMiddlewareProps) {
  const token = localStorage.getItem(storageKey);

  const isValid = token && !isTokenExpired(token);

  return isValid ? <Outlet /> : <Navigate to={to} replace />;
}
