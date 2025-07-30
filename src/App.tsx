import "./index.css";
import { ErrorBoundary } from "./middleware/error-boundary";
import { ReactQueryProvider } from "./middleware/react-query-provider";
import { Router } from "./router";
import { Toaster } from "sonner";
export function App() {
  return (
    <ErrorBoundary>
      <ReactQueryProvider>
        <Router />
        <Toaster position="top-center" richColors closeButton />
      </ReactQueryProvider>
    </ErrorBoundary>
  );
}
