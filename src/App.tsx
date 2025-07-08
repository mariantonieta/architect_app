import { UserProvider } from "./context/UserContext";
import "./index.css";
import { ErrorBoundary } from "./middleware/error-boundary";
import { ReactQueryProvider } from "./middleware/react-query-provider";
import { Router } from "./router";

export function App() {
  return (
    <ErrorBoundary>
      <ReactQueryProvider>
        <UserProvider>
        <Router />
        </UserProvider>
      </ReactQueryProvider>
    </ErrorBoundary>
  );
}
