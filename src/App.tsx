import "./index.css";
import "./i18n"; // Initialize i18n
import { ErrorBoundary } from "./middleware/error-boundary";
import { ReactQueryProvider } from "./middleware/react-query-provider";
import { I18nProvider } from "./middleware/i18n-provider";
import { ThemeProvider } from "./hooks/useTheme";
import { ThemeToggle } from "./components/theme-toggle";
import { LanguageToggle } from "./components/language-toggle";
import { Router } from "./router";
import { Toaster } from "sonner";

export function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <I18nProvider>
          <ReactQueryProvider>
            <Router />
            <ThemeToggle />
            <LanguageToggle />
            <Toaster position="top-center" richColors closeButton />
          </ReactQueryProvider>
        </I18nProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
